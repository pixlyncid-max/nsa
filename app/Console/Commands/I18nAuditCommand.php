<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

class I18nAuditCommand extends Command
{
    protected $signature = 'i18n:audit
        {--path= : Direktori yang dipindai (default: resources/js)}
        {--limit=50 : Maksimal jumlah temuan yang ditampilkan (0 = semua)}';

    protected $description = 'Memindai file frontend non-admin di resources/js untuk string literal berbahasa Indonesia atau Inggris yang masih tertanam';

    /** @var list<string> */
    private const EXCLUDED_SEGMENTS = [
        '/Pages/Admin/',
        '/Components/admin/',
        '/Layouts/AdminLayout.tsx',
        '/Pages/Design/',
        '/lib/copy.ts',
        '/types/',
    ];

    public function handle(): int
    {
        $scanPath = $this->option('path') ?: resource_path('js');
        if (! is_dir($scanPath)) {
            $this->error("Direktori tidak ditemukan: {$scanPath}");

            return self::FAILURE;
        }

        $limit = (int) $this->option('limit');
        $findings = [];

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($scanPath));

        /** @var SplFileInfo $file */
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $ext = strtolower($file->getExtension());
            if (! in_array($ext, ['tsx', 'jsx'], true)) {
                continue;
            }

            $normalizedPath = str_replace('\\', '/', $file->getPathname());
            if ($this->isExcluded($normalizedPath)) {
                continue;
            }

            $lines = file($file->getPathname(), FILE_IGNORE_NEW_LINES);
            if ($lines === false) {
                continue;
            }

            $relativePath = ltrim(str_replace(str_replace('\\', '/', base_path()), '', $normalizedPath), '/');

            foreach ($lines as $index => $line) {
                $lineNum = $index + 1;
                $trimmed = trim($line);
                if ($trimmed === '' || str_starts_with($trimmed, '//') || str_starts_with($trimmed, '*') || str_starts_with($trimmed, 'import ')) {
                    continue;
                }

                // 1. Atribut UI yang tampak ke pengguna atau pembaca layar: placeholder, aria-label, alt, title
                if (preg_match_all('/\b(placeholder|aria-label|alt|title)=["\']([^"\']*[a-zA-Z]{3,}[^"\']*)["\']/u', $line, $attrMatches, PREG_SET_ORDER)) {
                    foreach ($attrMatches as $match) {
                        $text = trim($match[2]);
                        if ($this->looksLikeHumanText($text)) {
                            $findings[] = [
                                'file' => $relativePath,
                                'line' => $lineNum,
                                'kind' => $match[1],
                                'text' => $text,
                            ];
                        }
                    }
                }

                // 2. Toast literal: toast.success('...') / toast.error("...")
                if (preg_match_all('/\btoast\.(?:success|error|info|warning)\(\s*[\'"]([^\'"]{4,})[\'"]/u', $line, $toastMatches)) {
                    foreach ($toastMatches[1] as $text) {
                        if ($this->looksLikeHumanText($text)) {
                            $findings[] = [
                                'file' => $relativePath,
                                'line' => $lineNum,
                                'kind' => 'toast',
                                'text' => trim($text),
                            ];
                        }
                    }
                }

                // 3. Teks JSX langsung di antara >...<
                if (preg_match_all('/>([^<>{}\r\n]+)</u', $line, $jsxMatches)) {
                    foreach ($jsxMatches[1] as $raw) {
                        $text = trim($raw);
                        if ($this->looksLikeHumanText($text)) {
                            $findings[] = [
                                'file' => $relativePath,
                                'line' => $lineNum,
                                'kind' => 'jsx-text',
                                'text' => $text,
                            ];
                        }
                    }
                }
            }
        }

        $total = count($findings);
        $this->info("Audit i18n selesai. Total temuan string literal non-admin: {$total}");

        if ($total === 0) {
            $this->info('Tidak ditemukan string literal yang tertanam.');

            return self::SUCCESS;
        }

        $shown = $limit > 0 ? array_slice($findings, 0, $limit) : $findings;
        foreach ($shown as $item) {
            $snippet = mb_strlen($item['text']) > 70
                ? mb_substr($item['text'], 0, 67).'...'
                : $item['text'];
            $this->line(sprintf('  [%s] %s:%d -> "%s"', $item['kind'], $item['file'], $item['line'], $snippet));
        }

        if ($limit > 0 && $total > $limit) {
            $this->warn('... dan '.($total - $limit).' temuan lainnya. Gunakan --limit=0 untuk melihat semuanya.');
        }

        return self::SUCCESS;
    }

    private function isExcluded(string $normalizedPath): bool
    {
        foreach (self::EXCLUDED_SEGMENTS as $segment) {
            if (str_contains($normalizedPath, $segment)) {
                return true;
            }
        }

        return false;
    }

    private function looksLikeHumanText(string $text): bool
    {
        if (mb_strlen($text) < 3) {
            return false;
        }

        // Abaikan entitas HTML, angka/simbol saja, URL, atau kode/kelas CSS
        if (preg_match('/^(&[a-z]+;|[\d\s.,:%+\-\/()•|—–→←↑↓×✓]+)$/u', $text)) {
            return false;
        }

        if (preg_match('/^(https?:\/\/|mailto:|tel:|\/|#)/i', $text)) {
            return false;
        }

        // Harus mengandung minimal satu kata alfabet >= 3 huruf
        return preg_match('/[A-Za-zÀ-ÿ]{3,}/u', $text) === 1;
    }
}
