<?php

namespace App\Actions\Membership;

use App\Enums\MembershipStatus;
use App\Mail\AdminNewMembershipNotification;
use App\Mail\MembershipApplicationSubmitted;
use App\Models\MemberReviewLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class SubmitMembershipApplication
{
    /**
     * Validasi final dan kirim pengajuan keanggotaan.
     */
    public function execute(User $user): User
    {
        $user->load([
            'profile',
            'business',
            'documents',
            'commodities',
            'statement',
            'application.plan',
        ]);

        $errors = [];

        // 1. Validasi Akun Pengguna
        if (empty($user->name)) {
            $errors['name'] = 'Nama lengkap pengguna wajib diisi.';
        }
        if (empty($user->email)) {
            $errors['email'] = 'Alamat email pengguna wajib diisi.';
        }
        if (empty($user->phone)) {
            $errors['phone'] = 'Nomor telepon/WhatsApp wajib diisi.';
        }

        // 2. Validasi Data Pribadi
        if (! $user->profile) {
            $errors['profile'] = 'Data pribadi belum dilengkapi.';
        } else {
            if (empty($user->profile->nik)) {
                $errors['nik'] = 'Nomor Induk Kependudukan (NIK) wajib diisi.';
            } elseif (! preg_match('/^\d{16}$/', $user->profile->nik)) {
                $errors['nik'] = 'NIK harus tepat 16 digit angka.';
            }

            if (empty($user->profile->birth_place) || empty($user->profile->birth_date)) {
                $errors['birth'] = 'Tempat dan tanggal lahir wajib diisi.';
            }

            if (empty($user->profile->gender)) {
                $errors['gender'] = 'Jenis kelamin wajib dipilih.';
            }

            if (empty($user->profile->address)) {
                $errors['address'] = 'Alamat tempat tinggal pribadi wajib diisi.';
            }
        }

        // 3. Validasi Data Usaha Perikanan
        if (! $user->business) {
            $errors['business'] = 'Data usaha perikanan belum dilengkapi.';
        } else {
            $b = $user->business;
            if (empty($b->name)) {
                $errors['business_name'] = 'Nama usaha perikanan wajib diisi.';
            }
            if (empty($b->owner_name)) {
                $errors['owner_name'] = 'Nama penanggung jawab usaha wajib diisi.';
            }
            if (empty($b->nib)) {
                $errors['nib'] = 'Nomor Induk Berusaha (NIB) wajib diisi.';
            } elseif (! preg_match('/^\d{13}$/', $b->nib)) {
                $errors['nib'] = 'NIB harus tepat 13 digit angka.';
            }
            if (empty($b->founded_at)) {
                $errors['founded_at'] = 'Tanggal berdiri usaha wajib diisi.';
            }
            if (! isset($b->employee_count) || $b->employee_count < 0) {
                $errors['employee_count'] = 'Jumlah tenaga kerja wajib diisi.';
            }
            if (empty($b->annual_revenue)) {
                $errors['annual_revenue'] = 'Omzet tahunan usaha wajib dipilih.';
            }
            if (empty($b->business_status)) {
                $errors['business_status'] = 'Status kepemilikan usaha wajib dipilih.';
            }
            if (empty($b->business_scale)) {
                $errors['business_scale'] = 'Skala usaha wajib dipilih.';
            }
            if (empty($b->province_id) || empty($b->regency_id) || empty($b->district_id) || empty($b->village_id)) {
                $errors['business_region'] = 'Wilayah alamat usaha (Provinsi, Kota/Kab, Kecamatan, Desa) wajib lengkap.';
            }
            if (empty($b->address)) {
                $errors['business_address'] = 'Alamat lengkap tempat usaha wajib diisi.';
            }
        }

        // 4. Validasi Dokumen Persyaratan (KTP, NIB, & Foto Tempat Usaha)
        $docTypes = $user->documents->pluck('type')->toArray();
        if (! in_array('ktp', $docTypes, true)) {
            $errors['doc_ktp'] = 'Dokumen foto/scan KTP wajib diunggah.';
        }
        if (! in_array('nib', $docTypes, true)) {
            $errors['doc_nib'] = 'Dokumen izin NIB wajib diunggah.';
        }
        if (! in_array('business_photo', $docTypes, true)) {
            $errors['doc_business_photo'] = 'Foto tempat/sarana usaha perikanan wajib diunggah.';
        }

        // 5. Validasi Komoditas (Minimal 1)
        if ($user->commodities->isEmpty()) {
            $errors['commodities'] = 'Minimal 1 komoditas perikanan budidaya/tangkap wajib diisi.';
        }

        // 6. Validasi Paket Keanggotaan
        $app = $user->application;
        if (! $app || empty($app->membership_plan_id)) {
            $errors['membership_plan_id'] = 'Pilihan paket keanggotaan wajib ditentukan.';
        }
        if (! $app || empty($app->join_reason)) {
            $errors['join_reason'] = 'Alasan bergabung dengan asosiasi wajib diisi.';
        }

        // 7. Validasi Surat Pernyataan & Tanda Tangan Digital
        $stmt = $user->statement;
        if (! $stmt || empty($stmt->signature_path)) {
            $errors['signature_data'] = 'Tanda tangan digital pemohon wajib dibubuhkan.';
        }
        if (! $stmt || ! $stmt->agree_data_accurate) {
            $errors['agree_data_accurate'] = 'Pernyataan kebenaran data wajib disetujui.';
        }
        if (! $stmt || ! $stmt->agree_ad_art) {
            $errors['agree_ad_art'] = 'Persetujuan AD/ART wajib dicentang.';
        }
        if (! $stmt || ! $stmt->agree_privacy_policy) {
            $errors['agree_privacy_policy'] = 'Persetujuan kebijakan privasi wajib dicentang.';
        }

        if (! empty($errors)) {
            throw ValidationException::withMessages($errors);
        }

        return DB::transaction(function () use ($user, $app) {
            $requireInitialVerification = (bool) Setting::get('membership.require_initial_verification', true);
            $targetStatus = $requireInitialVerification
                ? MembershipStatus::PendingReview
                : MembershipStatus::AwaitingPayment;

            // Update user status
            $user->update([
                'membership_status' => $targetStatus,
            ]);

            // Update application status & submitted_at
            if ($app) {
                $allSteps = [
                    'akun',
                    'data-pribadi',
                    'data-usaha',
                    'dokumen',
                    'media-sosial',
                    'data-komoditas',
                    'keanggotaan',
                    'surat-pernyataan',
                    'review-data',
                ];

                $completed = array_values(array_unique(array_merge($app->completed_steps ?? [], $allSteps)));

                $app->update([
                    'status' => $targetStatus,
                    'submitted_at' => now(),
                    'completed_steps' => $completed,
                ]);
            }

            // Catat review log
            MemberReviewLog::create([
                'user_id' => $user->id,
                'action' => 'submitted',
                'note' => 'Pengajuan pendaftaran anggota baru berhasil dikirim dan siap diverifikasi oleh Pengurus.',
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
                    ?? config('brand.support_email')
                    ?? config('mail.from.address')
                    ?? 'admin@nsa.or.id';
                Mail::to($adminEmail)->send(new AdminNewMembershipNotification($user));
            } catch (\Throwable $e) {
                Log::warning('Gagal mengirim email notifikasi pengajuan baru ke admin: '.$e->getMessage());
            }

            return $user;
        });
    }
}
