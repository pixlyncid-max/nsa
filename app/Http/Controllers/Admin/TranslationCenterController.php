<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Translator;
use App\Http\Controllers\Controller;
use App\Jobs\TranslateModelJob;
use App\Models\ActivityLog;
use App\Models\ContentTranslation;
use App\Models\Setting;
use App\Models\TranslationGlossary;
use App\Models\TranslationUsageDaily;
use App\Services\StatisticService;
use App\Support\Copy\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class TranslationCenterController extends Controller
{
    /** @var array<string, string> */
    private const MODEL_LABELS = [
        'post' => 'Artikel & Berita',
        'post_category' => 'Kategori Artikel',
        'product' => 'Produk',
        'product_category' => 'Kategori Produk',
        'program' => 'Program Kerja',
        'page' => 'Halaman Statis',
        'dpp_member' => 'Pengurus DPP',
        'dpw_member' => 'Pengurus DPW',
        'dpc_member' => 'Pengurus DPC',
        'partner' => 'Mitra',
        'fish_category' => 'Kategori Ikan',
        'business_field' => 'Bidang Usaha',
        'membership_category' => 'Kategori Keanggotaan',
        'membership_type' => 'Jenis Keanggotaan',
        'membership_fee_item' => 'Item Biaya Keanggotaan',
        'membership_plan' => 'Paket Keanggotaan',
    ];

    public function index(Request $request): Response
    {
        $tab = (string) $request->query('tab', 'summary');
        if (! in_array($tab, ['summary', 'content', 'glossary', 'settings'], true)) {
            $tab = 'summary';
        }

        // 1. Ringkasan status
        $doneCount = ContentTranslation::query()
            ->where('status', ContentTranslation::STATUS_DONE)
            ->where('is_manual', false)
            ->count();
        $pendingCount = ContentTranslation::query()
            ->where('status', ContentTranslation::STATUS_PENDING)
            ->count();
        $failedCount = ContentTranslation::query()
            ->where('status', ContentTranslation::STATUS_FAILED)
            ->count();
        $manualCount = ContentTranslation::query()
            ->where('is_manual', true)
            ->count();

        $dailyChars = TranslationUsageDaily::todayChars();
        $monthlyChars = (int) TranslationUsageDaily::query()
            ->where('date', '>=', now()->startOfMonth()->toDateString())
            ->sum('chars');

        $dailyLimit = (int) Setting::get('translation.daily_char_limit', (string) config('translation.daily_char_limit', 100000));
        $batchSize = (int) Setting::get('translation.batch_size', (string) config('translation.batch_size', 25));
        $failedThreshold = (int) Setting::get('translation.failed_alert_threshold', '5');
        $activeDriver = (string) config('translation.driver', 'fake');

        // 2. Konten terjemahan (filter & paginasi)
        $typeFilter = (string) $request->query('type', '');
        $statusFilter = (string) $request->query('status', '');
        $search = trim((string) $request->query('search', ''));

        $modelMap = (array) config('translation.models', []);
        $classToAlias = array_flip($modelMap);

        $contentQuery = ContentTranslation::query()->orderByDesc('updated_at')->orderByDesc('id');

        if ($typeFilter !== '' && isset($modelMap[$typeFilter])) {
            $modelClass = $modelMap[$typeFilter];
            $morphClass = (new $modelClass)->getMorphClass();
            $contentQuery->where('translatable_type', $morphClass);
        }

        if ($statusFilter === 'manual') {
            $contentQuery->where('is_manual', true);
        } elseif (in_array($statusFilter, [
            ContentTranslation::STATUS_DONE,
            ContentTranslation::STATUS_PENDING,
            ContentTranslation::STATUS_FAILED,
        ], true)) {
            $contentQuery->where('status', $statusFilter);
            if ($statusFilter === ContentTranslation::STATUS_DONE) {
                $contentQuery->where('is_manual', false);
            }
        }

        if ($search !== '') {
            $contentQuery->where(function ($q) use ($search) {
                $q->where('field', 'like', "%{$search}%")
                    ->orWhere('value', 'like', "%{$search}%")
                    ->orWhere('error', 'like', "%{$search}%");
            });
        }

        $translations = $contentQuery->paginate(15)->withQueryString();
        $translations->load('translatable');

        $translations->through(function (ContentTranslation $row) use ($classToAlias) {
            $model = $row->translatable;
            $alias = $classToAlias[$row->translatable_type] ?? class_basename($row->translatable_type);
            $sourceTitle = $this->resolveModelTitle($model);
            $sourceText = $this->resolveSourceFieldValue($model, $row->field);

            $effectiveStatus = $row->is_manual ? 'manual' : $row->status;

            return [
                'id' => $row->id,
                'type' => $alias,
                'typeLabel' => self::MODEL_LABELS[$alias] ?? ucfirst($alias),
                'modelId' => $row->translatable_id,
                'sourceTitle' => $sourceTitle,
                'field' => $row->field,
                'locale' => $row->locale,
                'sourceText' => $sourceText,
                'translatedText' => $row->value,
                'status' => $effectiveStatus,
                'isManual' => (bool) $row->is_manual,
                'provider' => $row->provider,
                'error' => $row->error,
                'updatedAt' => $row->updated_at?->translatedFormat('d M Y, H:i') ?? '-',
            ];
        });

        // 3. Glosarium
        $glossarySearch = trim((string) $request->query('glossary_search', ''));
        $glossaryQuery = TranslationGlossary::query()->orderBy('source');
        if ($glossarySearch !== '') {
            $glossaryQuery->where(function ($q) use ($glossarySearch) {
                $q->where('source', 'like', "%{$glossarySearch}%")
                    ->orWhere('target', 'like', "%{$glossarySearch}%")
                    ->orWhere('note', 'like', "%{$glossarySearch}%");
            });
        }
        $glossaryItems = $glossaryQuery->get()->map(fn (TranslationGlossary $g) => [
            'id' => $g->id,
            'source' => $g->source,
            'target' => $g->target,
            'locale' => $g->locale,
            'note' => $g->note,
            'caseSensitive' => (bool) $g->case_sensitive,
            'isActive' => (bool) $g->is_active,
        ]);

        // 4. Status driver (TIDAK PERNAH mengirim kunci API ke frontend)
        $driverStatus = [
            'active' => $activeDriver,
            'configured' => $this->isDriverConfigured($activeDriver),
            'model' => $activeDriver === 'claude'
                ? (string) config('translation.drivers.claude.model', '')
                : null,
        ];

        $modelOptions = collect($modelMap)->keys()->map(fn (string $alias) => [
            'value' => $alias,
            'label' => self::MODEL_LABELS[$alias] ?? ucfirst($alias),
        ])->values();

        return Inertia::render('Admin/Translations/Index', [
            'activeTab' => $tab,
            'summary' => [
                'done' => $doneCount,
                'pending' => $pendingCount,
                'failed' => $failedCount,
                'manual' => $manualCount,
                'dailyChars' => $dailyChars,
                'monthlyChars' => $monthlyChars,
                'dailyLimit' => $dailyLimit,
                'driver' => $driverStatus,
            ],
            'translations' => $translations,
            'modelOptions' => $modelOptions,
            'filters' => [
                'type' => $typeFilter,
                'status' => $statusFilter,
                'search' => $search,
                'glossary_search' => $glossarySearch,
            ],
            'glossary' => $glossaryItems,
            'settings' => [
                'daily_char_limit' => $dailyLimit,
                'batch_size' => $batchSize,
                'failed_alert_threshold' => $failedThreshold,
                'driver' => $driverStatus,
            ],
        ]);
    }

    public function testConnection(Request $request, Translator $translator): JsonResponse
    {
        $started = microtime(true);

        try {
            $result = $translator->translateBatch(
                ['ping' => 'Halo Nusantara'],
                'id',
                'en',
                ['domain' => 'connection test']
            );
            $latencyMs = (int) round((microtime(true) - $started) * 1000);

            ActivityLog::log(
                action: 'test_translation_provider',
                subject: 'Menguji koneksi penyedia terjemahan: '.$translator->driverName(),
                meta: ['driver' => $translator->driverName(), 'ok' => true, 'latency_ms' => $latencyMs],
                userId: $request->user()->id,
            );

            return response()->json([
                'ok' => true,
                'driver' => $translator->driverName(),
                'sample' => (string) ($result['ping'] ?? ''),
                'latencyMs' => $latencyMs,
                'message' => 'Koneksi ke penyedia terjemahan berhasil.',
            ]);
        } catch (Throwable $e) {
            ActivityLog::log(
                action: 'test_translation_provider',
                subject: 'Uji koneksi penyedia terjemahan gagal: '.$translator->driverName(),
                meta: ['driver' => $translator->driverName(), 'ok' => false],
                userId: $request->user()->id,
            );

            return response()->json([
                'ok' => false,
                'driver' => $translator->driverName(),
                'message' => 'Koneksi gagal: '.$this->sanitizeErrorMessage($e->getMessage()),
            ], 422);
        }
    }

    public function updateContent(Request $request, ContentTranslation $translation): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'value' => ['required', 'string'],
        ]);

        $model = $translation->translatable;
        $isHtml = $model
            && method_exists($model, 'getTranslatableHtmlFields')
            && in_array($translation->field, $model->getTranslatableHtmlFields(), true);

        $cleanValue = $isHtml
            ? HtmlSanitizer::sanitize($validated['value'])
            : $validated['value'];

        $translation->forceFill([
            'value' => $cleanValue,
            'is_manual' => true,
            'status' => ContentTranslation::STATUS_MANUAL,
            'error' => null,
            'translated_at' => now(),
        ])->save();

        app(StatisticService::class)->clearCache();

        ActivityLog::log(
            action: 'update_content_translation_manual',
            subject: "Mengedit manual terjemahan ({$translation->locale}): {$translation->field}",
            meta: [
                'translation_id' => $translation->id,
                'translatable_type' => $translation->translatable_type,
                'translatable_id' => $translation->translatable_id,
                'field' => $translation->field,
                'locale' => $translation->locale,
            ],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Terjemahan disimpan dan dikunci manual.',
                'translation' => [
                    'id' => $translation->id,
                    'value' => $translation->value,
                    'status' => 'manual',
                    'isManual' => true,
                ],
            ]);
        }

        return back()->with('success', 'Terjemahan disimpan dan dikunci manual.');
    }

    public function retranslateContent(Request $request, ContentTranslation $translation): RedirectResponse|JsonResponse
    {
        $translation->forceFill([
            'is_manual' => false,
            'status' => ContentTranslation::STATUS_PENDING,
            'error' => null,
        ])->save();

        TranslateModelJob::dispatch(
            $translation->translatable_type,
            $translation->translatable_id,
            $translation->locale
        )->onQueue((string) config('translation.queue', 'translations'));

        ActivityLog::log(
            action: 'retranslate_content',
            subject: "Memicu terjemahan ulang ({$translation->locale}): {$translation->field}",
            meta: ['translation_id' => $translation->id],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Terjemahan ulang masuk antrean.']);
        }

        return back()->with('success', 'Terjemahan ulang masuk antrean.');
    }

    public function revertContentToAuto(Request $request, ContentTranslation $translation): RedirectResponse|JsonResponse
    {
        $translation->forceFill([
            'is_manual' => false,
            'status' => ContentTranslation::STATUS_PENDING,
            'error' => null,
        ])->save();

        TranslateModelJob::dispatch(
            $translation->translatable_type,
            $translation->translatable_id,
            $translation->locale
        )->onQueue((string) config('translation.queue', 'translations'));

        ActivityLog::log(
            action: 'revert_content_translation_auto',
            subject: "Mengembalikan terjemahan ke mode otomatis: {$translation->field}",
            meta: ['translation_id' => $translation->id],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Terjemahan dikembalikan ke mode otomatis.']);
        }

        return back()->with('success', 'Terjemahan dikembalikan ke mode otomatis.');
    }

    public function retryFailed(Request $request): RedirectResponse|JsonResponse
    {
        $failedCount = ContentTranslation::query()
            ->where('status', ContentTranslation::STATUS_FAILED)
            ->where('is_manual', false)
            ->count();

        Artisan::call('translate:retry-failed');

        ActivityLog::log(
            action: 'retry_failed_translations',
            subject: "Menjalankan ulang {$failedCount} terjemahan gagal",
            meta: ['count' => $failedCount],
            userId: $request->user()->id,
        );

        $message = $failedCount > 0
            ? "{$failedCount} terjemahan gagal dimasukkan ke antrean ulang."
            : 'Tidak ada terjemahan gagal untuk diulang.';

        if ($request->wantsJson()) {
            return response()->json(['message' => $message, 'count' => $failedCount]);
        }

        return back()->with('success', $message);
    }

    public function translateMissing(Request $request): RedirectResponse|JsonResponse
    {
        $queued = 0;
        $models = (array) config('translation.models', []);

        foreach ($models as $modelClass) {
            if (! class_exists($modelClass)) {
                continue;
            }

            $modelClass::query()->chunkById(100, function ($rows) use (&$queued): void {
                foreach ($rows as $row) {
                    if (method_exists($row, 'queueAutoTranslations') && $row->queueAutoTranslations(false)) {
                        $queued++;
                    }
                }
            });
        }

        ActivityLog::log(
            action: 'backfill_missing_translations',
            subject: "Memasukkan {$queued} item konten ke antrean terjemahan",
            meta: ['queued_models' => $queued],
            userId: $request->user()->id,
        );

        $message = $queued > 0
            ? "{$queued} konten yang belum diterjemahkan dimasukkan ke antrean."
            : 'Semua konten aktif sudah memiliki terjemahan.';

        if ($request->wantsJson()) {
            return response()->json(['message' => $message, 'queued' => $queued]);
        }

        return back()->with('success', $message);
    }

    public function storeGlossary(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'source' => ['required', 'string', 'max:120'],
            'target' => ['required', 'string', 'max:160'],
            'locale' => ['nullable', 'string', 'in:en'],
            'note' => ['nullable', 'string', 'max:255'],
            'case_sensitive' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $entry = TranslationGlossary::create([
            'source' => trim($validated['source']),
            'target' => trim($validated['target']),
            'locale' => $validated['locale'] ?? 'en',
            'note' => isset($validated['note']) ? trim($validated['note']) : null,
            'case_sensitive' => (bool) ($validated['case_sensitive'] ?? false),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        ActivityLog::log(
            action: 'create_translation_glossary',
            subject: "Menambah istilah glosarium: {$entry->source} → {$entry->target}",
            meta: ['glossary_id' => $entry->id],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Istilah glosarium ditambahkan.', 'glossary' => $entry], 201);
        }

        return back()->with('success', 'Istilah glosarium ditambahkan.');
    }

    public function updateGlossary(Request $request, TranslationGlossary $glossary): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'source' => ['required', 'string', 'max:120'],
            'target' => ['required', 'string', 'max:160'],
            'note' => ['nullable', 'string', 'max:255'],
            'case_sensitive' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $glossary->update([
            'source' => trim($validated['source']),
            'target' => trim($validated['target']),
            'note' => isset($validated['note']) ? trim($validated['note']) : null,
            'case_sensitive' => (bool) ($validated['case_sensitive'] ?? $glossary->case_sensitive),
            'is_active' => (bool) ($validated['is_active'] ?? $glossary->is_active),
        ]);

        ActivityLog::log(
            action: 'update_translation_glossary',
            subject: "Memperbarui istilah glosarium: {$glossary->source} → {$glossary->target}",
            meta: ['glossary_id' => $glossary->id],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Istilah glosarium diperbarui.', 'glossary' => $glossary]);
        }

        return back()->with('success', 'Istilah glosarium diperbarui.');
    }

    public function destroyGlossary(Request $request, TranslationGlossary $glossary): RedirectResponse|JsonResponse
    {
        $label = "{$glossary->source} → {$glossary->target}";
        $glossaryId = $glossary->id;
        $glossary->delete();

        ActivityLog::log(
            action: 'delete_translation_glossary',
            subject: "Menghapus istilah glosarium: {$label}",
            meta: ['glossary_id' => $glossaryId],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Istilah glosarium dihapus.']);
        }

        return back()->with('success', 'Istilah glosarium dihapus.');
    }

    public function applyGlossary(Request $request, TranslationGlossary $glossary): RedirectResponse|JsonResponse
    {
        $needle = $glossary->case_sensitive ? $glossary->source : mb_strtolower($glossary->source);
        $queued = 0;

        foreach ((array) config('translation.models', []) as $modelClass) {
            if (! class_exists($modelClass)) {
                continue;
            }

            $modelClass::query()->chunkById(100, function ($rows) use ($glossary, $needle, &$queued): void {
                foreach ($rows as $row) {
                    if (! method_exists($row, 'collectTranslatableSources') || ! method_exists($row, 'queueAutoTranslations')) {
                        continue;
                    }

                    $sources = $row->collectTranslatableSources();
                    $matched = false;
                    foreach ($sources as $text) {
                        $haystack = $glossary->case_sensitive ? $text : mb_strtolower($text);
                        if (str_contains($haystack, $needle)) {
                            $matched = true;
                            break;
                        }
                    }

                    if ($matched && $row->queueAutoTranslations(true)) {
                        $queued++;
                    }
                }
            });
        }

        ActivityLog::log(
            action: 'apply_glossary_to_content',
            subject: "Menerapkan glosarium [{$glossary->source}] ke {$queued} konten terkait",
            meta: ['glossary_id' => $glossary->id, 'queued_models' => $queued],
            userId: $request->user()->id,
        );

        $message = $queued > 0
            ? "Glosarium \"{$glossary->source}\" diterapkan ke {$queued} konten terkait."
            : "Tidak ditemukan konten aktif yang memuat istilah \"{$glossary->source}\".";

        if ($request->wantsJson()) {
            return response()->json(['message' => $message, 'queued' => $queued]);
        }

        return back()->with('success', $message);
    }

    public function exportGlossaryCsv(Request $request): StreamedResponse
    {
        $rows = TranslationGlossary::query()->orderBy('source')->get();
        $filename = 'nsa-glosarium-'.now()->format('Ymd-His').'.csv';

        ActivityLog::log(
            action: 'export_translation_glossary',
            subject: 'Mengekspor glosarium terjemahan (CSV)',
            meta: ['count' => $rows->count()],
            userId: $request->user()->id,
        );

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }
            // UTF-8 BOM agar terbaca rapi di Excel
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['source', 'target', 'locale', 'note', 'case_sensitive', 'is_active']);
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->source,
                    $row->target,
                    $row->locale,
                    $row->note ?? '',
                    $row->case_sensitive ? '1' : '0',
                    $row->is_active ? '1' : '0',
                ]);
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function importGlossaryCsv(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if ($handle === false) {
            abort(422, 'Berkas CSV tidak dapat dibaca.');
        }

        $imported = 0;
        $header = null;

        while (($row = fgetcsv($handle)) !== false) {
            if ($header === null) {
                $header = array_map(
                    fn ($h) => strtolower(trim((string) preg_replace('/^\xEF\xBB\xBF/', '', (string) $h))),
                    $row
                );

                continue;
            }

            if (count($row) < 2) {
                continue;
            }

            $assoc = [];
            foreach ($header as $i => $col) {
                $assoc[$col] = $row[$i] ?? '';
            }

            $source = trim((string) ($assoc['source'] ?? $row[0] ?? ''));
            $target = trim((string) ($assoc['target'] ?? $row[1] ?? ''));
            if ($source === '' || $target === '') {
                continue;
            }

            $locale = trim((string) ($assoc['locale'] ?? 'en')) ?: 'en';
            $note = trim((string) ($assoc['note'] ?? ''));
            $caseSensitive = in_array(strtolower(trim((string) ($assoc['case_sensitive'] ?? '0'))), ['1', 'true', 'yes'], true);
            $isActive = ! in_array(strtolower(trim((string) ($assoc['is_active'] ?? '1'))), ['0', 'false', 'no'], true);

            TranslationGlossary::query()->updateOrCreate(
                ['source' => $source, 'locale' => $locale],
                [
                    'target' => $target,
                    'note' => $note !== '' ? $note : null,
                    'case_sensitive' => $caseSensitive,
                    'is_active' => $isActive,
                ]
            );
            $imported++;
        }

        fclose($handle);

        ActivityLog::log(
            action: 'import_translation_glossary',
            subject: "Mengimpor {$imported} istilah glosarium dari CSV",
            meta: ['imported' => $imported],
            userId: $request->user()->id,
        );

        $message = "{$imported} istilah glosarium berhasil diimpor.";
        if ($request->wantsJson()) {
            return response()->json(['message' => $message, 'imported' => $imported]);
        }

        return back()->with('success', $message);
    }

    public function updateSettings(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'daily_char_limit' => ['required', 'integer', 'min:1000', 'max:10000000'],
            'batch_size' => ['required', 'integer', 'min:1', 'max:100'],
            'failed_alert_threshold' => ['required', 'integer', 'min:1', 'max:500'],
        ]);

        Setting::set('translation.daily_char_limit', (string) $validated['daily_char_limit']);
        Setting::set('translation.batch_size', (string) $validated['batch_size']);
        Setting::set('translation.failed_alert_threshold', (string) $validated['failed_alert_threshold']);

        ActivityLog::log(
            action: 'update_translation_settings',
            subject: 'Memperbarui pengaturan batas dan batch terjemahan',
            meta: $validated,
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Pengaturan terjemahan disimpan.']);
        }

        return back()->with('success', 'Pengaturan terjemahan disimpan.');
    }

    private function isDriverConfigured(string $driver): bool
    {
        if ($driver === 'fake') {
            return true;
        }

        $apiKey = config("translation.drivers.{$driver}.api_key");

        return is_string($apiKey) && trim($apiKey) !== '';
    }

    private function resolveModelTitle(?Model $model): string
    {
        if (! $model) {
            return '(Konten dihapus)';
        }

        foreach (['title', 'name', 'slug'] as $attr) {
            $val = $model->getAttribute($attr);
            if (is_string($val) && trim($val) !== '') {
                return $val;
            }
        }

        return class_basename($model).' #'.$model->getKey();
    }

    private function resolveSourceFieldValue(?Model $model, string $field): string
    {
        if (! $model) {
            return '';
        }

        if (method_exists($model, 'collectTranslatableSources')) {
            $sources = $model->collectTranslatableSources();
            if (isset($sources[$field])) {
                return $sources[$field];
            }
        }

        $val = $model->getAttribute($field);

        return is_string($val) ? $val : '';
    }

    private function sanitizeErrorMessage(string $message): string
    {
        // Pastikan kunci API tidak pernah terbawa di pesan error
        $sanitized = preg_replace('/(sk-[a-zA-Z0-9_-]+|key=[a-zA-Z0-9_-]+|Bearer\s+\S+)/i', '[REDACTED]', $message) ?? $message;

        return mb_substr($sanitized, 0, 240);
    }
}
