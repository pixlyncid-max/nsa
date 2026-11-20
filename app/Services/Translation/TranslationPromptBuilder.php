<?php

namespace App\Services\Translation;

use App\Models\TranslationGlossary;

class TranslationPromptBuilder
{
    /**
     * Mengambil hanya entri glosarium aktif yang relevan dengan kumpulan teks pada batch.
     *
     * @param  array<string, string>  $items
     * @return list<array{source: string, target: string, note: ?string, case_sensitive: bool}>
     */
    public static function relevantGlossary(array $items, string $locale = 'en'): array
    {
        if ($items === []) {
            return [];
        }

        $haystack = implode("\n", $items);
        $haystackLower = mb_strtolower($haystack);

        return TranslationGlossary::query()
            ->where('locale', $locale)
            ->where('is_active', true)
            ->get()
            ->filter(function (TranslationGlossary $entry) use ($haystack, $haystackLower): bool {
                if ($entry->source === '') {
                    return false;
                }

                if ($entry->case_sensitive) {
                    return str_contains($haystack, $entry->source);
                }

                return str_contains($haystackLower, mb_strtolower($entry->source));
            })
            ->map(fn (TranslationGlossary $entry) => [
                'source' => $entry->source,
                'target' => $entry->target,
                'note' => $entry->note,
                'case_sensitive' => $entry->case_sensitive,
            ])
            ->values()
            ->all();
    }

    /**
     * Instruksi sistem standar untuk driver berbasis LLM (Claude, dll.).
     *
     * @param  list<array{source: string, target: string, note: ?string}>  $glossary
     */
    public static function systemPrompt(string $from = 'id', string $to = 'en', array $glossary = []): string
    {
        $lines = [
            "You are a professional translator translating from {$from} (Indonesian) to {$to} (English) for an aquaculture, fisheries, and business audience.",
            'Produce clear, accurate, natural, and professional English.',
            'STRICT RULES:',
            '1. NEVER alter or translate placeholders like {name}, {step}, {total}, {count}. Keep them verbatim.',
            '2. NEVER alter HTML tags, tag structure, or attributes. Translate only visible text inside tags.',
            '3. NEVER alter URLs, email addresses, numbers, ISO dates, person names, organization names, brand names, or place names.',
            '4. Return ONLY a valid JSON object with the exact same keys as the input JSON, with no markdown fences and no commentary.',
        ];

        if ($glossary !== []) {
            $lines[] = '5. Strictly follow this domain glossary:';
            foreach ($glossary as $term) {
                $note = ! empty($term['note']) ? " ({$term['note']})" : '';
                $lines[] = "   - \"{$term['source']}\" => \"{$term['target']}\"{$note}";
            }
        }

        return implode("\n", $lines);
    }
}
