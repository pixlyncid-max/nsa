<?php

namespace App\Console\Commands;

use App\Models\ContentTranslation;
use App\Models\TranslationUsageDaily;
use Illuminate\Console\Command;

class TranslateStatusCommand extends Command
{
    protected $signature = 'translate:status';

    protected $description = 'Menampilkan ringkasan jumlah terjemahan per status dan pemakaian karakter harian';

    public function handle(): int
    {
        $counts = ContentTranslation::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        $this->info('Ringkasan Status Terjemahan:');
        $this->table(
            ['Status', 'Jumlah'],
            [
                ['pending', $counts[ContentTranslation::STATUS_PENDING] ?? 0],
                ['done', $counts[ContentTranslation::STATUS_DONE] ?? 0],
                ['manual', $counts[ContentTranslation::STATUS_MANUAL] ?? 0],
                ['failed', $counts[ContentTranslation::STATUS_FAILED] ?? 0],
            ]
        );

        $todayChars = TranslationUsageDaily::todayChars();
        $dailyLimit = (int) config('translation.daily_char_limit', 100000);
        $driver = (string) config('translation.driver', 'fake');

        $this->info("Driver aktif           : {$driver}");
        $this->info('Pemakaian hari ini     : '.number_format($todayChars).' / '.number_format($dailyLimit).' karakter');

        return self::SUCCESS;
    }
}
