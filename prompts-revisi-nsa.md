# Revisi NSA — Analisis & Prompt Perubahan

Dokumen ini berisi (1) hasil analisis revisi klien, (2) hal yang perlu dikonfirmasi, dan (3) prompt bertahap untuk mengubah proyek yang sudah ada.

> Asumsi: proyek ini adalah kelanjutan dari proyek sebelumnya (Laravel + Inertia + React), kini bernama **NSA (Nusantara Sustainable Aquatic)**. Bila NSA proyek terpisah, tetap bisa dipakai; lewati Prompt 0.

---

## 1. Analisis

### 1.1 Alur sistem baru (Keputusan Klien: Login & Sign Up ke Beranda)

```
web utama (/)
├── login
│   ├── admin / superadmin            → CMS Admin (/admin)
│   └── user biasa & approved         → beranda utama ("/") + toast "Selamat datang kembali, {nama}."
│                                       (URL intended dihormati bila ada)
│                                       └── Buka Dashboard via Menu Akun di Navbar:
│                                             ├── non-approved user → Dashboard Sederhana (/akun)
│                                             └── approved member   → Dashboard Membership (/anggota)
│                                       └── Banner ajakan membership tampil otomatis di beranda untuk non-approved
│                                             └── Join Membership
│                                                   → pendaftaran
│                                                   → pembayaran member
│                                                   → persetujuan admin
│                                                   → MEMBERSHIP
│                                                   → Dashboard Membership
└── sign up
    └── user biasa                    → beranda utama ("/") + toast sambutan + banner ajakan membership
```

Perubahan penting dibanding rancangan awal:

| Hal | Rancangan lama | Alur baru |
|---|---|---|
| Urutan bayar | Admin verifikasi dulu, bayar belum ada | **Pendaftaran → pembayaran → persetujuan admin** |
| Dashboard | Satu area akun | **Dua dashboard**: sederhana (`/akun`) dan Membership (`/anggota`), dibuka lewat menu akun navbar |
| Tombol ke web utama | Tidak ada | Ada di kedua dashboard |
| Setelah disetujui | Halaman status + kartu | Dashboard Membership penuh (7 menu) |
| Sign up | Daftar akun biasa | **Ke Beranda Utama ("/") + banner ajakan bergabung** |
| Login user | Sebelumnya ke `/akun` | **Ke Beranda Utama ("/") + toast selamat datang**; intended URL tetap dihormati; menu akun memuat link ke dashboard |

### 1.2 Konflik yang ditemukan (perlu keputusan)

Diagram menaruh **pembayaran sebelum persetujuan admin**, tetapi teks Step 8 berkata *"Pembayaran dapat dilakukan setelah verifikasi awal."* Dua hal ini bisa disatukan menjadi **dua gerbang admin**:

1. Kirim pendaftaran → admin **verifikasi awal** (cek kelengkapan data).
2. Lolos → status **menunggu pembayaran** → user bayar + unggah bukti.
3. Admin **konfirmasi bayar + persetujuan akhir** → MEMBERSHIP.

Prompt di bawah memakai alur 3 langkah ini sebagai default dan menyediakan **satu saklar pengaturan** (`require_initial_verification`). Bila klien ternyata ingin persis seperti diagram (tanpa verifikasi awal), cukup matikan saklar itu.

### 1.3 Perubahan 9 langkah pendaftaran

| # | Langkah BARU | Pengganti / asal di versi lama |
|---|---|---|
| 1 | Identitas Calon Anggota (WNI/WNA) | Gabungan Informasi Akun + Data Pribadi |
| 2 | Kategori dan Jenis Keanggotaan | Kartu "Jenis Keanggotaan" dari Langkah 3 lama, diperluas |
| 3 | Profil Pekerjaan atau Usaha + legalitas | Kartu "Informasi Usaha" Langkah 3 lama + NIB/NPWP/CBIB |
| 4 | Data Aktivitas Perikanan (form dinamis) | Menggantikan Data Komoditas (Langkah 6 lama) |
| 5 | Jaringan dan Aktivitas Bisnis | **Baru** |
| 6 | Kebutuhan dan Minat Program NSA | **Baru** |
| 7 | Lokasi, Foto, dan Dokumen | Alamat (dari Langkah 3 lama) + Dokumen (Langkah 4 lama) |
| 8 | Paket Keanggotaan dan Administrasi | Menggantikan Langkah 7 lama; **ditambah biaya** |
| 9 | Pemeriksaan dan Pengiriman | Review lama + persetujuan ketentuan |

Yang **dihapus**: Langkah *Media Sosial* dan *Surat Pernyataan* (tanda tangan digital). Persetujuan ketentuan dan kebijakan privasi kini berupa centang di Langkah 9. Bila klien masih butuh tanda tangan digital, tambahkan kembali di Langkah 9.

### 1.4 Dampak ke bagian lain

- **Statistik Beranda**: sebelumnya dihitung dari `member_commodities`. Kini sumbernya data **Langkah 4** (aktivitas perikanan) dan wilayah dari **Langkah 7**. `StatisticService` harus disesuaikan.
- **Pembayaran**: tabel `payments` sebelumnya hanya untuk pesanan toko. Harus dibuat **polimorfik** agar bisa juga untuk tagihan keanggotaan.
- **Status keanggotaan**: Enum `MembershipStatus` perlu status baru (menunggu pembayaran, menunggu persetujuan).
- **Program**: "Program Kerja" di Tentang Kami dan "Program NSA" di dashboard member memakai **satu tabel `programs`** agar tidak ada data ganda.
- **Biaya keanggotaan** (pendaftaran, kartu, rompi, kemeja, iuran) harus **bisa diedit di CMS**, bukan ditulis permanen di kode, karena klien menulis "sesuai keputusan resmi NSA".
- **Unit usaha**: mockup menyebut kelak ada beberapa unit usaha. Relasi dibuat `hasMany` sejak sekarang, UI pendaftaran tetap satu usaha.

### 1.5 Dashboard (dari gambar mockup)

Tata letak: header putih (logo + "Portal Anggota" + tombol), sidebar kiri berisi kartu profil (inisial, nama, label status) lalu menu, konten kanan dengan **banner judul** + kartu isi.

Menu Dashboard Membership: **Dashboard, Profil & Verifikasi, Kartu Anggota, Usaha & Legalitas, Program NSA, Iuran & Administrasi, Pengaturan.** Mockup juga menyebut: data Step 3–5 dikelola di *Usaha & Legalitas*, dan kelak mendukung banyak unit usaha, izin, status proses, dan permintaan pendampingan.

---

## 2. Hal yang Perlu Dikonfirmasi ke Klien

| # | Pertanyaan | Default di prompt |
|---|---|---|
| 1 | Pembayaran: ada verifikasi awal sebelum bayar, atau langsung bayar lalu persetujuan? | 2 gerbang (saklar bisa dimatikan) |
| 2 | Nama dan warna: apakah tampilan ikut warna mockup NSA (hijau-teal) atau tetap biru `design.md`? | Tetap biru; mockup hanya acuan tata letak |
| 3 | Apakah tanda tangan digital masih diperlukan? | Dihapus, diganti centang persetujuan |
| 4 | Daftar kategori kegiatan dan jenis keanggotaan menurut AD/ART | Contoh yang bisa diedit di CMS |
| 5 | Nominal biaya, ukuran rompi/kemeja, aturan iuran | Diisi lewat CMS, seeder berisi nilai contoh |
| 6 | Label "Calon Anggota" di mockup: tampil untuk user yang sedang proses? | Ya, di kartu profil dashboard sederhana |
| 7 | Apakah banner/judul dashboard memakai kata "Demo"? | Tidak, tanda "DEMO OFFLINE" di mockup diabaikan |

---

## 3. Cara Pakai

1. Tempel **Prompt Konteks** dari `prompts.md` di awal sesi, lalu tambahkan baris ini:
   ```
   Proyek ini sedang direvisi untuk klien (NSA). Baca juga prompts-revisi-nsa.md
   bagian 1 (Analisis). Jangan merusak fitur lama yang tidak disebut di revisi.
   ```
2. Lampirkan **diagram alur** dan **mockup dashboard** pada Prompt 2, 3, dan 9.
3. Jalankan berurutan: **0 → 10**. Jalankan tes dan commit di setiap akhir prompt.

---

## Prompt 0 — Rebrand ke NSA & Perbarui Dokumen

```
PROMPT 0: Perbarui identitas ke NSA dan sinkronkan dokumen.

Konteks: proyek direvisi untuk klien. Nama organisasi kini
"NSA (Nusantara Sustainable Aquatic)", area anggotadisebut "Portal Anggota".

Tugas:
1. Jangan menulis nama organisasi di banyak tempat. Pusatkan di
   config/brand.php (name, short_name, tagline, domain, support_phone,
   support_email) dan tabel settings agar superadmin bisa mengubah.
   Buat helper/props Inertia bersama `brand` yang dipakai Navbar, Footer,
   judul halaman, email, dan sidebar.
2. Cari dan ganti semua teks "IFAA" / "Indonesian Fisheries and Aquaculture
   Association" di kode, seeder, email, dan view menjadi memakai brand.
   Jangan mengubah nama folder/namespace.
3. Logo: sediakan slot di settings (logo terang & gelap). Pakai placeholder
   sampai file logo asli ada.
4. Perbarui dokumen: prd.md (alur baru, 9 langkah baru, dua dashboard,
   tabel baru, status baru), design.md (bagian dashboard & banner judul),
   readme.md (nama proyek), dan catat perubahan di CHANGELOG.md.
   Gunakan bagian "Analisis" di prompts-revisi-nsa.md sebagai sumber.
5. Warna tetap memakai palet design.md kecuali ada keputusan klien berbeda.

Hasil: tidak ada lagi teks "IFAA" yang tertinggal (cek dengan grep),
dokumen sudah mencerminkan alur baru.
```

---

## Prompt 1 — Database & Status Keanggotaan Baru

```
PROMPT 1: Perubahan database dan status.

Baca prompts-revisi-nsa.md bagian 1.2, 1.3, 1.4.

Tugas:
1. Update Enum MembershipStatus (backed string):
   non_member, draft, pending_review (menunggu verifikasi awal),
   revision, awaiting_payment, pending_approval (sudah bayar, menunggu
   persetujuan akhir), approved, rejected.
   Tambahkan method label() dalam bahasa Indonesia dan color() untuk badge.
   Migrasi data lama: pending → pending_review.
2. Saklar pengaturan `membership.require_initial_verification` (default true)
   di tabel settings. Bila false: setelah kirim, status langsung
   awaiting_payment.
3. Tabel baru / perubahan (migration terpisah per topik):
   - member_applications: tambah kolom membership_category,
     applicant_type (individual|institution), membership_type_id nullable.
   - member_identities: nationality (wni|wna), full_name, gender, birth_place,
     birth_date, phone, email, nik (encrypted, nullable), ktp_address JSON
     nullable, passport_number (encrypted, nullable), origin_country nullable,
     years_in_indonesia nullable.
   - membership_categories dan membership_types (nama, deskripsi, aturan
     AD/ART singkat, is_active). Seeder berisi CONTOH yang bisa diedit CMS.
   - member_businesses: ubah menjadi hasMany dari user/application; tambah
     institution_name, activity_field, years_operating, scale,
     operational_info (text), is_primary.
   - member_legal_documents: business_id, type (nib|npwp|cbib|other), number,
     label (untuk other), issued_at, expires_at nullable, file_path nullable.
   - member_fish_activities: application_id, fish_category_id, farming_system,
     pond_count, production_amount, production_unit, period, seed_need,
     feed_need, purchase_capacity (untuk buyer), notes. (Kolom opsional
     karena form dinamis.)
   - member_network_profiles: application_id, marketing_info, distribution_areas
     JSON (provinsi), supply_needs, cooperation_types JSON, professional_activities.
   - member_program_interests: application_id, category (Enum ProgramCategory:
     pelatihan, pendampingan, informasi_pasar, akses_kemitraan,
     teknologi_budidaya, pengembangan_usaha), note nullable.
   - member_locations: application_id, kind (domicile|business|activity),
     province_id, regency_id, district_id, village_id, postal_code, address,
     latitude, longitude.
   - member_photos (path, caption) dan pakai member_documents yang ada.
   - programs: title, slug, category (Enum ProgramCategory), summary, body,
     cover, status (draft|published), is_public, starts_at, ends_at, order.
   - program_registrations: program_id, user_id, status, note.
   - membership_fee_items: code, name, description, amount, type
     (required|optional|recurring), has_size_option, size_options JSON,
     is_active, order.
   - member_invoices: application_id, number, status (unpaid|waiting_confirmation|paid|rejected),
     total, due_at nullable.
   - member_invoice_items: invoice_id, fee_item_id, name_snapshot,
     amount_snapshot, qty, size nullable.
   - Ubah tabel payments menjadi polimorfik: payable_type, payable_id
     (pesanan toko tetap berjalan; migrasi data lama dengan aman).
4. Hapus (tandai deprecated, jangan hapus data dulu) tabel member_social_links,
   member_statements, dan member_commodities. Tulis catatan migrasi di
   CHANGELOG.md. Data lama jangan hilang.
5. Model + relasi + factory + seeder contoh (kategori, jenis, biaya, program).

Tes: migrasi naik-turun jalan, data pesanan lama tetap valid, relasi benar.
```

---

## Prompt 2 — Autentikasi, Routing, dan Dua Dashboard

```
PROMPT 2: Alur login/sign up dan pembagian dashboard.

Lampiran: diagram alur sistem.

Tugas:
1. Setelah LOGIN, arahkan lewat satu tempat (Action ResolveHomeRoute):
   - admin / superadmin → /admin
   - user dengan status approved → /anggota (Dashboard Membership)
   - user lain → /akun (Dashboard sederhana)
2. SIGN UP: buat akun role user, status non_member, lalu ke /akun.
3. Middleware baru `member.approved` untuk semua rute /anggota/*; user
   non-approved yang membuka /anggota mendapat redirect ke /akun dengan toast
   "Fitur ini khusus anggota".
4. Tombol "Gabung Jadi Anggota" di /akun mengarah ke
   /akun/keanggotaan/daftar (wizard). User yang statusnya sudah di proses
   diarahkan ke halaman status, bukan wizard.
5. Tombol "Ke Web Utama" (ikon Home/ExternalLink) di header kedua dashboard
   mengarah ke "/".
6. Navbar publik: bila sudah login tampilkan menu akun kecil
   (Dashboard, Keluar) menggantikan tombol Masuk/Daftar.
7. Rapikan route: routes/account.php (/akun/*) dan routes/member.php
   (/anggota/*) terpisah, masing-masing memakai prefix, nama route, dan
   middleware sendiri.
8. Tes: tiap role diarahkan benar setelah login, non-approved ditolak masuk
   /anggota, sign up berakhir di /akun, tombol Ke Web Utama ada.
```

---

## Prompt 3 — Dashboard Sederhana (Non-Membership)

```
PROMPT 3: Dashboard sederhana untuk user biasa.

Lampiran: mockup dashboard (acuan tata letak). Ikuti design.md, bukan warna
mockup (kecuali ada keputusan klien).

Tata letak (sama dengan mockup):
- Header putih: logo + "Portal Anggota" + tombol "Ke Web Utama".
- Sidebar kiri: kartu profil (inisial bulat, nama, label status), label
  "AREA AKUN", menu aktif berlatar lembut.
- Konten kanan: banner judul bergradien biru tua (eyebrow kecil kapital,
  judul besar, subjudul) lalu kartu isi putih.
Buat layout ini sebagai komponen yang dipakai ulang oleh Dashboard
Membership (Prompt 9): Layouts/PortalLayout.tsx menerima daftar menu
sebagai props, plus komponen PageBanner dan SummaryRow.

Menu non-membership: Dashboard, Pesanan Saya, Profil, Pengaturan.

Isi halaman Dashboard (/akun):
1. Banner: "Selamat datang, {nama}".
2. Kartu "Status Keanggotaan": sesuai MembershipStatus.
   - non_member: ajakan + tombol "Gabung Jadi Anggota".
   - draft: "Lanjutkan Pendaftaran" + progres langkah (mis. 3 dari 9).
   - pending_review / awaiting_payment / pending_approval / revision /
     rejected: garis waktu proses singkat + tombol sesuai tahap
     (mis. "Bayar Sekarang", "Perbaiki Data"). Label "Calon Anggota" tampil
     di kartu profil untuk status yang sedang diproses.
3. Kartu "Pesanan Terakhir" (3 terbaru) dan ringkasan keranjang.
4. Kartu "Butuh bantuan?" memakai kontak dari brand.

Halaman: /akun/pesanan, /akun/profil (ubah nama, telepon, foto, password),
/akun/pengaturan.

Keadaan loading/kosong/error dirancang. Rapi di 360px.

Tes: kartu status sesuai tiap status, tombol aksi benar, tombol Ke Web Utama
berfungsi.
```

---

## Prompt 4 — Revisi Web Utama: Program Kerja di Tentang Kami

```
PROMPT 4: Tambahkan Program Kerja ke halaman Tentang Kami.

Tugas:
1. Di /tentang-kami, tambahkan bagian "Program Kerja" (letakkan setelah
   Visi & Misi). TIDAK membuat menu navbar baru.
2. Data dari tabel programs (is_public = true, status published), diurutkan
   kolom order. Tampilkan sebagai daftar bernomor besar bergaya editorial
   (bukan deretan kartu ikon seragam): nomor, judul, ringkasan, tag kategori
   (pelatihan, pendampingan, informasi pasar, dll.), dan jadwal bila ada.
3. Tombol "Lihat Detail" membuka halaman /program/{slug} sederhana.
   Bila pengguna anggota, tampilkan tombol "Daftar Program" (lihat Prompt 9).
4. CMS: menu "Program" (CRUD programs, urutkan lewat drag, tandai publik atau
   khusus anggota, unggah cover). Admin dan superadmin boleh.
5. Seeder: 6 program contoh sesuai kategori minat (pelatihan, pendampingan,
   informasi pasar, akses kemitraan, teknologi budidaya, pengembangan usaha).
6. Animasi muncul bertahap (Framer Motion), hormati reduced-motion.

Tes: program publik tampil, program khusus anggota tidak tampil di halaman
publik, urutan sesuai CMS.
```

---

## Prompt 5 — Wizard Baru: Kerangka dan Langkah 1–3

```
PROMPT 5: Susun ulang wizard menjadi 9 langkah baru; kerjakan Langkah 1–3.

Pakai kerangka wizard yang sudah ada (steps.ts, WizardStepper,
WizardFooter, SaveRegistrationStep). Jangan menulis ulang kerangkanya.

A. steps.ts: ganti menjadi 9 langkah baru dengan slug:
   identitas, kategori-keanggotaan, profil-usaha, aktivitas-perikanan,
   jaringan-bisnis, minat-program, lokasi-dokumen, paket-administrasi,
   pemeriksaan. Sidebar dan stepper otomatis ikut.
   Hapus komponen langkah lama yang tidak dipakai setelah selesai
   (Media Sosial, Surat Pernyataan, Komoditas).

LANGKAH 1 — Identitas Calon Anggota
Subjudul: "Isi sesuai dokumen identitas Anda."
- Kewarganegaraan* (segmented: WNI / WNA). Pilihan ini menentukan kolom.
- Nama lengkap*, Jenis kelamin*, Tempat lahir*, Tanggal lahir*
- Usia: tampil otomatis dari tanggal lahir (hanya baca, tanpa input)
- Nomor telepon* (+62), Email* (terkunci bila sudah login)
- Bila WNI: NIK* (16 digit) dan Domisili sesuai KTP (RegionSelect +
  alamat). Beri catatan "Wajib diisi bila diperlukan sesuai ketentuan"
  dan jadikan dua kolom ini diatur oleh setting
  `membership.require_ktp_for_wni` (default true).
- Bila WNA: Nomor paspor*, Negara asal* (select negara), Lama berada di
  Indonesia* (angka + satuan bulan/tahun).
- Perpindahan WNI↔WNA: kolom lain beranimasi masuk/keluar (Framer Motion),
  data kolom yang disembunyikan tidak ikut divalidasi.

LANGKAH 2 — Kategori dan Jenis Keanggotaan
- Kategori kegiatan* (kartu pilihan, dari membership_categories; mis.
  Pembudidaya, Pembenih, Pakan/Sarana, Pengolah, Buyer, Akademisi,
  Konsultan, Lainnya + isian). Daftar bersifat CONTOH dan dapat diedit CMS.
- Status pendaftar* (radio): Individu atau Perwakilan Lembaga.
  Bila lembaga: tampil kolom Nama lembaga*, Jabatan pendaftar*.
- Jenis keanggotaan* (dari membership_types, dengan penjelasan singkat sesuai
  AD/ART; kartu pilihan dengan manfaat dan ketentuan ringkas).
- Simpan kategori yang dipilih karena menentukan isi Langkah 4.

LANGKAH 3 — Profil Pekerjaan atau Usaha
Gunakan gaya FormCard 2 kolom seperti referensi sebelumnya.
Kartu 1 "Profil Usaha":
- Nama usaha / lembaga*, Bidang kegiatan*, Lama berusaha* (tahun/bulan),
  Skala kegiatan* (Mikro, Kecil, Menengah, Besar; tooltip kriteria),
  Informasi dasar operasional (textarea, maks 500 karakter).
- Bila pendaftar individu tanpa usaha, tersedia centang "Saya belum memiliki
  usaha" yang mengubah kolom menjadi "Pekerjaan utama".
Kartu 2 "Perizinan dan Legalitas" (komponen LegalDocumentRepeater):
- Baris bertipe: NIB (13 digit), NPWP (15/16 digit), CBIB, Lainnya (isi
  nama izin). Tiap baris: nomor, tanggal terbit, masa berlaku (opsional).
- Tombol "Tambah izin lain". Semua opsional kecuali yang dipersyaratkan
  kategori (atur lewat config, mis. kategori Eksportir mewajibkan NIB).
- Unggah berkas izin dilakukan di Langkah 7; di sini cukup datanya.

Backend: Form Request per langkah (SaveIdentityStepRequest,
SaveCategoryStepRequest, SaveBusinessProfileStepRequest) dengan pesan
Indonesia. Simpan via SaveRegistrationStep. NIK dan paspor terenkripsi.

Tes: WNI vs WNA validasi berbeda, usia otomatis benar, kategori tersimpan,
legalitas wajib sesuai kategori, kolom tersembunyi tidak divalidasi.
```

---

## Prompt 6 — Langkah 4–6

```
PROMPT 6: Langkah 4 (Aktivitas Perikanan), 5 (Jaringan Bisnis), 6 (Minat).

LANGKAH 4 — Data Aktivitas Perikanan (FORM DINAMIS)
Subjudul: "Isi sesuai kegiatan Anda. Langkah ini boleh dilewati bila tidak
relevan."
Rancangan config-driven agar mudah dirawat:
- Buat config/activity_forms.php: pemetaan kategori → daftar field.
  Contoh bentuk:
    'pembudidaya' => [ fish_category, farming_system, pond_count,
                       production_amount+unit+period, seed_need, feed_need ],
    'pembenih'    => [ fish_category, production_amount, ... ],
    'buyer'       => [ fish_category, purchase_capacity+unit+period,
                       preferred_size, delivery_area ],
    'akademisi', 'konsultan' => [] (langkah opsional/dilewati)
- Komponen DynamicActivityForm membaca config dari server (props Inertia),
  merender field sesuai tipe (select, number, number+unit, textarea) dan
  repeater "Tambah Jenis Ikan" (animasi layout).
- Validasi di server dibangun dari config yang sama (ActivityFormRules),
  jangan menulis aturan dua kali.
- Kategori tidak relevan: tampilkan kartu "Langkah ini tidak wajib untuk
  kategori Anda" + tombol "Lewati". Langkah dihitung selesai.
- Simpan ke member_fish_activities. Data ini menjadi sumber StatisticService
  (lihat Prompt 10).

LANGKAH 5 — Jaringan dan Aktivitas Bisnis
- Informasi pemasaran (textarea): saluran dan cara memasarkan
- Wilayah distribusi (multi pilih provinsi, tampil chip)
- Kebutuhan pasokan (textarea) — opsional
- Jenis kerja sama yang dicari (checkbox: pasokan, distribusi, investasi,
  teknologi, penelitian, lainnya + isian)
- Kegiatan profesional yang dijalankan (textarea)
Semua opsional; langkah boleh dilewati. Simpan ke member_network_profiles.

LANGKAH 6 — Kebutuhan dan Minat Program NSA
- Kartu pilihan multi (boleh lebih dari satu): Pelatihan, Pendampingan,
  Informasi Pasar, Akses Kemitraan, Teknologi Budidaya, Pengembangan Usaha.
  Tiap kartu: ikon Lucide, judul, satu kalimat penjelas, centang animasi.
- Kolom catatan tambahan (opsional).
- Simpan ke member_program_interests (Enum ProgramCategory).

Tes: form dinamis berubah sesuai kategori, validasi dari config, langkah
tidak relevan bisa dilewati dan dianggap selesai, minat tersimpan.
```

---

## Prompt 7 — Langkah 7–9

```
PROMPT 7: Langkah 7 (Lokasi, Foto, Dokumen), 8 (Paket & Administrasi),
9 (Pemeriksaan & Pengiriman).

LANGKAH 7 — Lokasi, Foto, dan Dokumen (letaknya mendekati akhir)
Kartu 1 "Alamat Domisili atau Usaha": RegionSelect 4 tingkat, kode pos,
alamat lengkap (0/250). Centang "Alamat usaha berbeda dengan domisili".
Kartu 2 "Lokasi Kegiatan": MapPicker (cari lokasi + geser pin, simpan
latitude/longitude), boleh lebih dari satu lokasi kegiatan.
Kartu 3 "Foto Usaha" (opsional): unggah 1–5 foto, pratinjau, hapus.
Kartu 4 "Dokumen Pendukung": satu DocumentUploadCard per dokumen yang
dibutuhkan, dihasilkan dari data Langkah 1–3: identitas (KTP bila WNI atau
paspor bila WNA), serta berkas tiap izin yang diisi di Langkah 3 (NIB,
NPWP, CBIB, lainnya). Disimpan di disk privat, URL bertanda tangan.
Wilayah (provinsi/kabupaten) dari langkah ini menjadi dasar statistik.

LANGKAH 8 — Paket Keanggotaan dan Administrasi
Subjudul: "Rincian biaya sesuai keputusan resmi NSA."
- Daftar biaya dari membership_fee_items (BUKAN hard-code): Biaya
  pendaftaran, Kartu anggota, Rompi (pilih ukuran), Kemeja tambahan
  (opsional: jumlah + ukuran), Informasi iuran (teks + nominal).
- Item wajib sudah tercentang dan terkunci; item opsional bisa diatur.
- Ringkasan total yang menghitung ulang secara langsung (animasi angka).
- Catatan jelas: "Pembayaran dilakukan setelah pendaftaran lolos verifikasi
  awal." (teks menyesuaikan setting require_initial_verification).
- Pilihan ini disimpan sebagai draft invoice (belum ditagihkan).

LANGKAH 9 — Pemeriksaan dan Pengiriman
- Ringkasan semua data per langkah, tombol "Ubah" per bagian yang kembali
  ke review setelah disimpan. NIK/paspor dimasker.
- Tandai bagian belum lengkap dan blokir tombol kirim sampai lengkap.
- Centang wajib: "Saya menyetujui ketentuan keanggotaan" dan
  "Saya menyetujui kebijakan privasi" (tautan membuka modal isi dari CMS).
- Tombol "Kirim Pendaftaran".
- SubmitRegistration: validasi ulang SEMUA langkah di server, status →
  pending_review (atau awaiting_payment bila saklar verifikasi awal mati),
  kirim email ke pemohon dan notifikasi ke admin, dalam satu transaksi.

Tes: berkas yang diminta sesuai kategori dan izin, total biaya benar,
tidak bisa kirim tanpa centang persetujuan, status berubah sesuai saklar.
```

---

## Prompt 8 — Pembayaran Member & Persetujuan Admin

```
PROMPT 8: Alur verifikasi → pembayaran → persetujuan.

Alur yang dibangun:
  pending_review → (admin lolos) → awaiting_payment → (user bayar)
  → pending_approval → (admin setujui) → approved
Cabang: revision (perbaikan), rejected (ditolak).

Sisi user (/akun/keanggotaan):
1. Halaman status dengan garis waktu 5 tahap yang menyorot posisi saat ini.
2. Saat awaiting_payment: tampilkan tagihan (member_invoices) berisi rincian
   item, total, rekening tujuan (dari settings), batas waktu bila ada, dan
   form unggah bukti bayar (jpg/png/pdf, maks 3 MB) + tanggal dan nama
   pengirim. Setelah unggah: invoice waiting_confirmation, status
   pending_approval.
3. Saat revision: daftar catatan per bagian + tombol "Perbaiki Data" yang
   membuka langkah terkait lalu kirim ulang.
4. Saat approved: arahkan ke /anggota.

Sisi admin (CMS → Anggota):
1. Antrean dengan tab: Verifikasi Awal, Menunggu Pembayaran, Menunggu
   Persetujuan, Disetujui, Ditolak.
2. Detail pendaftar (data 9 langkah, dokumen via URL bertanda tangan, peta).
3. Aksi per tahap:
   - Verifikasi awal: Loloskan (status awaiting_payment + terbitkan invoice
     dari draft Langkah 8 + email), Minta Revisi (catatan per bagian),
     Tolak (alasan wajib).
   - Persetujuan akhir: lihat bukti bayar, Konfirmasi Pembayaran + Setujui
     (nomor anggota otomatis format NSA-YYYY-00001, status approved, invoice
     paid, email, notifikasi), atau Tolak Bukti Bayar (user diminta unggah
     ulang).
4. Semua tindakan tercatat di member_review_logs dan activity_logs.
5. Hanya admin dan superadmin (Policy). Aturan nomor anggota unik dan tidak
   bisa dobel meski dua admin menekan bersamaan (gunakan kunci/transaksi).
6. Pembayaran memakai tabel payments polimorfik; PaymentService tetap
   berbasis interface agar gateway bisa dipasang nanti.

Tes: alur penuh dari kirim sampai approved, saklar verifikasi awal mati
melewati tahap pertama, bukti bayar ditolak bisa diunggah ulang, nomor
anggota unik, user biasa 403.
```

---

## Prompt 9 — Dashboard Membership

```
PROMPT 9: Dashboard Membership (/anggota).

Lampiran: mockup dashboard. Pakai PortalLayout dan PageBanner dari Prompt 3
(menu diberikan sebagai props). Rute di routes/member.php, dilindungi
middleware member.approved. Header memiliki tombol "Ke Web Utama".

Kartu profil di sidebar: inisial, nama, label "Anggota" (bukan
"Calon Anggota"), nomor anggota kecil.

Menu: Dashboard, Profil & Verifikasi, Kartu Anggota, Usaha & Legalitas,
Program NSA, Iuran & Administrasi, Pengaturan. Tambahkan "Pesanan Saya"
agar riwayat toko tetap terjangkau.

1. DASHBOARD (/anggota)
   Banner "Halo, {nama}". Kartu ringkasan: status keanggotaan aktif,
   masa berlaku, program yang diikuti, tagihan yang belum dibayar,
   pengumuman/berita terbaru anggota.

2. PROFIL & VERIFIKASI (/anggota/profil)
   Data identitas (NIK/paspor dimasker), status verifikasi per dokumen,
   riwayat keputusan. Ubah data dasar diperbolehkan; perubahan data
   penting (nama, kewarganegaraan, kategori) membuat permintaan perubahan
   yang disetujui admin (tabel member_change_requests sederhana).

3. KARTU ANGGOTA (/anggota/kartu)
   Kartu digital (foto, nama, nomor anggota, jenis keanggotaan, masa
   berlaku, QR menuju halaman verifikasi publik /verifikasi/{token}).
   Tombol "Unduh" (PDF/gambar). Halaman verifikasi publik hanya
   menampilkan nama, nomor, jenis, status aktif (tanpa data pribadi).

4. USAHA & LEGALITAS (/anggota/usaha)
   Banner: "Profil Usaha dan Perizinan".
   Kartu "Ringkasan profil usaha" berisi baris: Bidang kegiatan, NIB / NPWP /
   CBIB (status terisi atau belum), Data operasional & pemasaran (Langkah
   4–5). Kelola data Langkah 3–5 di sini.
   Dukungan banyak unit usaha: daftar unit (member_businesses hasMany),
   tombol "Tambah Unit Usaha", tambah/ubah/hapus izin per unit dengan unggah
   berkas dan penanda masa berlaku (badge "Segera berakhir" bila < 60 hari).
   Bagian "Permintaan Pendampingan": form singkat (topik, deskripsi) →
   masuk ke CMS, tampil status (Diajukan, Diproses, Selesai).

5. PROGRAM NSA (/anggota/program)
   Daftar program (tabel programs) dengan filter kategori, ditandai yang
   sesuai minat dari Langkah 6. Tombol "Daftar" (program_registrations),
   status pendaftaran, riwayat program yang diikuti.

6. IURAN & ADMINISTRASI (/anggota/iuran)
   Daftar tagihan (pendaftaran, iuran berkala) dengan status, unggah bukti
   bayar untuk tagihan baru, unduh kuitansi sederhana, aturan iuran dari
   CMS. Admin dapat menerbitkan tagihan iuran lewat CMS.

7. PENGATURAN (/anggota/pengaturan)
   Ganti password, preferensi notifikasi email, keluar dari semua perangkat.

Desain: ikuti design.md. Tiap halaman punya banner judul dengan eyebrow
kecil (mis. "USAHA & LEGALITAS"), kartu putih, keadaan kosong yang
menolong. Responsif: sidebar menjadi drawer di mobile.

Tes: hanya approved yang bisa masuk, kartu menampilkan data benar,
halaman verifikasi publik tidak membocorkan data pribadi, tambah unit
usaha dan izin bekerja, pendaftaran program tercatat.
```

---

## Prompt 10 — Statistik, Pembersihan, dan Poles

```
PROMPT 10: Sesuaikan statistik, bersihkan sisa lama, poles.

1. StatisticService: ganti sumber data dari member_commodities ke
   member_fish_activities (hanya anggota approved) dengan wilayah dari
   member_locations (kind business/domicile). Pastikan statistik per
   provinsi dan per kategori ikan (lele, nila, mas, dst.) di Beranda tetap
   benar. Bersihkan cache saat anggota disetujui.
2. Bersihkan kode lama yang tidak terpakai: komponen langkah lama (Media
   Sosial, Surat Pernyataan, Komoditas), Form Request lama, route lama.
   Tinggalkan migrasi yang menandai tabel lama deprecated; hapus tabelnya
   hanya setelah dikonfirmasi.
3. CMS: tambahkan menu Master Keanggotaan (kategori, jenis, biaya, program)
   dan pengaturan (saklar verifikasi awal, aturan KTP untuk WNI, rekening
   bank, teks persetujuan dan kebijakan privasi). Superadmin-only untuk
   biaya dan pengaturan.
4. Audit tampilan terhadap design.md bagian 11 (dua dashboard, wizard baru,
   Tentang Kami). Rapi di 360, 768, 1280. Aksesibilitas dan reduced-motion.
5. Performa: cegah N+1 di daftar anggota dan dashboard, eager load, indeks
   pada kolom filter baru.
6. Tes menyeluruh alur utama:
   sign up → dashboard sederhana → gabung → isi 9 langkah → kirim →
   verifikasi awal → bayar → persetujuan → dashboard membership.
   Jalankan pint, lint, typecheck, dan seluruh test.
7. Perbarui readme.md (akun seeder baru, saklar pengaturan) dan CHANGELOG.md.
```

---

## Prompt Cadangan (kasus khusus)

**Bila klien memilih tanpa verifikasi awal:**
```
Set setting membership.require_initial_verification = false sebagai default
seeder, ubah teks di Langkah 8 dan halaman status, hapus tab "Verifikasi Awal"
di antrean admin saat saklar mati, dan pastikan tes alur lama dan baru lulus.
```

**Bila klien ingin warna mengikuti mockup (hijau-teal):**
```
Ganti token warna di tailwind.config.ts dan design.md ke palet NSA (kirim
hex dari klien). Jangan ubah komponen satu per satu; semua harus berubah
lewat token. Periksa kontras WCAG AA dan perbarui bagian Warna di design.md.
```

**Bila tanda tangan digital masih diperlukan:**
```
Tambahkan kembali kanvas tanda tangan digital di Langkah 9 (di atas tombol
kirim), simpan PNG di disk privat, tampilkan di detail pendaftar CMS.
```
