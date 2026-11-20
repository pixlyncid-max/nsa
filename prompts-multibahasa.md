# Multi Bahasa (Indonesia & Inggris) + Terjemahan Otomatis

Revisi klien: seluruh website tersedia dalam **Bahasa Indonesia** dan **Inggris**. CMS tetap **hanya Bahasa Indonesia**; versi Inggris dibuat **otomatis**.

---

## 1. Analisis

### Empat jenis teks, empat cara penanganan

| Jenis | Contoh | Cara menghasilkan versi Inggris |
|---|---|---|
| **Teks tetap tampilan** (registry "Teks Website") | Judul hero, label tombol, teks footer, banner membership | Versi Inggris bawaan dibuat **sekali** lewat perintah artisan, disimpan di file (bisa ditinjau dan di-commit). Superadmin bisa mengubahnya |
| **Konten dinamis dari CMS** | Artikel, produk, kategori, program, jabatan pengurus, isi Tentang Kami, opsi form (bidang usaha, jenis ikan) | **Otomatis di belakang layar** setiap admin menyimpan konten Indonesia (lewat antrean) |
| **Konten buatan pengguna** | Nama usaha, alamat, pesan kontak, ulasan | **Tidak diterjemahkan** |
| **Sistem** | Pesan validasi, email, format tanggal dan angka | File bahasa Laravel + registry email |

### Prinsip

- **Admin tidak berubah.** Form CMS tetap hanya kolom Indonesia, tanpa kolom Inggris. Terjemahan berjalan otomatis tanpa tindakan admin.
- **Superadmin punya "Pusat Terjemahan"** untuk meninjau, mengedit manual, menerjemahkan ulang, dan mengelola glosarium.
- **Tidak pernah kosong.** Bila versi Inggris belum siap atau gagal, halaman menampilkan Bahasa Indonesia, bukan teks kosong atau error.
- **Penyedia terjemahan bisa diganti** (Claude API, DeepL, atau Google) lewat satu konfigurasi. Kunci API hanya di `.env`.
- **Hemat biaya:** hanya teks yang berubah yang diterjemahkan ulang (cek hash), dikirim berkelompok, lewat antrean.
- **Istilah dijaga:** glosarium (DPP, DPW, DPC, NIB, NPWP, CBIB, nama ikan), nama organisasi/orang/merek, placeholder, HTML, URL tidak boleh rusak.

### Keputusan teknis

| Hal | Keputusan |
|---|---|
| Bahasa bawaan | Indonesia. Inggris di alamat berawalan `/en` (contoh `/en/produk`) |
| Alamat halaman publik | Segmen tetap sama dengan versi Indonesia (`/en/produk`, bukan `/en/products`) agar sederhana dan mudah dirawat |
| Area login (akun, anggota, wizard) | Tanpa awalan URL; mengikuti bahasa pilihan user (disimpan di profil) |
| Deteksi bahasa | Urutan: awalan URL → profil user → cookie → bawaan. **Tidak** mengalihkan otomatis berdasarkan bahasa browser (aman untuk SEO) |
| Slug artikel/produk | Satu slug (Indonesia) dipakai di kedua bahasa |
| Penyimpanan terjemahan | Tabel `content_translations` (polimorfik), bukan kolom ganda di tiap tabel |
| Nama wilayah (provinsi, kabupaten) | Tidak diterjemahkan |

### Perlu dikonfirmasi ke klien

1. **Penyedia terjemahan dan biayanya** (butuh API key; saran: Claude API atau DeepL).
2. Apakah **nama produk** ikut diterjemahkan otomatis atau dibiarkan (bisa dikunci manual per item).
3. Istilah resmi untuk glosarium (mis. terjemahan "DPP/DPW/DPC", "CBIB"). Isi awal hanya contoh.
4. Apakah email sistem ke user dikirim sesuai bahasa user (default: ya).

---

## 2. Cara Pakai

1. Prasyarat: fitur **Teks Website** (S1–S4 di `prompts-superadmin-teks.md`) sudah ada. M3 memperluasnya.
2. Jalankan **M1 → M5** berurutan; jalankan tes dan commit di setiap akhir prompt.
3. Tempel Prompt Konteks dari `prompts.md` di awal sesi.

---

## Prompt M1 — Pondasi Multi Bahasa (Locale, Rute, Pemilih Bahasa)

```
PROMPT M1: Pondasi multi bahasa Indonesia (id) dan Inggris (en).

Aturan utama: CMS (/admin) TETAP Bahasa Indonesia dan tidak diubah.

Tugas:
1. config/locales.php: supported ['id','en'], default 'id', nama tampil
   ('Bahasa Indonesia','English'), kode html lang (id, en), kode Open Graph.
2. Migration: users.locale (string, default 'id', nullable di data lama).
3. Rute halaman publik: definisikan SEKALI lalu daftarkan dua kali lewat
   macro Route::localized(fn () => ...): tanpa awalan (id) dan dengan
   awalan 'en' (nama rute berawalan 'en.'). Sediakan helper backend dan
   frontend lroute('products.index') yang menghasilkan URL sesuai bahasa
   aktif. Jangan menulis URL ke tangan di komponen.
   Area login (/akun, /anggota, wizard) TIDAK diberi awalan.
4. Middleware SetLocale (urutan prioritas):
   awalan URL 'en' → users.locale (bila login) → cookie 'locale' → 'id'.
   Terapkan App::setLocale dan Carbon::setLocale. /admin selalu 'id'.
5. Pengalihan: hanya untuk kunjungan ke "/" TANPA awalan bila cookie
   'locale' = en → redirect ke /en. JANGAN mengalihkan berdasarkan header
   Accept-Language.
6. Shared props Inertia: locale, availableLocales, dan alternates (URL
   padanan halaman saat ini untuk tiap bahasa, termasuk query string dan
   parameter rute).
7. Komponen LanguageSwitcher (Components/layout):
   - Tombol ikon Globe + kode bahasa aktif ("ID" / "EN"), satu baris,
     whitespace-nowrap, tinggi 40px.
   - Menu kecil berisi "Bahasa Indonesia" dan "English" dengan tanda centang
     pada yang aktif; dapat dipakai dengan keyboard.
   - Memilih bahasa: simpan cookie 'locale' (1 tahun) dan users.locale bila
     login, lalu pindah ke URL padanan (alternates) dengan path, query, dan
     hash yang sama.
   - Letak: Navbar (kanan, sebelum keranjang), drawer mobile, header portal
     (Dashboard dan wizard; menggantikan dropdown "Bahasa" statis).
8. SEO: <html lang>, tautan hreflang (id, en, x-default), canonical per
   bahasa, og:locale dan og:locale:alternate, sitemap.xml memuat kedua
   bahasa.
9. File bahasa Laravel: lang/id dan lang/en (validation, auth, passwords,
   pagination). Pasang paket laravel-lang/lang untuk Indonesia.
10. Pemformat (lib/format.ts + helper backend): tanggal, angka, dan mata
    uang mengikuti bahasa aktif. Simbol "Rp" tetap dipakai di kedua bahasa;
    pemisah ribuan sesuai bahasa. Jangan memformat manual di komponen.
11. Halaman yang memakai teks tertanam untuk bahasa (judul tab, aria-label,
    alt, placeholder) harus melewati t() agar ikut diterjemahkan (lihat M3).
12. Tes: penentuan locale tiap urutan prioritas, pemilih bahasa menjaga
    path/query/hash, redirect "/" hanya karena cookie, /admin selalu id,
    hreflang dan canonical benar, sitemap memuat kedua bahasa.

Belum menerjemahkan isi. Tahap ini hanya pondasi.
```

---

## Prompt M2 — Mesin Terjemahan Otomatis

```
PROMPT M2: Mesin terjemahan otomatis Indonesia → Inggris.

Tugas:
1. Kontrak: App\Contracts\Translator dengan metode
   translateBatch(array $items, string $from = 'id', string $to = 'en',
   array $context = []): array  (items = [key => teks], hasil = [key => teks]).
   Driver: ClaudeTranslator (Anthropic API, nama model dari config),
   DeepLTranslator, GoogleTranslator, FakeTranslator (untuk tes, mis. awalan
   "[EN] "). Pilih lewat TRANSLATION_DRIVER di .env; kunci API hanya di .env
   (jangan di repo). config/translation.php memuat driver, model, batas
   percobaan, batas karakter harian, ukuran batch.
2. Aturan untuk driver berbasis LLM (instruksi sistem):
   - Terjemahkan dari Bahasa Indonesia ke Bahasa Inggris yang profesional,
     jelas, dan natural untuk audiens perikanan dan bisnis.
   - JANGAN mengubah: placeholder seperti {name}, tag/atribut HTML, URL,
     email, angka, tanggal ISO, nama orang, nama organisasi, nama merek,
     nama tempat. Terjemahkan hanya teks yang tampil.
   - Patuhi glosarium yang diberikan.
   - Keluarkan JSON dengan key yang sama persis; tanpa komentar.
3. Glosarium: tabel translation_glossary (source, target, locale, note,
   case_sensitive, is_active). Seeder berisi CONTOH yang bisa disesuaikan
   (nama organisasi NSA dipertahankan; DPP, DPW, DPC; NIB; NPWP; CBIB;
   Lele = Catfish, Nila = Tilapia, Mas = Common carp; Pembudidaya = Fish
   farmer). Kirim hanya entri glosarium yang relevan dengan teks yang
   sedang diterjemahkan.
4. Tabel content_translations: id, translatable_type, translatable_id,
   field (mendukung jalur JSON, mis. body.sejarah.0.title), locale,
   value (text, nullable), source_hash, status
   (pending|done|failed|manual), is_manual (boolean), provider, chars,
   error (nullable), translated_at, timestamps. Unik pada
   (translatable_type, translatable_id, field, locale). Indeks pada status.
5. Trait HasAutoTranslations: model mendeklarasikan
   $translatable = ['title','excerpt','body'] (dan, bila perlu,
   $translatableJson untuk kolom JSON).
   - Saat model disimpan (observer): hitung hash tiap field Indonesia;
     bila hash berubah atau terjemahan belum ada DAN is_manual = false,
     tandai pending dan kirim TranslateModelJob (antrean 'translations').
   - Field kosong dilewati; bila Indonesia dikosongkan, hapus terjemahannya.
   - Untuk kolom JSON (mis. body halaman Tentang Kami): ambil hanya nilai
     string yang layak diterjemahkan (abaikan URL, id, angka, tanggal, path
     file) dan simpan per jalur.
   - Untuk richtext HTML: terjemahkan teks tanpa merusak tag; hasil
     disanitasi lagi.
6. TranslateModelJob: kumpulkan semua field pending satu model dalam SATU
   panggilan batch, panggil Translator, validasi hasil (lihat 7), simpan
   status done. Percobaan ulang 3 kali dengan backoff; setelah itu status
   failed + catat error. Job idempoten (aman dijalankan ulang).
7. Validasi hasil terjemahan (tolak dan coba ulang bila gagal):
   semua placeholder ada, tag HTML seimbang dan sama, URL dan angka tidak
   berubah, rasio panjang wajar (mis. 0,5x–3x), bukan kosong, bukan sama
   persis dengan sumber bila sumber mengandung kalimat panjang.
8. Pembacaan (fallback aman):
   - Method $model->tr('field') dan trait resource ResolvesLocale:
     locale id → nilai asli; locale en → terjemahan status done atau manual,
     jika tidak ada → nilai Indonesia.
   - Scope withLocale($locale) yang me-eager-load HANYA terjemahan bahasa
     aktif agar tidak ada N+1.
9. Pengendali biaya: dedup lewat source_hash, batch, batas karakter harian
   (config); bila terlampaui, job ditunda dan dicatat. Catat pemakaian
   (provider, karakter, tanggal) di tabel translation_usage_daily.
10. Perintah artisan:
    translate:backfill {model?} {--force}  (terjemahkan data lama yang belum),
    translate:retry-failed (jadwalkan tiap jam di scheduler),
    translate:status (ringkasan jumlah per status dan pemakaian).
11. readme.md: cara menjalankan worker
    (php artisan queue:work --queue=translations), variabel .env, cara
    mengganti driver.
12. Tes (memakai FakeTranslator): perubahan field memicu job; hash sama tidak
    memicu panggilan; is_manual tidak ditimpa; placeholder hilang → ditolak
    dan dicoba ulang; gagal 3x → failed dan fallback Indonesia tetap
    tampil; batch hanya satu panggilan per model; JSON leaf benar.

Admin tidak melihat atau mengubah apa pun pada form CMS di tahap ini.
```

---

## Prompt M3 — Teks Tetap Dua Bahasa (Registry & "Teks Website")

```
PROMPT M3: Teks tetap tampilan dalam dua bahasa.

Memperluas fitur Teks Website (prompts-superadmin-teks.md). Kolom locale di
site_texts sudah disiapkan.

Tugas:
1. Registry: nilai bawaan Inggris disimpan terpisah di resources/copy/en/
   (file per kelompok, key sama dengan resources/copy/). Resolusi untuk
   locale en:
     override DB (locale en) → bawaan registry en → bawaan registry id.
   Untuk id: override DB (id) → bawaan registry id.
2. Perintah copy:translate-defaults: membaca seluruh registry Indonesia,
   menerjemahkan lewat Translator + glosarium (memperhatikan placeholder,
   batas max), menulis hasilnya ke resources/copy/en/*.php untuk DITINJAU
   MANUSIA lalu di-commit. Tidak dijalankan saat runtime. Opsi --only=group
   dan --missing (hanya key yang belum ada).
3. copy:check diperluas: laporkan key tanpa terjemahan Inggris; gagal bila
   ada key aktif tanpa en bawaan.
4. CopyService: forGroups($groups, $locale) mengikuti urutan resolusi di
   atas; cache per kelompok DAN per locale; hapus cache kedua locale saat
   ada perubahan.
5. Menu Teks Website (superadmin): tiap teks tampil dalam dua tab
   ID | EN (atau dua kolom di layar lebar).
   - Superadmin hanya perlu mengubah ID; saat ID berubah, versi EN
     diterjemahkan otomatis (job M2), kecuali dikunci manual.
   - Status EN per teks: Otomatis, Menerjemahkan, Gagal, Manual (terkunci).
   - Tombol: "Terjemahkan ulang", "Edit EN manual" (otomatis mengunci),
     "Kembalikan ke otomatis".
   - Validasi placeholder dan batas panjang berlaku di kedua bahasa
     (beri kelonggaran sekitar 30% untuk Inggris atau tambahkan max_en).
   - Riwayat revisi mencatat locale.
6. Mode Edit Teks langsung: di halaman /en/... menyimpan ke versi Inggris
   (otomatis terkunci manual); di halaman Indonesia menyimpan ke Indonesia
   dan memicu terjemahan otomatis.
7. Email: kelompok emails mendukung dua bahasa; Mailable memakai
   locale penerima (users.locale; guest memakai locale permintaan). Gunakan
   $mailable->locale(...) agar terjemahan ikut.
8. Perbarui t() dan useCopy: tidak perlu perubahan pemanggilan; nilai yang
   dikirim server sudah sesuai locale. Pastikan Inertia memuat ulang copy
   saat bahasa berganti.
9. Lengkapi semua teks yang masih tertanam di komponen (judul tab, placeholder,
   aria-label, alt, toast, tooltip, tombol) agar melewati t(). Jalankan
   php artisan i18n:audit (buat perintah ini): memindai resources/js
   non-admin untuk string literal berbahasa Indonesia atau Inggris yang
   tertanam dan melaporkannya.
10. Uji tata letak dengan teks Inggris (umumnya 20–30% lebih panjang):
    pastikan tombol tidak membungkus (nowrap tetap), judul tidak
    meluber, navbar muat pada 1024px, wizard dan dashboard rapi.
11. Tes: resolusi tiga lapis benar, ID diubah → EN diterjemahkan otomatis,
    EN manual tidak tertimpa, cache dua locale terhapus, email terkirim
    sesuai bahasa user, copy:check gagal bila en bawaan hilang.
```

---

## Prompt M4 — Konten Dinamis Dua Bahasa (Terjemahan Otomatis dari CMS)

```
PROMPT M4: Konten dinamis dari CMS tampil dalam dua bahasa.

Aturan: form CMS admin TIDAK diubah (tetap kolom Indonesia saja). Terjemahan
terjadi otomatis lewat trait HasAutoTranslations (M2).

Tugas:
1. Pasang trait pada model dan tentukan field yang diterjemahkan
   (periksa skema aktual; daftar ini acuan):
   - Post (artikel/berita): title, excerpt, body (richtext), meta_title,
     meta_description
   - Product: name, short_description, description (nama merek dan nama
     diri dijaga lewat aturan penerjemah; superadmin bisa mengunci manual)
   - ProductCategory: name, description
   - Page: body JSON (Tentang Kami, halaman statis lain), title, meta
   - Program: title, summary, body
   - DppMember, DpwMember, DpcMember: position (jabatan) SAJA; nama orang
     tidak diterjemahkan
   - Dpw dan Dpc: description bila ada (nama wilayah tidak diterjemahkan)
   - Partner: type (jenis mitra) dan description; nama mitra tidak
   - FishCategory, BusinessField, MembershipCategory, MembershipType,
     MembershipFeeItem: name dan description (opsi form pendaftaran)
   - Faq (bila ada): question, answer
   - Settings bertipe teks publik (tagline, deskripsi footer) bila ada
   TIDAK diterjemahkan: slug, nama orang/organisasi, nama provinsi/kabupaten,
   data buatan pengguna (nama usaha, alamat, pesan kontak, ulasan), angka,
   tanggal, kode.
2. Resource/serializer: semua data yang dikirim ke frontend untuk halaman
   publik, akun, dan wizard melewati trait ResolvesLocale agar field
   mengikuti bahasa aktif dengan fallback ke Indonesia. Komponen React
   tidak perlu tahu soal bahasa untuk data ini.
3. Eager load: gunakan scope withLocale() di semua query daftar (artikel,
   produk, organisasi, opsi form) agar tidak ada N+1; periksa dengan
   Debugbar/Telescope.
4. Pencarian dan filter pada locale en: cari pada terjemahan Inggris DAN
   teks Indonesia; filter kategori tetap memakai slug yang sama.
5. SEO: meta title/description, Open Graph, dan data terstruktur memakai
   versi bahasa aktif; hreflang hanya untuk halaman yang punya padanan.
6. Data lama: jalankan translate:backfill setelah deploy (jalankan lewat
   antrean, aman diulang). Pastikan data lama tampil Indonesia sampai
   terjemahannya selesai.
7. Cache: saat terjemahan selesai, hapus cache halaman terkait (statistik
   beranda, daftar artikel/produk, Tentang Kami).
8. Opsi form pendaftaran (jenis keanggotaan, bidang usaha, kategori ikan,
   biaya) dan statistik (label kategori ikan di grafik/peta) otomatis
   tampil dalam bahasa aktif.
9. Tes: artikel baru → terjemahan dibuat; ubah judul → diterjemahkan ulang;
   hapus isi → terjemahan terhapus; /en menampilkan Inggris dan fallback
   Indonesia saat belum siap; nama pengurus tidak berubah, jabatannya
   berubah; admin tidak melihat perubahan pada form; tidak ada N+1
   pada halaman daftar.
```

---

## Prompt M5 — Pusat Terjemahan (Superadmin) dan QA

```
PROMPT M5: Pusat Terjemahan untuk superadmin dan audit akhir.

A. MENU "TERJEMAHAN" (superadmin-only, ikon Lucide: Languages)
Ikuti AdminLayout; admin biasa tidak melihat menu dan mendapat 403 di URL.
Empat tab:
1. Ringkasan: jumlah per status (Selesai, Menerjemahkan, Gagal, Manual),
   pemakaian karakter harian/bulanan, driver aktif, tombol "Uji koneksi"
   penyedia.
2. Konten: tabel semua terjemahan (jenis, judul Indonesia, bahasa, status,
   diperbarui). Filter jenis dan status, pencarian. Aksi per baris:
   lihat Indonesia dan Inggris berdampingan, "Edit manual" (mengunci),
   "Terjemahkan ulang", "Kembalikan ke otomatis". Aksi massal:
   "Terjemahkan ulang yang gagal", "Terjemahkan semua yang belum"
   (antrean, dengan progres).
3. Glosarium: CRUD istilah (sumber, terjemahan, catatan), pencarian, impor
   dan ekspor CSV. Perubahan glosarium tidak otomatis menerjemahkan ulang;
   sediakan tombol "Terapkan ke konten terkait".
4. Pengaturan: batas karakter harian, ukuran batch, driver (hanya tampil
   status, kunci API tidak pernah ditampilkan).
Semua aksi tercatat di activity_logs. Notifikasi ke superadmin (dashboard)
bila jumlah gagal melampaui ambang.

B. AUDIT AKHIR MULTI BAHASA
1. i18n:audit bersih; copy:check bersih (semua key punya en).
2. Tidak ada layar bercampur bahasa: telusuri tiap halaman di /en
   (beranda, organisasi, produk, keranjang/checkout, tentang kami,
   kemitraan, artikel, kontak, login/daftar, dashboard, wizard 9 langkah,
   banner membership, strip ajakan di atas footer, 404/403/500).
3. Pemilih bahasa: mempertahankan path/query/hash di setiap halaman,
   tampil di navbar, drawer mobile, dan header portal.
4. Tata letak: uji dengan teks Inggris yang lebih panjang pada 360, 768,
   1024, 1280px; tombol (termasuk "Daftar Anggota") tetap satu baris.
5. SEO: hreflang, canonical, sitemap dua bahasa, meta per bahasa.
6. Performa: tidak ada query tambahan berarti di halaman publik (cache +
   eager load), Lighthouse mobile >= 85 pada Beranda, Produk, Artikel.
7. Ketahanan: matikan penyedia terjemahan (kunci salah) lalu pastikan situs
   tetap normal dengan fallback Indonesia, job masuk status failed, dan
   pulih setelah translate:retry-failed.
8. Keamanan: kunci API tidak bocor ke frontend/log; hasil terjemahan
   richtext disanitasi; endpoint Pusat Terjemahan hanya superadmin.
9. Dokumen: prd.md (fitur multi bahasa, hak akses Terjemahan: superadmin ✓,
   admin ✗), readme.md (worker antrean, .env, perintah artisan),
   design.md (pemilih bahasa, aturan panjang teks Inggris), CHANGELOG.md.
10. Jalankan pint, lint, typecheck, copy:check, i18n:audit, dan seluruh tes.
```

---

## Prompt Cadangan

**Ganti penyedia terjemahan:**
```
Ubah TRANSLATION_DRIVER dari [driver lama] ke [driver baru] di .env.example
dan dokumentasi. Jalankan translate:backfill --force pada contoh kecil
(10 konten) dan bandingkan kualitasnya dengan hasil sebelumnya. Jangan
menimpa terjemahan berstatus manual.
```

**Tambah bahasa ketiga (mis. Mandarin):**
```
Tambahkan locale 'zh' di config/locales.php. Perbanyak resources/copy/zh,
terjemahan konten lewat Translator (parameter to = 'zh'), awalan URL /zh,
pemilih bahasa, hreflang, dan lang file. Tidak boleh ada perubahan
struktur tabel (content_translations sudah memakai kolom locale).
```

**Segmen URL berbahasa Inggris (/en/products):**
```
Tambahkan peta segmen di config/route_segments.php (organisasi → organization,
produk → products, tentang-kami → about-us, kemitraan → partnership,
artikel → articles, kontak → contact) dan terapkan pada macro
Route::localized. Perbarui alternates, hreflang, sitemap, dan tes. Beri
redirect 301 dari /en/produk ke /en/products.
```

**Saran pindah bahasa yang halus (tanpa redirect paksa):**
```
Bila bahasa browser pengunjung adalah Inggris dan ia belum pernah memilih
bahasa, tampilkan satu bilah kecil yang bisa ditutup: "View this page in
English?" dengan tombol Ya/Tidak. Simpan pilihan di cookie. Jangan mengalihkan
otomatis.
```
