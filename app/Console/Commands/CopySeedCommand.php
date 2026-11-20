<?php

namespace App\Console\Commands;

use App\Support\Copy\CopyRegistry;
use Illuminate\Console\Command;
use Throwable;

class CopySeedCommand extends Command
{
    protected $signature = 'copy:seed';

    protected $description = 'Memvalidasi seluruh file registry teks di resources/copy tanpa mengisi database';

    public function handle(CopyRegistry $registry): int
    {
        try {
            $registry->flush();
            $all = $registry->all();
            $groups = $registry->groups();
        } catch (Throwable $e) {
            $this->error('Validasi registry teks gagal: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info('Registry teks valid (tanpa menulis ke database).');
        $this->table(
            ['Kelompok', 'Jumlah Key'],
            collect($groups)->map(fn (string $group) => [
                $group,
                count($registry->forGroup($group)),
            ])->all()
        );
        $this->info('Total key terdaftar: '.count($all));

        return self::SUCCESS;
    }
}
