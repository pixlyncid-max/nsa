<?php

namespace App\Models;

use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipFeeItem extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['name', 'description'];

    protected $fillable = [
        'code',
        'name',
        'description',
        'amount',
        'type',
        'has_size_option',
        'size_options',
        'is_active',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'has_size_option' => 'boolean',
            'size_options' => 'array',
            'is_active' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(MemberInvoiceItem::class, 'fee_item_id');
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rp '.number_format((float) $this->amount, 0, ',', '.');
    }
}
