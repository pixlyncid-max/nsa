<?php

return [
    'registration.wizard.title' => [
        'label' => 'Judul Pendaftaran Keanggotaan',
        'hint' => 'Pendaftaran → Header wizard 9 langkah',
        'type' => 'text',
        'default' => 'Pendaftaran Anggota NSA',
        'max' => 80,
        'placeholders' => [],
    ],
    'registration.progress' => [
        'label' => 'Indikator Progres Langkah',
        'hint' => 'Pendaftaran → Menampilkan langkah aktif (placeholder: {step}, {total})',
        'type' => 'text',
        'default' => 'Langkah {step} dari {total}',
        'max' => 50,
        'placeholders' => ['step', 'total'],
    ],
    'registration.submit.button' => [
        'label' => 'Tombol Kirim Pendaftaran',
        'hint' => 'Pendaftaran → Langkah 9 tinjauan akhir',
        'type' => 'button',
        'default' => 'Kirim Pendaftaran Keanggotaan',
        'max' => 50,
        'placeholders' => [],
    ],
];
