<?php

namespace App\Console\Commands;

use App\Jobs\TranslateModelJob;
use App\Models\ContentTranslation;
use Illuminate\Console\Command;

class TranslateRetryFailedCommand extends Command
{
    protected $signature = 'translate:retry-failed';

    protected $description = 'Mengantrekan ulang seluruh terjemahan berstatus failed';

    public function handle(): int
    {
        $failedGroups = ContentTranslation::query()
            ->select(['translatable_type', 'translatable_id', 'locale'])
            ->where('status', ContentTranslation::STATUS_FAILED)
            ->where('is_manual', false)
            ->distinct()
            ->get();

        if ($failedGroups->isEmpty()) {
            $this->info('Tidak ada terjemahan gagal yang perlu dicoba ulang.');

            return self::SUCCESS;
        }

        $count = 0;
        foreach ($failedGroups as $group) {
            ContentTranslation::query()
                ->where('translatable_type', $group->translatable_type)
                ->where('translatable_id', $group->translatable_id)
                ->where('locale', $group->locale)
                ->where('status', ContentTranslation::STATUS_FAILED)
                ->where('is_manual', false)
                ->update([
                    'status' => ContentTranslation::STATUS_PENDING,
                    'error' => null,
                ]);

            if (class_exists($group->translatable_type)) {
                TranslateModelJob::dispatch(
                    $group->translatable_type,
                    $group->translatable_id,
                    $group->locale
                )->onQueue((string) config('translation.queue', 'translations'));
                $count++;
            }
        }

        $this->info("Berhasil mengantrekan ulang {$count} entitas terjemahan yang gagal.");

        return self::SUCCESS;
    }
}
