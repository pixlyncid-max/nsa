<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\MemberDocument;
use App\Models\MemberStatement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    /**
     * Tampilkan berkas dokumen privat dengan otorisasi ketat.
     */
    public function show(MemberDocument $document, Request $request): BinaryFileResponse
    {
        // Otorisasi melalui Policy: hanya admin/superadmin atau pemilik dokumen
        $user = $request->user();
        if (! $user || ! $user->can('view', $document)) {
            abort(403, 'Anda tidak memiliki hak akses untuk membuka dokumen ini.');
        }

        if (! Storage::disk('private')->exists($document->path)) {
            abort(404, 'Berkas dokumen tidak ditemukan di media penyimpanan aman.');
        }

        $fullPath = Storage::disk('private')->path($document->path);

        return response()->file($fullPath);
    }

    /**
     * Tampilkan berkas dokumen privat via URL bertanda tangan (signed URL).
     */
    public function signedShow(MemberDocument $document, Request $request): BinaryFileResponse
    {
        $user = $request->user();
        if (! $user || ! $user->can('view', $document)) {
            abort(403, 'Anda tidak memiliki hak akses untuk membuka dokumen ini.');
        }

        if (! Storage::disk('private')->exists($document->path)) {
            abort(404, 'Berkas dokumen tidak ditemukan di media penyimpanan aman.');
        }

        $fullPath = Storage::disk('private')->path($document->path);

        return response()->file($fullPath, [
            'Content-Disposition' => 'inline; filename="'.($document->original_name ?: basename($document->path)).'"',
        ]);
    }

    /**
     * Tampilkan berkas tanda tangan privat via URL bertanda tangan (signed URL).
     */
    public function signatureSigned(MemberStatement $statement, Request $request): BinaryFileResponse
    {
        $user = $request->user();
        if (! $user || ($user->id !== $statement->user_id && ! in_array($user->role->value, ['admin', 'superadmin'], true))) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat tanda tangan ini.');
        }

        if (! Storage::disk('private')->exists($statement->signature_path)) {
            abort(404, 'Berkas tanda tangan tidak ditemukan.');
        }

        $fullPath = Storage::disk('private')->path($statement->signature_path);

        return response()->file($fullPath, [
            'Content-Disposition' => 'inline; filename="tanda_tangan.png"',
        ]);
    }
}
