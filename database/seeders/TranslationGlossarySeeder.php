<?php

namespace Database\Seeders;

use App\Models\TranslationGlossary;
use Illuminate\Database\Seeder;

class TranslationGlossarySeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            ['source' => 'NSA', 'target' => 'NSA', 'note' => 'Nama organisasi dipertahankan', 'case_sensitive' => true],
            ['source' => 'DPP', 'target' => 'DPP', 'note' => 'Singkatan Dewan Pengurus Pusat', 'case_sensitive' => true],
            ['source' => 'DPW', 'target' => 'DPW', 'note' => 'Singkatan Dewan Pengurus Wilayah', 'case_sensitive' => true],
            ['source' => 'DPC', 'target' => 'DPC', 'note' => 'Singkatan Dewan Pengurus Cabang', 'case_sensitive' => true],
            ['source' => 'NIB', 'target' => 'NIB', 'note' => 'Nomor Induk Berusaha', 'case_sensitive' => true],
            ['source' => 'NPWP', 'target' => 'NPWP', 'note' => 'Nomor Pokok Wajib Pajak', 'case_sensitive' => true],
            ['source' => 'CBIB', 'target' => 'CBIB', 'note' => 'Cara Budidaya Ikan yang Baik', 'case_sensitive' => true],
            ['source' => 'Lele', 'target' => 'Catfish', 'note' => 'Komoditas perikanan air tawar', 'case_sensitive' => false],
            ['source' => 'Nila', 'target' => 'Tilapia', 'note' => 'Komoditas perikanan air tawar', 'case_sensitive' => false],
            ['source' => 'Mas', 'target' => 'Common carp', 'note' => 'Ikan mas (komoditas budidaya)', 'case_sensitive' => false],
            ['source' => 'Pembudidaya', 'target' => 'Fish farmer', 'note' => 'Pelaku usaha budidaya ikan', 'case_sensitive' => false],
        ];

        foreach ($entries as $entry) {
            TranslationGlossary::query()->updateOrCreate(
                [
                    'source' => $entry['source'],
                    'locale' => 'en',
                ],
                [
                    'target' => $entry['target'],
                    'note' => $entry['note'],
                    'case_sensitive' => $entry['case_sensitive'],
                    'is_active' => true,
                ]
            );
        }
    }
}
