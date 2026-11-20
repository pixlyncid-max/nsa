<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartnershipRequest;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Partner;
use App\Models\Setting;
use App\Support\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PartnershipController extends Controller
{
    /**
     * Tampilkan halaman kemitraan NSA.
     */
    public function index(): Response
    {
        $short = Brand::shortName();

        $locale = app()->getLocale();
        $partners = Partner::orderBy('order')
            ->withLocale($locale)
            ->get(['id', 'name', 'logo', 'type', 'url'])
            ->map(fn (Partner $partner) => [
                'id' => $partner->id,
                'name' => $partner->name,
                'logo' => $partner->logo,
                'type' => $partner->tr('type', $locale),
                'url' => $partner->url,
            ]);

        $schemes = $locale === 'en'
            ? [
                [
                    'id' => 'pakan_bibit',
                    'title' => 'Feed & Certified Seed Supply Chain',
                    'tag' => 'Producers & Distributors',
                    'desc' => "Partnership supplying CPIB-certified seeds and high-quality feed with member-preferential pricing for {$short} assisted farms.",
                    'benefits' => [
                        'Direct reach to 12,000+ assisted ponds across 38 provinces',
                        "Official product catalog integration on the {$short} e-commerce portal",
                        'Demonstration pond facilitation together with farmer groups',
                    ],
                ],
                [
                    'id' => 'riset_teknologi',
                    'title' => 'Aquaculture Research & Technology Transfer',
                    'tag' => 'Universities & R&D',
                    'desc' => 'Joint research on local-ingredient alternative feed, IoT pond sensor automation, and aquatic disease biosecurity.',
                    'benefits' => [
                        'Field laboratory access across member pond centers',
                        'Joint publications and applied science dissemination to farmers',
                        'Student internship and rural aquaculture empowerment programs',
                    ],
                ],
                [
                    'id' => 'pasar_ekspor',
                    'title' => 'Downstreaming & Export Market Access',
                    'tag' => 'Exporters & Processing Industry',
                    'desc' => 'Stable absorption partnerships for shrimp, tilapia, pangasius, and milkfish harvests with price certainty and international quality compliance.',
                    'benefits' => [
                        'Scheduled harvest volumes standardized to CBIB practices',
                        'End-to-end supply chain traceability from hatchery to cold storage',
                        'Mitigation of seasonal raw material shortages',
                    ],
                ],
                [
                    'id' => 'finansial_asuransi',
                    'title' => 'Aquaculture Financing & Insurance',
                    'tag' => 'Banking, SOEs & Fintech',
                    'desc' => 'Cluster-based microcredit (KUR), working capital per farming cycle, and crop failure insurance against extreme weather.',
                    'benefits' => [
                        "Real-time pond and NIB verification via the {$short} member database",
                        'Low NPL ratio supported by daily field technical coaching',
                        'Targeted financing with measurable social impact',
                    ],
                ],
            ]
            : [
                [
                    'id' => 'pakan_bibit',
                    'title' => 'Rantai Pasok Pakan & Bibit Unggul',
                    'tag' => 'Produsen & Distributor',
                    'desc' => "Kerja sama penyediaan benih bersertifikat CPIB dan pakan berkualitas tinggi dengan penetapan harga afirmatif khusus anggota binaan {$short}.",
                    'benefits' => [
                        'Jangkauan langsung ke 12.000+ tambak binaan di 38 provinsi',
                        "Integrasi katalog produk resmi di portal e-commerce {$short}",
                        'Fasilitasi demo kolam percontohan bersama kelompok tani',
                    ],
                ],
                [
                    'id' => 'riset_teknologi',
                    'title' => 'Riset & Transfer Teknologi Akuakultur',
                    'tag' => 'Perguruan Tinggi & Litbang',
                    'desc' => 'Kolaborasi riset formulasi pakan alternatif berbasis bahan baku lokal, otomatisasi sensor IoT kolam, serta biosekuriti penyakit akuatik.',
                    'benefits' => [
                        'Akses laboratorium lapangan di sentra kolam anggota',
                        'Publikasi bersama dan diseminasi sains ke masyarakat petambak',
                        'Program magang mahasiswa dan pemberdayaan bina desa',
                    ],
                ],
                [
                    'id' => 'pasar_ekspor',
                    'title' => 'Hilirisasi & Akses Pasar Ekspor',
                    'tag' => 'Eksportir & Industri Olahan',
                    'desc' => 'Kemitraan penyerapan hasil panen udang, nila, patin, dan bandeng secara stabil dengan kepastian harga dan pemenuhan standar mutu internasional.',
                    'benefits' => [
                        'Pasokan volume panen terjadwal dan terstandarisasi CBIB',
                        'Keterlacakan rantai pasok (traceability) dari benih hingga cold storage',
                        'Mitigasi risiko kelangkaan bahan baku musiman',
                    ],
                ],
                [
                    'id' => 'finansial_asuransi',
                    'title' => 'Pembiayaan & Asuransi Usaha Budidaya',
                    'tag' => 'Perbankan, BUMN & Fintech',
                    'desc' => 'Fasilitasi Kredit Usaha Rakyat (KUR) klaster perikanan, pendanaan modal kerja siklus budidaya, dan proteksi asuransi kegagalan panen cuaca ekstrem.',
                    'benefits' => [
                        "Verifikasi riil data kolam dan NIB lewat database anggota {$short}",
                        'Rasio NPL rendah didukung pendampingan teknis harian di lapangan',
                        'Penyaluran pembiayaan tepat sasaran dan berdampak sosial tinggi',
                    ],
                ],
            ];

        return Inertia::render('Public/Partnership', [
            'partners' => $partners,
            'schemes' => $schemes,
        ]);
    }

    /**
     * Simpan ajuan kemitraan ke tabel contact_messages dengan topik kemitraan.
     */
    public function store(StorePartnershipRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $short = Brand::shortName();

        $combinedMessage = "Nama Instansi / Perusahaan: {$validated['institution']}\n".
            "Skema Kemitraan: {$validated['partnership_scheme']}\n".
            "Nomor Telepon/WA: {$validated['phone']}\n\n".
            "Rincian Proposal / Pesan:\n{$validated['message']}";

        $contactMessage = ContactMessage::create([
            'name' => "{$validated['name']} ({$validated['institution']})",
            'email' => $validated['email'],
            'topic' => 'kemitraan',
            'message' => $combinedMessage,
        ]);

        // Kirim email notifikasi ke sekretariat
        $adminEmail = Setting::get('contact_email', Brand::supportEmail());
        try {
            Mail::to($adminEmail)->send(new ContactMessageReceived($contactMessage));
        } catch (\Throwable $e) {
            Log::warning('Failed to send partnership notification email: '.$e->getMessage());
        }

        return back()->with('success', "Pengajuan kemitraan berhasil dikirim. Tim kemitraan strategis {$short} akan menghubungi Anda melalui email atau telepon dalam 1-2 hari kerja.");
    }
}
