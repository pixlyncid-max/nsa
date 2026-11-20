<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TranslateBackfillCommand extends Command
{
    protected $signature = 'translate:backfill {model? : Nama singkat model (post|product|program|page) atau kosong untuk semua} {--force : Terjemahkan ulang meski hash sama (tidak menimpa manual)}';

    protected $description = 'Mengantrekan terjemahan otomatis untuk data konten lama yang belum diterjemahkan';

    public function handle(): int
    {
        $models = (array) config('translation.models', []);
        $requested = $this->argument('model');
        $force = (bool) $this->option('force');

        if ($requested !== null) {
            $key = strtolower((string) $requested);
            if (! array_key_exists($key, $models)) {
                $this->error("Model [{$requested}] tidak terdaftar. Pilihan: ".implode(', ', array_keys($models)));

                return self::FAILURE;
            }
            $models = [$key => $models[$key]];
        }

        $totalQueued = 0;

        foreach ($models as $alias => $class) {
            if (! class_exists($class) || ! method_exists($class, 'queueAutoTranslations')) {
                $this->warn("Melewati [{$alias}] ({$class}) karena belum memakai HasAutoTranslations.");

                continue;
            }

            $queuedForModel = 0;
            $class::query()->chunkById(100, function ($records) use ($force, &$queuedForModel): void {
                foreach ($records as $record) {
                    if ($record->queueAutoTranslations($force)) {
                        $queuedForModel++;
                    }
                }
            });

            $this->info("Model [{$alias}]: {$queuedForModel} entri diantrekan.");
            $totalQueued += $queuedForModel;
        }

        $this->info("Selesai. Total entri diantrekan: {$totalQueued}.");

        return self::SUCCESS;
    }
}
