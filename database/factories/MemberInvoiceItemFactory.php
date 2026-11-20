<?php

namespace Database\Factories;

use App\Models\MemberInvoice;
use App\Models\MemberInvoiceItem;
use App\Models\MembershipFeeItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberInvoiceItem>
 */
class MemberInvoiceItemFactory extends Factory
{
    protected $model = MemberInvoiceItem::class;

    public function definition(): array
    {
        return [
            'invoice_id' => MemberInvoice::factory(),
            'fee_item_id' => MembershipFeeItem::factory(),
            'name_snapshot' => 'Iuran Anggota NSA',
            'amount_snapshot' => 100000,
            'qty' => 1,
            'size' => null,
        ];
    }
}
