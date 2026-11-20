<?php

namespace App\Jobs;

use App\Contracts\Translator;
use App\Models\ContentTranslation;
use App\Models\TranslationUsageDaily;
use App\Services\StatisticService;
use App\Services\Translation\TranslationPromptBuilder;
use App\Services\Translation\TranslationValidator;
use App\Support\Copy\HtmlSanitizer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class TranslateModelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;

    /**
     * @param  class-string<Model>  $modelClass
     */
    public function __construct(
        public readonly string $modelClass,
        public readonly int|string $modelId,
        public readonly string $locale = 'en',
    ) {
        $this->tries = (int) config('translation.max_attempts', 3);
        $this->onQueue((string) config('translation.queue', 'translations'));
    }

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return array_map('intval', (array) config('translation.backoff', [30, 120, 300]));
    }

    public function handle(Translator $translator, TranslationValidator $validator): void
    {
        /** @var Model|null $model */
        $model = $this->modelClass::query()->find($this->modelId);
        if (! $model || ! method_exists($model, 'collectTranslatableSources')) {
            return;
        }

        $pending = ContentTranslation::query()
            ->where('translatable_type', $model->getMorphClass())
            ->where('translatable_id', $model->getKey())
            ->where('locale', $this->locale)
            ->where('status', ContentTranslation::STATUS_PENDING)
            ->where('is_manual', false)
            ->get();

        if ($pending->isEmpty()) {
            return;
        }

        $sources = $model->collectTranslatableSources();
        $htmlFields = method_exists($model, 'getTranslatableHtmlFields')
            ? $model->getTranslatableHtmlFields()
            : [];

        $items = [];
        $recordsByField = [];

        foreach ($pending as $record) {
            if (! array_key_exists($record->field, $sources)) {
                $record->delete();

                continue;
            }
            $items[$record->field] = $sources[$record->field];
            $recordsByField[$record->field] = $record;
        }

        if ($items === []) {
            return;
        }

        // Pengendali biaya: cek batas karakter harian
        $totalChars = array_sum(array_map('mb_strlen', $items));
        $dailyLimit = (int) config('translation.daily_char_limit', 100000);
        $usedToday = TranslationUsageDaily::todayChars();

        if ($dailyLimit > 0 && ($usedToday + $totalChars) > $dailyLimit) {
            Log::warning('Batas karakter terjemahan harian terlampaui; job ditunda.', [
                'model' => $this->modelClass,
                'id' => $this->modelId,
                'used_today' => $usedToday,
                'batch_chars' => $totalChars,
                'daily_limit' => $dailyLimit,
            ]);

            if ($this->job) {
                $this->release(3600);
            }

            return;
        }

        $glossary = TranslationPromptBuilder::relevantGlossary($items, $this->locale);

        // Satu panggilan batch untuk seluruh field pending satu model
        $translated = $translator->translateBatch(
            $items,
            (string) config('translation.source_locale', 'id'),
            $this->locale,
            [
                'glossary' => $glossary,
                'html_fields' => $htmlFields,
            ]
        );

        // Validasi seluruh hasil sebelum menulis
        $validatedValues = [];
        foreach ($items as $field => $sourceText) {
            $resultText = (string) ($translated[$field] ?? '');
            $isHtml = in_array($field, $htmlFields, true);

            $validator->validate($field, $sourceText, $resultText, $isHtml);

            $validatedValues[$field] = $isHtml
                ? HtmlSanitizer::sanitize($resultText)
                : $resultText;
        }

        $provider = $translator->driverName();

        foreach ($validatedValues as $field => $cleanValue) {
            /** @var ContentTranslation $record */
            $record = $recordsByField[$field];
            $record->forceFill([
                'value' => $cleanValue,
                'status' => ContentTranslation::STATUS_DONE,
                'provider' => $provider,
                'chars' => mb_strlen($items[$field]),
                'error' => null,
                'translated_at' => now(),
            ])->save();
        }

        TranslationUsageDaily::recordUsage($provider, $totalChars, 1);

        // Hapus cache halaman terkait (statistik beranda, daftar artikel/produk, Tentang Kami)
        app(StatisticService::class)->clearCache();
    }

    public function failed(?Throwable $exception): void
    {
        $modelInstance = new $this->modelClass;
        $morphClass = $modelInstance->getMorphClass();

        ContentTranslation::query()
            ->where('translatable_type', $morphClass)
            ->where('translatable_id', $this->modelId)
            ->where('locale', $this->locale)
            ->where('status', ContentTranslation::STATUS_PENDING)
            ->where('is_manual', false)
            ->update([
                'status' => ContentTranslation::STATUS_FAILED,
                'error' => mb_substr((string) ($exception?->getMessage() ?? 'Terjemahan gagal.'), 0, 1000),
                'updated_at' => now(),
            ]);
    }
}
