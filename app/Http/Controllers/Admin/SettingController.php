<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Support\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('manage-settings');

        $logoLight = Setting::get('brand_logo_light') ?? Setting::get('logo');
        $logoDark = Setting::get('brand_logo_dark');

        $settings = [
            'brand_name' => Brand::name(),
            'brand_short_name' => Brand::shortName(),
            'brand_tagline' => Brand::tagline(),
            'brand_domain' => Brand::domain(),
            'brand_portal_name' => Brand::portalName(),
            'site_name' => Brand::name(),
            'site_tagline' => Brand::tagline(),
            'logo' => $logoLight,
            'logo_light' => $logoLight,
            'logo_dark' => $logoDark,
            'contact_email' => Brand::supportEmail(),
            'contact_phone' => Brand::supportPhone(),
            'contact_address' => Brand::address(),
            'bank_name' => Setting::get('bank_name', 'Bank Central Asia (BCA)'),
            'bank_account_number' => Setting::get('bank_account_number', '8830-1234-5678'),
            'bank_account_holder' => Setting::get('bank_account_holder', 'Perkumpulan Akuakultur NSA'),
            'social_instagram' => Setting::get('social_instagram', config('brand.social.instagram')),
            'social_facebook' => Setting::get('social_facebook', config('brand.social.facebook')),
            'social_youtube' => Setting::get('social_youtube', config('brand.social.youtube')),
            // Pengaturan NSA Keanggotaan
            'require_initial_verification' => (bool) Setting::get('membership.require_initial_verification', true),
            'require_ktp_for_wni' => (bool) Setting::get('membership.require_ktp_for_wni', true),
            'membership_statement_template' => Setting::get('membership_statement_template', 'Dengan ini menyatakan tunduk pada Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) NSA serta bersedia menjaga nama baik organisasi dan integritas budidaya perikanan berkelanjutan.'),
            'terms_content' => Setting::get('terms_content', "Syarat & Ketentuan Keanggotaan NSA:\n1. Calon anggota wajib mengisi data yang sah dan dapat dipertanggungjawabkan.\n2. Berkomitmen menjaga mutu dan kelestarian ekosistem akuakultur nasional.\n3. Mematuhi AD/ART dan kode etik perikanan berkelanjutan."),
            'privacy_policy_content' => Setting::get('privacy_policy_content', "Kebijakan Privasi Anggota NSA:\n1. Data identitas dan dokumen legalitas dilindungi dan disimpan secara terenkripsi.\n2. Informasi hanya digunakan untuk verifikasi keanggotaan dan pemetaan statistik asosiasi.\n3. NSA tidak menyebarluaskan data pribadi anggota kepada pihak ketiga tanpa izin resmi."),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'logoUrl' => $logoLight ? Storage::url($logoLight) : null,
            'logoLightUrl' => $logoLight ? Storage::url($logoLight) : null,
            'logoDarkUrl' => $logoDark ? Storage::url($logoDark) : null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        Gate::authorize('manage-settings');

        $validated = $request->validate([
            'brand_name' => ['nullable', 'string', 'max:255'],
            'brand_short_name' => ['nullable', 'string', 'max:50'],
            'brand_tagline' => ['nullable', 'string', 'max:255'],
            'brand_domain' => ['nullable', 'string', 'max:100'],
            'brand_portal_name' => ['nullable', 'string', 'max:100'],
            'site_name' => ['nullable', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:100'],
            'contact_phone' => ['required', 'string', 'max:50'],
            'contact_address' => ['required', 'string', 'max:500'],
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'max:50'],
            'bank_account_holder' => ['required', 'string', 'max:100'],
            'social_instagram' => ['nullable', 'string', 'max:255'],
            'social_facebook' => ['nullable', 'string', 'max:255'],
            'social_youtube' => ['nullable', 'string', 'max:255'],
            'require_initial_verification' => ['nullable', 'boolean'],
            'require_ktp_for_wni' => ['nullable', 'boolean'],
            'membership_statement_template' => ['nullable', 'string'],
            'terms_content' => ['nullable', 'string'],
            'privacy_policy_content' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'logo_light' => ['nullable', 'image', 'max:2048'],
            'logo_dark' => ['nullable', 'image', 'max:2048'],
        ]);

        $name = $validated['brand_name'] ?? $validated['site_name'] ?? Brand::name();
        $tagline = $validated['brand_tagline'] ?? $validated['site_tagline'] ?? Brand::tagline();

        Setting::set('brand_name', $name);
        Setting::set('site_name', $name);
        Setting::set('brand_short_name', $validated['brand_short_name'] ?? Brand::shortName());
        Setting::set('brand_tagline', $tagline);
        Setting::set('site_tagline', $tagline);
        Setting::set('brand_domain', $validated['brand_domain'] ?? Brand::domain());
        Setting::set('brand_portal_name', $validated['brand_portal_name'] ?? Brand::portalName());

        Setting::set('contact_email', $validated['contact_email']);
        Setting::set('brand_support_email', $validated['contact_email']);
        Setting::set('contact_phone', $validated['contact_phone']);
        Setting::set('brand_support_phone', $validated['contact_phone']);
        Setting::set('contact_address', $validated['contact_address']);
        Setting::set('brand_address', $validated['contact_address']);

        Setting::set('bank_name', $validated['bank_name']);
        Setting::set('bank_account_number', $validated['bank_account_number']);
        Setting::set('bank_account_holder', $validated['bank_account_holder']);

        Setting::set('social_instagram', $validated['social_instagram'] ?? null);
        Setting::set('social_facebook', $validated['social_facebook'] ?? null);
        Setting::set('social_youtube', $validated['social_youtube'] ?? null);

        if (array_key_exists('require_initial_verification', $validated)) {
            Setting::set('membership.require_initial_verification', (bool) $validated['require_initial_verification']);
        }
        if (array_key_exists('require_ktp_for_wni', $validated)) {
            Setting::set('membership.require_ktp_for_wni', (bool) $validated['require_ktp_for_wni']);
        }
        if (isset($validated['membership_statement_template'])) {
            Setting::set('membership_statement_template', $validated['membership_statement_template']);
        }
        if (isset($validated['terms_content'])) {
            Setting::set('terms_content', $validated['terms_content']);
        }
        if (isset($validated['privacy_policy_content'])) {
            Setting::set('privacy_policy_content', $validated['privacy_policy_content']);
        }

        if ($request->hasFile('logo_light')) {
            $pathLight = $request->file('logo_light')->store('settings', 'public');
            Setting::set('brand_logo_light', $pathLight);
            Setting::set('logo', $pathLight);
        } elseif ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('settings', 'public');
            Setting::set('brand_logo_light', $path);
            Setting::set('logo', $path);
        }

        if ($request->hasFile('logo_dark')) {
            $pathDark = $request->file('logo_dark')->store('settings', 'public');
            Setting::set('brand_logo_dark', $pathDark);
        }

        ActivityLog::log(
            action: 'update_settings',
            subject: 'Memperbarui konfigurasi situs dan identitas brand NSA',
            userId: $request->user()->id,
        );

        return back()->with('success', 'Pengaturan situs berhasil disimpan.');
    }
}
