<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SaveSocialStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Otomatis rapikan format URL sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        // Rapikan website (tambahkan https:// jika belum ada)
        if ($this->filled('website')) {
            $web = trim($this->website);
            if (! preg_match('~^(?:f|ht)tps?://~i', $web)) {
                $web = 'https://'.$web;
            }
            $merge['website'] = $web;
        }

        // Rapikan Instagram (jika hanya username atau diawali @)
        if ($this->filled('instagram')) {
            $ig = trim($this->instagram);
            $ig = ltrim($ig, '@');
            if (! str_starts_with($ig, 'http://') && ! str_starts_with($ig, 'https://')) {
                $ig = 'https://instagram.com/'.ltrim($ig, '/');
            }
            $merge['instagram'] = $ig;
        }

        // Rapikan Facebook
        if ($this->filled('facebook')) {
            $fb = trim($this->facebook);
            if (! str_starts_with($fb, 'http://') && ! str_starts_with($fb, 'https://')) {
                $fb = 'https://facebook.com/'.ltrim($fb, '/');
            }
            $merge['facebook'] = $fb;
        }

        // Rapikan TikTok
        if ($this->filled('tiktok')) {
            $tt = trim($this->tiktok);
            if (! str_starts_with($tt, 'http://') && ! str_starts_with($tt, 'https://')) {
                $handle = str_starts_with($tt, '@') ? $tt : '@'.$tt;
                $tt = 'https://tiktok.com/'.$handle;
            }
            $merge['tiktok'] = $tt;
        }

        // Rapikan YouTube
        if ($this->filled('youtube')) {
            $yt = trim($this->youtube);
            if (! str_starts_with($yt, 'http://') && ! str_starts_with($yt, 'https://')) {
                $yt = 'https://youtube.com/'.ltrim($yt, '/');
            }
            $merge['youtube'] = $yt;
        }

        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'website' => ['nullable', 'url', 'max:200'],
            'instagram' => ['nullable', 'url', 'max:200'],
            'facebook' => ['nullable', 'url', 'max:200'],
            'tiktok' => ['nullable', 'url', 'max:200'],
            'youtube' => ['nullable', 'url', 'max:200'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'website.url' => 'Format alamat website tidak valid (contoh: https://usahaanda.com).',
            'instagram.url' => 'Format URL atau username Instagram tidak valid.',
            'facebook.url' => 'Format URL Facebook tidak valid.',
            'tiktok.url' => 'Format URL TikTok tidak valid.',
            'youtube.url' => 'Format URL YouTube tidak valid.',
        ];
    }
}
