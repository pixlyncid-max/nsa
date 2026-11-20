<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ContactMessage::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($topic = $request->input('topic')) {
            $query->where('topic', $topic);
        }

        $messages = $query->latest('id')->paginate(15)->withQueryString()->through(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'topic' => $m->topic ?? 'Umum',
            'message' => $m->message,
            'is_read' => $m->read_at !== null,
            'read_at' => $m->read_at?->format('d/m/Y H:i'),
            'created_at' => $m->created_at?->format('d/m/Y H:i'),
        ]);

        return Inertia::render('Admin/Messages/Index', [
            'messages' => $messages,
            'filters' => $request->only(['search', 'topic']),
            'topics' => [
                ['value' => 'kemitraan', 'label' => 'Pengajuan Kemitraan'],
                ['value' => 'keanggotaan', 'label' => 'Pertanyaan Keanggotaan'],
                ['value' => 'kerjasama', 'label' => 'Kerjasama Usaha'],
                ['value' => 'lainnya', 'label' => 'Lainnya / Umum'],
            ],
        ]);
    }

    public function markAsRead(ContactMessage $message): RedirectResponse
    {
        $message->update(['read_at' => now()]);

        return back()->with('success', 'Pesan ditandai telah dibaca.');
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $id = $message->id;
        $message->delete();

        ActivityLog::log('delete_contact_message', "Menghapus pesan kontak #{$id}");

        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}
