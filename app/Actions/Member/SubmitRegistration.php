<?php

namespace App\Actions\Member;

use App\Actions\Membership\SubmitMembershipApplication;
use App\Enums\MembershipStatus;
use App\Mail\AdminNewMembershipNotification;
use App\Mail\MembershipApplicationSubmitted;
use App\Models\MemberApplication;
use App\Models\MemberDocument;
use App\Models\MemberReviewLog;
use App\Models\Setting;
use App\Models\User;
use App\Support\Brand;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class SubmitRegistration
{
    public function __construct(
        protected SubmitMembershipApplication $legacySubmitter
    ) {}

    /**
     * Finalisasi dan kirim pengajuan keanggotaan NSA (9 langkah baru).
     *
     * @param  array<string, mixed>  $agreements
     */
    public function execute(User $user, array $agreements = []): MemberApplication
    {
        $application = $user->application()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'status' => MembershipStatus::Draft,
                'current_step' => 'pemeriksaan',
                'completed_steps' => array_values(MemberApplication::STEPS),
            ]
        );

        $application->load([
            'identity',
            'membershipType',
            'businesses.legalDocuments',
            'fishActivities',
            'networkProfile',
            'programInterests',
            'locations',
            'photos',
            'invoices.items',
        ]);

        // Cek apakah pendaftaran menggunakan alur 9 langkah baru atau legacy
        if ($application->identity) {
            $this->validateNewWizardSubmission($user, $application, $agreements);
        } else {
            // Kompatibilitas alur pendaftaran lama
            $this->legacySubmitter->execute($user);
        }

        return DB::transaction(function () use ($user, $application) {
            $requireInitialVerification = (bool) Setting::get('membership.require_initial_verification', true);
            $targetStatus = $requireInitialVerification
                ? MembershipStatus::PendingReview
                : MembershipStatus::AwaitingPayment;

            // Update status pengguna
            $user->update([
                'membership_status' => $targetStatus,
            ]);

            // Update status aplikasi
            $application->update([
                'status' => $targetStatus,
                'submitted_at' => now(),
                'current_step' => 'pemeriksaan',
                'completed_steps' => array_values(MemberApplication::STEPS),
            ]);

            // Catat log ulasan pendaftaran
            MemberReviewLog::create([
                'user_id' => $user->id,
                'action' => 'submitted',
                'note' => 'Pendaftaran anggota '.Brand::shortName().' berhasil dikirim dan siap diproses.',
            ]);

            // Kirim email konfirmasi ke pemohon
            try {
                Mail::to($user->email)->send(new MembershipApplicationSubmitted($user));
            } catch (\Throwable $e) {
                Log::warning('Gagal mengirim email konfirmasi pendaftaran anggota: '.$e->getMessage());
            }

            // Kirim email notifikasi ke admin
            try {
                $adminEmail = Setting::get('notification_email')
                    ?? Setting::get('brand_support_email')
                    ?? Brand::supportEmail()
                    ?? config('brand.support_email')
                    ?? config('mail.from.address')
                    ?? 'admin@nsa.or.id';
                Mail::to($adminEmail)->send(new AdminNewMembershipNotification($user));
            } catch (\Throwable $e) {
                Log::warning('Gagal mengirim email notifikasi pengajuan baru ke admin: '.$e->getMessage());
            }

            return $application->fresh();
        });
    }

    /**
     * Validasi menyeluruh 9 langkah baru sebelum pengiriman.
     *
     * @param  array<string, mixed>  $agreements
     */
    public function validateNewWizardSubmission(User $user, MemberApplication $application, array $agreements = []): void
    {
        $errors = [];

        // 0. Validasi Persetujuan Ketentuan & Privasi (Langkah 9)
        if (empty($agreements['agree_terms'])) {
            $errors['agree_terms'] = 'Anda wajib menyetujui ketentuan dan AD/ART keanggotaan.';
        }
        if (empty($agreements['agree_privacy'])) {
            $errors['agree_privacy'] = 'Anda wajib menyetujui kebijakan privasi.';
        }

        // 1. Validasi Identitas (Langkah 1)
        $identity = $application->identity;
        if (! $identity) {
            $errors['identity'] = 'Data identitas calon anggota belum diisi.';
        } else {
            if (empty($identity->full_name)) {
                $errors['identity_full_name'] = 'Nama lengkap calon anggota wajib diisi.';
            }
            if (empty($identity->gender)) {
                $errors['identity_gender'] = 'Jenis kelamin wajib dipilih.';
            }
            if (empty($identity->birth_place) || empty($identity->birth_date)) {
                $errors['identity_birth'] = 'Tempat dan tanggal lahir wajib diisi.';
            }
            if (empty($identity->phone)) {
                $errors['identity_phone'] = 'Nomor telepon/WhatsApp wajib diisi.';
            }
            if (empty($identity->email)) {
                $errors['identity_email'] = 'Alamat email wajib diisi.';
            }

            if ($identity->nationality === 'wni') {
                $requireKtp = (bool) Setting::get('membership.require_ktp_for_wni', true);
                if ($requireKtp) {
                    if (empty($identity->nik)) {
                        $errors['identity_nik'] = 'NIK wajib diisi untuk WNI.';
                    } elseif (! preg_match('/^\d{16}$/', $identity->nik)) {
                        $errors['identity_nik'] = 'NIK harus tepat 16 digit angka.';
                    }
                }
            } else {
                if (empty($identity->passport_number)) {
                    $errors['identity_passport'] = 'Nomor paspor wajib diisi untuk WNA.';
                }
                if (empty($identity->origin_country)) {
                    $errors['identity_origin_country'] = 'Negara asal wajib dipilih untuk WNA.';
                }
                if ($identity->years_in_indonesia === null || $identity->years_in_indonesia < 0) {
                    $errors['identity_years_in_indonesia'] = 'Lama berada di Indonesia wajib diisi.';
                }
            }
        }

        // 2. Validasi Kategori Keanggotaan (Langkah 2)
        if (empty($application->membership_category)) {
            $errors['membership_category'] = 'Kategori keanggotaan wajib dipilih.';
        }
        if ($application->applicant_type === 'institution' && empty($application->institution_name)) {
            $errors['institution_name'] = 'Nama instansi/perusahaan wajib diisi untuk jenis pemohon lembaga.';
        }
        if (empty($application->membership_type_id)) {
            $errors['membership_type_id'] = 'Jenis keanggotaan spesifik wajib dipilih.';
        }

        // 3. Validasi Profil Usaha (Langkah 3)
        $primaryBusiness = $application->businesses->firstWhere('is_primary', true)
            ?? $application->businesses->first();

        if (! $primaryBusiness) {
            $errors['business'] = 'Profil usaha atau pekerjaan wajib diisi.';
        } else {
            if (! $primaryBusiness->has_no_business) {
                if (empty($primaryBusiness->name)) {
                    $errors['business_name'] = 'Nama usaha wajib diisi.';
                }
                if (empty($primaryBusiness->activity_field)) {
                    $errors['activity_field'] = 'Bidang usaha wajib diisi.';
                }
            } else {
                if (empty($primaryBusiness->main_job)) {
                    $errors['main_job'] = 'Pekerjaan/profesi utama wajib diisi jika tidak memiliki usaha.';
                }
            }
        }

        // 4. Validasi Jaringan Bisnis (Langkah 5)
        if (! $application->networkProfile) {
            $errors['network_profile'] = 'Data jaringan dan rencana kemitraan bisnis wajib dilengkapi.';
        }

        // 5. Validasi Minat Program (Langkah 6)
        if ($application->programInterests->isEmpty()) {
            $errors['program_interests'] = 'Pilih minimal satu program kerja asosiasi yang diminati.';
        }

        // 6. Validasi Lokasi (Langkah 7)
        $domicileLocation = $application->locations->firstWhere('kind', 'domicile');
        if (! $domicileLocation || empty($domicileLocation->province_id) || empty($domicileLocation->regency_id) || empty($domicileLocation->address)) {
            $errors['domicile_location'] = 'Alamat domisili lengkap (Provinsi, Kota/Kabupaten, dan Alamat) wajib diisi.';
        }

        // 7. Validasi Dokumen Persyaratan (Langkah 7)
        $userDocTypes = MemberDocument::where('user_id', $user->id)->pluck('type')->toArray();

        if ($identity && $identity->nationality === 'wni') {
            $requireKtp = (bool) Setting::get('membership.require_ktp_for_wni', true);
            if ($requireKtp && ! in_array('ktp', $userDocTypes, true)) {
                $errors['doc_ktp'] = 'Dokumen KTP wajib diunggah.';
            }
        } elseif ($identity && $identity->nationality === 'wna') {
            if (! in_array('passport', $userDocTypes, true)) {
                $errors['doc_passport'] = 'Dokumen Paspor wajib diunggah untuk WNA.';
            }
        }

        // Cek dokumen legalitas jika usaha diisi di Langkah 3
        if ($primaryBusiness && ! $primaryBusiness->has_no_business) {
            foreach ($primaryBusiness->legalDocuments as $legalDoc) {
                $type = $legalDoc->type;
                if (! empty($type)) {
                    $hasDoc = in_array($type, $userDocTypes, true)
                        || in_array('legal_'.$type, $userDocTypes, true)
                        || ! empty($legalDoc->file_path);

                    if (! $hasDoc) {
                        $label = $legalDoc->label ?: strtoupper($type);
                        $errors['doc_'.$type] = "Berkas dokumen {$label} belum diunggah.";
                    }
                }
            }
        }

        // 8. Validasi Paket & Administrasi (Langkah 8)
        $invoice = $application->invoices->firstWhere('status', 'unpaid');
        if (! $invoice || $invoice->items->isEmpty()) {
            $errors['administration'] = 'Paket keanggotaan dan rincian administrasi wajib dipilih.';
        }

        if (! empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
