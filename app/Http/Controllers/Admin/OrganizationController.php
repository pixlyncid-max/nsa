<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Dpc;
use App\Models\DpcMember;
use App\Models\DppMember;
use App\Models\Dpw;
use App\Models\DpwMember;
use App\Models\Province;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    // ==========================================
    // 1. DPP (Dewan Pengurus Pusat)
    // ==========================================
    public function dppIndex(): Response
    {
        $members = DppMember::orderBy('order')->get()->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'position' => $m->position,
            'period' => $m->period,
            'bio' => $m->bio,
            'order' => $m->order,
            'photo_url' => $m->photo ? Storage::url($m->photo) : null,
        ]);

        return Inertia::render('Admin/Organization/Dpp', [
            'members' => $members,
        ]);
    }

    public function dppStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'period' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'photo' => ['nullable', 'image', 'max:3072'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('organization/dpp', 'public');
        }

        $member = DppMember::create([
            'name' => $validated['name'],
            'position' => $validated['position'],
            'period' => $validated['period'] ?? '2024-2029',
            'bio' => $validated['bio'] ?? null,
            'order' => $validated['order'] ?? 0,
            'photo' => $photoPath,
        ]);

        ActivityLog::log('create_dpp_member', "Menambah pengurus DPP: {$member->name} ({$member->position})");

        return back()->with('success', "Pengurus DPP {$member->name} berhasil ditambahkan.");
    }

    public function dppUpdate(DppMember $member, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'period' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'photo' => ['nullable', 'image', 'max:3072'],
        ]);

        $photoPath = $member->photo;
        if ($request->hasFile('photo')) {
            if ($member->photo) {
                Storage::disk('public')->delete($member->photo);
            }
            $photoPath = $request->file('photo')->store('organization/dpp', 'public');
        }

        $member->update([
            'name' => $validated['name'],
            'position' => $validated['position'],
            'period' => $validated['period'] ?? $member->period,
            'bio' => $validated['bio'] ?? null,
            'order' => $validated['order'] ?? $member->order,
            'photo' => $photoPath,
        ]);

        ActivityLog::log('update_dpp_member', "Memperbarui pengurus DPP: {$member->name}");

        return back()->with('success', "Pengurus DPP {$member->name} berhasil diperbarui.");
    }

    public function dppDestroy(DppMember $member): RedirectResponse
    {
        $name = $member->name;
        if ($member->photo) {
            Storage::disk('public')->delete($member->photo);
        }
        $member->delete();

        ActivityLog::log('delete_dpp_member', "Menghapus pengurus DPP: {$name}");

        return back()->with('success', "Pengurus DPP {$name} berhasil dihapus.");
    }

    // ==========================================
    // 2. DPW (Dewan Pengurus Wilayah / Provinsi)
    // ==========================================
    public function dpwIndex(Request $request): Response
    {
        $query = Dpw::query()->with(['province', 'members' => fn ($q) => $q->orderBy('order')]);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('province', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
        }

        $dpws = $query->paginate(12)->through(fn ($d) => [
            'id' => $d->id,
            'name' => $d->name,
            'province_id' => $d->province_id,
            'province_name' => $d->province?->name ?? '-',
            'address' => $d->address,
            'phone' => $d->phone,
            'email' => $d->email,
            'period' => $d->period,
            'members' => $d->members->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'position' => $m->position,
                'order' => $m->order,
                'photo_url' => $m->photo ? Storage::url($m->photo) : null,
            ]),
        ]);

        $provinces = Province::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Organization/Dpw', [
            'dpws' => $dpws,
            'provinces' => $provinces,
            'filters' => $request->only(['search']),
        ]);
    }

    public function dpwStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'province_id' => ['required', 'exists:provinces,id', 'unique:dpws,province_id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'period' => ['nullable', 'string', 'max:50'],
        ]);

        $dpw = Dpw::create($validated);
        ActivityLog::log('create_dpw', "Menambah DPW: {$dpw->name}");

        return back()->with('success', "DPW {$dpw->name} berhasil ditambahkan.");
    }

    public function dpwUpdate(Dpw $dpw, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'province_id' => ['required', 'exists:provinces,id', 'unique:dpws,province_id,'.$dpw->id],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'period' => ['nullable', 'string', 'max:50'],
        ]);

        $dpw->update($validated);
        ActivityLog::log('update_dpw', "Memperbarui DPW: {$dpw->name}");

        return back()->with('success', "DPW {$dpw->name} berhasil diperbarui.");
    }

    public function dpwDestroy(Dpw $dpw): RedirectResponse
    {
        $name = $dpw->name;
        $dpw->members()->delete();
        $dpw->delete();

        ActivityLog::log('delete_dpw', "Menghapus DPW: {$name}");

        return back()->with('success', "DPW {$name} berhasil dihapus.");
    }

    public function dpwMemberStore(Dpw $dpw, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
            'photo' => ['nullable', 'image', 'max:3072'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('organization/dpw', 'public');
        }

        DpwMember::create([
            'dpw_id' => $dpw->id,
            'name' => $validated['name'],
            'position' => $validated['position'],
            'order' => $validated['order'] ?? 0,
            'photo' => $photoPath,
        ]);

        return back()->with('success', 'Pengurus DPW berhasil ditambahkan.');
    }

    public function dpwMemberDestroy(DpwMember $member): RedirectResponse
    {
        if ($member->photo) {
            Storage::disk('public')->delete($member->photo);
        }
        $member->delete();

        return back()->with('success', 'Pengurus DPW berhasil dihapus.');
    }

    // ==========================================
    // 3. DPC (Dewan Pengurus Cabang / Kab/Kota)
    // ==========================================
    public function dpcIndex(Request $request): Response
    {
        $query = Dpc::query()->with(['regency.province', 'members' => fn ($q) => $q->orderBy('order')]);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('regency', fn ($rq) => $rq->where('name', 'like', "%{$search}%"));
        }

        if ($provinceId = $request->input('province_id')) {
            $query->whereHas('regency', fn ($rq) => $rq->where('province_id', $provinceId));
        }

        $dpcs = $query->paginate(12)->through(fn ($d) => [
            'id' => $d->id,
            'name' => $d->name,
            'regency_id' => $d->regency_id,
            'regency_name' => $d->regency?->name ?? '-',
            'province_name' => $d->regency?->province?->name ?? '-',
            'address' => $d->address,
            'phone' => $d->phone,
            'email' => $d->email,
            'period' => $d->period,
            'members' => $d->members->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'position' => $m->position,
                'order' => $m->order,
                'photo_url' => $m->photo ? Storage::url($m->photo) : null,
            ]),
        ]);

        $provinces = Province::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Organization/Dpc', [
            'dpcs' => $dpcs,
            'provinces' => $provinces,
            'filters' => $request->only(['search', 'province_id']),
        ]);
    }

    public function dpcStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'regency_id' => ['required', 'exists:regencies,id', 'unique:dpcs,regency_id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'period' => ['nullable', 'string', 'max:50'],
        ]);

        $dpc = Dpc::create($validated);
        ActivityLog::log('create_dpc', "Menambah DPC: {$dpc->name}");

        return back()->with('success', "DPC {$dpc->name} berhasil ditambahkan.");
    }

    public function dpcUpdate(Dpc $dpc, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'regency_id' => ['required', 'exists:regencies,id', 'unique:dpcs,regency_id,'.$dpc->id],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'period' => ['nullable', 'string', 'max:50'],
        ]);

        $dpc->update($validated);
        ActivityLog::log('update_dpc', "Memperbarui DPC: {$dpc->name}");

        return back()->with('success', "DPC {$dpc->name} berhasil diperbarui.");
    }

    public function dpcDestroy(Dpc $dpc): RedirectResponse
    {
        $name = $dpc->name;
        $dpc->members()->delete();
        $dpc->delete();

        ActivityLog::log('delete_dpc', "Menghapus DPC: {$name}");

        return back()->with('success', "DPC {$name} berhasil dihapus.");
    }

    public function dpcMemberStore(Dpc $dpc, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
            'photo' => ['nullable', 'image', 'max:3072'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('organization/dpc', 'public');
        }

        DpcMember::create([
            'dpc_id' => $dpc->id,
            'name' => $validated['name'],
            'position' => $validated['position'],
            'order' => $validated['order'] ?? 0,
            'photo' => $photoPath,
        ]);

        return back()->with('success', 'Pengurus DPC berhasil ditambahkan.');
    }

    public function dpcMemberDestroy(DpcMember $member): RedirectResponse
    {
        if ($member->photo) {
            Storage::disk('public')->delete($member->photo);
        }
        $member->delete();

        return back()->with('success', 'Pengurus DPC berhasil dihapus.');
    }
}
