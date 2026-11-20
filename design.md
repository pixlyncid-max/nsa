# Design System — NSA (Nusantara Sustainable Aquatic)

Panduan visual agar seluruh halaman web publik, CMS admin, dan Portal Anggota terasa satu keluarga yang kokoh dan berkarakter. Baca ini sebelum membuat atau mengubah komponen apa pun.

---

## 1. Karakter Desain

**Satu kalimat:** *Profesional seperti lembaga maritim terpercaya, tapi hangat dan membumi seperti ekosistem pembudidaya Nusantara.*

Kesan yang dituju: berwibawa, bersih, modern, berakar kuat pada perairan dan perikanan berkelanjutan Indonesia. Menolak tampilan "AI slop" atau "startup template generik".

### Ciri khas (signature) visual NSA
1. **Garis kontur air.** Pola garis topografi kedalaman laut/perairan (batimetri), dipakai sebagai tekstur halus berkelas di hero, banner portal, dan section bernuansa `navy`. Ini identitas visual utama organisasi.
2. **Pembatas ombak presisi.** Pemisah section halus berbentuk kurva ombak 1px, memisahkan ritme antar bagian secara alami.
3. **Fotografi otentik.** Kolam budidaya, tambak pesisir, perahu nelayan, tangan pembudidaya, dan aktivitas nyata budidaya ikan Indonesia. Tanpa ilustrasi 3D murahan, tanpa foto stok bule yang kaku.
4. **Tipografi editorial & angka besar.** Statistik dan judul dirancang bergaya majalah terbitan kurasi tinggi: angka sangat besar dengan label eyebrow tegas.
5. **Ritme asimetris.** Penataan layout menghindari grid 3-kartu seragam yang membosankan. Variasi ritme visual diterapkan konsisten.

### Yang DILARANG (anti-slop filter)
- Gradien ungu-pink, gradien pelangi, efek neon ultraviolet.
- Kartu seragam 3 kolom dengan lingkaran pastel di semua section.
- Glassmorphism berlebihan, bayangan tebal melayang, efek "glow" tidak fungsional.
- Emoji sebagai ikon UI (selalu gunakan Lucide icons).
- Kalimat AI klise ("Revolusi maritim", "Solusi mutakhir", "Tingkatkan potensi Anda tanpa batas").
- Pola repetitif tanpa kontras fungsional.

---

## 2. Warna

Sesuai arahan klien, palet warna **tetap konsisten memakai palet resmi design.md**. Latar halaman publik mayoritas **putih**. Warna brand digunakan untuk struktur dan aksen yang tegas.

### Palet Brand

| Token | Hex | Pemakaian |
|---|---|---|
| `navy` | `#014081` | Teks judul display, sidebar Portal & CMS, tombol primer, section kontras utama |
| `ocean` | `#056ED4` | Tautan interaktif, hover tombol, ring fokus input, indikator tab aktif |
| `sky` | `#27AAE1` | Aksen sekunder, ikon aktif, badge info, pill sorotan |
| `aqua` | `#3AD1F3` | Highlight aksen tipis, garis kontur air, aksen eyebrow di atas latar gelap |

### Warna Netral (Harmonisasi Turunan Navy)

| Token | Hex | Pemakaian |
|---|---|---|
| `white` | `#FFFFFF` | Latar halaman dan kartu isi |
| `mist` | `#F4F8FC` | Latar section selang-seling, input disabled, kartu sekunder |
| `line` | `#E1E9F2` | Garis border, pembatas kartu |
| `slate` | `#5B6B7F` | Teks pendukung, label keterangan, deskripsi sekunder |
| `ink` | `#0B1F36` | Teks isi utama (body copy), keterbacaan tinggi |

### Warna Status & Verifikasi

| Token | Hex | Pemakaian |
|---|---|---|
| `success` | `#1E9E5A` | Berhasil, terverifikasi (`approved`), langkah selesai |
| `warning` | `#E59A12` | Menunggu verifikasi (`pending_review`, `pending_approval`), revisi |
| `danger` | `#D64545` | Error validasi, penolakan (`rejected`), aksi destruktif |

---

## 3. Tipografi

| Peran | Font | Catatan |
|---|---|---|
| Judul (Display) | **Bricolage Grotesque** | Berkarakter kuat, lugas, sedikit humanis maritim |
| Teks Isi & UI | **Plus Jakarta Sans** | Ergonomis, mudah dibaca, akrab bagi pengguna Indonesia |

Muat lewat Google Fonts dengan parameter `display=swap`.

### Skala Tipografi
- **Display (Hero):** 72px desktop / 40px mobile (700 bold, line-height 1.02)
- **H1:** 48px / 32px (700 bold, line-height 1.08)
- **H2:** 36px / 26px (600 semibold, line-height 1.15)
- **H3:** 24px / 20px (600 semibold, line-height 1.25)
- **Body Large:** 18px / 17px (400 regular, line-height 1.65)
- **Body Normal:** 16px / 16px (400 regular, line-height 1.60)
- **Small:** 14px / 14px (500 medium, line-height 1.50)
- **Eyebrow:** 12px / 12px (700 bold, line-height 1.30, uppercase, letter-spacing +0.12em)
- **Statistik Besar:** 96px / 56px (700 bold, letter-spacing -0.04em)

Lebar paragraf teks isi maksimal **68 karakter** untuk menjaga kenyamanan membaca.

---

## 4. Tata Letak Dashboard & Portal Anggota

Portal dirancang khusus dengan dua tingkat: **Dashboard Sederhana (`/akun`)** untuk pengguna biasa non-membership dan **Dashboard Membership (`/anggota`)** untuk anggota resmi terverifikasi. Keduanya berbagi sistem tata letak terpadu yang konsisten:

### 4.1 Header Bersama (White Header)
- Tinggi tetap 72px, latar putih bersih (`#FFFFFF`), border bawah tipis `border-line`.
- **Kiri**: Slot logo resmi NSA (dengan placeholder wordmark NSA jika file logo belum diunggah) + tulisan penanda area **"Portal Anggota"**.
- **Kanan**: Tombol **"Ke Web Utama"** (ikon Home / ExternalLink) yang selalu mengarahkan pengguna kembali ke halaman depan publik (`/`), berdampingan dengan profil ringkas dan menu keluar.

### 4.2 Sidebar Kiri (Navigasi & Profil)
- Latar `navy` pekat (`#014081`) dengan ornamen garis kontur air halus di latar belakang.
- **Bagian Atas**: Kartu profil pengguna:
  - Avatar inisial bulat putih berhuruf `navy` tebal.
  - Nama pengguna lengkap.
  - Badge status keanggotaan (misal "Non-Anggota", "Calon Anggota" untuk status dalam proses, atau "Anggota Resmi").
- **Tengah (Menu)**:
  - Label kategori kapital (misal: "AREA AKUN" atau "MENU ANGGOTA").
  - Menu aktif berupa pil lonjong berlatar `ocean` (`#056ED4`) dengan teks putih dan bayangan halus `shadow-soft`.
  - Menu tidak aktif berwarna putih/80% dengan hover lembut `bg-white/10`.
- **Bawah**: Tombol bantuan atau tombol navigasi kembali ke web utama.

### 4.3 Banner Judul Konten Kanan (PageBanner)
Setiap halaman utama di area portal disambut oleh **Banner Judul Bergradien Biru Tua**:
- **Latar Gradien**: Dari `navy` (`#014081`) ke `ocean` (`#056ED4`) berpadu dengan aksen garis kontur tipis `aqua`.
- **Struktur Teks**:
  - **Eyebrow**: Huruf kapital kecil warna `aqua` (misal: `"PORTAL ANGGOTA NSA"` atau `"STATUS PENDAFTARAN"`).
  - **Judul Besar**: Display font Bricolage Grotesque putih tebal (misal: `"Selamat Datang, {Nama}"` atau `"Dasbor Keanggotaan"`).
  - **Subjudul / Keterangan**: Teks putih/85% ukuran 14–15px yang memberikan panduan langkah selanjutnya.
- **Kartu Isi (Content Cards)**: Berada tepat di bawah banner judul dengan latar putih, radius 16px (`rounded-card`), border `line`, dan bayangan `shadow-soft`.

---

## 5. Komponen Utama

### 5.1 Tombol (Button)
- **Sejajar Satu Baris**: `inline-flex shrink-0 flex-nowrap items-center justify-center gap-2 whitespace-nowrap leading-none`. Ikon berukuran tetap `18px` (`shrink-0`) agar label dan ikon tidak pernah membungkus atau bertumpuk pada wadah sempit.
- **Tinggi Tetap**: `sm` `40px`, `md` `44px`, `lg` `48px`, radius `10px` (`rounded-control`).
- **Primary**: Latar `navy`, teks putih, hover `ocean`.
- **Secondary**: Border `navy` 1.5px, teks `navy`, latar putih, hover latar `mist`.
- **Ghost**: Tanpa border, teks `ocean`, hover garis bawah.
- **Danger**: Latar `danger`, teks putih, digunakan khusus pembatalan atau penolakan.

### 5.4 Footer & Strip Ajakan di Atas Footer
- **Footer (`Footer.tsx`)**: Berlatar `navy` (`#014081`) dengan kontur putih halus, tanpa kartu ajakan bergabung di dalamnya. Berisi 3 kolom (logo + deskripsi, Navigasi & Organisasi, Kontak Sekretariat) serta baris hak cipta & tautan sosial.
- **Strip Ajakan (`FooterJoinStrip.tsx`) & Pembungkus (`FooterShell.tsx`)**:
  - Pita lebar penuh berlatar `ocean` (`#056ED4`) dengan kontur putih 10%, menempel langsung di atas Footer tanpa celah.
  - Satu `WaveDivider` tipis di tepi atas `FooterShell` (mengisi `ocean` bila strip tampil, atau `navy` bila strip tidak tampil).
  - Desktop (`>=768px`): satu baris sejajar (`items-center`, `py-7`), kiri kotak ikon `40px` + blok teks putih (tanpa warna `aqua` di atas `ocean`), kanan tombol putih `48px` satu baris (`shrink-0`). Mobile (`<768px`): teks di atas, tombol penuh di bawah.
  - **Aturan Tampil** (`config/join_strip.php`, diputuskan di server lewat prop Inertia `joinStrip`): tampil di halaman web utama (`PublicLayout`) hanya untuk `guest`, `non_member`, dan `draft`. Tidak tampil untuk `approved`, status pasca-kirim (`pending_review`, `revision`, `awaiting_payment`, `pending_approval`, `rejected`), staf, maupun area `/admin`, `/akun`, `/anggota`, wizard, dan login/daftar.

### 5.2 Formulir Input & Stepper Pendaftaran
- Tinggi input 44px, border `line`, latar putih, radius 10px.
- Status fokus: Ring 3px warna `ocean/15%` + border `ocean`.
- **Stepper 9 Langkah**:
  - Desktop: 9 lingkaran indikator bernomor di atas, dihubungkan garis progres. Langkah selesai bertanda centang hijau `success`, langkah aktif berlingkar `ocean`, langkah mendatang abu-abu `line`.
  - Mobile (≤640px): Teks indikator ringkas "Langkah X dari 9" dengan baris progres tipis.

### 5.3 Kartu & Ringkasan Data (SummaryRow)
- Baris metrik dan data penting disajikan menggunakan kartu putih bersih dengan divider tipis `border-line`.
- Penegasan status menggunakan badge warna semantik:
  - Non-Member: Netral / Slate
  - Draft: Sky
  - Menunggu Verifikasi Awal / Persetujuan: Warning
  - Perlu Revisi: Warning / Sky
  - Disetujui (Approved): Success
  - Ditolak: Danger

---

## 6. Gaya Penulisan (Copywriting)

- Menggunakan Bahasa Indonesia lugas, terstruktur, dan bersahabat bagi komunitas perikanan.
- Hindari kata-kata kosong berbunga-bunga khas AI (misal: "buka potensi tanpa batas", "revolusi ekosistem masa depan").
- Tombol tindakan ditulis langsung: "Daftar Anggota", "Bayar Sekarang", "Perbaiki Berkas", "Lihat Program NSA".
- Pesan kesalahan dan instruksi formulir harus instruktif dan membantu pengguna menyelesaikan tugas.

---

## 7. Aksesibilitas & Performa

- Kontras teks rasio minimal 4.5:1 (WCAG AA).
- Seluruh kontrol interaktif memiliki target tap minimal 44×44px.
- Indikator fokus keyboard (`focus:ring-ocean`) tampak jelas di semua link dan tombol.
- Mendukung mode hemat daya & gerak berkurang (`prefers-reduced-motion` mematikan semua animasi non-kritis).
- Responsif optimal dari resolusi mobile terkecil (360px), tablet (768px), hingga monitor desktop lebar (1440px+).

---

## 8. Layout Garis Pantai (Signature Layout System)

Arah desain **Garis Pantai** adalah sistem tata letak editorial maritim yang menolak tampilan kartu AI generik. Mengambil inspirasi dari garis kontur pantai Nusantara yang organik namun presisi, Garis Pantai mengedepankan:

### 8.1 Bab Bernomor & Garis Pembatas Halus
- Setiap bagian besar ditandai dengan nomor indeks bab berformat dua digit (misal: `01`, `02`, `03`) diikuti label kategori kapital.
- Pemisah section berupa garis horizontal tipis (`border-line` pada latar terang, `border-white/15` pada latar gelap) dengan nomor bab mengambang rapi di kiri atas.
- Ritme spasi vertikal konsisten: `py-16 md:py-24 lg:py-28`.

### 8.2 Grid Asimetris (Anti-Template 3-Kartu)
Struktur konten memecah kebiasaan AI yang monoton (3 kolom identik) dengan proporsi grid 12 kolom dinamis:
- **Pola 5 / 7**: 5 kolom judul dan narasi pengantar editorial di kiri, 7 kolom media sorotan, statistik, atau kartu aksi di kanan.
- **Pola 4 / 8**: 4 kolom indeks samping atau rangkuman metrik statis, 8 kolom eksplorasi konten bertingkat.
- **Pola 3 / 9**: 3 kolom `StickyIndex` di sisi kiri yang menempel, 9 kolom tubuh materi dan galeri aktivitas.

### 8.3 Bentuk Foto Beragam (Image Shapes)
Menghadirkan karakter arsitektur maritim melalui variasi bingkai foto tanpa mengorbankan performa:
- **Lengkung Atas (`ArchImage`)**: Bagian atas melengkung anggun (`rounded-t-[80px] sm:rounded-t-[120px] rounded-b-xl`), merepresentasikan lengkungan gerbang dok kapal dan kubah mercusuar.
- **Tegak Portrait (`tall`)**: Rasio aspek 3:4 atau 4:5 dengan sudut membulat `rounded-2xl` untuk dokumentasi figur nelayan dan fasilitas budidaya.
- **Lingkaran (`circle`)**: Rasio aspek 1:1 (`rounded-full`) dengan border tipis `border-line` untuk foto pengurus dan profil anggota.
- **Zero CLS**: Seluruh komponen foto wajib menyertakan rasio aspek tetap (`aspect-[4/5]`, `aspect-square`, dll.) dan dimensi eksplisit sehingga tidak terjadi layout shift saat memuat gambar.

### 8.4 Indeks Samping Menempel (StickyIndex)
- Indeks bab vertikal di sisi kiri halaman panjang yang menempel rapi selama pengguna menggulir.
- Posisi lengket terikat dinamis pada tinggi header aktual: `top: calc(var(--header-h, 72px) + 24px)`.
- Dilengkapi scrollspy berbasis `IntersectionObserver` untuk menyorot bab aktif secara halus tanpa lonjakan kinerja.

### 8.5 Ritme Section
- Pergantian nada latar teratur: `white` (bersih), `mist` (teduh selang-seling), dan `navy` (kontras berwibawa sesekali pada hero, banner penutup, atau footer).
- Palet brand dan tipografi tetap mengikat penuh: Bricolage Grotesque untuk judul display dan Plus Jakarta Sans untuk teks isi.


---

## 9. Pedoman UI Multi Bahasa (Indonesia & Inggris)

### 9.1 Pemilih Bahasa (`LanguageSwitcher`)
- **Komposisi**: Tombol satu baris (`h-10`, `whitespace-nowrap`, `shrink-0`) menampilkan ikon `Globe`, kode bahasa aktif (`ID` / `EN`), dan ikon panah dropdown.
- **Penempatan**: Navbar desktop, header `MobileDrawer`, dan header `PortalLayout`.
- **Aksesibilitas**: Mendukung navigasi keyboard (`Enter`, `Space`, `Escape`), atribut `aria-expanded`, `aria-haspopup="menu"`, dan `menuitemradio` dengan tanda centang pada bahasa aktif.
- **Navigasi**: Menyimpan cookie `locale` (1 tahun) serta `users.locale` bila login, lalu berpindah ke URL padanan (`alternates`) dengan mempertahankan query string dan hash.

### 9.2 Aturan Panjang Teks Inggris
- Teks Bahasa Inggris rata-rata 20–30% lebih panjang daripada Bahasa Indonesia.
- **Batas Karakter**: Registry teks (`CopyRegistry::maxFor`) otomatis memberi kelonggaran +30% untuk locale `en` (atau memakai nilai eksplisit `max_en`).
- **Anti-Wrap Tombol**: Seluruh `Button` wajib menggunakan `inline-flex items-center justify-center flex-nowrap whitespace-nowrap shrink-0` agar label tombol (termasuk *"Join Membership"* / *"Daftar Anggota"*) tidak pernah membungkus ke dua baris pada 360px, 768px, 1024px, maupun 1280px.
- **Navbar 1024px**: Tautan menu menggunakan padding dan ukuran adaptif (`px-2 xl:px-3 text-xs xl:text-sm`) agar seluruh item menu dan pemilih bahasa tetap muat satu baris.


---

## 10. Ukuran Logo & Aturan Footer (`BrandLogo`)

- **Sumber & File Turunan**: Seluruh varian dihasilkan via `npm run images:logo` ke `public/images/brand/` (`1x/2x/3x` WebP & PNG) dan dibaca melalui `resources/js/generated/brand-logo.json`. Komponen tidak boleh mereferensikan path folder berspasi secara langsung.
- **Ukuran Tampil**:
  - **Navbar desktop**: `40px` tinggi, mengecil halus ke `34px` (`transition-[height] duration-200`) saat halaman digulir (`scrolled`).
  - **Navbar mobile & Drawer mobile**: `32px` tinggi (`shrink-0`, tidak pernah diperas di bawah `32px`).
  - **Footer (latar navy `#014081`)**: `44px` tinggi.
- **Aturan Kontras Footer (`footerMode`)**:
  - `mono-white` (otomatis untuk logo transparan bernada gelap): menghasilkan varian putih monokrom (`logo-footer-white@1x/2x/3x`) dengan mempertahankan kanal alpha agar kontras jelas di atas `#014081`.
  - `white-badge`: bila logo berlatar solid, ditampilkan di dalam lencana putih (`rounded-[12px]`, padding `10–12px`).
  - `original`: bila logo sudah terang atau tersedia file khusus `Logo NSA putih.svg/.png`.
- **Wordmark & Fallback**: Karena logo NSA sudah memuat emblem dan tulisan *Nusantara Sustainable Aquatic*, tidak boleh menambah teks di samping logo. Jika file turunan tidak tersedia, tampilkan wordmark teks `brand.short_name` (`font-display` tebal, navy di navbar, putih di footer).
