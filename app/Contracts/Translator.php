<?php

namespace App\Contracts;

interface Translator
{
    /**
     * Menerjemahkan kumpulan pasangan [key => teks] dalam satu panggilan batch.
     *
     * @param  array<string, string>  $items
     * @param  array<string, mixed>  $context
     * @return array<string, string>
     */
    public function translateBatch(
        array $items,
        string $from = 'id',
        string $to = 'en',
        array $context = []
    ): array;

    public function driverName(): string;
}
