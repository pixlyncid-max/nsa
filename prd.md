# PRD — Website NSA (Nusantara Sustainable Aquatic)

**NSA (Nusantara Sustainable Aquatic)**  
Versi 2.0 (Revisi Klien) · Dokumen ini adalah sumber kebenaran untuk *apa* yang dibangun. Untuk *tampilannya* lihat `design.md`, untuk *cara menjalankan* lihat `readme.md`, dan riwayat perubahan tercatat di `CHANGELOG.md`.

---

## 1. Ringkasan

NSA (Nusantara Sustainable Aquatic) adalah platform digital asosiasi perikanan dan akuakultur Indonesia yang menggabungkan empat pilar utama:

1. **Profil Organisasi & Web Publik**: struktur DPP, DPW, DPC, Program Kerja asosiasi, berita, artikel, dan kemitraan strategis.
2. **Keanggotaan Terpadu ("Portal Anggota")**:
   - Pendaftaran anggota 9 langkah baru (dengan opsi WNI/WNA, form dinamis aktivitas perikanan, jaringan bisnis, dan minat program).
   - Alur persetujuan bertahap dengan integrasi pembayaran iuran/paket administrasi keanggotaan.
3. **Dua Tingkat Dashboard Pengguna**:
   - **Dashboard Sederhana (`/akun`)**: untuk pengguna terdaftar biasa (non-membership) dan calon anggota yang sedang dalam proses pendaftaran.
   - **Dashboard Membership (`/anggota`)**: portal khusus anggota resmi (`approved`) dengan 7 menu ekosistem perikanan lengkap.
4. **Toko (Semi E-Commerce)**: katalog produk dan sarana akuakultur, keranjang belanja, transaksi pembayaran manual berjenjang dengan harga khusus anggota (*Member Price*).

Tujuan utama: menjadi ekosistem digital terpadu bagi pembudidaya, petambak, nelayan, pelaku usaha, industri, dan akademisi perikanan berkelanjutan di seluruh Nusantara.

---

## 2. Tujuan & Ukuran Keberhasilan

| Tujuan | Ukuran |
|---|---|
| Menarik anggota baru | Penyelesaian formulir pendaftaran 9 langkah ≥ 65% |
| Transparansi proses & pembayaran | Konfirmasi pembayaran pendaftaran dan verifikasi admin ≤ 2x24 jam |
| Membangun kepercayaan industri | Struktur organisasi DPP/DPW/DPC dan Program Kerja selalu terbarui |
| Menghasilkan transaksi sarana budidaya | Checkout belanja selesai ≥ 40% dari keranjang yang dibuat |
| Fleksibilitas konfigurasi | Superadmin dapat mengelola brand, logo (terang & gelap), biaya iuran, dan program tanpa ubah kode |
| Kinerja & Aksesibilitas | Skor Lighthouse ≥ 85 (mobile) dan kepatuhan WCAG AA |

---

## 3. Pengguna, Role, dan Alur Sistem

### 3.1 Role Sistem

Hanya ada **3 role** di database (`users.role`):

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| `superadmin` | Pimpinan/Pengelola Pusat | Semua fitur admin + Kelola Akun Admin + Pengaturan Identitas Brand & Situs + Hapus Permanen Data |
| `admin` | Tim Verifikator & Staf CMS | Verifikasi pendaftaran anggota, konfirmasi iuran & pembayaran, kelola program, produk, pesanan, artikel, organisasi, statistik |
| `user` | Pengguna Terdaftar | Akses dashboard sederhana, belanja, kelola profil akun, mendaftar keanggotaan NSA |

### 3.2 Alur Sistem Baru (Setelah Login & Sign Up ke Beranda)

```
Web Utama (/)
├── Login
│   ├── admin / superadmin           → CMS Admin (/admin)
│   └── user (semua status)          → Beranda Utama ("/") + Toast Sambutan ("Selamat datang kembali, {nama}.")
│                                      (URL intended dihormati bila ada, misal checkout)
│                                      └── Menu Akun di Navbar:
│                                            ├── Item "Dashboard" → /akun (non-approved) atau /anggota (approved)
│                                            ├── Pesanan Saya (drawer pesanan)
│                                            ├── Profil (drawer profil)
│                                            └── Keluar (logout)
│                                      └── Banner Ajakan Membership (MembershipPromoBar) otomatis tampil di Beranda
│                                            untuk user dengan status non-approved:
│                                            └── Tombol Aksi Kontekstual ("Daftar Sekarang", "Lanjutkan", "Lihat Status")
│                                                  → Formulir Pendaftaran 9 Langkah
│                                                  → Verifikasi Awal Admin (kelengkapan berkas)
│                                                  → Pembayaran Biaya Keanggotaan & Tagihan Invoice
│                                                  → Konfirmasi Pembayaran & Persetujuan Akhir Admin
│                                                  → Status: APPROVED (Resmi Anggota NSA)
│
└── Sign Up
    └── Registrasi akun biasa        → Status: non_member → diarahkan ke Beranda Utama ("/") + Toast Notifikasi + Banner Membership
```

### 3.3 Status Keanggotaan Baru (`MembershipStatus`)

Enum `MembershipStatus` diperluas untuk mengakomodasi alur verifikasi dan pembayaran:

| Status | Label Indonesia | Keterangan & Tindakan Pengguna |
|---|---|---|
| `non_member` | Non-Anggota | Pengguna biasa; melihat ajakan gabung di `/akun` |
| `draft` | Draf Pendaftaran | Sedang mengisi wizard 9 langkah pendaftaran |
| `pending_review` | Menunggu Verifikasi Awal | Formulir terkirim; admin memeriksa kelengkapan data |
| `revision` | Perlu Perbaikan | Admin meminta revisi data/dokumen tertentu |
| `awaiting_payment` | Menunggu Pembayaran | Lolos verifikasi awal; invoice terbit, user membayar & unggah bukti |
| `pending_approval` | Menunggu Persetujuan Akhir | Bukti bayar terkirim; admin memvalidasi mutasi & persetujuan final |
| `approved` | Anggota Resmi | Persetujuan tuntas; nomor anggota NSA terbit, akses penuh `/anggota` |
| `rejected` | Ditolak | Pendaftaran tidak disetujui (disertai alasan wajib) |

> **Saklar Pengaturan:** Terdapat konfigurasi `membership.require_initial_verification` (default `true`) di tabel `settings`. Bila disetel `false`, setelah pengguna mengirim pendaftaran, status langsung menjadi `awaiting_payment` tanpa verifikasi awal manual.

---

## 4. Dua Tingkat Portal Pengguna

### 4.1 Dashboard Sederhana (`/akun`) — Pengguna Biasa & Calon Anggota
Ditujukan bagi pengguna terdaftar yang belum menjadi anggota resmi:
- **Header Putih**: Logo NSA + teks "Portal Anggota" + tombol "Ke Web Utama" (`/`).
- **Sidebar Kiri**:
  - Kartu profil: Avatar inisial bulat, nama akun, label status (misal badge "Calon Anggota" untuk status yang sedang diproses).
  - Menu area akun: *Dashboard*, *Pesanan Saya*, *Profil*, *Pengaturan*.
- **Konten Kanan**:
  - Banner judul bergradien biru tua (`navy` ke `ocean`) dengan eyebrow kapital, judul besar selamat datang, dan subjudul.
  - Kartu **Status Keanggotaan**: garis waktu proses (timeline) dinamis dengan tombol aksi kontekstual ("Gabung Jadi Anggota", "Lanjutkan Pendaftaran", "Bayar Sekarang", atau "Perbaiki Berkas").
  - Kartu **Pesanan Terakhir** & status pengiriman barang toko.
  - Kartu bantuan resmi sekretariat NSA.

### 4.2 Dashboard Membership (`/anggota`) — Khusus Anggota Resmi
Hanya dapat diakses oleh user dengan status `approved` (dilindungi middleware `member.approved`):
- **Header Putih**: Logo NSA + "Portal Anggota" + status keanggotaan aktif + tombol "Ke Web Utama".
- **Sidebar Kiri (7 Menu Utama)**:
  1. **Dashboard**: Ringkasan NTA, masa aktif, status iuran, pengumuman internal anggota, dan statistik singkat.
  2. **Profil & Verifikasi**: Data identitas diri, kewarganegaraan, kontak darurat, dan riwayat verifikasi NTA.
  3. **Kartu Anggota**: Kartu Tanda Anggota (KTA) digital dengan QR Code verifikasi, unduh kartu format cetak/PDF.
  4. **Usaha & Legalitas**: Kelola multi unit usaha perikanan, daftar perizinan (NIB, NPWP, CBIB/CPIB), pelaporan status tambak, dan permohonan pendampingan teknis.
  5. **Program NSA**: Katalog program kerja/pelatihan/pendampingan resmi, status keikutsertaan, dan formulir pendaftaran program.
  6. **Iuran & Administrasi**: Riwayat tagihan invoice pendaftaran, iuran tahunan, atribut resmi (rompi, kemeja, merchandise), dan konfirmasi pembayaran.
  7. **Pengaturan**: Keamanan akun, preferensi notifikasi, dan ubah kata sandi.

---

## 5. Pendaftaran Anggota (9 Langkah Baru)

Formulir dirancang responsif, tersimpan otomatis per langkah sebagai `draft`, dan dapat dilanjutkan sewaktu-waktu:

| # | Langkah Baru | Deskripsi & Isi Formulir |
|---|---|---|
| **1** | **Identitas Calon Anggota** | Opsi kewarganegaraan (**WNI / WNA**). Untuk WNI: NIK (terenkripsi), nama KTP, tempat/tgl lahir, jenis kelamin, HP, email. Untuk WNA: Nomor Paspor (terenkripsi), negara asal, durasi tinggal di Indonesia. |
| **2** | **Kategori & Jenis Keanggotaan** | Pilihan kategori pemohon (**Perorangan / Badan Usaha/Institusi**), pilihan paket jenis keanggotaan dari AD/ART (Anggota Biasa, Luar Biasa, Kehormatan). |
| **3** | **Profil Pekerjaan atau Usaha + Legalitas** | Data institusi/perusahaan: nama usaha, bidang aktivitas, tahun beroperasi, skala usaha (mikro/kecil/menengah/besar), dan unggahan legalitas (NIB, NPWP, CBIB, dll.). Mendukung struktur multi-usaha. |
| **4** | **Data Aktivitas Perikanan** | Form dinamis sesuai jenis komoditas: budidaya air tawar/laut, sistem budidaya (RAS, bioflok, kolam tanah), jumlah kolam, kapasitas produksi, unit panen, kebutuhan benih & pakan, serta kapasitas serap pembeli. |
| **5** | **Jaringan & Aktivitas Bisnis** | Jangkauan distribusi pemasaran (pilihan provinsi), kebutuhan pasokan saprotan, bentuk kerja sama yang dicari, dan aktivitas profesional di rantai pasok industri. |
| **6** | **Kebutuhan & Minat Program NSA** | Pilihan minat program prioritas: *Pelatihan Budidaya, Pendampingan Lapangan, Informasi Harga & Pasar, Akses Kemitraan Rantai Pasok, Teknologi Budidaya Modern, Pengembangan Usaha & Akses Modal*. |
| **7** | **Lokasi, Foto, dan Dokumen** | Titik lokasi usaha/kolam pada peta, alamat lengkap berjenjang (Provinsi, Kota/Kab, Kecamatan, Desa/Kelurahan, Kode Pos), foto fasilitas usaha/kolam, dan berkas identitas. |
| **8** | **Paket Keanggotaan & Administrasi** | Rincian biaya keanggotaan terstruktur (uang pangkal/pendaftaran, kartu anggota fisik, atribut rompi/kemeja dengan pilihan ukuran S/M/L/XL/XXL, iuran tahunan). Total tagihan terhitung otomatis. |
| **9** | **Pemeriksaan & Pengiriman** | Ringkasan menyeluruh dari langkah 1 s.d. 8, persetujuan syarat ketentuan AD/ART NSA, kebijakan privasi, dan pengiriman berkas ke admin. |

> **Catatan:** Langkah *Media Sosial* dan *Surat Pernyataan bertanda tangan digital gambar* pada versi lama telah dihapus dan digantikan oleh centang persetujuan legalitas di Langkah 9.

---

## 6. Fitur Halaman Publik & Konten

1. **Beranda (`/`)**:
   - Hero section dengan visual kemaritiman Nusantara dan ajakan bergabung.
   - Angka statistik agregasi pembudidaya nasional (bersumber dari data aktivitas Langkah 4 & wilayah Langkah 7 anggota `approved`).
   - Peta interaktif sebaran pembudidaya per provinsi dan grafik tren komoditas.
   - Warta & artikel terkini NSA.
   - Produk unggulan toko dan direktori mitra strategis.
2. **Tentang Kami (`/tentang-kami`)**:
   - Sejarah pendirian NSA, Visi & Misi, Nilai-nilai Keberlanjutan, dan Legalitas Resmi.
   - **Bagian Program Kerja Asosiasi**: Tampil setelah Visi & Misi dengan gaya editorial bernomor besar (bersumber dari tabel `programs` dengan status publik). Setiap program memiliki tombol "Lihat Detail" (`/program/{slug}`).
   - Susunan Pengurus Inti DPP NSA.
3. **Organisasi (`/organisasi`)**:
   - `/organisasi/dpp`: Susunan Dewan Pengurus Pusat.
   - `/organisasi/dpw`: Dewan Pengurus Wilayah berbasis filter Provinsi.
   - `/organisasi/dpc`: Dewan Pengurus Cabang berbasis Kabupaten/Kota.
4. **Toko Sarana Akuakultur (`/produk`)**:
   - Tiga kategori utama: *Air Tawar*, *Air Laut*, *Lain-lain*.
   - Filter produk, keranjang belanja, dan sistem checkout transfer manual dengan rekening resmi NSA.
5. **Kemitraan (`/kemitraan`)** & **Kontak (`/kontak`)**:
   - Formulir terintegrasi yang mengirim pesan langsung ke CMS Admin dan email sekretariat NSA.

---

## 7. Panel CMS Admin & Superadmin (`/admin`)

| Modul CMS | Admin | Superadmin | Deskripsi |
|---|:-:|:-:|---|
| **Dashboard CMS** | ✓ | ✓ | Ringkasan permohonan anggota baru, mutasi pembayaran, pesanan produk, dan log |
| **Verifikasi Anggota** | ✓ | ✓ | Detail 9 langkah data pendaftar, approval verifikasi awal, cek bukti bayar, persetujuan akhir |
| **Manajemen Program NSA** | ✓ | ✓ | CRUD program kerja, tandai publik/khusus member, jadwal, peserta terdaftar |
| **Katalog & Stok Produk** | ✓ | ✓ | CRUD produk, kategori, harga umum & member, stok, foto galeri |
| **Pesanan & Transaksi Toko** | ✓ | ✓ | Konfirmasi transfer pembayaran pesanan, input resi pengiriman, ekspor CSV |
| **Berita & Artikel (Warta)** | ✓ | ✓ | Editor warta industri, artikel teknologi budidaya, kategori, penerbitan |
| **Struktur Organisasi** | ✓ | ✓ | Kelola pengurus DPP, pembentukan DPW provinsi, dan DPC kabupaten/kota |
| **Statistik & Kategori Ikan** | ✓ | ✓ | Pemutakhiran snapshot data perikanan daerah dan kategori komoditas |
| **Kelola Admin** | ✗ | ✓ | Tambah/nonaktifkan akun staf verifikator CMS |
| **Pengaturan Brand & Situs** | ✗ | ✓ | Ubah identitas organisasi (nama, singkatan, tagline, domain, kontak, slot logo terang & gelap) |
| **Teks Website** | ✗ | ✓ | Ubah seluruh teks antarmuka website (`resources/copy/`), mode edit langsung di halaman, riwayat revisi, serta ekspor/impor JSON |
| **Log Aktivitas** | ✗ | ✓ | Audit trail aktivitas sistem (login, approval, revisi pengaturan) |

> **Dua Jenis Teks di Website NSA:**
> 1. **Teks Konten Database** (artikel, berita, produk, program kerja, struktur organisasi DPP/DPW/DPC, mitra): dikelola oleh Admin & Superadmin pada modul CMS masing-masing.
> 2. **Teks Antarmuka Website** (label menu, judul bab, tombol, banner keanggotaan, footer, pesan keadaan kosong): terdaftar di `resources/copy/*.php` sebagai satu sumber kebenaran, disimpan override-nya di `site_texts` (beserta riwayat `site_text_revisions`), dan **hanya dapat diubah oleh Superadmin** melalui `/admin/teks-website` atau mode *Edit Teks* langsung di halaman publik.

---

## 8. Arsitektur Teknis & Database

### 8.1 Stack Teknologi
- **Backend**: Laravel 12 (PHP 8.2+), arsitektur Action/Service, Form Request, Policy, Enum.
- **Frontend**: React 19, TypeScript, Inertia.js v2, Tailwind CSS.
- **Animasi & Interaksi**: Framer Motion, anime.js, Lucide Icons, Sonner.
- **Visualisasi Data**: Recharts, Leaflet/MapPicker untuk geolokasi kolam.
- **Konfigurasi Brand Terpusat**: `config/brand.php`, model `Setting`, helper `brand()`, dan shared prop Inertia `brand`.

### 8.2 Perubahan & Skema Database Baru

1. **Identitas & Organisasi**:
   - `users`: penambahan kolom status baru pada `membership_status` (`pending_review`, `awaiting_payment`, `pending_approval`).
   - `settings`: penyimpanan dinamis konfigurasi brand (`brand_name`, `brand_short_name`, `brand_tagline`, `brand_logo_light`, `brand_logo_dark`, `brand_domain`, `brand_support_phone`, `brand_support_email`, `membership.require_initial_verification`).
2. **Keanggotaan**:
   - `member_applications`: penambahan `membership_category`, `applicant_type` (`individual` / `institution`), `membership_type_id`.
   - `member_identities`: `nationality` (`wni` / `wna`), nama, NIK (terenkripsi), paspor (terenkripsi), negara asal, alamat KTP (JSON).
   - `membership_categories` & `membership_types`: kategori dan tipe keanggotaan yang dapat dikelola dinamis di CMS.
   - `member_businesses`: diubah menjadi relasi `hasMany` dari user/aplikasi; penambahan `institution_name`, `activity_field`, `years_operating`, `scale`, `operational_info`, `is_primary`.
   - `member_legal_documents`: `business_id`, tipe dokumen (`nib`, `npwp`, `cbib`, `other`), nomor, masa berlaku, file path.
   - `member_fish_activities`: form dinamis aktivitas budidaya (kategori ikan, sistem, kolam, volume produksi, unit, periode panen, kebutuhan benih/pakan).
   - `member_network_profiles`: info pemasaran, target wilayah distribusi (JSON), kebutuhan pasokan, jenis kerja sama.
   - `member_program_interests`: kategori program prioritas pemohon.
   - `member_locations`: titik koordinat (lat/lng) dan alamat berjenjang (domisili / unit usaha).
   - `member_photos`: foto fasilitas kolam dan dokumentasi usaha.
3. **Program Kerja**:
   - `programs`: `title`, `slug`, `category`, `summary`, `body`, `cover`, `status` (`draft`/`published`), `is_public`, `starts_at`, `ends_at`, `order`.
   - `program_registrations`: `program_id`, `user_id`, `status`, `note`.
4. **Biaya & Pembayaran**:
   - `membership_fee_items`: item tarif keanggotaan (uang pangkal, KTA, seragam, iuran tahunan) yang dikonfigurasi via CMS.
   - `member_invoices` & `member_invoice_items`: tagihan administrasi pendaftaran anggota baru.
   - `payments`: dibuat **polimorfik** (`payable_type`, `payable_id`) agar dapat menangani pembayaran pesanan toko maupun invoice pendaftaran anggota.
5. **Tabel Deprecated (Data Tetap Dipelihara Aman)**:
   - `member_social_links`, `member_statements`, `member_commodities`.


---

## 9. Sistem Multi Bahasa (Indonesia `id` & Inggris `en`)

### 9.1 Cakupan & Aturan Utama
- **Halaman Publik**: Tersedia tanpa awalan untuk Bahasa Indonesia (`/`, `/produk`, `/artikel`, dst.) dan berawalan `/en` untuk Bahasa Inggris (`/en`, `/en/produk`, `/en/artikel`, dst.).
- **Area Login & Portal**: `/akun`, `/anggota`, dan wizard pendaftaran 9 langkah tidak berawalan URL; bahasa mengikuti `users.locale` atau cookie `locale`.
- **CMS Admin (`/admin`)**: Selalu berbahasa Indonesia. Form konten CMS tetap kolom Indonesia saja; terjemahan Inggris diproses otomatis di belakang layar lewat `HasAutoTranslations` + antrean `translations`.
- **Fallback Aman**: Jika terjemahan Inggris belum selesai, gagal, atau kosong, situs tetap normal menampilkan teks asli Bahasa Indonesia.

### 9.2 Matriks Hak Akses Fitur Terjemahan
| Menu / Fitur | User / Member | Admin | Superadmin |
|---|:---:|:---:|:---:|
| Pemilih Bahasa (Publik & Portal) | ✓ | ✓ | ✓ |
| Teks Website (ID \| EN, Mode Edit Langsung) | ✗ | ✗ | ✓ |
| Pusat Terjemahan (`/admin/terjemahan` — Ringkasan, Konten, Glosarium, Pengaturan) | ✗ | ✗ | ✓ |
| Notifikasi Terjemahan Gagal di Dasbor | ✗ | ✗ | ✓ |
