<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Province;
use App\Models\Regency;
use App\Services\Contracts\PaymentServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AccountApiController extends Controller
{
    public function __construct(
        protected PaymentServiceInterface $paymentService
    ) {}

    /**
     * Ambil daftar pesanan pengguna saat ini untuk Drawer Pesanan.
     */
    public function orders(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with(['items', 'payment'])
            ->latest()
            ->take(20)
            ->get()
            ->map(function (Order $order) {
                return [
                    'id' => $order->id,
                    'code' => $order->code,
                    'status' => $order->status->value,
                    'status_label' => $order->status->label(),
                    'total' => (float) $order->total,
                    'items_count' => $order->items->sum('qty'),
                    'items' => $order->items->map(fn ($item) => [
                        'id' => $item->id,
                        'name' => $item->name_snapshot,
                        'price' => (float) $item->price_snapshot,
                        'qty' => $item->qty,
                        'subtotal' => (float) ($item->price_snapshot * $item->qty),
                    ]),
                    'created_at' => $order->created_at->translatedFormat('d M Y, H:i'),
                    'payment_status' => $order->payment?->status ?? 'pending',
                    'payment_method' => $order->payment?->method ?? 'manual_transfer',
                    'proof_url' => $order->payment?->proof_path ? asset('storage/'.$order->payment->proof_path) : null,
                ];
            });

        return response()->json([
            'orders' => $orders,
        ]);
    }

    /**
     * Unggah bukti transfer untuk pesanan tertentu langsung dari Drawer.
     */
    public function uploadProof(Order $order, Request $request): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Tidak memiliki otorisasi pada pesanan ini.'], 403);
        }

        $validated = $request->validate([
            'proof' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ], [
            'proof.required' => 'Silakan pilih berkas bukti transfer.',
            'proof.image' => 'Berkas bukti transfer harus berupa gambar (JPG, PNG, WebP).',
            'proof.max' => 'Ukuran berkas bukti transfer maksimal 2MB.',
        ]);

        $file = $request->file('proof');
        $path = $file->store('payments', 'public');

        $payment = $order->payment;
        if ($payment) {
            if ($payment->proof_path && Storage::disk('public')->exists($payment->proof_path)) {
                Storage::disk('public')->delete($payment->proof_path);
            }
            $payment->update([
                'proof_path' => $path,
                'status' => 'pending',
            ]);
        } else {
            $order->payment()->create([
                'method' => 'manual_transfer',
                'amount' => $order->total,
                'status' => 'pending',
                'proof_path' => $path,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bukti transfer berhasil diunggah. Kami akan segera memverifikasinya.',
            'proof_url' => asset('storage/'.$path),
        ]);
    }

    /**
     * Ambil data alamat pengguna saat ini untuk Drawer Alamat.
     */
    public function address(Request $request): JsonResponse
    {
        $user = $request->user();
        $business = $user->business;
        $profile = $user->profile;

        $provinceId = $business?->province_id;
        $regencyId = $business?->regency_id;

        $provinceName = $business?->province?->name;
        if (! $provinceName && $provinceId) {
            $provinceName = Province::find($provinceId)?->name;
        }

        $regencyName = $business?->regency?->name;
        if (! $regencyName && $regencyId) {
            $regencyName = Regency::find($regencyId)?->name;
        }

        return response()->json([
            'recipient_name' => $user->name,
            'phone' => $user->phone ?? '',
            'province_id' => $provinceId,
            'province_name' => $provinceName ?? '',
            'regency_id' => $regencyId,
            'regency_name' => $regencyName ?? '',
            'postal_code' => $business?->postal_code ?? '',
            'address' => $business?->address ?? $profile?->address ?? '',
        ]);
    }

    /**
     * Simpan / Perbarui alamat pengguna.
     */
    public function updateAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'province_id' => ['nullable', 'integer', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'integer', 'exists:regencies,id'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'address' => ['required', 'string', 'max:1000'],
        ], [
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'address.required' => 'Alamat lengkap wajib diisi.',
        ]);

        $user = $request->user();

        // Perbarui data nama dan nomor telepon user jika diperlukan
        $user->name = $validated['recipient_name'];
        $user->phone = $validated['phone'];
        $user->save();

        // Simpan ke member profile / business
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);
        $profile->address = $validated['address'];
        $profile->save();

        $business = $user->business()->firstOrCreate(['user_id' => $user->id]);
        $business->province_id = $validated['province_id'] ?? null;
        $business->regency_id = $validated['regency_id'] ?? null;
        $business->postal_code = $validated['postal_code'] ?? null;
        $business->address = $validated['address'];
        $business->save();

        return response()->json([
            'success' => true,
            'message' => 'Alamat pengiriman berhasil disimpan.',
        ]);
    }

    /**
     * Ambil data profil pengguna untuk Drawer Profil & Sandi.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'membership_status' => $user->membership_status?->value ?? 'non_member',
            'member_number' => $user->member_number,
        ]);
    }

    /**
     * Perbarui data profil pengguna (Nama, Email, No. Telepon).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar oleh pengguna lain.',
        ]);

        $user->name = $validated['name'];
        if ($user->email !== $validated['email']) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
        }
        $user->phone = $validated['phone'] ?? null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * Perbarui kata sandi pengguna.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'current_password.current_password' => 'Kata sandi saat ini tidak sesuai.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi Anda berhasil diperbarui.',
        ]);
    }
}
