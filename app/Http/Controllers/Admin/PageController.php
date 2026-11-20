<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Public\AboutController;
use App\Models\ActivityLog;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        // Pastikan default page 'tentang-kami' ada dengan skema lengkap
        Page::firstOrCreate(
            ['slug' => 'tentang-kami'],
            [
                'title' => 'Tentang Kami',
                'body' => AboutController::defaultAboutContent(),
            ]
        );

        $pages = Page::all()->map(fn ($p) => [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'updated_at' => $p->updated_at?->format('d/m/Y H:i'),
        ]);

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
        ]);
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Edit', [
            'page' => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'body' => $page->body,
            ],
        ]);
    }

    public function update(Page $page, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'array'],
        ]);

        $page->update($validated);

        ActivityLog::log('update_page', "Memperbarui halaman statis: {$page->title}");

        return redirect()->route('admin.pages.index')->with('success', "Halaman {$page->title} berhasil diperbarui.");
    }
}
