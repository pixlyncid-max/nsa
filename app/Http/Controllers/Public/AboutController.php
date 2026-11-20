<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\DppMember;
use App\Models\Page;
use App\Models\Program;
use App\Support\Brand;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * Konten baku halaman Tentang Kami sesuai prd.md.
     */
    public static function defaultAboutContent(string $locale = 'id'): array
    {
        $brandName = Brand::name();

        if ($locale === 'en') {
            return [
                'subtitle' => 'A Unified Platform for Indonesian Fish Farmers, Entrepreneurs, and Aquaculture Stakeholders',
                'history' => "Founded in 2018 in Bogor, {$brandName} was born from the shared concerns of freshwater fish farmers and coastal pond operators facing high feed costs and volatile harvest prices.",
                'vision' => 'To realize a resilient, sovereign, environmentally sustainable national aquaculture industry as a key pillar of global food security.',
                'missions' => [
                    'Promote equitable adoption of practical aquaculture technology to lower production costs.',
                    'Build an integrated supply chain network from certified superior seeds to export markets.',
                    'Advocate public policy and assist with business licensing (NIB, quality certifications).',
                    'Strengthen organizational governance at the regional (DPW) and branch (DPC) levels.',
                ],
                'values' => [
                    ['title' => 'Ecosystem Sustainability', 'desc' => 'Preserving water quality and enforcing pond biosecurity practices.'],
                    ['title' => 'Farmer Independence', 'desc' => 'Supporting local feed formulation and high-quality hatcheries.'],
                    ['title' => 'Collective Solidarity', 'desc' => 'Supporting each other and sharing transparent regional harvest pricing data.'],
                    ['title' => 'Scientific Integrity', 'desc' => 'Grounding all recommendations in applied science and empirical field evidence.'],
                ],
                'legalities' => [
                    ['label' => 'Notarial Deed of Establishment', 'value' => 'No. 24 dated 18 July 2019 (Notary Dr. Suhendra, S.H., M.Kn)'],
                    ['label' => 'Ministry of Law & Human Rights Decree', 'value' => 'AHU-0008452.AH.01.07.TAHUN 2019'],
                    ['label' => 'Taxpayer Identification Number (NPWP)', 'value' => '92.124.789.2-072.000'],
                    ['label' => 'Association Operational Permit', 'value' => 'Kemenlut RI No. 503/AS-NSA/2020'],
                ],
            ];
        }

        return [
            'subtitle' => 'Wadah Persatuan Pembudidaya, Pelaku Usaha, dan Pemerhati Perikanan Nusantara',
            'history' => "Didirikan pada tahun 2018 di Bogor, {$brandName} lahir dari keresahan bersama para pelaku budidaya air tawar dan petambak pesisir terhadap tingginya biaya pakan serta fluktuasi harga panen.",
            'vision' => 'Terwujudnya industri perikanan budidaya dan akuakultur nasional yang tangguh, berdaulat, ramah lingkungan, dan menjadi pilar utama ketahanan pangan dunia.',
            'missions' => [
                'Mendorong pemerataan teknologi budidaya tepat guna untuk menekan biaya produksi.',
                'Membangun jejaring rantai pasok terintegrasi dari benih unggul hingga pasar ekspor.',
                'Advokasi kebijakan publik dan pendampingan izin berusaha (NIB, sertifikasi mutu).',
                'Menguatkan tata kelola organisasi di tingkat wilayah (DPW) dan cabang (DPC).',
            ],
            'values' => [
                ['title' => 'Keberlanjutan Ekosistem', 'desc' => 'Menjaga kemurnian sumber daya perairan dan menerapkan biosekuriti kolam.'],
                ['title' => 'Kemandirian Pembudidaya', 'desc' => 'Mendukung pakan mandiri dan pembenihan bermutu tinggi.'],
                ['title' => 'Solidaritas Gotong Royong', 'desc' => 'Saling menopang dan berbagi transparansi data harga panen regional.'],
                ['title' => 'Integritas Ilmiah', 'desc' => 'Seluruh rekomendasi berlandaskan sains terapan dan bukti uji empiris.'],
            ],
            'legalities' => [
                ['label' => 'Akta Notaris Pendirian', 'value' => 'No. 24 Tanggal 18 Juli 2019 (Notaris Dr. Suhendra, S.H., M.Kn)'],
                ['label' => 'SK Kemenkumham RI', 'value' => 'AHU-0008452.AH.01.07.TAHUN 2019'],
                ['label' => 'Nomor Pokok Wajib Pajak (NPWP)', 'value' => '92.124.789.2-072.000'],
                ['label' => 'Izin Operasional Asosiasi', 'value' => 'Kemenlut RI No. 503/AS-NSA/2020'],
            ],
        ];
    }

    /**
     * Tampilkan halaman Tentang Kami dengan tata letak editorial.
     */
    public function index(): Response
    {
        $locale = app()->getLocale();
        $page = Page::where('slug', 'tentang-kami')->withLocale($locale)->first();
        $defaults = self::defaultAboutContent($locale);

        $localizedBody = $page ? $page->tr('body', $locale) : [];
        $savedBody = is_array($localizedBody) ? $localizedBody : [];

        // Lakukan penggabungan mendalam (deep merge) agar seluruh skema esensial selalu ada
        $aboutContent = [
            'subtitle' => ! empty($savedBody['subtitle']) ? $savedBody['subtitle'] : $defaults['subtitle'],
            'history' => ! empty($savedBody['history']) ? $savedBody['history'] : $defaults['history'],
            'vision' => ! empty($savedBody['vision']) ? $savedBody['vision'] : $defaults['vision'],
            'missions' => ! empty($savedBody['missions']) && is_array($savedBody['missions']) ? $savedBody['missions'] : $defaults['missions'],
            'values' => ! empty($savedBody['values']) && is_array($savedBody['values']) ? $savedBody['values'] : $defaults['values'],
            'legalities' => ! empty($savedBody['legalities']) && is_array($savedBody['legalities']) ? $savedBody['legalities'] : $defaults['legalities'],
        ];

        // Ambil data pengurus inti DPP: nama orang tetap, jabatan & bio diterjemahkan
        $team = DppMember::orderBy('order')
            ->withLocale($locale)
            ->take(6)
            ->get(['id', 'name', 'position', 'photo', 'period', 'bio'])
            ->map(fn (DppMember $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'position' => $member->tr('position', $locale),
                'photo' => $member->photo,
                'period' => $member->period,
                'bio' => $member->tr('bio', $locale),
            ]);

        // Ambil data program kerja publik dan telah terbit
        $programs = Program::query()
            ->publicOnly()
            ->published()
            ->ordered()
            ->withLocale($locale)
            ->get()
            ->map(function (Program $program) use ($locale) {
                $schedule = null;
                if ($program->starts_at && $program->ends_at) {
                    $schedule = $program->starts_at->translatedFormat('d M Y').' — '.$program->ends_at->translatedFormat('d M Y');
                } elseif ($program->starts_at) {
                    $prefix = $locale === 'en' ? 'Starts ' : 'Mulai ';
                    $schedule = $prefix.$program->starts_at->translatedFormat('d M Y');
                }

                return [
                    'id' => $program->id,
                    'title' => $program->tr('title', $locale),
                    'slug' => $program->slug,
                    'category' => $program->category->value,
                    'category_label' => $program->category->label(),
                    'summary' => $program->tr('summary', $locale),
                    'cover_url' => $program->cover_url,
                    'is_public' => $program->is_public,
                    'schedule' => $schedule,
                    'order' => $program->order,
                ];
            });

        return Inertia::render('Public/About', [
            'title' => $page?->tr('title', $locale) ?? ($locale === 'en' ? 'About '.Brand::shortName() : 'Tentang '.Brand::shortName()),
            'content' => $aboutContent,
            'team' => $team,
            'programs' => $programs,
        ]);
    }
}
