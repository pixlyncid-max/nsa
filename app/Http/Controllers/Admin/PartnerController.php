<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function index(): Response
    {
        $partners = Partner::orderBy('order')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'type' => $p->type,
            'url' => $p->url,
            'order' => $p->order,
            'logo_url' => $p->logo ? Storage::url($p->logo) : null,
        ]);

        return Inertia::render('Admin/Partners/Index', [
            'partners' => $partners,
            'types' => [
                ['value' => 'instansi', 'label' => 'Instansi Pemerintah'],
                ['value' => 'swasta', 'label' => 'Sektor Swasta / Korporasi'],
                ['value' => 'akademik', 'label' => 'Universitas / Lembaga Riset'],
                ['value' => 'asosiasi', 'label' => 'Asosiasi & Komunitas'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'url' => ['nullable', 'url', 'max:255'],
            'order' => ['nullable', 'integer'],
            'logo' => ['required', 'image', 'max:3072'],
        ]);

        $logoPath = $request->file('logo')->store('partners', 'public');

        $partner = Partner::create([
            'name' => $validated['name'],
            'logo' => $logoPath,
            'type' => $validated['type'] ?? 'instansi',
            'url' => $validated['url'] ?? null,
            'order' => $validated['order'] ?? 0,
        ]);

        ActivityLog::log('create_partner', "Menambah mitra baru: {$partner->name}");

        return back()->with('success', "Mitra {$partner->name} berhasil ditambahkan.");
    }

    public function update(Partner $partner, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'url' => ['nullable', 'url', 'max:255'],
            'order' => ['nullable', 'integer'],
            'logo' => ['nullable', 'image', 'max:3072'],
        ]);

        $logoPath = $partner->logo;
        if ($request->hasFile('logo')) {
            if ($partner->logo) {
                Storage::disk('public')->delete($partner->logo);
            }
            $logoPath = $request->file('logo')->store('partners', 'public');
        }

        $partner->update([
            'name' => $validated['name'],
            'logo' => $logoPath,
            'type' => $validated['type'] ?? $partner->type,
            'url' => $validated['url'] ?? null,
            'order' => $validated['order'] ?? $partner->order,
        ]);

        ActivityLog::log('update_partner', "Memperbarui mitra: {$partner->name}");

        return back()->with('success', "Mitra {$partner->name} berhasil diperbarui.");
    }

    public function destroy(Partner $partner): RedirectResponse
    {
        $name = $partner->name;
        if ($partner->logo) {
            Storage::disk('public')->delete($partner->logo);
        }
        $partner->delete();

        ActivityLog::log('delete_partner', "Menghapus mitra: {$name}");

        return back()->with('success', "Mitra {$name} berhasil dihapus.");
    }
}
