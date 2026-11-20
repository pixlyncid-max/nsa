<?php

return [
    // =========================================================================
    // Email Selamat Datang (WelcomeUserMail)
    // =========================================================================
    'emails.welcome.subject' => [
        'label' => 'Subjek Email Selamat Datang',
        'hint' => 'Email → Dikirim setelah pendaftaran akun baru (placeholder: {brand})',
        'type' => 'text',
        'default' => 'Selamat Datang di {brand}! Mulai Langkah Anda',
        'max' => 120,
        'placeholders' => ['brand'],
    ],
    'emails.welcome.subtitle' => [
        'label' => 'Subjudul Email Selamat Datang',
        'hint' => 'Email → Baris kecil di bawah nama organisasi pada email selamat datang',
        'type' => 'text',
        'default' => 'Selamat Bergabung di Komunitas Perikanan Berkelanjutan',
        'max' => 120,
        'placeholders' => [],
    ],
    'emails.welcome.greeting' => [
        'label' => 'Sapaan Email Selamat Datang',
        'hint' => 'Email → Pembuka email selamat datang (placeholder: {name})',
        'type' => 'text',
        'default' => 'Halo {name}, terima kasih telah bergabung bersama NSA.',
        'max' => 140,
        'placeholders' => ['name'],
    ],
    'emails.welcome.body' => [
        'label' => 'Isi Email Selamat Datang',
        'hint' => 'Email → Paragraf utama email selamat datang (richtext)',
        'type' => 'richtext',
        'default' => '<p>Akun Anda telah aktif. Untuk mendapatkan manfaat penuh seperti Kartu Tanda Anggota (KTA) digital resmi, akses program pelatihan &amp; kemitraan, serta harga khusus anggota di katalog kami, mari lengkapi pendaftaran keanggotaan Anda.</p>',
        'max' => 500,
        'placeholders' => [],
    ],
    'emails.welcome.cta' => [
        'label' => 'Tombol CTA Email Selamat Datang',
        'hint' => 'Email → Tombol utama email selamat datang',
        'type' => 'button',
        'default' => 'Daftar Jadi Anggota',
        'max' => 40,
        'placeholders' => [],
    ],
    'emails.welcome.footnote' => [
        'label' => 'Catatan Kaki Email Selamat Datang',
        'hint' => 'Email → Penjelasan simpan otomatis draft pendaftaran',
        'type' => 'textarea',
        'default' => 'Proses pendaftaran terdiri dari 9 langkah terstruktur dengan fitur simpan otomatis (draft), sehingga Anda dapat melanjutkannya kapan saja.',
        'max' => 240,
        'placeholders' => [],
    ],

    // =========================================================================
    // Email Pengajuan Pendaftaran Diterima (MembershipApplicationSubmitted)
    // =========================================================================
    'emails.application_submitted.subject' => [
        'label' => 'Subjek Email Konfirmasi Pendaftaran',
        'hint' => 'Email → Konfirmasi berkas diterima (placeholder: {brand})',
        'type' => 'text',
        'default' => 'Konfirmasi Pendaftaran Anggota {brand} - Berkas Diterima',
        'max' => 120,
        'placeholders' => ['brand'],
    ],
    'emails.application_submitted.subtitle' => [
        'label' => 'Subjudul Email Konfirmasi Pendaftaran',
        'hint' => 'Email → Subjudul header email pendaftaran diterima',
        'type' => 'text',
        'default' => 'Pemberitahuan Pendaftaran Keanggotaan',
        'max' => 100,
        'placeholders' => [],
    ],
    'emails.application_submitted.body' => [
        'label' => 'Isi Email Konfirmasi Pendaftaran',
        'hint' => 'Email → Paragraf utama setelah pengajuan berkas (placeholder: {brand})',
        'type' => 'textarea',
        'default' => 'Terima kasih telah mengajukan pendaftaran keanggotaan {brand}. Berkas dan data usaha Anda telah kami terima dan saat ini berstatus Menunggu Verifikasi (Pending). Tim pengurus akan meninjau dokumen dalam 1-3 hari kerja.',
        'max' => 420,
        'placeholders' => ['brand'],
    ],
    'emails.application_submitted.cta' => [
        'label' => 'Tombol Email Konfirmasi Pendaftaran',
        'hint' => 'Email → Tombol cek status verifikasi',
        'type' => 'button',
        'default' => 'Cek Status Verifikasi',
        'max' => 40,
        'placeholders' => [],
    ],

    // =========================================================================
    // Email Lolos Verifikasi Awal (MemberInitialVerifiedMail)
    // =========================================================================
    'emails.initial_verified.subject' => [
        'label' => 'Subjek Email Lolos Verifikasi Awal',
        'hint' => 'Email → Instruksi pembayaran iuran (placeholder: {brand})',
        'type' => 'text',
        'default' => 'Verifikasi Awal Berhasil - Tagihan Administrasi Keanggotaan {brand}',
        'max' => 140,
        'placeholders' => ['brand'],
    ],
    'emails.initial_verified.subtitle' => [
        'label' => 'Subjudul Email Lolos Verifikasi Awal',
        'hint' => 'Email → Subjudul instruksi pembayaran',
        'type' => 'text',
        'default' => 'Instruksi Pembayaran Keanggotaan',
        'max' => 100,
        'placeholders' => [],
    ],
    'emails.initial_verified.body' => [
        'label' => 'Isi Email Lolos Verifikasi Awal',
        'hint' => 'Email → Informasi lolos verifikasi awal (placeholder: {brand})',
        'type' => 'textarea',
        'default' => 'Berkas pendaftaran keanggotaan Anda telah dinyatakan LOLOS VERIFIKASI AWAL oleh pengurus {brand}. Silakan selesaikan pembayaran dan unggah bukti transfer melalui dasbor keanggotaan Anda.',
        'max' => 360,
        'placeholders' => ['brand'],
    ],
    'emails.initial_verified.cta' => [
        'label' => 'Tombol Email Lolos Verifikasi Awal',
        'hint' => 'Email → Tombol bayar & unggah bukti',
        'type' => 'button',
        'default' => 'Bayar & Unggah Bukti',
        'max' => 40,
        'placeholders' => [],
    ],

    // =========================================================================
    // Email Keanggotaan Disetujui (MemberApprovedMail)
    // =========================================================================
    'emails.approved.subject' => [
        'label' => 'Subjek Email Keanggotaan Disetujui',
        'hint' => 'Email → Pemberitahuan persetujuan anggota (placeholder: {brand})',
        'type' => 'text',
        'default' => 'Selamat! Pendaftaran Keanggotaan {brand} Anda Telah Disetujui',
        'max' => 140,
        'placeholders' => ['brand'],
    ],
    'emails.approved.subtitle' => [
        'label' => 'Subjudul Email Keanggotaan Disetujui',
        'hint' => 'Email → Subjudul header persetujuan keanggotaan',
        'type' => 'text',
        'default' => 'Pemberitahuan Persetujuan Keanggotaan',
        'max' => 100,
        'placeholders' => [],
    ],
    'emails.approved.body' => [
        'label' => 'Isi Email Keanggotaan Disetujui',
        'hint' => 'Email → Paragraf persetujuan keanggotaan (placeholder: {brand})',
        'type' => 'textarea',
        'default' => 'Selamat! Pengajuan pendaftaran keanggotaan Anda telah diverifikasi dan DISETUJUI oleh pengurus {brand}. Anda kini dapat mengakses harga khusus anggota, jaringan budidaya nasional, dan Kartu Tanda Anggota digital.',
        'max' => 400,
        'placeholders' => ['brand'],
    ],
    'emails.approved.cta' => [
        'label' => 'Tombol Email Keanggotaan Disetujui',
        'hint' => 'Email → Tombol masuk dasbor anggota',
        'type' => 'button',
        'default' => 'Masuk ke Dasbor Anggota',
        'max' => 40,
        'placeholders' => [],
    ],

    // =========================================================================
    // Email Permintaan Revisi (MemberRevisionRequestedMail)
    // =========================================================================
    'emails.revision.subject' => [
        'label' => 'Subjek Email Permintaan Revisi',
        'hint' => 'Email → Permintaan perbaikan data (placeholder: {brand})',
        'type' => 'text',
        'default' => 'Perlu Revisi: Pendaftaran Keanggotaan {brand} Anda',
        'max' => 120,
        'placeholders' => ['brand'],
    ],
    'emails.revision.subtitle' => [
        'label' => 'Subjudul Email Permintaan Revisi',
        'hint' => 'Email → Subjudul permintaan revisi',
        'type' => 'text',
        'default' => 'Permintaan Perbaikan Data Keanggotaan',
        'max' => 100,
        'placeholders' => [],
    ],
    'emails.revision.body' => [
        'label' => 'Isi Email Permintaan Revisi',
        'hint' => 'Email → Penjelasan catatan verifikator (placeholder: {brand})',
        'type' => 'textarea',
        'default' => 'Tim verifikator {brand} telah memeriksa berkas pendaftaran Anda. Terdapat beberapa data atau dokumen yang perlu diperbaiki sebelum keanggotaan dapat disetujui.',
        'max' => 360,
        'placeholders' => ['brand'],
    ],
    'emails.revision.cta' => [
        'label' => 'Tombol Email Permintaan Revisi',
        'hint' => 'Email → Tombol perbaiki berkas pendaftaran',
        'type' => 'button',
        'default' => 'Perbaiki Berkas Pendaftaran',
        'max' => 40,
        'placeholders' => [],
    ],

    // =========================================================================
    // Email Penolakan Pendaftaran (MemberRejectedMail)
    // =========================================================================
    'emails.rejected.subject' => [
        'label' => 'Subjek Email Penolakan Pendaftaran',
        'hint' => 'Email → Pemberitahuan status penolakan (placeholder: {brand})',
        'type' => 'text',
        'default' => 'Pemberitahuan Status Pendaftaran Keanggotaan {brand}',
        'max' => 120,
        'placeholders' => ['brand'],
    ],
    'emails.rejected.subtitle' => [
        'label' => 'Subjudul Email Penolakan Pendaftaran',
        'hint' => 'Email → Subjudul hasil verifikasi',
        'type' => 'text',
        'default' => 'Pemberitahuan Hasil Verifikasi',
        'max' => 100,
        'placeholders' => [],
    ],
    'emails.rejected.body' => [
        'label' => 'Isi Email Penolakan Pendaftaran',
        'hint' => 'Email → Paragraf pemberitahuan penolakan (placeholder: {brand})',
        'type' => 'textarea',
        'default' => 'Terima kasih atas minat Anda untuk bergabung bersama {brand}. Setelah melalui proses verifikasi berkas, pengajuan pendaftaran Anda saat ini belum dapat disetujui.',
        'max' => 360,
        'placeholders' => ['brand'],
    ],
    'emails.rejected.cta' => [
        'label' => 'Tombol Email Penolakan Pendaftaran',
        'hint' => 'Email → Tombol hubungi sekretariat',
        'type' => 'button',
        'default' => 'Hubungi Sekretariat',
        'max' => 40,
        'placeholders' => [],
    ],

    // =========================================================================
    // Email Bukti Pembayaran Ditolak (PaymentProofRejectedMail)
    // =========================================================================
    'emails.payment_rejected.subject' => [
        'label' => 'Subjek Email Bukti Pembayaran Ditolak',
        'hint' => 'Email → Pemberitahuan bukti bayar ditolak (placeholder: {brand})',
        'type' => 'text',
        'default' => 'Pemberitahuan Bukti Pembayaran Keanggotaan {brand}',
        'max' => 120,
        'placeholders' => ['brand'],
    ],
    'emails.payment_rejected.subtitle' => [
        'label' => 'Subjudul Email Bukti Pembayaran Ditolak',
        'hint' => 'Email → Subjudul bukti pembayaran',
        'type' => 'text',
        'default' => 'Pemberitahuan Bukti Pembayaran',
        'max' => 100,
        'placeholders' => [],
    ],
    'emails.payment_rejected.body' => [
        'label' => 'Isi Email Bukti Pembayaran Ditolak',
        'hint' => 'Email → Paragraf bukti bayar belum dapat dikonfirmasi (placeholder: {brand})',
        'type' => 'textarea',
        'default' => 'Bukti pembayaran yang Anda unggah belum dapat dikonfirmasi oleh bendahara/pengurus {brand}. Silakan periksa kembali transaksi Anda dan unggah ulang bukti transfer yang sah.',
        'max' => 360,
        'placeholders' => ['brand'],
    ],
    'emails.payment_rejected.cta' => [
        'label' => 'Tombol Email Bukti Pembayaran Ditolak',
        'hint' => 'Email → Tombol unggah ulang bukti bayar',
        'type' => 'button',
        'default' => 'Unggah Ulang Bukti Pembayaran',
        'max' => 45,
        'placeholders' => [],
    ],
];
