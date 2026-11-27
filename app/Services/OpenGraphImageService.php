<?php

namespace App\Services;

use Throwable;

class OpenGraphImageService
{
    public const WIDTH = 1200;

    public const HEIGHT = 630;

    /**
     * Menghasilkan versi JPEG 1200x630 (< 200 KB) di storage/app/public/og-cache/
     * agar WhatsApp selalu menampilkan preview kartu foto besar di atas judul.
     *
     * @return array{url: string, width: int, height: int, type: string}|null
     */
    public function prepare(?string $rawUrl): ?array
    {
        if (! is_string($rawUrl) || trim($rawUrl) === '') {
            return null;
        }

        $rawUrl = trim($rawUrl);
        $relativePath = ltrim((string) parse_url($rawUrl, PHP_URL_PATH), '/');

        $localPath = null;
        if (str_starts_with($relativePath, 'storage/')) {
            $candidate = storage_path('app/public/'.substr($relativePath, 8));
            if (is_file($candidate)) {
                $localPath = $candidate;
            }
        } elseif ($relativePath !== '' && is_file(public_path($relativePath))) {
            $localPath = public_path($relativePath);
        }

        // Jika berkas lokal ada dan ekstensi GD tersedia, buat/pakai versi 1200x630 JPEG ringan
        if ($localPath !== null && function_exists('imagecreatetruecolor')) {
            $cached = $this->generateOptimizedJpeg($localPath);
            if ($cached !== null) {
                return $cached;
            }
        }

        // Fallback ke gambar asli jika berkas eksternal atau GD tidak tersedia
        $width = self::WIDTH;
        $height = self::HEIGHT;
        $mime = 'image/jpeg';

        if ($localPath !== null && ($info = @getimagesize($localPath))) {
            $width = (int) ($info[0] ?? self::WIDTH);
            $height = (int) ($info[1] ?? self::HEIGHT);
            $mime = (string) ($info['mime'] ?? 'image/jpeg');
        } else {
            $ext = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));
            $mime = match ($ext) {
                'png' => 'image/png',
                'webp' => 'image/webp',
                default => 'image/jpeg',
            };
        }

        return [
            'url' => $rawUrl,
            'width' => $width,
            'height' => $height,
            'type' => $mime,
        ];
    }

    /**
     * @return array{url: string, width: int, height: int, type: string}|null
     */
    private function generateOptimizedJpeg(string $sourcePath): ?array
    {
        try {
            $mtime = @filemtime($sourcePath) ?: 0;
            $hash = md5($sourcePath.'|'.$mtime.'|'.self::WIDTH.'x'.self::HEIGHT);
            $cacheDir = storage_path('app/public/og-cache');
            $cacheFile = $cacheDir.DIRECTORY_SEPARATOR.$hash.'.jpg';
            $publicUrl = '/storage/og-cache/'.$hash.'.jpg';

            if (is_file($cacheFile) && filesize($cacheFile) > 0) {
                return [
                    'url' => $publicUrl,
                    'width' => self::WIDTH,
                    'height' => self::HEIGHT,
                    'type' => 'image/jpeg',
                ];
            }

            $info = @getimagesize($sourcePath);
            if (! $info || empty($info[0]) || empty($info[1])) {
                return null;
            }

            $srcW = (int) $info[0];
            $srcH = (int) $info[1];
            $mime = (string) ($info['mime'] ?? '');

            $srcImg = match ($mime) {
                'image/jpeg', 'image/jpg' => function_exists('imagecreatefromjpeg') ? @imagecreatefromjpeg($sourcePath) : false,
                'image/png' => function_exists('imagecreatefrompng') ? @imagecreatefrompng($sourcePath) : false,
                'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourcePath) : false,
                default => false,
            };

            if (! $srcImg) {
                return null;
            }

            // Center-crop ke rasio 1200:630 (1.9047:1) agar tidak gepeng atau terpotong aneh
            $targetRatio = self::WIDTH / self::HEIGHT;
            $srcRatio = $srcW / $srcH;

            if ($srcRatio > $targetRatio) {
                $cropH = $srcH;
                $cropW = (int) round($srcH * $targetRatio);
                $srcX = (int) floor(($srcW - $cropW) / 2);
                $srcY = 0;
            } else {
                $cropW = $srcW;
                $cropH = (int) round($srcW / $targetRatio);
                $srcX = 0;
                $srcY = (int) floor(($srcH - $cropH) / 2);
            }

            $dstImg = imagecreatetruecolor(self::WIDTH, self::HEIGHT);
            $white = imagecolorallocate($dstImg, 255, 255, 255);
            imagefill($dstImg, 0, 0, $white);

            imagecopyresampled(
                $dstImg,
                $srcImg,
                0,
                0,
                $srcX,
                $srcY,
                self::WIDTH,
                self::HEIGHT,
                $cropW,
                $cropH
            );

            if (! is_dir($cacheDir)) {
                @mkdir($cacheDir, 0755, true);
            }

            $saved = @imagejpeg($dstImg, $cacheFile, 82);
            imagedestroy($srcImg);
            imagedestroy($dstImg);

            if (! $saved || ! is_file($cacheFile)) {
                return null;
            }

            return [
                'url' => $publicUrl,
                'width' => self::WIDTH,
                'height' => self::HEIGHT,
                'type' => 'image/jpeg',
            ];
        } catch (Throwable) {
            return null;
        }
    }
}
