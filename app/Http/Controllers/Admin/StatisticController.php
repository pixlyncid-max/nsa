<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\FishCategory;
use App\Models\Province;
use App\Models\StatisticSnapshot;
use App\Services\StatisticService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatisticController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StatisticSnapshot::query()->with(['province', 'fishCategory']);

        if ($provinceId = $request->input('province_id')) {
            $query->where('province_id', $provinceId);
        }

        if ($fishCategoryId = $request->input('fish_category_id')) {
            $query->where('fish_category_id', $fishCategoryId);
        }

        if ($year = $request->input('year')) {
            $query->where('year', $year);
        }

        $snapshots = $query->latest('year')->latest('id')->paginate(15)->through(fn ($s) => [
            'id' => $s->id,
            'province_id' => $s->province_id,
            'province_name' => $s->province?->name ?? '-',
            'fish_category_id' => $s->fish_category_id,
            'fish_category_name' => $s->fishCategory?->name ?? 'Semua',
            'year' => $s->year,
            'farmer_count' => $s->farmer_count,
            'source' => $s->source ?? 'Input Manual',
        ]);

        $provinces = Province::orderBy('name')->get(['id', 'name']);
        $fishCategories = FishCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Statistics/Index', [
            'snapshots' => $snapshots,
            'provinces' => $provinces,
            'fishCategories' => $fishCategories,
            'filters' => $request->only(['province_id', 'fish_category_id', 'year']),
        ]);
    }

    public function store(Request $request, StatisticService $statisticService): RedirectResponse
    {
        $validated = $request->validate([
            'province_id' => ['required', 'exists:provinces,id'],
            'fish_category_id' => ['nullable', 'exists:fish_categories,id'],
            'year' => ['required', 'integer', 'min:2000', 'max:2099'],
            'farmer_count' => ['required', 'integer', 'min:0'],
            'source' => ['nullable', 'string', 'max:255'],
        ]);

        $snapshot = StatisticSnapshot::create($validated);
        $statisticService->clearCache();

        ActivityLog::log(
            action: 'create_statistic_snapshot',
            subject: "Menambah data statistik provinsi ID {$snapshot->province_id} tahun {$snapshot->year}",
            meta: $snapshot->toArray()
        );

        return back()->with('success', 'Data statistik berhasil ditambahkan.');
    }

    public function update(StatisticSnapshot $statistic, Request $request, StatisticService $statisticService): RedirectResponse
    {
        $validated = $request->validate([
            'province_id' => ['required', 'exists:provinces,id'],
            'fish_category_id' => ['nullable', 'exists:fish_categories,id'],
            'year' => ['required', 'integer', 'min:2000', 'max:2099'],
            'farmer_count' => ['required', 'integer', 'min:0'],
            'source' => ['nullable', 'string', 'max:255'],
        ]);

        $statistic->update($validated);
        $statisticService->clearCache();

        ActivityLog::log(
            action: 'update_statistic_snapshot',
            subject: "Memperbarui data statistik #{$statistic->id}",
            meta: $statistic->toArray()
        );

        return back()->with('success', 'Data statistik berhasil diperbarui.');
    }

    public function destroy(StatisticSnapshot $statistic, StatisticService $statisticService): RedirectResponse
    {
        $id = $statistic->id;
        $statistic->delete();
        $statisticService->clearCache();

        ActivityLog::log('delete_statistic_snapshot', "Menghapus data statistik #{$id}");

        return back()->with('success', 'Data statistik berhasil dihapus.');
    }
}
