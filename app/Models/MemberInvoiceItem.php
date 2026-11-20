<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberInvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'fee_item_id',
        'name_snapshot',
        'amount_snapshot',
        'qty',
        'size',
    ];

    protected function casts(): array
    {
        return [
            'amount_snapshot' => 'decimal:2',
            'qty' => 'integer',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(MemberInvoice::class, 'invoice_id');
    }

    public function feeItem(): BelongsTo
    {
        return $this->belongsTo(MembershipFeeItem::class, 'fee_item_id');
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->amount_snapshot * $this->qty;
    }
}
