<?php

namespace App\Jobs;

use App\Contracts\Translator;
use App\Models\SiteText;
use App\Models\SiteTextRevision;
use App\Models\TranslationUsageDaily;
use App\Services\CopyService;
use App\Services\Translation\TranslationPromptBuilder;
use App\Services\Translation\TranslationValidationException;
use App\Services\Translation\TranslationValidator;
use App\Support\Copy\CopyRegistry;
use App\Support\Copy\HtmlSanitizer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class TranslateSiteTextJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;

    public function __construct(
        public string $key,
        public string $sourceText,
        public string $targetLocale = 'en',
        public bool $force = false,
        public ?int $triggeredByUserId = null,
    ) {
        $this->tries = (int) config('translation.max_attempts', 3);
        $this->onQueue((string) config('translation.queue', 'translations'));
    }

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return array_values(array_map('intval', (array) config('translation.backoff', [30, 120, 300])));
    }

    public function handle(
        Translator $translator,
        CopyRegistry $registry,
        CopyService $copyService,
        TranslationValidator $validator,
    ): void {
        $definition = $registry->get($this->key);
        if ($definition === null) {
            return;
        }

        $group = $definition['group'];
        $sourceHash = hash('sha256', $this->sourceText);

        $enRow = SiteText::query()->firstOrNew([
            'key' => $this->key,
            'locale' => $this->targetLocale,
        ]);

        // Hormati kunci manual kecuali dipaksa (mis. "Kembalikan ke otomatis").
        if ($enRow->exists && $enRow->is_manual && ! $this->force) {
            return;
        }

        // Hindari panggilan ulang bila sumber belum berubah dan terjemahan sudah sukses.
        if (
            ! $this->force
            && $enRow->exists
            && $enRow->translation_status === SiteText::STATUS_AUTO
            && $enRow->source_hash === $sourceHash
            && $enRow->value !== null
        ) {
            return;
        }

        $charCount = mb_strlen($this->sourceText);
        $dailyLimit = (int) config('translation.daily_char_limit', 100000);
        if ($dailyLimit > 0 && (TranslationUsageDaily::todayChars() + $charCount) > $dailyLimit) {
            if ($this->job && ! app()->runningUnitTests()) {
                $this->release(3600);
            }

            return;
        }

        $glossary = TranslationPromptBuilder::relevantGlossary([$this->key => $this->sourceText], $this->targetLocale);
        $maxEn = $registry->maxFor($this->key, $this->targetLocale);

        $translatedMap = $translator->translateBatch(
            [$this->key => $this->sourceText],
            'id',
            $this->targetLocale,
            [
                'glossary' => $glossary,
                'domain' => 'UI copy for Indonesian aquaculture association',
                'max_length' => $maxEn,
                'placeholders' => $definition['placeholders'] ?? [],
            ]
        );

        TranslationUsageDaily::recordUsage($translator->driverName(), $charCount, 1);

        $translated = $translatedMap[$this->key] ?? null;
        if (! is_string($translated) || trim($translated) === '') {
            throw new TranslationValidationException("Hasil terjemahan kosong untuk key [{$this->key}].");
        }

        $isHtml = $definition['type'] === 'richtext';
        $validator->validate($this->key, $this->sourceText, $translated, $isHtml);

        $sanitized = $isHtml
            ? HtmlSanitizer::sanitize($translated)
            : HtmlSanitizer::escapePlainText($translated);

        foreach ($definition['placeholders'] ?? [] as $placeholder) {
            if (! str_contains($sanitized, '{'.$placeholder.'}')) {
                throw new TranslationValidationException("Placeholder {{$placeholder}} hilang pada hasil terjemahan [{$this->key}].");
            }
        }

        $oldValue = $enRow->exists ? $enRow->value : null;

        $enRow->group = $group;
        $enRow->value = $sanitized;
        $enRow->is_manual = false;
        $enRow->translation_status = SiteText::STATUS_AUTO;
        $enRow->source_hash = $sourceHash;
        $enRow->translation_error = null;
        $enRow->translated_at = now();
        $enRow->updated_by = $this->triggeredByUserId;
        $enRow->save();

        SiteTextRevision::create([
            'site_text_id' => $enRow->id,
            'locale' => $this->targetLocale,
            'old_value' => $oldValue,
            'new_value' => $sanitized,
            'user_id' => $this->triggeredByUserId,
            'created_at' => now(),
        ]);

        $copyService->forgetGroupCache($group);
    }

    public function failed(?Throwable $exception): void
    {
        $registry = app(CopyRegistry::class);
        $definition = $registry->get($this->key);
        if ($definition === null) {
            return;
        }

        $enRow = SiteText::query()->firstOrNew([
            'key' => $this->key,
            'locale' => $this->targetLocale,
        ]);

        if ($enRow->exists && $enRow->is_manual && ! $this->force) {
            return;
        }

        $enRow->group = $definition['group'];
        $enRow->is_manual = false;
        $enRow->translation_status = SiteText::STATUS_FAILED;
        $enRow->source_hash = hash('sha256', $this->sourceText);
        $enRow->translation_error = $exception ? mb_substr($exception->getMessage(), 0, 500) : 'Terjemahan gagal.';
        $enRow->save();

        app(CopyService::class)->forgetGroupCache($definition['group']);
    }
}
