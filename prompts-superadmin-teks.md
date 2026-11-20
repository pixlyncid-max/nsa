# Superadmin: Kelola Teks Seluruh Website

Revisi klien: **superadmin dapat mengubah kata-kata di semua halaman website.** Role **admin tidak berubah sama sekali** (menu, akses, dan tampilannya tetap seperti sekarang).

---

## 1. Analisis

### Dua jenis teks (jangan dicampur)

| Jenis | Contoh | Siapa yang mengelola |
|---|---|---|
| **Konten dinamis** (data) | Artikel, berita, produk, pengurus, program, isi halaman Tentang Kami | **Admin & superadmin** lewat modul CMS yang sudah ada (tidak berubah) |
| **Teks tetap tampilan** (copy) | Judul hero, subjudul section, label tombol, teks banner membership, teks footer, placeholder form, pesan toast | **Hanya superadmin** lewat menu baru **"Teks Website"** |

Fitur baru ini hanya untuk jenis kedua. Dengan begitu admin tidak terganggu.

### Cakupan "semua halaman"

| Area | Termasuk |
|---|---|
| Publik | Navbar, footer, Beranda, Organisasi, Produk (daftar, detail, keranjang, checkout), Tentang Kami, Kemitraan, Artikel, Kontak |
| Autentikasi | Login, sign up, lupa password |
| Akun | Dashboard sederhana, Dashboard Membership (semua menu), banner ajakan membership |
| Pendaftaran anggota | Judul, subjudul, label, placeholder, bantuan (tooltip) di 9 langkah |
| Notifikasi | Teks toast umum, teks email utama (sambutan, status keanggotaan) |
| **Tidak termasuk** | Panel CMS admin/superadmin, pesan validasi sistem, nama kolom database |

### Keputusan teknis

- **Satu sumber kebenaran:** daftar teks (registry) ditulis di file per halaman, berisi key, label, nilai bawaan, batas panjang, dan placeholder. Database hanya menyimpan nilai yang **diubah**; bila kosong, otomatis memakai nilai bawaan.
- **Aman:** teks biasa selalu di-escape. Hanya tipe `richtext` yang boleh HTML terbatas dan wajib disanitasi.
- **Variabel dilindungi:** teks seperti `Langkah {step} dari {total}` tidak boleh kehilangan `{step}` dan `{total}` saat diedit.
- **Cepat:** semua teks di-cache, dan hanya teks halaman terkait yang dikirim ke browser.
- **Bisa dipulihkan:** setiap perubahan tercatat (siapa, kapan, nilai lama) dan bisa dikembalikan.
- **Siap multi-bahasa:** kolom `locale` disiapkan, isi awal hanya Bahasa Indonesia (dropdown "Bahasa" di mockup nanti bisa dipakai).

---

## 2. Cara Pakai

1. Tempel Prompt Konteks dari `prompts.md` di awal sesi.
2. Jalankan **S1 → S4** berurutan. Commit setiap tahap.
3. **S2 adalah tahap terpanjang**: memindahkan teks yang masih tertanam di kode ke registry. Kerjakan per kelompok halaman, jangan sekaligus.

---

## Prompt S1 — Pondasi: Registry, Database, Service, Hak Akses

```
PROMPT S1: Pondasi fitur "Teks Website" (khusus superadmin).

Aturan utama: role ADMIN TIDAK BOLEH BERUBAH (menu, rute, hak akses, tampilan).
Fitur ini hanya untuk superadmin. Fitur lama harus tetap lulus tes.

Tugas:
1. Registry teks (satu sumber kebenaran), file per kelompok di
   resources/copy/ :
     global.php (navbar, footer, banner membership, tombol umum, toast umum)
     home.php, organization.php, products.php, cart.php, about.php,
     partnership.php, articles.php, contact.php, auth.php,
     account.php, member.php, registration.php, emails.php
   Setiap entri berbentuk:
     'home.hero.title' => [
        'label'        => 'Judul utama',
        'hint'         => 'Beranda → Hero (teks paling besar)',
        'type'         => 'text',   // text | textarea | richtext | button | link
        'default'      => '...',
        'max'          => 80,
        'placeholders' => [],        // contoh: ['step','total']
     ]
   Key memakai format: kelompok.bagian.nama (huruf kecil, titik).
2. Migration:
   - site_texts: id, key (unik, index), group (index), locale (default 'id'),
     value (text, nullable; null = pakai default), updated_by (FK users,
     nullable), timestamps. Unik pada (key, locale).
   - site_text_revisions: id, site_text_id, old_value, new_value, user_id,
     created_at.
   Model + relasi + factory.
3. App\Support\Copy\CopyRegistry: memuat dan memvalidasi semua file registry
   (key unik, tipe valid, default tidak kosong).
4. App\Services\CopyService:
   - forGroups(array $groups, string $locale): hasil gabungan default +
     nilai DB, di-cache (Cache::rememberForever per kelompok) dan
     dihapus otomatis saat ada perubahan.
   - update(key, value, user): validasi (max, tipe, placeholder wajib ada,
     sanitasi richtext), simpan, catat revisi, hapus cache, catat ke
     activity_logs.
   - reset(key, user): kembali ke default (value = null).
   - restore(revisionId, user).
5. Inertia: di HandleInertiaRequests bagikan `copy` = kelompok 'global' +
   kelompok halaman aktif. Petakan nama route → kelompok di
   config/copy_routes.php agar tidak mengirim semua teks ke setiap halaman.
6. Frontend: hooks/useCopy.ts
     const { t } = useCopy();
     t('home.hero.title');
     t('registration.progress', { step: 3, total: 9 });
   - Mengganti {placeholder}, nilai di-render sebagai teks (React meng-escape).
   - Key tidak ada: tampil key di mode dev + console.warn; di produksi
     fallback aman (string kosong) dan catat ke log.
   - Komponen <RichCopy k="..." /> khusus tipe richtext (HTML sudah
     disanitasi di server).
7. Hak akses:
   - Policy SiteTextPolicy: hanya Role::Superadmin.
   - Rute di routes/admin.php dalam grup middleware role:superadmin,
     prefix /admin/teks-website. Admin biasa → 403.
   - Menu "Teks Website" hanya muncul untuk superadmin (sidebar sudah punya
     pola menu superadmin-only; ikuti pola itu).
8. Perintah artisan:
   - copy:check  → membandingkan registry dengan pemakaian t('...') di
     resources/js; laporkan key yang dipakai tapi tidak terdaftar, dan key
     terdaftar yang tidak dipakai. Gagal (exit code 1) bila ada yang tidak
     terdaftar, agar bisa dipasang di CI.
   - copy:seed → opsional, hanya memastikan registry valid (tidak mengisi DB).
9. Tes:
   - Nilai bawaan dipakai bila DB kosong; nilai DB menimpa default.
   - Update menghapus cache dan mencatat revisi.
   - Placeholder wajib tidak boleh hilang; melebihi max ditolak.
   - HTML pada tipe text di-escape; richtext disanitasi (script dihapus).
   - Admin biasa dan user mendapat 403 di semua rute /admin/teks-website;
     guest diarahkan login; superadmin 200.
   - Tes admin yang sudah ada tetap lulus tanpa perubahan.

Belum mengubah halaman publik di tahap ini.
```

---

## Prompt S2 — Pindahkan Teks dari Kode ke Registry (Per Kelompok)

Jalankan prompt ini **berulang**, sekali untuk tiap kelompok di daftar urutan. Ganti `[KELOMPOK]`.

```
PROMPT S2: Pindahkan teks tertanam menjadi teks yang bisa dikelola.

Kelompok: [KELOMPOK]
Urutan yang disarankan:
  1 global (navbar, footer, banner membership, tombol & toast umum)
  2 home         3 organization    4 products + cart
  5 about        6 partnership     7 articles     8 contact
  9 auth        10 account + member (dashboard)
 11 registration (9 langkah wizard)   12 emails

Tugas:
1. Telusuri semua file React/Blade/Mail untuk kelompok ini dan daftar
   SEMUA teks tampilan yang tertanam (judul, subjudul, paragraf, label
   tombol, placeholder, tooltip, teks keadaan kosong, teks toast, alt gambar
   yang bersifat teks, meta judul/deskripsi halaman).
2. Daftarkan ke resources/copy/[kelompok].php dengan:
   - key bermakna (home.hero.title, bukan text1)
   - label dan hint lokasi yang jelas untuk superadmin
   - tipe yang tepat, max yang wajar, daftar placeholder bila ada variabel
   - default = teks yang sekarang tampil (tidak boleh mengubah tampilan)
3. Ganti teks di komponen dengan t('key', {vars}) atau <RichCopy>.
   Jangan mengubah tata letak, kelas, atau perilaku.
4. JANGAN dipindahkan: data dari database (artikel, produk, pengurus,
   program), pesan validasi sistem, teks panel CMS admin/superadmin, nama
   route, dan istilah teknis.
5. Kalimat yang disusun dari potongan (mis. "Halo, " + nama) diubah menjadi
   satu key dengan placeholder: "Halo, {name}" agar urutan kata bisa diedit.
6. Gabungkan teks yang sama persis dan dipakai berulang ke satu key umum
   (global.button.register) bila memang harus selalu sama; bila konteksnya
   berbeda, pakai key terpisah.
7. Jalankan `php artisan copy:check` sampai bersih untuk kelompok ini.
8. Verifikasi: halaman terlihat IDENTIK dengan sebelum perubahan (default
   sama). Jalankan tes yang ada; perbarui snapshot bila ada.

Keluaran: ringkas jumlah key yang ditambahkan dan file yang diubah.
```

> Tips: S2 menyentuh banyak file. Commit **per kelompok** supaya mudah ditelusuri dan dikembalikan.

---

## Prompt S3 — Antarmuka Superadmin: Menu "Teks Website"

```
PROMPT S3: Halaman pengelolaan teks untuk superadmin.

Ikuti AdminLayout dan gaya tabel/form yang ada. JANGAN mengubah halaman
atau menu admin lain; hanya tambahkan satu menu baru yang tampil khusus
untuk superadmin (ikon Lucide: Type atau PenLine), label "Teks Website".

Rute: /admin/teks-website  (+ /admin/teks-website/{kelompok}).

Tata letak dua kolom:
- Kiri (sidebar kecil): daftar kelompok (Umum, Beranda, Organisasi, Produk,
  Keranjang & Checkout, Tentang Kami, Kemitraan, Artikel, Kontak, Masuk &
  Daftar, Akun, Dashboard Anggota, Pendaftaran Anggota, Email). Tiap item
  menampilkan jumlah teks dan lencana "N diubah".
- Kanan: daftar kolom teks untuk kelompok terpilih, dikelompokkan per
  bagian (mis. Beranda → Hero, Peta, Berita).

Komponen per teks (SiteTextField):
- Label, hint lokasi ("Beranda → Hero → Judul"), dan nilai saat ini.
- Input sesuai tipe: text (satu baris), textarea, richtext (editor ringan
  dengan tebal, miring, tautan, daftar saja), button (teks), link (validasi
  URL).
- Penghitung karakter dan batas max; peringatan merah bila melebihi.
- Chip placeholder ({name}, {step}) yang wajib ada; bila terhapus, tombol
  simpan ditolak dengan pesan jelas.
- Lencana "Diubah" bila berbeda dari default; di bawahnya tampil nilai
  default dalam teks kecil.
- Tombol "Reset ke default" (dengan konfirmasi) dan "Riwayat" (laci
  samping berisi daftar perubahan: siapa, kapan, nilai lama → baru, tombol
  "Pulihkan versi ini").
- Status simpan: tersimpan / belum disimpan (penanda titik kuning).

Fitur halaman:
1. Pencarian global (di atas) mencari pada key, label, dan nilai.
2. Filter: Semua / Hanya yang diubah.
3. Simpan per teks (Enter / blur) dan tombol "Simpan Semua" untuk
   perubahan di satu kelompok. Konfirmasi tinggalkan halaman bila ada
   perubahan belum disimpan.
4. Tombol "Buka Halaman" di tiap bagian untuk membuka halaman publik terkait
   di tab baru agar hasilnya bisa dicek langsung.
5. Pratinjau kecil (panel di bawah field) yang menampilkan teks dengan gaya
   tipografi sebenarnya (judul memakai font display).
6. Notifikasi Sonner: "Teks berhasil disimpan", pesan error spesifik.
7. Keadaan loading (skeleton), kosong, dan error dirancang.
8. Responsif: sidebar kelompok menjadi select di mobile.

Backend:
- SiteTextController tipis, Form Request UpdateSiteTextRequest (validasi
  via registry: tipe, max, placeholder wajib), semua logika lewat CopyService.
- Setiap perubahan masuk activity_logs.

Tes:
- Superadmin dapat mengubah, mereset, dan memulihkan teks; halaman publik
  menampilkan teks baru setelah cache dihapus.
- Admin biasa tidak melihat menu dan mendapat 403 bila membuka URL.
- Teks tanpa placeholder wajib ditolak; teks terlalu panjang ditolak.
- Pencarian dan filter "Hanya yang diubah" bekerja.
```

---

## Prompt S4 — Mode Edit Langsung, Ekspor/Impor, dan Poles

```
PROMPT S4: Mode Edit Teks langsung di halaman, ekspor/impor, dan QA.

A. MODE EDIT TEKS (hanya superadmin)
1. Bila superadmin login dan membuka halaman publik, tampil tombol kecil
   melayang "Edit Teks" (pojok kiri bawah). Pengunjung lain, admin biasa,
   dan user TIDAK melihat tombol ini dan tidak menerima data pendukungnya
   (cek dilakukan di server; kirim prop canEditCopy hanya untuk superadmin).
2. Saat mode aktif: setiap teks yang berasal dari registry diberi garis putus
   halus saat disorot (hover), tanpa mengubah tata letak. Implementasi:
   t() dan <RichCopy> memberi atribut data-copy-key HANYA saat mode aktif.
   Klik pada teks → muncul popover kecil berisi input teks (sesuai tipe),
   penghitung karakter, tombol Simpan, Reset, dan tautan "Buka di pengelola".
3. Simpan memakai endpoint yang sama dengan S3 (satu jalur logika), teks
   diperbarui langsung di layar tanpa reload (Inertia partial reload).
4. Mode aktif tidak mengganggu klik normal pada tautan dan tombol bila
   pengguna menekan Esc atau mematikan mode.
5. Jangan memuat kode mode edit untuk pengunjung biasa (lazy import hanya
   bila canEditCopy = true) agar tidak menambah ukuran bundle.

B. EKSPOR / IMPOR (superadmin)
1. Tombol "Ekspor" menghasilkan JSON seluruh teks yang diubah (key, value,
   locale).
2. "Impor": unggah JSON → tampilkan pratinjau perbedaan (key, nilai lama,
   nilai baru, peringatan bila key tidak dikenal atau placeholder hilang) →
   konfirmasi → terapkan dalam satu transaksi dan catat revisi.
3. Berguna untuk memindahkan teks dari server uji ke produksi.

C. POLES & QA
1. Audit: jalankan copy:check, pastikan tidak ada teks tertanam yang
   tersisa pada halaman dalam cakupan (cari string literal berbahasa
   Indonesia di resources/js/Pages dan Components non-admin).
2. Performa: pastikan jumlah query tidak bertambah per halaman (cache
   bekerja), payload props `copy` hanya kelompok yang relevan, tidak ada
   layout shift.
3. Uji panjang teks ekstrem pada komponen (judul sangat panjang, teks
   kosong): tata letak tidak pecah; tambahkan batas max yang realistis di
   registry dan penanganan overflow (line-clamp/wrap).
4. Aksesibilitas: popover mode edit bisa dioperasikan keyboard, fokus
   kembali ke elemen semula.
5. Keamanan: coba injeksi <script> dan atribut berbahaya pada tipe text dan
   richtext; pastikan di-escape/disanitasi. Pastikan endpoint hanya bisa
   dipanggil superadmin (uji sebagai admin, user, guest).
6. Dokumentasi:
   - prd.md: tambahkan baris "Teks Website" (superadmin ✓, admin ✗) di
     tabel hak akses bagian 6 dan penjelasan dua jenis teks.
   - readme.md: bagian "Menambah teks baru": tambahkan entri di
     resources/copy/, pakai t('key'), jalankan copy:check.
   - CHANGELOG.md.
7. Jalankan pint, lint, typecheck, copy:check, dan seluruh tes.
```

---

## Prompt Cadangan

**Menambah teks baru di masa depan (untuk developer):**
```
Tambahkan teks baru untuk [bagian/halaman]: daftarkan di resources/copy/
[kelompok].php dengan key, label, hint lokasi, tipe, default, dan max;
gunakan t('key') di komponen; jalankan copy:check. Jangan menulis teks
langsung di komponen.
```

**Bila klien juga ingin admin bisa mengedit sebagian teks:**
```
Tambahkan kolom `editable_by` pada registry (superadmin | admin) per
KELOMPOK, bukan per teks. Beri izin admin hanya untuk kelompok yang
ditentukan; menu "Teks Website" untuk admin hanya menampilkan kelompok itu.
Policy dan tes disesuaikan. Jangan mengubah default: semua kelompok tetap
superadmin saja.
```

**Bila klien ingin dua bahasa (Indonesia & Inggris):**
```
Aktifkan locale 'en' pada site_texts. Dropdown "Bahasa" di header memilih
locale (simpan di cookie dan profil user). Registry menambahkan default
bahasa Inggris per key; teks yang belum diterjemahkan fallback ke Indonesia.
Tambahkan filter "Belum diterjemahkan" di menu Teks Website.
```
