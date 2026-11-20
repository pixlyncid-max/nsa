<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\MembershipFeeItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MembershipFeeItemController extends Controller
{
    /**
     * Tampilkan daftar master tarif iuran & biaya keanggotaan (khusus Superadmin).
     */
    public function index(): Response
    {
        Gate::authorize('manage-settings');

        $feeItems = MembershipFeeItem::withCount('invoiceItems')
            ->orderBy('order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Admin/MembershipMaster/FeeItems', [
            'feeItems' => $feeItems,
        ]);
    }

    /**
     * Simpan komponen biaya baru.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('manage-settings');

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:membership_fee_items,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'amount' => ['required', 'numeric', 'min:0'],
            'type' => ['required', 'string', Rule::in(['one_time', 'annual', 'monthly'])],
            'has_size_option' => ['boolean'],
            'size_options' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'order' => ['integer', 'min:0'],
        ]);

        $validated['has_size_option'] = $validated['has_size_option'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        $item = MembershipFeeItem::create($validated);

        ActivityLog::log(
            action: 'create_membership_fee_item',
            subject: "Menambahkan komponen biaya keanggotaan: {$item->name} (Rp ".number_format((float) $item->amount, 0, ',', '.').')',
            userId: $request->user()->id,
        );

        return back()->with('success', "Komponen biaya '{$item->name}' berhasil ditambahkan.");
    }

    /**
     * Perbarui komponen biaya.
     */
    public function update(Request $request, MembershipFeeItem $feeItem): RedirectResponse
    {
        Gate::authorize('manage-settings');

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('membership_fee_items', 'code')->ignore($feeItem->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'amount' => ['required', 'numeric', 'min:0'],
            'type' => ['required', 'string', Rule::in(['one_time', 'annual', 'monthly'])],
            'has_size_option' => ['boolean'],
            'size_options' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'order' => ['integer', 'min:0'],
        ]);

        $feeItem->update($validated);

        ActivityLog::log(
            action: 'update_membership_fee_item',
            subject: "Memperbarui komponen biaya keanggotaan: {$feeItem->name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Komponen biaya '{$feeItem->name}' berhasil diperbarui.");
    }

    /**
     * Hapus komponen biaya keanggotaan.
     */
    public function destroy(Request $request, MembershipFeeItem $feeItem): RedirectResponse
    {
        Gate::authorize('manage-settings');

        if ($feeItem->invoiceItems()->count() > 0) {
            return back()->withErrors([
                'error' => "Komponen biaya '{$feeItem->name}' sudah terdapat pada invoice anggota. Nonaktifkan saja agar riwayat tagihan tetap konsisten.",
            ]);
        }

        $name = $feeItem->name;
        $feeItem->delete();

        ActivityLog::log(
            action: 'delete_membership_fee_item',
            subject: "Menghapus komponen biaya keanggotaan: {$name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Komponen biaya '{$name}' berhasil dihapus.");
    }
}
