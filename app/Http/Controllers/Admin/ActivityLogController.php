<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('view-activity-logs');

        $query = ActivityLog::query()->with('user');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        $logs = $query->latest('id')->paginate(20)->withQueryString()->through(fn ($l) => [
            'id' => $l->id,
            'user_name' => $l->user?->name ?? 'Sistem / Anonim',
            'action' => $l->action,
            'subject' => $l->subject,
            'meta' => $l->meta,
            'created_at' => $l->created_at?->format('d/m/Y H:i:s'),
        ]);

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
