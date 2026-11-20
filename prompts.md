# Prompt Bertahap — Website IFAA

Cara pakai:
1. Taruh `prd.md`, `design.md`, dan `readme.md` di root proyek.
2. Jalankan prompt **berurutan**. Jangan lompat tahap.
3. Setiap tahap selesai → jalankan, cek hasilnya, commit, baru lanjut.
4. Di awal setiap sesi baru, tempel **Prompt Konteks** di bawah ini.

---

## Prompt Konteks (tempel di awal setiap sesi)

```
Kamu adalah senior full-stack engineer sekaligus desainer UI. Kita membangun
website IFAA (Indonesian Fisheries and Aquaculture Association) dengan
Laravel 11 + Inertia + React (TypeScript), Tailwind, Framer Motion, anime.js,
Lucide, Sonner, Swiper, dan MySQL.

Sebelum menulis kode, baca: prd.md, design.md, dan readme.md di root proyek.
Ketiganya adalah aturan yang mengikat.

Aturan kerja:
- Latar putih. Aksen hanya #014081, #056ED4, #27AAE1, #3AD1F3 (lewat token Tailwind).
- Font: Bricolage Grotesque (judul) dan Plus Jakarta Sans (isi).
- Tampilan harus khas dan TIDAK terlihat seperti buatan AI: ikuti bagian
  "Yang DILARANG" di design.md.
- Kode bersih: controller tipis, logika di Actions/Services, validasi di
  Form Request, akses di Policy, nilai tetap di Enum, komponen React kecil.
- Nama kode bahasa Inggris, teks untuk pengguna bahasa Indonesia.
- Setelah selesai, jelaskan singkat dalam bahasa Indonesia: file apa yang
  dibuat/diubah, cara menjalankan, dan cara mengujinya.
- Jangan mengerjakan hal di luar tahap yang diminta.
```

---

## Tahap 0 — Pondasi Proyek

```
TAHAP 0: Pondasi proyek.

Tugas:
1. Buat proyek Laravel 11 dengan Inertia.js + React + TypeScript + Vite.
2. Pasang: tailwindcss, framer-motion, animejs, lucide-react, sonner, swiper,
   recharts, react-hook-form, zod, @hookform/resolvers.
3. Konfigurasi Tailwind memakai token warna, font, radius, dan shadow dari
   design.md (bagian "Tailwind config"). Muat font lewat Google Fonts.
4. Buat struktur folder persis seperti di prd.md bagian 8 (kosong dulu, beri
   .gitkeep bila perlu).
5. Buat file lib/motion.ts berisi token gerak dari design.md bagian 7.
6. Pasang Laravel Pint, ESLint, Prettier, dan script `typecheck`.
7. Siapkan .env.example, konfigurasi bahasa Indonesia (locale `id`, timezone
   Asia/Pontianak sesuai kebutuhan atau Asia/Jakarta), dan alias import `@/`.
8. Pasang Pest/PHPUnit dengan satu tes contoh yang lulus.
9. Perbarui readme.md bila ada langkah pemasangan yang berbeda.

Hasil yang diharapkan: `npm run dev` + `php artisan serve` menampilkan halaman
kosong bertuliskan "IFAA" dengan font dan warna yang benar.
```

---

## Tahap 1 — Database, Role, dan Autentikasi

```
TAHAP 1: Database, role, dan autentikasi.

Baca prd.md bagian 3 dan 9.

Tugas:
1. Buat Enum: Role (superadmin, admin, user), MembershipStatus (non_member,
   draft, pending, revision, approved, rejected), OrderStatus, ProductType,
   PostType.
2. Buat semua migration sesuai prd.md bagian 9, urut per kelompok (wilayah,
   akses, keanggotaan, organisasi, statistik, produk-transaksi, konten).
   - Tabel DPW (dpws, dpw_members) dan DPC (dpcs, dpc_members) HARUS terpisah.
     dpcs berelasi ke regencies, BUKAN ke dpws.
   - Tambahkan index pada kolom yang sering difilter (province_id,
     regency_id, slug, status).
3. Buat Model + relasi + casts Enum + factory untuk semua tabel penting.
4. Seeder:
   - RegionSeeder: provinsi, kabupaten/kota, kecamatan, kelurahan Indonesia
     (gunakan paket seperti laravolt/indonesia atau data resmi).
   - FishCategorySeeder (Lele, Nila, Mas, Patin, Gurame, Bawal, Udang, dll.)
   - BusinessFieldSeeder (20 bidang usaha dari prd.md bagian 5).
   - ProductCategorySeeder (struktur 3 kelompok + sub-kategori prd.md 4.3).
   - UserSeeder (4 akun contoh dari readme.md).
   - DemoSeeder: data contoh untuk DPP, beberapa DPW/DPC, produk, berita,
     statistik (volume cukup agar halaman terlihat hidup).
5. Autentikasi: login, register (akun dasar user), logout, lupa & reset
   password, verifikasi email. Buat halaman Inertia yang mengikuti design.md
   (bukan tampilan bawaan starter kit).
6. Middleware `role:` dan Policy dasar. Redirect setelah login:
   admin/superadmin → /admin, user → /akun.
7. Tes: login per role, akses terlarang ditolak (403), redirect benar.

Jangan membuat halaman publik dulu.
```

---

## Tahap 2 — Design System & Layout

```
TAHAP 2: Design system dan layout.

Baca design.md sepenuhnya.

Tugas:
1. Komponen UI di Components/ui: Button (4 varian), Input, Textarea, Select,
   Checkbox, Radio, Badge status, Card, Modal, Tabs, Skeleton, EmptyState,
   Pagination, Breadcrumb. Semuanya memakai token design.md dan punya state
   hover/fokus/disabled/error/loading.
2. Komponen motion di Components/motion: Reveal (whileInView), CountUp
   (anime.js), PageTransition, MagneticButton (halus, opsional).
3. Elemen khas IFAA sebagai komponen SVG:
   - ContourPattern: garis kontur air halus (props: opacity, warna, ukuran)
   - WaveDivider: pembatas gelombang tipis
   Gambar garis dengan anime.js (stroke-dashoffset) dan hormati
   prefers-reduced-motion.
4. Layout:
   - PublicLayout: Navbar (dropdown Organisasi, mega-menu Produk, ikon
     keranjang + badge, tombol Masuk, tombol Daftar Anggota, drawer mobile),
     Footer sesuai design.md, <Toaster /> dari Sonner.
   - AccountLayout dan AdminLayout: sidebar navy bergaya referensi gambar
     (menu aktif pil ocean, kotak "Butuh bantuan?").
5. Halaman /desain (hanya aktif di mode lokal): galeri semua komponen untuk
   dicek visual.

Pastikan rapi di 360px, 768px, 1280px. Jangan ada warna di luar token.
```

---

## Tahap 3 — Beranda

```
TAHAP 3: Halaman Beranda.

Baca prd.md 4.1 dan design.md bagian 8 (ritme section Beranda).

Tugas:
1. Backend: HomeController + StatisticService yang menghitung statistik
   pembudidaya per provinsi dan per kategori ikan dari statistic_snapshots
   (gabungan data anggota approved + input manual). Cache hasilnya (mis. 1 jam)
   dan hapus cache saat data berubah.
2. Frontend Pages/Public/Home.tsx berisi 10 section sesuai prd.md 4.1:
   Hero, Angka Utama, Peta Statistik, Grafik Kategori, Berita Terkini,
   Jelajah Produk, Kenapa Bergabung, Cerita Anggota, Mitra, CTA Akhir.
3. Peta Indonesia interaktif (SVG): klik/hover provinsi menampilkan angka
   pembudidaya; filter kategori ikan (Semua, Lele, Nila, Mas, + lainnya dari
   database); panel peringkat provinsi di samping. Provinsi menyala berurutan
   dengan anime.js.
4. Grafik per kategori dengan Recharts: perbandingan lele/nila/mas + tren
   tahunan. Tab untuk berpindah kategori.
5. Berita Terkini: 1 utama + daftar; Swiper di mobile.
6. Tambahan pemicu rasa penasaran: kartu "Fakta Perikanan Hari Ini" yang
   berganti pelan, dan "Anggota Terbaru" (hanya nama usaha + kota).
7. Hero: baris judul muncul bertahap, kontur air tergambar, foto kolase
   miring (pakai placeholder foto lokal dulu, siapkan komponen agar mudah
   diganti).
8. Semua teks dalam bahasa Indonesia, hindari kata klise ("revolusi",
   "inovatif", dst.).

Tes: halaman memuat tanpa error, data statistik benar untuk data seeder.
```

---

## Tahap 4 — Organisasi (DPP, DPW, DPC)

```
TAHAP 4: Halaman Organisasi.

Baca prd.md 4.2.

Aturan utama: DPW dan DPC adalah DUA FITUR TERPISAH. Controller, route,
halaman, dan halaman admin masing-masing sendiri.

Tugas:
1. Route publik:
   - /organisasi/dpp
   - /organisasi/dpw  (+ query ?provinsi=<slug>)
   - /organisasi/dpc  (+ query ?provinsi=<slug>&kota=<slug>)
2. Controller terpisah: DppController, DpwController, DpcController.
3. DPP: tampilkan susunan pengurus (ketua lebih besar, lalu bidang).
4. DPW: dropdown Provinsi → tampilkan pengurus DPW provinsi itu.
5. DPC: dropdown Provinsi → dropdown Kabupaten/Kota (terisi sesuai provinsi,
   dimuat lewat endpoint ringan) → tampilkan pengurus DPC kota itu.
6. Keadaan kosong: kartu "Belum terbentuk" + ajakan membentuk (link ke
   Kontak/Kemitraan).
7. Animasi pergantian hasil dengan Framer Motion (`AnimatePresence` + layout).
8. URL bisa dibagikan (state filter tersimpan di query string).
9. Tes untuk masing-masing halaman, termasuk wilayah tanpa pengurus.

Jangan membuat relasi dpcs → dpws.
```

---

## Tahap 5 — Produk, Keranjang, dan Checkout

```
TAHAP 5: Produk, keranjang, checkout.

Baca prd.md 4.3 dan 4.4.

Tugas:
1. Halaman Produk:
   - /produk (semua), /produk/{kelompok} (air-tawar, air-laut, lain-lain),
     /produk/{kelompok}/{sub-kategori}, /produk/{slug} (detail).
   - Filter: kategori, rentang harga, lokasi; urutkan; pencarian.
   - Detail: galeri Swiper, deskripsi, harga (harga anggota otomatis tampil
     untuk anggota approved), stok, tombol "Tambah ke Keranjang".
   - Perilaku sesuai ProductType: physical (stok + berat), rental (pilih
     tanggal mulai + durasi), spot (pilih tanggal kunjungan + jumlah tiket),
     community (tombol gabung, tanpa stok).
2. CartService: keranjang guest (cookie/session) dan user (database);
   gabungkan saat login; validasi stok; hitung subtotal.
3. UI keranjang: drawer mini di navbar + halaman /keranjang penuh. Ubah
   jumlah, hapus, ringkasan. Animasi ikon keranjang + toast Sonner.
4. Checkout 3 langkah: Data/Alamat → Pengiriman & Pembayaran → Konfirmasi.
   Wajib login (arahkan ke login lalu kembali).
5. PlaceOrder Action: buat order + order_items dengan snapshot nama/harga,
   kurangi stok dalam transaksi database, kode pesanan unik.
6. Pembayaran transfer manual: tampilkan rekening (dari tabel settings),
   unggah bukti, status payments. Buat PaymentService berbasis interface agar
   gateway (Midtrans/Xendit) mudah dipasang nanti.
7. Area akun: riwayat pesanan + detail + unggah bukti bayar.
8. Tes: tambah/ubah/hapus keranjang, gabung keranjang guest, checkout sukses,
   stok tidak boleh minus, harga anggota hanya untuk anggota approved.
```

---

## Tahap 6 — Pendaftaran Anggota (9 Langkah)

```
TAHAP 6: Pendaftaran anggota.

Baca prd.md bagian 5 dan lihat gambar referensi form (ikuti gaya: sidebar
navy bernomor dengan centang hijau, stepper atas, kartu form putih).

Tugas:
1. Halaman /akun/keanggotaan/daftar dengan 9 langkah:
   1 Informasi Akun, 2 Data Pribadi, 3 Data Usaha Perikanan, 4 Dokumen,
   5 Media Sosial, 6 Data Komoditas, 7 Keanggotaan, 8 Surat Pernyataan,
   9 Review Data.
2. Simpan otomatis per langkah (status `draft`); pengguna bisa keluar dan
   melanjutkan. Tombol "Kembali" dan "Selanjutnya" seperti referensi.
3. Langkah 3 persis seperti referensi: Jenis Keanggotaan (radio, termasuk
   "Lainnya" dengan isian), Informasi Usaha, Bidang Usaha (checkbox
   multi + "Lainnya"), Alamat Usaha (dropdown bertingkat Provinsi →
   Kabupaten/Kota → Kecamatan → Kelurahan/Desa), kode pos, alamat lengkap
   dengan penghitung 0/250, pencarian lokasi + pemilih titik peta.
4. Langkah 4: unggah dokumen (drag & drop, pratinjau, batas ukuran/tipe),
   disimpan di disk privat.
5. Langkah 6: pilih komoditas (dari fish_categories) + kapasitas + luas lahan,
   boleh lebih dari satu.
6. Langkah 8: surat pernyataan + tanda tangan digital (kanvas).
7. Langkah 9: ringkasan semua data, tombol "Ubah" per bagian, lalu "Kirim".
8. Validasi: Zod di klien, Form Request per langkah di server (pesan dalam
   bahasa Indonesia, mis. "NIB harus 13 digit").
9. Setelah kirim: status `pending`, halaman status dengan penjelasan alur,
   email konfirmasi.
10. Di tampilan mobile, stepper berubah jadi "Langkah X dari 9" + progress bar.
11. Tes: tiap langkah menyimpan draft, tidak bisa kirim bila ada data wajib
    kosong, status berubah jadi pending.
```

---

## Tahap 7 — Halaman Statis, Artikel, Kemitraan, Kontak

```
TAHAP 7: Halaman konten.

Baca prd.md 4.5 sampai 4.8.

Tugas:
1. /tentang-kami: sejarah, visi misi, nilai, legalitas, tim; isi dari tabel
   pages (bisa diedit CMS). Tata letak editorial, bukan blok seragam.
2. /kemitraan: penjelasan skema, daftar mitra (logo, jenis), formulir ajuan
   kemitraan (masuk ke contact_messages dengan topik "kemitraan").
3. /artikel dan /berita: daftar, kategori, pencarian, paginasi; /artikel/{slug}
   dengan waktu baca, artikel terkait, tombol bagikan; SEO meta + Open Graph.
4. /kontak: formulir (validasi + rate limit + honeypot anti-spam), info
   kontak, peta, sosial media. Notifikasi email ke admin.
5. Komponen konten kaya (rich text) aman dari XSS saat ditampilkan.
6. Sitemap.xml dan robots.txt dasar.
7. Tes: kirim kontak sukses, rate limit bekerja, artikel draft tidak tampil
   publik.
```

---

## Tahap 8 — CMS (Admin & Superadmin)

```
TAHAP 8: CMS.

Baca prd.md bagian 6 dan design.md bagian 8 (CMS).

Tugas:
1. AdminLayout dengan sidebar menu sesuai hak akses (menu superadmin-only
   disembunyikan untuk admin, dan DILINDUNGI di server lewat Policy).
2. Dashboard: 4 kartu ringkasan, grafik pendaftaran anggota, daftar "Perlu
   Tindakan" (anggota pending, pesanan menunggu konfirmasi bayar).
3. Modul Anggota: daftar + filter status/wilayah, halaman detail dengan semua
   data dan dokumen (URL bertanda tangan), aksi Setujui (nomor anggota otomatis
   + email), Minta Revisi (catatan per bagian), Tolak (alasan wajib); tulis ke
   member_review_logs.
4. Modul Produk & Kategori (CRUD, unggah banyak gambar, urutkan gambar, stok,
   harga anggota), Pesanan (ubah status, konfirmasi pembayaran), Berita &
   Artikel (editor rich text, draft/terbit/jadwal), Organisasi (CRUD DPP,
   DPW, DPC dalam menu TERPISAH), Statistik (input manual per provinsi,
   kategori, tahun) dan Kategori Ikan, Halaman Statis, Mitra, Pesan Kontak.
5. Khusus superadmin: kelola akun admin, pengaturan situs (logo, kontak,
   rekening bank, sosial media), log aktivitas, hapus permanen.
6. Tabel data yang konsisten: pencarian, filter, urutkan, paginasi, aksi
   massal sederhana, ekspor CSV untuk anggota dan pesanan.
7. Semua aksi penting dicatat di activity_logs.
8. Tes: admin tidak bisa mengakses menu superadmin, approve/reject anggota
   mengubah status dan mencatat log.
```

---

## Tahap 9 — Poles, Performa, dan Rilis

```
TAHAP 9: Poles dan rilis.

Tugas:
1. Audit tampilan terhadap daftar periksa design.md bagian 11. Perbaiki yang
   melenceng (warna, font, ritme section, teks klise).
2. Aksesibilitas: kontras, fokus keyboard, label form, alt gambar,
   prefers-reduced-motion.
3. Performa: lazy import untuk Swiper dan Recharts per halaman, gambar WebP +
   srcset, cegah layout shift, eager-load relasi untuk mencegah N+1 (cek
   dengan Laravel Telescope/Debugbar), cache halaman statistik.
4. Keamanan: rate limit login & form, validasi unggahan, header keamanan,
   pastikan dokumen anggota tidak bisa diakses publik, cek Policy di semua
   rute admin dan akun.
5. SEO: meta per halaman, Open Graph, data terstruktur Organization & Article.
6. Halaman error 403/404/500/maintenance bergaya IFAA.
7. Lengkapi tes (alur kritis) dan jalankan seluruh pint, lint, typecheck, test.
8. Perbarui readme.md: langkah deploy produksi, cron/queue, backup.
9. Tulis daftar masalah yang diketahui + saran Fase 2 (payment gateway,
   ongkir otomatis, kartu anggota QR, notifikasi WhatsApp).
```

---

## Prompt Perbaikan Cepat (dipakai kapan saja)

**Terlihat seperti template / AI:**
```
Tinjau halaman [NAMA] terhadap design.md bagian 1 ("Yang DILARANG") dan
bagian 11. Cari bagian yang terasa generik (pola kartu berulang, ikon
lingkaran pastel, teks klise, jarak seragam). Ubah tata letak dan ritmenya
agar lebih khas IFAA tanpa keluar dari token desain. Jelaskan apa yang diubah.
```

**Rapikan kode:**
```
Refactor [FILE/FITUR]: pindahkan logika dari controller ke Action/Service,
pindahkan validasi ke Form Request, pecah komponen React > 150 baris, hapus
kode mati. Perilaku tidak boleh berubah; jalankan tes sebelum dan sesudah.
```

**Tambah fitur kecil:**
```
Tambahkan [FITUR] mengikuti prd.md dan design.md. Sebutkan dulu file yang
akan diubah, kerjakan seminimal mungkin, tambahkan tes, dan jelaskan cara
mengujinya.
```

**Perbaiki bug:**
```
Bug: [GEJALA]. Langkah mengulang: [LANGKAH]. Temukan akar masalah (bukan
sekadar menutup gejala), perbaiki, tambahkan tes yang gagal sebelum perbaikan
dan lulus sesudahnya.
```
