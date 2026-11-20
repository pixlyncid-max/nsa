<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\SiteMediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteMediaController extends Controller
{
    public function __construct(
        private readonly SiteMediaService $mediaService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Admin/SiteMedia/Index', [
            'groups' => collect($this->mediaService->groups())->map(fn (string $label, string $key) => [
                'key' => $key,
                'label' => $label,
            ])->values(),
            'items' => $this->mediaService->listForAdmin(),
        ]);
    }

    public function update(Request $request, string $slot): RedirectResponse|JsonResponse
    {
        $slots = $this->mediaService->slots();
        if (! array_key_exists($slot, $slots)) {
            abort(404);
        }

        $isLogo = str_starts_with($slot, 'brand_logo_');
        $mimes = $isLogo ? 'jpg,jpeg,png,webp,svg' : 'jpg,jpeg,png,webp';

        $request->validate([
            'image' => ['required', 'file', "mimes:{$mimes}", 'max:5120'],
        ], [
            'image.required' => 'Pilih berkas gambar terlebih dahulu.',
            'image.mimes' => $isLogo
                ? 'Format gambar harus JPG, PNG, WebP, atau SVG.'
                : 'Format gambar harus JPG, PNG, atau WebP.',
            'image.max' => 'Ukuran gambar maksimal 5 MB.',
        ]);

        $url = $this->mediaService->upload($slot, $request->file('image'));

        ActivityLog::log(
            action: 'update_site_media',
            subject: 'Memperbarui gambar website: '.$slots[$slot]['label'],
            meta: ['slot' => $slot],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Gambar berhasil diperbarui.',
                'slot' => $slot,
                'url' => $url,
            ]);
        }

        return back()->with('success', 'Gambar berhasil diperbarui.');
    }

    public function destroy(Request $request, string $slot): RedirectResponse|JsonResponse
    {
        $slots = $this->mediaService->slots();
        if (! array_key_exists($slot, $slots)) {
            abort(404);
        }

        $this->mediaService->reset($slot);

        ActivityLog::log(
            action: 'reset_site_media',
            subject: 'Mengembalikan gambar website ke bawaan: '.$slots[$slot]['label'],
            meta: ['slot' => $slot],
            userId: $request->user()->id,
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Gambar dikembalikan ke bawaan.',
                'slot' => $slot,
            ]);
        }

        return back()->with('success', 'Gambar dikembalikan ke bawaan.');
    }
}
