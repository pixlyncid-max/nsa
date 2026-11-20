<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class MemberInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'number',
        'status',
        'total',
        'due_at',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'due_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(MemberApplication::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(MemberInvoiceItem::class, 'invoice_id');
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function latestPayment(): MorphOne
    {
        return $this->morphOne(Payment::class, 'payable')->latestOfMany();
    }

    public function getFormattedTotalAttribute(): string
    {
        return 'Rp '.number_format((float) $this->total, 0, ',', '.');
    }
}
