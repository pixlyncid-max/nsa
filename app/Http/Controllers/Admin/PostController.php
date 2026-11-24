<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PostType;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Post::query()->with(['category', 'author']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $posts = $query->latest('id')->paginate(12)->withQueryString()->through(function ($p) {
            return [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'type' => $p->type instanceof PostType ? $p->type->value : (string) $p->type,
                'category_name' => $p->category?->name ?? 'Umum',
                'author_name' => $p->publisher_name ?: ($p->author?->name ?? '-'),
                'status' => $p->status,
                'cover_url' => $p->coverUrl(),
                'published_at' => $p->published_at?->format('d/m/Y H:i'),
                'created_at' => $p->created_at?->format('d/m/Y'),
            ];
        });

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'type', 'status']),
            'categories' => PostCategory::orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Posts/Form', [
            'post' => null,
            'categories' => PostCategory::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:news,article'],
            'category_id' => ['nullable', 'exists:post_categories,id'],
            'publisher_name' => ['nullable', 'string', 'max:150'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'cover' => ['nullable', 'image', 'max:5120'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'published_at' => ['nullable', 'date'],
        ]);

        $slug = Str::slug($validated['title']);
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = Str::slug($validated['title']).'-'.$counter++;
        }

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('posts', 'public');
        }

        $publishedAt = match ($validated['status']) {
            'published' => ! empty($validated['published_at']) ? $validated['published_at'] : now(),
            'scheduled' => ! empty($validated['published_at']) ? $validated['published_at'] : now()->addDay(),
            default => null,
        };

        $post = Post::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'type' => $validated['type'],
            'category_id' => $validated['category_id'] ?? null,
            'author_id' => $request->user()->id,
            'publisher_name' => filled($validated['publisher_name'] ?? null) ? trim((string) $validated['publisher_name']) : null,
            'excerpt' => $validated['excerpt'] ?? null,
            'body' => $validated['body'],
            'cover' => $coverPath,
            'status' => $validated['status'],
            'published_at' => $publishedAt,
        ]);

        ActivityLog::log(
            action: 'create_post',
            subject: "Menerbitkan pos: {$post->title}",
            meta: ['post_id' => $post->id, 'type' => $post->type->value ?? $post->type],
            userId: $request->user()->id,
        );

        return redirect()->route('admin.posts.index')->with('success', "Pos {$post->title} berhasil disimpan.");
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('Admin/Posts/Form', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'type' => $post->type instanceof PostType ? $post->type->value : (string) $post->type,
                'category_id' => $post->category_id,
                'publisher_name' => $post->publisher_name,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'cover_url' => $post->coverUrl(),
                'status' => $post->status,
                'published_at' => $post->published_at?->format('Y-m-d\TH:i'),
            ],
            'categories' => PostCategory::orderBy('name')->get(),
        ]);
    }

    public function update(Post $post, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:news,article'],
            'category_id' => ['nullable', 'exists:post_categories,id'],
            'publisher_name' => ['nullable', 'string', 'max:150'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'cover' => ['nullable', 'image', 'max:5120'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'published_at' => ['nullable', 'date'],
        ]);

        $coverPath = $post->cover;
        if ($request->hasFile('cover')) {
            if ($post->cover) {
                Storage::disk('public')->delete($post->cover);
            }
            $coverPath = $request->file('cover')->store('posts', 'public');
        }

        $publishedAt = match ($validated['status']) {
            'published' => ! empty($validated['published_at']) ? $validated['published_at'] : ($post->published_at ?? now()),
            'scheduled' => ! empty($validated['published_at']) ? $validated['published_at'] : now()->addDay(),
            default => null,
        };

        $post->update([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'category_id' => $validated['category_id'] ?? null,
            'publisher_name' => filled($validated['publisher_name'] ?? null) ? trim((string) $validated['publisher_name']) : null,
            'excerpt' => $validated['excerpt'] ?? null,
            'body' => $validated['body'],
            'cover' => $coverPath,
            'status' => $validated['status'],
            'published_at' => $publishedAt,
        ]);

        ActivityLog::log(
            action: 'update_post',
            subject: "Memperbarui pos: {$post->title}",
            meta: ['post_id' => $post->id],
            userId: $request->user()->id,
        );

        return redirect()->route('admin.posts.index')->with('success', "Pos {$post->title} berhasil diperbarui.");
    }

    public function destroy(Post $post, Request $request): RedirectResponse
    {
        $title = $post->title;
        if ($post->cover) {
            Storage::disk('public')->delete($post->cover);
        }

        ActivityLog::log(
            action: 'delete_post',
            subject: "Menghapus pos: {$title}",
            meta: ['post_id' => $post->id],
            userId: $request->user()->id,
        );

        $post->delete();

        return redirect()->route('admin.posts.index')->with('success', "Pos {$title} berhasil dihapus.");
    }
}
