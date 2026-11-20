<?php

namespace App\Console\Commands;

use App\Support\Copy\CopyRegistry;
use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use Throwable;

class CopyCheckCommand extends Command
{
    protected $signature = 'copy:check {--path= : Path direktori frontend yang dipindai (default: resources/js)}';

    protected $description = 'Memeriksa kesesuaian registry teks (resources/copy & resources/copy/en) dengan pemakaian t(...) dan <RichCopy> di resources/js';

    public function handle(CopyRegistry $registry): int
    {
        try {
            $registeredKeys = array_keys($registry->all());
            $englishDefaults = $registry->englishDefaults();
        } catch (Throwable $e) {
            $this->error('Registry teks tidak valid: '.$e->getMessage());

            return self::FAILURE;
        }

        $scanPath = $this->option('path') ?: resource_path('js');
        if (! is_dir($scanPath)) {
            $this->error("Direktori frontend tidak ditemukan: {$scanPath}");

            return self::FAILURE;
        }

        $usedKeys = $this->scanUsedKeys($scanPath);

        $unregistered = array_values(array_diff($usedKeys, $registeredKeys));
        $unused = array_values(array_diff($registeredKeys, $usedKeys));
        $missingEnglish = array_values(array_filter(
            $registeredKeys,
            fn (string $key) => ! isset($englishDefaults[$key]) || trim($englishDefaults[$key]) === ''
        ));

        sort($unregistered);
        sort($unused);
        sort($missingEnglish);

        $this->info('Total key terdaftar          : '.count($registeredKeys));
        $this->info('Total key dipakai            : '.count($usedKeys));
        $this->info('Total key punya bawaan EN    : '.(count($registeredKeys) - count($missingEnglish)));

        if ($unused !== []) {
            $this->warn('Key terdaftar tetapi belum dipakai di frontend ('.count($unused).'):');
            foreach ($unused as $key) {
                $this->line("  - {$key}");
            }
        }

        $hasError = false;

        if ($unregistered !== []) {
            $hasError = true;
            $this->error('Key dipakai di frontend tetapi TIDAK terdaftar di registry ('.count($unregistered).'):');
            foreach ($unregistered as $key) {
                $this->line("  - {$key}");
            }
        }

        if ($missingEnglish !== []) {
            $hasError = true;
            $this->error('Key aktif tanpa terjemahan bawaan Inggris di resources/copy/en/ ('.count($missingEnglish).'):');
            foreach ($missingEnglish as $key) {
                $this->line("  - {$key}");
            }
        }

        if ($hasError) {
            return self::FAILURE;
        }

        $this->info('Pemeriksaan selesai: semua key terdaftar dan memiliki terjemahan bawaan Inggris.');

        return self::SUCCESS;
    }

    /**
     * @return list<string>
     */
    private function scanUsedKeys(string $directory): array
    {
        $found = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

        /** @var SplFileInfo $file */
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $ext = strtolower($file->getExtension());
            if (! in_array($ext, ['ts', 'tsx', 'js', 'jsx'], true)) {
                continue;
            }

            $content = file_get_contents($file->getPathname());
            if ($content === false) {
                continue;
            }

            if (preg_match_all('/(?<![\w$.])t\(\s*[\'"]([a-z0-9]+(?:\.[a-z0-9_]+)+)[\'"]/u', $content, $matches)) {
                foreach ($matches[1] as $key) {
                    $found[$key] = true;
                }
            }

            if (preg_match_all('/<RichCopy\b[^>]*\bk=\s*[\'"]([a-z0-9]+(?:\.[a-z0-9_]+)+)[\'"]/u', $content, $matches)) {
                foreach ($matches[1] as $key) {
                    $found[$key] = true;
                }
            }
        }

        return array_keys($found);
    }
}
