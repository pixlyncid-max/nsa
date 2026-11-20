<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkUpdateSiteTextRequest;
use App\Http\Requests\Admin\UpdateSiteTextRequest;
use App\Models\SiteText;
use App\Models\SiteTextRevision;
use App\Services\CopyService;
use App\Support\Copy\CopyRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SiteTextController extends Controller
{
    /** @var array<string, array{label: string, public_url: ?string}> */
    private const GROUP_META = [
        'global' => ['label' => 'Umum', 'public_url' => '/'],
        'home' => ['label' => 'Beranda', 'public_url' => '/'],
        'organization' => ['label' => 'Organisasi', 'public_url' => '/organisasi/dpp'],
        'products' => ['label' => 'Produk', 'public_url' => '/produk'],
        'cart' => ['label' => 'Keranjang & Checkout', 'public_url' => '/keranjang'],
        'about' => ['label' => 'Tentang Kami', 'public_url' => '/tentang-kami'],
        'partnership' => ['label' => 'Kemitraan', 'public_url' => '/kemitraan'],
        'articles' => ['label' => 'Artikel', 'public_url' => '/artikel'],
        'contact' => ['label' => 'Kontak', 'public_url' => '/kontak'],
        'auth' => ['label' => 'Masuk & Daftar', 'public_url' => '/login'],
        'account' => ['label' => 'Akun', 'public_url' => '/akun'],
        'member' => ['label' => 'Dashboard Anggota', 'public_url' => '/anggota'],
        'registration' => ['label' => 'Pendaftaran Anggota', 'public_url' => '/akun/keanggotaan/daftar'],
        'emails' => ['label' => 'Email', 'public_url' => null],
    ];

    public function __construct(
        private readonly CopyRegistry $registry,
        private readonly CopyService $copyService,
    ) {}

    public function index(Request $request, ?string $group = null): Response
    {
        Gate::authorize('viewAny', SiteText::class);

        $availableGroups = $this->orderedGroups();
        $activeGroup = $group !== null && in_array($group, $availableGroups, true)
            ? $group
            : ($availableGroups[0] ?? 'global');

        if ($group !== null && ! in_array($group, $availableGroups, true)) {
            abort(404);
        }

        $search = trim((string) $request->query('search', ''));
        $filter = (string) $request->query('filter', 'all');
        if (! in_array($filter, ['all', 'changed'], true)) {
            $filter = 'all';
        }

        $allRecords = SiteText::query()
            ->with('updatedBy:id,name')
            ->withCount('revisions')
            ->whereIn('locale', ['id', 'en'])
            ->get();

        $idOverrides = $allRecords->where('locale', 'id')->keyBy('key');
        $enOverrides = $allRecords->where('locale', 'en')->keyBy('key');
        $englishDefaults = $this->registry->englishDefaults();

        $groups = collect($availableGroups)->map(function (string $groupName) use ($idOverrides, $enOverrides) {
            $entries = $this->registry->forGroup($groupName);
            $customizedCount = collect(array_keys($entries))
                ->filter(fn (string $key) => (isset($idOverrides[$key]) && $idOverrides[$key]->value !== null)
                    || (isset($enOverrides[$key]) && $enOverrides[$key]->value !== null))
                ->count();

            $meta = self::GROUP_META[$groupName] ?? ['label' => ucfirst($groupName), 'public_url' => null];

            return [
                'name' => $groupName,
                'label' => $meta['label'],
                'publicUrl' => $meta['public_url'],
                'total' => count($entries),
                'customized' => $customizedCount,
            ];
        })->values();

        // Jika ada pencarian global, telusuri semua kelompok; jika kosong, tampilkan kelompok terpilih.
        $sourceEntries = $search !== ''
            ? $this->registry->all()
            : $this->registry->forGroup($activeGroup);

        $searchLower = mb_strtolower($search);

        $items = collect($sourceEntries)
            ->map(function (array $entry) use ($idOverrides, $enOverrides, $englishDefaults) {
                $key = $entry['key'];
                /** @var SiteText|null $idRecord */
                $idRecord = $idOverrides[$key] ?? null;
                /** @var SiteText|null $enRecord */
                $enRecord = $enOverrides[$key] ?? null;

                $dbValue = $idRecord?->value;
                $isChanged = $dbValue !== null && $dbValue !== $entry['default'];
                $currentValue = $dbValue ?? $entry['default'];

                $defaultEn = $englishDefaults[$key] ?? $entry['default'];
                $enDbValue = $enRecord?->value;
                $currentEnValue = $enDbValue ?? $defaultEn;
                $enIsChanged = $enDbValue !== null && $enDbValue !== $defaultEn;
                $enStatus = $this->resolveEnStatus($enRecord);

                $parts = explode('.', $key);
                $section = $parts[1] ?? 'umum';
                $groupMeta = self::GROUP_META[$entry['group']] ?? ['label' => ucfirst($entry['group']), 'public_url' => null];

                return [
                    'key' => $key,
                    'group' => $entry['group'],
                    'groupLabel' => $groupMeta['label'],
                    'section' => $section,
                    'label' => $entry['label'],
                    'hint' => $entry['hint'],
                    'type' => $entry['type'],
                    'default' => $entry['default'],
                    'value' => $dbValue,
                    'currentValue' => $currentValue,
                    'isChanged' => $isChanged,
                    'max' => $entry['max'],
                    'maxEn' => $this->registry->maxFor($key, 'en'),
                    'defaultEn' => $defaultEn,
                    'enValue' => $enDbValue,
                    'currentEnValue' => $currentEnValue,
                    'enIsChanged' => $enIsChanged,
                    'enIsManual' => (bool) ($enRecord?->is_manual ?? false),
                    'enStatus' => $enStatus,
                    'enError' => $enRecord?->translation_error,
                    'placeholders' => $entry['placeholders'],
                    'revisionsCount' => (int) (($idRecord?->revisions_count ?? 0) + ($enRecord?->revisions_count ?? 0)),
                    'updatedAt' => $idRecord?->updated_at?->toIso8601String(),
                    'updatedByName' => $idRecord?->updatedBy?->name,
                    'publicUrl' => $groupMeta['public_url'],
                ];
            })
            ->filter(function (array $item) use ($filter, $searchLower) {
                if ($filter === 'changed' && ! $item['isChanged'] && ! $item['enIsChanged']) {
                    return false;
                }

                if ($searchLower !== '') {
                    $haystack = mb_strtolower(
                        $item['key'].' '.$item['label'].' '.$item['hint'].' '.$item['currentValue'].' '.$item['default'].' '.$item['currentEnValue'].' '.$item['defaultEn']
                    );

                    return str_contains($haystack, $searchLower);
                }

                return true;
            })
            ->values();

        return Inertia::render('Admin/SiteTexts/Index', [
            'groups' => $groups,
            'activeGroup' => $activeGroup,
            'items' => $items,
            'totalKeys' => count($this->registry->all()),
            'filters' => [
                'search' => $search,
                'filter' => $filter,
            ],
        ]);
    }

    public function update(UpdateSiteTextRequest $request, string $key): RedirectResponse|JsonResponse
    {
        $locale = (string) ($request->validated('locale') ?: 'id');

        $siteText = $this->copyService->update(
            $key,
            $request->validated('value'),
            $request->user(),
            $locale
        );

        $message = $locale === 'en'
            ? 'Teks Inggris disimpan dan dikunci manual.'
            : 'Teks berhasil disimpan.';

        if ($request->wantsJson()) {
            return response()->json([
                'message' => $message,
                'siteText' => [
                    'key' => $siteText->key,
                    'locale' => $siteText->locale,
                    'value' => $siteText->value,
                    'isManual' => (bool) $siteText->is_manual,
                    'translationStatus' => $siteText->translation_status,
                    'updatedAt' => $siteText->updated_at?->toIso8601String(),
                    'revisionsCount' => $siteText->revisions()->count(),
                ],
            ]);
        }

        return back()->with('success', $message);
    }

    public function bulkUpdate(BulkUpdateSiteTextRequest $request): RedirectResponse|JsonResponse
    {
        $items = $request->validated('items');
        $updatedCount = 0;

        foreach ($items as $item) {
            $this->copyService->update(
                $item['key'],
                $item['value'] ?? null,
                $request->user(),
                (string) (($item['locale'] ?? null) ?: 'id')
            );
            $updatedCount++;
        }

        $message = "{$updatedCount} teks berhasil disimpan.";

        if ($request->wantsJson()) {
            return response()->json([
                'message' => $message,
                'updatedCount' => $updatedCount,
            ]);
        }

        return back()->with('success', $message);
    }

    public function reset(Request $request, string $key): RedirectResponse|JsonResponse
    {
        Gate::authorize('reset', SiteText::class);

        $locale = in_array($request->input('locale'), ['id', 'en'], true)
            ? (string) $request->input('locale')
            : 'id';

        $siteText = $this->copyService->reset($key, $request->user(), $locale);
        $defaultValue = $this->registry->defaultFor($key, $locale) ?? '';

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Teks dikembalikan ke nilai bawaan.',
                'locale' => $locale,
                'default' => $defaultValue,
                'revisionsCount' => $siteText->revisions()->count(),
            ]);
        }

        return back()->with('success', 'Teks dikembalikan ke nilai bawaan.');
    }

    public function retranslate(Request $request, string $key): RedirectResponse|JsonResponse
    {
        Gate::authorize('update', SiteText::class);

        $enRow = $this->copyService->retranslate($key, $request->user());

        $message = 'Terjemahan Inggris sedang diproses ulang.';

        if ($request->wantsJson()) {
            return response()->json([
                'message' => $message,
                'enStatus' => $this->resolveEnStatus($enRow),
                'enValue' => $enRow->value,
                'enIsManual' => (bool) $enRow->is_manual,
            ]);
        }

        return back()->with('success', $message);
    }

    public function revertToAuto(Request $request, string $key): RedirectResponse|JsonResponse
    {
        Gate::authorize('update', SiteText::class);

        $enRow = $this->copyService->revertToAuto($key, $request->user());

        $message = 'Versi Inggris dikembalikan ke mode otomatis.';

        if ($request->wantsJson()) {
            return response()->json([
                'message' => $message,
                'enStatus' => $this->resolveEnStatus($enRow),
                'enValue' => $enRow->value,
                'enIsManual' => (bool) $enRow->is_manual,
            ]);
        }

        return back()->with('success', $message);
    }

    public function revisions(Request $request, string $key): JsonResponse
    {
        Gate::authorize('view', SiteText::class);

        $definition = $this->registry->get($key);
        if ($definition === null) {
            abort(404);
        }

        $siteTextIds = SiteText::query()
            ->where('key', $key)
            ->whereIn('locale', ['id', 'en'])
            ->pluck('id');

        $revisions = $siteTextIds->isNotEmpty()
            ? SiteTextRevision::query()
                ->with(['user:id,name', 'siteText:id,locale'])
                ->whereIn('site_text_id', $siteTextIds)
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->limit(50)
                ->get()
                ->map(fn (SiteTextRevision $rev) => [
                    'id' => $rev->id,
                    'locale' => $rev->locale ?: ($rev->siteText?->locale ?? 'id'),
                    'oldValue' => $rev->old_value,
                    'newValue' => $rev->new_value,
                    'userName' => $rev->user?->name ?? 'Sistem',
                    'createdAt' => $rev->created_at?->toIso8601String(),
                    'createdAtLabel' => $rev->created_at?->translatedFormat('d M Y, H:i') ?? '-',
                ])->values()
            : collect();

        return response()->json([
            'key' => $key,
            'label' => $definition['label'],
            'default' => $definition['default'],
            'defaultEn' => $this->registry->defaultFor($key, 'en') ?? $definition['default'],
            'revisions' => $revisions,
        ]);
    }

    public function restore(Request $request, int $revision): RedirectResponse|JsonResponse
    {
        Gate::authorize('restore', SiteText::class);

        $siteText = $this->copyService->restore($revision, $request->user());
        $defaultValue = $this->registry->defaultFor($siteText->key, $siteText->locale) ?? '';

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Versi teks berhasil dipulihkan.',
                'locale' => $siteText->locale,
                'value' => $siteText->value ?? $defaultValue,
                'isChanged' => $siteText->value !== null && $siteText->value !== $defaultValue,
                'revisionsCount' => $siteText->revisions()->count(),
            ]);
        }

        return back()->with('success', 'Versi teks berhasil dipulihkan.');
    }

    public function meta(Request $request, string $key): JsonResponse
    {
        Gate::authorize('view', SiteText::class);

        $definition = $this->registry->get($key);
        if ($definition === null) {
            abort(404);
        }

        $locale = in_array($request->query('locale'), ['id', 'en'], true)
            ? (string) $request->query('locale')
            : 'id';

        $record = SiteText::query()
            ->where('key', $key)
            ->where('locale', $locale)
            ->first();

        $defaultValue = $this->registry->defaultFor($key, $locale) ?? $definition['default'];
        $dbValue = $record?->value;
        $groupMeta = self::GROUP_META[$definition['group']] ?? ['label' => ucfirst($definition['group']), 'public_url' => null];

        return response()->json([
            'key' => $definition['key'],
            'locale' => $locale,
            'group' => $definition['group'],
            'groupLabel' => $groupMeta['label'],
            'label' => $definition['label'],
            'hint' => $definition['hint'],
            'type' => $definition['type'],
            'default' => $defaultValue,
            'value' => $dbValue,
            'currentValue' => $dbValue ?? $defaultValue,
            'isChanged' => $dbValue !== null && $dbValue !== $defaultValue,
            'isManual' => (bool) ($record?->is_manual ?? false),
            'max' => $this->registry->maxFor($key, $locale),
            'placeholders' => $definition['placeholders'],
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', SiteText::class);

        $localeParam = $request->query('locale');
        $locale = in_array($localeParam, ['id', 'en'], true) ? (string) $localeParam : null;
        $items = $this->copyService->exportCustomized($locale);
        $filename = 'nsa-teks-website-'.now()->format('Ymd-His').'.json';

        return response()->json([
            'exported_at' => now()->toIso8601String(),
            'locale' => $locale ?? 'all',
            'count' => count($items),
            'items' => $items,
        ], 200, [
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    public function importPreview(Request $request): JsonResponse
    {
        Gate::authorize('update', SiteText::class);

        $items = $this->extractImportItems($request);

        return response()->json($this->copyService->previewImport($items, 'id'));
    }

    public function importApply(Request $request): JsonResponse
    {
        Gate::authorize('update', SiteText::class);

        $items = $this->extractImportItems($request);
        $result = $this->copyService->applyImport($items, $request->user(), 'id');

        return response()->json([
            'message' => "{$result['applied']} teks berhasil diimpor.",
            'applied' => $result['applied'],
            'skipped' => $result['skipped'],
        ]);
    }

    private function resolveEnStatus(?SiteText $enRecord): string
    {
        if ($enRecord === null) {
            return SiteText::STATUS_AUTO;
        }

        if ($enRecord->is_manual) {
            return SiteText::STATUS_MANUAL;
        }

        return $enRecord->translation_status ?: SiteText::STATUS_AUTO;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function extractImportItems(Request $request): array
    {
        if ($request->hasFile('file')) {
            $request->validate([
                'file' => ['required', 'file', 'mimes:json,txt', 'max:2048'],
            ]);

            $decoded = json_decode((string) file_get_contents($request->file('file')->getRealPath()), true);
            if (! is_array($decoded)) {
                abort(422, 'Berkas JSON tidak valid.');
            }

            $items = $decoded['items'] ?? $decoded;
            if (! is_array($items)) {
                abort(422, 'Format JSON harus berisi array "items".');
            }

            return array_values(array_filter($items, 'is_array'));
        }

        $validated = $request->validate([
            'items' => ['required', 'array'],
        ]);

        return array_values(array_filter($validated['items'], 'is_array'));
    }

    /**
     * @return list<string>
     */
    private function orderedGroups(): array
    {
        $registered = $this->registry->groups();
        $ordered = array_values(array_intersect(array_keys(self::GROUP_META), $registered));
        $remaining = array_values(array_diff($registered, $ordered));

        return array_merge($ordered, $remaining);
    }
}
