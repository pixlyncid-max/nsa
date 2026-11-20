<?php

namespace Database\Seeders;

use App\Models\MembershipFeeItem;
use Illuminate\Database\Seeder;

class MembershipFeeItemSeeder extends Seeder
{
    /**
     * Seed contoh item biaya dan administrasi keanggotaan NSA yang dapat dikelola via CMS.
     */
    public function run(): void
    {
        $feeItems = [
            [
                'code' => 'REG_FEE',
                'name' => 'Biaya Registrasi Anggota Baru',
                'description' => 'Biaya administrasi pendaftaran dan pemrosesan berkas keanggotaan NSA.',
                'amount' => 100000,
                'type' => 'required',
                'has_size_option' => false,
                'size_options' => null,
                'is_active' => true,
                'order' => 1,
            ],
            [
                'code' => 'KTA_CARD',
                'name' => 'Kartu Tanda Anggota (KTA) Fisik',
                'description' => 'Pencetakan dan penerbitan kartu fisik ber-chip RFID dengan NTA resmi NSA.',
                'amount' => 50000,
                'type' => 'required',
                'has_size_option' => false,
                'size_options' => null,
                'is_active' => true,
                'order' => 2,
            ],
            [
                'code' => 'ANNUAL_DUES',
                'name' => 'Iuran Tahunan Anggota',
                'description' => 'Iuran wajib kontribusi operasional dan advokasi organisasi tahun berjalan.',
                'amount' => 200000,
                'type' => 'recurring',
                'has_size_option' => false,
                'size_options' => null,
                'is_active' => true,
                'order' => 3,
            ],
            [
                'code' => 'VEST_OFFICIAL',
                'name' => 'Rompi Resmi Lapangan NSA',
                'description' => 'Rompi seragam berlogo bordir NSA dengan bahan tahan percikan air untuk kegiatan lapangan.',
                'amount' => 150000,
                'type' => 'optional',
                'has_size_option' => true,
                'size_options' => ['S', 'M', 'L', 'XL', 'XXL'],
                'is_active' => true,
                'order' => 4,
            ],
            [
                'code' => 'SHIRT_OFFICIAL',
                'name' => 'Kemeja Resmi NSA',
                'description' => 'Kemeja kerja katun resmi NSA untuk pertemuan formal dan kegiatan organisasi.',
                'amount' => 175000,
                'type' => 'optional',
                'has_size_option' => true,
                'size_options' => ['S', 'M', 'L', 'XL', 'XXL'],
                'is_active' => true,
                'order' => 5,
            ],
        ];

        foreach ($feeItems as $item) {
            MembershipFeeItem::updateOrCreate(
                ['code' => $item['code']],
                $item
            );
        }
    }
}
