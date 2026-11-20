<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Page;
use App\Models\Setting;
use App\Support\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Daftar 5 pertanyaan umum baku apabila halaman CMS kontak belum memiliki entri FAQ.
     *
     * @return array<int, array{question: string, answer: string}>
     */
    public static function defaultFaqs(): array
    {
        $short = Brand::shortName();

        return [
            [
                'question' => "Bagaimana cara mendaftar sebagai anggota resmi {$short}?",
                'answer' => 'Klik tombol Daftar Anggota di pojok kanan atas, buat akun, lalu lengkapi formulir 9 langkah di portal akun. Progres tersimpan otomatis sebagai draf sehingga dapat dilanjutkan kapan saja hingga KTA digital terbit.',
            ],
            [
                'question' => 'Berapa lama proses verifikasi berkas dan bagaimana mekanisme iuran keanggotaan?',
                'answer' => 'Tim verifikator memeriksa kelengkapan data dan legalitas usaha dalam 1 sampai 3 hari kerja. Rincian nominal serta petunjuk pembayaran iuran tercantum pada tahap administrasi dan halaman riwayat tagihan akun Anda.',
            ],
            [
                'question' => 'Apakah anggota aktif otomatis mendapat harga khusus pada katalog produk?',
                'answer' => 'Ya. Setelah status keanggotaan Anda disetujui (approved), sistem katalog dan keranjang belanja langsung menerapkan Harga Anggota secara otomatis tanpa perlu memasukkan kode kupon tambahan.',
            ],
            [
                'question' => 'Bagaimana mengajukan pembentukan DPW atau DPC di daerah yang belum aktif?',
                'answer' => 'Pembudidaya atau kelompok usaha perikanan setempat dapat menghubungi Sekretariat Nasional melalui formulir Kontak atau mengajukan audiensi di halaman Kemitraan dengan topik pembentukan kepengurusan wilayah.',
            ],
            [
                'question' => 'Bagaimana prosedur menjalin kerja sama pasokan, riset, atau distribusi hasil panen?',
                'answer' => 'Ajukan ringkasan proposal dan kontak penanggung jawab lembaga melalui formulir Kemitraan atau kirim pesan dengan topik Kemitraan pada halaman ini. Sekretariat akan menjadwalkan audiensi teknis dalam 1 sampai 2 hari kerja.',
            ],
        ];
    }

    /**
     * Tampilkan halaman kontak NSA.
     */
    public function index(): Response
    {
        $short = Brand::shortName();

        $contactInfo = [
            'address' => Brand::address(),
            'phone' => Brand::supportPhone(),
            'whatsapp' => Brand::supportPhone(),
            'email' => Brand::supportEmail(),
            'hours' => 'Senin - Jumat: 08.30 - 17.00 WIB',
            'coordinates' => [
                'lat' => -6.175392,
                'lng' => 106.827153,
            ],
            'social_media' => [
                ['platform' => 'Instagram', 'handle' => '@nsa.indonesia', 'url' => Setting::get('social_instagram', config('brand.social.instagram'))],
                ['platform' => 'YouTube', 'handle' => "{$short} Official", 'url' => Setting::get('social_youtube', config('brand.social.youtube'))],
                ['platform' => 'Facebook', 'handle' => Brand::name(), 'url' => Setting::get('social_facebook', config('brand.social.facebook'))],
                ['platform' => 'LinkedIn', 'handle' => "{$short} Indonesia Association", 'url' => 'https://linkedin.com/company/nsa-indonesia'],
            ],
        ];

        $page = Page::where('slug', 'kontak')->first();
        $savedFaqs = is_array($page?->body['faqs'] ?? null) ? $page->body['faqs'] : [];
        $validFaqs = array_values(array_filter(
            $savedFaqs,
            fn ($item) => is_array($item) && ! empty($item['question']) && ! empty($item['answer'])
        ));

        $faqs = count($validFaqs) > 0 ? $validFaqs : self::defaultFaqs();

        return Inertia::render('Public/Contact', [
            'contactInfo' => $contactInfo,
            'faqs' => $faqs,
        ]);
    }

    /**
     * Simpan pesan kontak dari formulir publik.
     */
    public function store(StoreContactRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $short = Brand::shortName();

        $contactMessage = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'topic' => $validated['topic'],
            'message' => $validated['message'],
        ]);

        // Kirim email notifikasi ke sekretariat
        $adminEmail = Setting::get('contact_email', Brand::supportEmail());
        try {
            Mail::to($adminEmail)->send(new ContactMessageReceived($contactMessage));
        } catch (\Throwable $e) {
            Log::warning('Failed to send contact message email: '.$e->getMessage());
        }

        return back()->with('success', "Terima kasih, pesan Anda berhasil dikirim ke sekretariat {$short}. Kami akan merespons pertanyaan Anda sesegera mungkin.");
    }
}
