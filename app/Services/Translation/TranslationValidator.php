<?php

namespace App\Services\Translation;

use DOMDocument;

class TranslationValidator
{
    /**
     * Memvalidasi hasil terjemahan terhadap sumbernya.
     * Melempar TranslationValidationException bila tidak memenuhi syarat.
     */
    public function validate(string $field, string $source, string $translated, bool $isHtml = false): void
    {
        $trimmedSource = trim($source);
        $trimmedTranslated = trim($translated);

        if ($trimmedTranslated === '') {
            throw new TranslationValidationException("Hasil terjemahan kosong untuk field [{$field}].");
        }

        // 1. Semua placeholder {name} dari sumber wajib ada di terjemahan
        preg_match_all('/\{[a-zA-Z0-9_]+\}/', $trimmedSource, $sourcePlaceholders);
        foreach (array_unique($sourcePlaceholders[0]) as $placeholder) {
            if (! str_contains($trimmedTranslated, $placeholder)) {
                throw new TranslationValidationException(
                    "Placeholder {$placeholder} hilang pada hasil terjemahan field [{$field}]."
                );
            }
        }

        // 2. Semua URL dari sumber wajib tidak berubah
        preg_match_all('/https?:\/\/[^\s<>"\']+/i', $trimmedSource, $sourceUrls);
        foreach (array_unique($sourceUrls[0]) as $url) {
            if (! str_contains($trimmedTranslated, $url)) {
                throw new TranslationValidationException(
                    "URL {$url} berubah atau hilang pada hasil terjemahan field [{$field}]."
                );
            }
        }

        // 3. Semua angka dari teks polos sumber wajib dipertahankan
        $plainSource = $isHtml ? trim(strip_tags($trimmedSource)) : $trimmedSource;
        $plainTranslated = $isHtml ? trim(strip_tags($trimmedTranslated)) : $trimmedTranslated;

        preg_match_all('/\b\d+(?:[.,]\d+)*\b/', $plainSource, $sourceNumbers);
        foreach (array_unique($sourceNumbers[0]) as $number) {
            $altDot = str_replace(',', '.', $number);
            $altComma = str_replace('.', ',', $number);
            if (
                ! str_contains($plainTranslated, $number)
                && ! str_contains($plainTranslated, $altDot)
                && ! str_contains($plainTranslated, $altComma)
            ) {
                throw new TranslationValidationException(
                    "Angka {$number} berubah atau hilang pada hasil terjemahan field [{$field}]."
                );
            }
        }

        // 4. Tag HTML harus seimbang dan jenis/jumlah tag sama bila mode HTML
        if ($isHtml && str_contains($trimmedSource, '<')) {
            $sourceTags = $this->extractTagCounts($trimmedSource);
            $translatedTags = $this->extractTagCounts($trimmedTranslated);

            if ($sourceTags !== $translatedTags) {
                throw new TranslationValidationException(
                    "Struktur tag HTML tidak cocok pada hasil terjemahan field [{$field}]."
                );
            }
        }

        // 5. Rasio panjang wajar (0.5x – 3.0x untuk teks >= 15 karakter)
        $srcLen = mb_strlen($plainSource);
        $trLen = mb_strlen($plainTranslated);

        if ($srcLen >= 15) {
            $ratio = $trLen / max(1, $srcLen);
            if ($ratio < 0.5 || $ratio > 3.0) {
                throw new TranslationValidationException(
                    'Rasio panjang terjemahan tidak wajar ('.round($ratio, 2)."x) untuk field [{$field}]."
                );
            }
        }

        // 6. Tidak boleh sama persis dengan sumber bila sumber adalah kalimat panjang
        if ($srcLen >= 35 && str_contains($plainSource, ' ') && $plainSource === $plainTranslated) {
            throw new TranslationValidationException(
                "Hasil terjemahan sama persis dengan sumber kalimat panjang pada field [{$field}]."
            );
        }
    }

    /**
     * @return array<string, int>
     */
    private function extractTagCounts(string $html): array
    {
        $previous = libxml_use_internal_errors(true);
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadHTML(
            '<?xml encoding="utf-8" ?><div id="__vroot__">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $dom->getElementById('__vroot__');
        if (! $root) {
            return [];
        }

        $counts = [];
        $elements = $root->getElementsByTagName('*');
        foreach ($elements as $el) {
            $tag = strtolower($el->tagName);
            $counts[$tag] = ($counts[$tag] ?? 0) + 1;
        }
        ksort($counts);

        return $counts;
    }
}
