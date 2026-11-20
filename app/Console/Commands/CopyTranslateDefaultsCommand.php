<?php

namespace App\Console\Commands;

use App\Contracts\Translator;
use App\Services\Translation\TranslationPromptBuilder;
use App\Support\Copy\CopyRegistry;
use Illuminate\Console\Command;
use Throwable;

class CopyTranslateDefaultsCommand extends Command
{
    protected $signature = 'copy:translate-defaults
        {--only= : Terjemahkan hanya satu kelompok tertentu (mis. global, home)}
        {--missing : Hanya terjemahkan key yang belum ada di resources/copy/en/}';

    protected $description = 'Menerjemahkan nilai bawaan registry Indonesia ke resources/copy/en/*.php untuk ditinjau manusia sebelum di-commit';

    public function handle(CopyRegistry $registry, Translator $translator): int
    {
        $onlyGroup = $this->option('only');
        $onlyMissing = (bool) $this->option('missing');

        $groups = $onlyGroup ? [(string) $onlyGroup] : $registry->groups();
        $targetDir = $registry->englishBasePath();

        if (! is_dir($targetDir) && ! mkdir($targetDir, 0755, true) && ! is_dir($targetDir)) {
            $this->error("Gagal membuat direktori: {$targetDir}");

            return self::FAILURE;
        }

        $batchSize = max(1, (int) config('translation.batch_size', 25));
        $totalTranslated = 0;

        foreach ($groups as $group) {
            $entries = $registry->forGroup($group);
            if ($entries === []) {
                $this->warn("Kelompok [{$group}] tidak ditemukan atau kosong.");

                continue;
            }

            $filePath = $targetDir.DIRECTORY_SEPARATOR.$group.'.php';
            $existing = is_file($filePath) ? (require $filePath) : [];
            if (! is_array($existing)) {
                $existing = [];
            }

            $toTranslate = [];
            foreach ($entries as $key => $meta) {
                $hasExisting = isset($existing[$key]) && is_string($existing[$key]) && trim($existing[$key]) !== '';
                if ($onlyMissing && $hasExisting) {
                    continue;
                }
                $toTranslate[$key] = (string) $meta['default'];
            }

            if ($toTranslate === []) {
                $this->line("Kelompok [{$group}]: tidak ada key baru yang perlu diterjemahkan.");

                continue;
            }

            $this->info("Menerjemahkan kelompok [{$group}] (".count($toTranslate).' key) via driver ['.$translator->driverName().']...');

            $chunks = array_chunk($toTranslate, $batchSize, true);
            $merged = $existing;

            foreach ($chunks as $chunk) {
                try {
                    $glossary = TranslationPromptBuilder::relevantGlossary($chunk, 'en');
                    $constraints = [];
                    foreach ($chunk as $k => $_) {
                        $meta = $entries[$k];
                        $constraints[$k] = [
                            'max' => $registry->maxFor($k, 'en'),
                            'placeholders' => $meta['placeholders'] ?? [],
                            'type' => $meta['type'],
                        ];
                    }

                    $translated = $translator->translateBatch($chunk, 'id', 'en', [
                        'glossary' => $glossary,
                        'constraints' => $constraints,
                        'domain' => 'Indonesian aquaculture association UI copy',
                    ]);
                } catch (Throwable $e) {
                    $this->error("Gagal menerjemahkan batch pada kelompok [{$group}]: ".$e->getMessage());

                    return self::FAILURE;
                }

                foreach ($chunk as $key => $sourceVal) {
                    $candidate = $translated[$key] ?? null;
                    if (! is_string($candidate) || trim($candidate) === '') {
                        $this->warn("  [!] Hasil kosong untuk [{$key}], dilewati.");

                        continue;
                    }

                    $missingPlaceholder = false;
                    foreach ($entries[$key]['placeholders'] ?? [] as $placeholder) {
                        if (! str_contains($candidate, '{'.$placeholder.'}')) {
                            $this->warn("  [!] Placeholder {{$placeholder}} hilang pada [{$key}], dilewati.");
                            $missingPlaceholder = true;
                            break;
                        }
                    }

                    if ($missingPlaceholder) {
                        continue;
                    }

                    $merged[$key] = $candidate;
                    $totalTranslated++;
                }
            }

            // Urutkan sesuai urutan key di registry Indonesia
            $ordered = [];
            foreach (array_keys($entries) as $key) {
                if (isset($merged[$key]) && is_string($merged[$key]) && trim($merged[$key]) !== '') {
                    $ordered[$key] = $merged[$key];
                }
            }

            $this->writePhpArrayFile($filePath, $ordered);
            $this->info("  ✓ Ditulis ke {$filePath} (".count($ordered).' key).');
        }

        $registry->flush();
        $this->info("Selesai. Total key diterjemahkan: {$totalTranslated}. Tinjau hasil di resources/copy/en/ sebelum commit.");

        return self::SUCCESS;
    }

    /**
     * @param  array<string, string>  $data
     */
    private function writePhpArrayFile(string $path, array $data): void
    {
        $lines = ["<?php\n", "return [\n"];
        foreach ($data as $key => $value) {
            $exportedKey = var_export($key, true);
            $exportedVal = var_export($value, true);
            $lines[] = "    {$exportedKey} => {$exportedVal},\n";
        }
        $lines[] = "];\n";

        file_put_contents($path, implode('', $lines));
    }
}
