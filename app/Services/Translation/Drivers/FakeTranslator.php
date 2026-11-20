<?php

namespace App\Services\Translation\Drivers;

use App\Contracts\Translator;

class FakeTranslator implements Translator
{
    public function __construct(
        private readonly string $prefix = '[EN] ',
    ) {}

    public function translateBatch(
        array $items,
        string $from = 'id',
        string $to = 'en',
        array $context = []
    ): array {
        $glossary = $context['glossary'] ?? [];
        $htmlFields = (array) ($context['html_fields'] ?? []);
        $results = [];

        foreach ($items as $key => $text) {
            $isHtml = in_array($key, $htmlFields, true) || (str_contains($text, '<') && str_contains($text, '>'));
            $translated = $this->applyGlossary($text, $glossary);

            if ($isHtml) {
                // Sisipkan awalan di dalam teks HTML pertama tanpa merusak tag
                $replaced = preg_replace('/(>[^<]+)/', '>'.$this->prefix.'$1', $translated, 1);
                $results[$key] = $replaced !== null && $replaced !== $translated
                    ? preg_replace('/>>/', '>', $replaced, 1)
                    : $this->prefix.$translated;
            } else {
                $results[$key] = $this->prefix.$translated;
            }
        }

        return $results;
    }

    public function driverName(): string
    {
        return 'fake';
    }

    /**
     * @param  list<array{source: string, target: string, case_sensitive?: bool}>  $glossary
     */
    private function applyGlossary(string $text, array $glossary): string
    {
        foreach ($glossary as $term) {
            $source = $term['source'] ?? '';
            $target = $term['target'] ?? '';
            if ($source === '' || $target === '' || $source === $target) {
                continue;
            }

            $flags = ! empty($term['case_sensitive']) ? 'u' : 'iu';
            $pattern = '/\b'.preg_quote($source, '/').'\b/'.$flags;
            $text = preg_replace($pattern, $target, $text) ?? $text;
        }

        return $text;
    }
}
