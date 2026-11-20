<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\DppMember;
use Inertia\Inertia;
use Inertia\Response;

class DppController extends Controller
{
    /**
     * Tampilkan susunan Dewan Pengurus Pusat (DPP) NSA.
     * Nama pengurus tidak diterjemahkan; jabatan & bio mengikuti bahasa aktif.
     */
    public function index(): Response
    {
        $locale = app()->getLocale();
        $members = DppMember::orderBy('order')
            ->withLocale($locale)
            ->get()
            ->map(fn (DppMember $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'position' => $member->tr('position', $locale),
                'photo' => $member->photo,
                'order' => $member->order,
                'period' => $member->period,
                'bio' => $member->tr('bio', $locale),
            ]);

        return Inertia::render('Public/Organization/Dpp', [
            'members' => $members,
        ]);
    }
}
