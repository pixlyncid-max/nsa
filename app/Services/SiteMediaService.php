<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class SiteMediaService
{
    public const CACHE_KEY = 'site_media:urls';

    /**
     * @return array<string, array<string, mixed>>
     */
    public function slots(): array
    {
        return (array) config('site_media.slots', []);
    }

    /**
     * @return array<string, string>
     */
    public function groups(): array
    {
        return (array) config('site_media.groups', []);
    }

    public function settingKeyFor(string $slotKey): string
    {
        $slot = $this->slots()[$slotKey] ?? null;
        if ($slot === null) {
            throw new InvalidArgumentException("Slot gambar [{$slotKey}] tidak terdaftar.");
        }

        return (string) ($slot['setting_key'] ?? "site_media.{$slotKey}");
    }

    /**
     * Mengembalikan URL gambar unggahan CMS untuk satu slot (atau null bila belum diunggah).
     */
    public function uploadedUrl(string $slotKey): ?string
    {
        $urls = $this->allUrls();

        return $urls[$slotKey] ?? null;
    }

    /**
     * Mengembalikan peta [slotKey => url|null] untuk seluruh slot (di-cache).
     *
     * @return array<string, ?string>
     */
    public function allUrls(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            $slots = $this->slots();
            $settingKeys = [];
            foreach ($slots as $key => $meta) {
                $settingKeys[$key] = (string) ($meta['setting_key'] ?? "site_media.{$key}");
            }

            $stored = Setting::query()
                ->whereIn('key', array_values($settingKeys))
                ->pluck('value', 'key')
                ->all();

            $result = [];
            foreach ($settingKeys as $slotKey => $settingKey) {
                $path = $stored[$settingKey] ?? null;
                $result[$slotKey] = is_string($path) && trim($path) !== ''
                    ? Storage::url($path)
                    : null;
            }

            return $result;
        });
    }

    /**
     * Daftar lengkap slot beserta metadata & URL aktif untuk halaman CMS.
     *
     * @return list<array<string, mixed>>
     */
    public function listForAdmin(): array
    {
        $slots = $this->slots();
        $groups = $this->groups();
        $urls = $this->allUrls();

        $items = [];
        foreach ($slots as $key => $meta) {
            $uploadedUrl = $urls[$key] ?? null;
            $defaultUrl = $meta['default'] ?? null;

            // Cek apakah file default benar-benar ada di public/ agar pratinjau tidak gambar pecah
            $defaultExists = is_string($defaultUrl)
                && $defaultUrl !== ''
                && file_exists(public_path(ltrim($defaultUrl, '/')));

            $items[] = [
                'key' => $key,
                'group' => $meta['group'],
                'groupLabel' => $groups[$meta['group']] ?? ucfirst((string) $meta['group']),
                'label' => $meta['label'],
                'hint' => $meta['hint'] ?? '',
                'recommended' => $meta['recommended'] ?? '',
                'aspect' => $meta['aspect'] ?? 'aspect-video',
                'darkPreview' => (bool) ($meta['dark_preview'] ?? false),
                'uploadedUrl' => $uploadedUrl,
                'defaultUrl' => $defaultExists ? $defaultUrl : null,
                'previewUrl' => $uploadedUrl ?? ($defaultExists ? $defaultUrl : null),
                'isCustom' => $uploadedUrl !== null,
            ];
        }

        return $items;
    }

    /**
     * Unggah dan simpan gambar baru untuk slot tertentu, hapus berkas lama, dan bersihkan cache.
     */
    public function upload(string $slotKey, UploadedFile $file): string
    {
        $settingKey = $this->settingKeyFor($slotKey);
        $oldPath = Setting::get($settingKey);

        $folder = str_starts_with($slotKey, 'brand_logo_') ? 'settings' : 'site-media';
        $newPath = $file->store($folder, 'public');

        Setting::set($settingKey, $newPath);
        if ($slotKey === 'brand_logo_light') {
            Setting::set('logo', $newPath);
        }

        if (is_string($oldPath) && $oldPath !== '' && $oldPath !== $newPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        $this->clearCache();

        return Storage::url($newPath);
    }

    /**
     * Hapus gambar unggahan CMS dan kembalikan slot ke nilai bawaan.
     */
    public function reset(string $slotKey): void
    {
        $settingKey = $this->settingKeyFor($slotKey);
        $oldPath = Setting::get($settingKey);

        if (is_string($oldPath) && $oldPath !== '' && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        Setting::set($settingKey, null);
        if ($slotKey === 'brand_logo_light') {
            Setting::set('logo', null);
        }

        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
