<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payable_type',
        'payable_id',
        'method',
        'amount',
        'proof_path',
        'sender_name',
        'sender_bank',
        'paid_at',
        'notes',
        'status',
        'confirmed_by',
        'confirmed_at',
    ];

    protected $appends = ['proof_url'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'date',
            'confirmed_at' => 'datetime',
        ];
    }

    public function getProofUrlAttribute(): ?string
    {
        if (! $this->proof_path) {
            return null;
        }

        if (str_starts_with($this->proof_path, 'http://') || str_starts_with($this->proof_path, 'https://')) {
            return $this->proof_path;
        }

        return Storage::disk('public')->url($this->proof_path);
    }

    /**
     * Relasi polimorfik ke Order (toko) atau MemberInvoice (iuran keanggotaan).
     */
    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Relasi langsung ke Order untuk kompatibilitas data/alur pesanan sebelumnya.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
