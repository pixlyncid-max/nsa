# CHANGELOG — NSA (Nusantara Sustainable Aquatic)

Semua perubahan penting pada proyek ini dicatat secara terstruktur pada dokumen ini.

---

### Revisi Banner Membership: Muncul Lagi Setiap Pindah Halaman

- Memperbarui perilaku penutupan [MembershipPromoBar.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/MembershipPromoBar.tsx) melalui hook baru [useDismissUntilNavigation.ts](file:///c:/xampp/htdocs/ifaa-app/resources/js/hooks/useDismissUntilNavigation.ts) yang dikelola di [PublicLayout.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Layouts/PublicLayout.tsx): tombol X hanya menutup banner untuk halaman aktif (pathname yang sama) dan otomatis muncul lagi saat berpindah halaman (klik tautan/menu, Back/Forward, refresh penuh, atau status keanggotaan berubah), sementara perubahan hash, query/filter, dan aksi di halaman yang sama tetap menjaganya tersembunyi.
- Menghapus penulisan `localStorage`/cookie 7 hari dan `sessionStorage` pada mode bawaan (`DISMISS_SCOPE = 'navigation'` di [membershipPromo.ts](file:///c:/xampp/htdocs/ifaa-app/resources/js/lib/membershipPromo.ts), dengan opsi cadangan `'session'` dan `'days:7'`), serta menambahkan pembersihan sekali jalan `clearLegacyPromoDismissStorage()` untuk kunci lama.
- Mengembalikan fokus keyboard ke `#konten` setelah banner ditutup dengan tombol X (`44×44px`).

---

### Perapihan Tombol, Hero Beranda Baru, Strip Ajakan di Atas Footer, & Penghapusan CTA Besar Beranda

- **Tombol Satu Baris (`Button.tsx` & `Navbar.tsx`)**: Menetapkan `inline-flex shrink-0 flex-nowrap whitespace-nowrap leading-none`, tinggi tetap (`sm 40px`, `md 44px`, `lg 48px`), dan ikon tetap `18px` (`shrink-0`) di [Button.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/ui/Button.tsx); menyelaraskan tombol Navbar lewat [membershipCta.ts](file:///c:/xampp/htdocs/ifaa-app/resources/js/lib/membershipCta.ts) dan menyesuaikan jarak lebar `1024–1279px` di [Navbar.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/Navbar.tsx).
- **Footer & Strip Ajakan (`FooterShell.tsx`, `FooterJoinStrip.tsx`)**: Menghapus kartu ajakan gabung dari dalam [Footer.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/Footer.tsx), memindahkannya ke strip satu baris berlatar `ocean` ([FooterJoinStrip.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/FooterJoinStrip.tsx)) yang menempel langsung pada Footer dengan satu `WaveDivider` dinamis di [FooterShell.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/FooterShell.tsx). Aturan tampil dikonfigurasi di [config/join_strip.php](file:///c:/xampp/htdocs/ifaa-app/config/join_strip.php) dan diputuskan di server lewat prop Inertia `joinStrip` (tampil hanya untuk `guest`, `non_member`, dan `draft` pada halaman publik).
- **Penghapusan CTA Besar Beranda**: Menghapus `FinalCtaSection.tsx` dari [Home.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Public/Home.tsx) dan merapikan transisi bawah [StoriesPartnersSection.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Public/Home/sections/StoriesPartnersSection.tsx).
- **Hero Beranda**: Memperbarui [HeroSection.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Public/Home/sections/HeroSection.tsx) mengikuti komposisi banner referensi dengan palet biru NSA, gelombang 3 lapis ([WaveDivider.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/motion/WaveDivider.tsx)), slot gambar AVIF/WebP ([config/hero.php](file:///c:/xampp/htdocs/ifaa-app/config/hero.php)), skrip `npm run images:hero`, dan key teks `home.hero.*`.

---

### Prompt S1–S4: Fitur "Teks Website" Khusus Superadmin

#### 1. Pondasi Copy Registry, Cache, & Hak Akses (`PROMPT S1`)
- Menambahkan 14 file registry teks di `resources/copy/` (`global`, `home`, `organization`, `products`, `cart`, `about`, `partnership`, `articles`, `contact`, `auth`, `account`, `member`, `registration`, `emails`) dengan validasi skema di [CopyRegistry.php](file:///c:/xampp/htdocs/ifaa-app/app/Support/Copy/CopyRegistry.php).
- Menambahkan migrasi `site_texts` dan `site_text_revisions`, model `SiteText` & `SiteTextRevision`, factory, [HtmlSanitizer.php](file:///c:/xampp/htdocs/ifaa-app/app/Support/Copy/HtmlSanitizer.php), dan [CopyService.php](file:///c:/xampp/htdocs/ifaa-app/app/Services/CopyService.php) (cache `rememberForever` per kelompok, pencatatan revisi, pemulihan versi, reset default, dan `activity_logs`).
- Menambahkan pemetaan route [config/copy_routes.php](file:///c:/xampp/htdocs/ifaa-app/config/copy_routes.php) agar [HandleInertiaRequests.php](file:///c:/xampp/htdocs/ifaa-app/app/Http/Middleware/HandleInertiaRequests.php) hanya mengirim kelompok `global` + kelompok halaman aktif, serta hook frontend [useCopy.ts](file:///c:/xampp/htdocs/ifaa-app/resources/js/hooks/useCopy.ts) dan [RichCopy.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/ui/RichCopy.tsx).
- Menambahkan [SiteTextPolicy.php](file:///c:/xampp/htdocs/ifaa-app/app/Policies/SiteTextPolicy.php), grup rute `/admin/teks-website` khusus `role:superadmin` (role `Admin` tetap tidak berubah dan mendapat `403`), serta perintah Artisan `php artisan copy:check` dan `php artisan copy:seed`.

#### 2. Migrasi Teks Kelompok `global` (`PROMPT S2`)
- Memindahkan seluruh teks tertanam pada `PublicLayout`, `Navbar`, `MobileDrawer`, `ProductMegaMenu`, `UserDropdown`, `CartButton`, `Footer`, `MembershipPromoBar`, `membershipPromo.ts`, dan `membershipCta.ts` ke [resources/copy/global.php](file:///c:/xampp/htdocs/ifaa-app/resources/copy/global.php) (86 key) dengan tampilan bawaan identik.

#### 3. Halaman Pengelolaan Teks Superadmin (`PROMPT S3`)
- Membangun antarmuka pengelolaan dua kolom di `/admin/teks-website` ([Index.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Admin/SiteTexts/Index.tsx), [SiteTextField.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/admin/site-texts/SiteTextField.tsx), [SimpleRichTextEditor.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/admin/site-texts/SimpleRichTextEditor.tsx), [RevisionDrawer.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/admin/site-texts/RevisionDrawer.tsx)) lengkap dengan pencarian global, filter `Hanya yang diubah`, validasi batas `max` & placeholder wajib via `UpdateSiteTextRequest` / `BulkUpdateSiteTextRequest`, simpan per kolom & simpan massal, pratinjau tipografi, reset dengan konfirmasi, laci riwayat revisi, dan konfirmasi tinggalkan halaman.

#### 4. Mode Edit Langsung di Halaman, Ekspor/Impor JSON, & QA (`PROMPT S4`)
- Menambahkan prop `canEditCopy` khusus Superadmin dan komponen *lazy-loaded* [InlineCopyEditor.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/admin/site-texts/InlineCopyEditor.tsx) (tombol melayang pojok kiri bawah, garis putus hover `data-copy-key` tanpa pergeseran layout, popover aksesibel dengan simpan via endpoint S3 + *partial reload* `copy`, reset, dan tautan ke pengelola).
- Menambahkan ekspor JSON (`/admin/teks-website/ekspor`) dan impor JSON berpemandu pratinjau perbedaan (`/admin/teks-website/impor/pratinjau` & `/admin/teks-website/impor/terapkan`) dalam satu transaksi database melalui [ImportSiteTextsModal.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/admin/site-texts/ImportSiteTextsModal.tsx).
- Memperbarui dokumentasi [prd.md](file:///c:/xampp/htdocs/ifaa-app/prd.md) & [readme.md](file:///c:/xampp/htdocs/ifaa-app/readme.md) serta melengkapi rangkaian tes fitur pada `SiteTextFoundationTest`, `SiteTextManagementTest`, dan `SiteTextInlineAndImportExportTest`.

---

### Prompt L & R0–R8: Penyelarasan Login ke Beranda & Redesain Sistem Layout "Garis Pantai"

#### 1. Penyelarasan Redirect Setelah Login (`PROMPT L`)
- Memperbarui [ResolveHomeRoute.php](file:///c:/xampp/htdocs/ifaa-app/app/Actions/ResolveHomeRoute.php) berbasis [config/auth_redirect.php](file:///c:/xampp/htdocs/ifaa-app/config/auth_redirect.php): `admin` / `superadmin` diarahkan ke `/admin`, sedangkan seluruh `role: user` (termasuk status disetujui) diarahkan ke beranda (`/`), sambil tetap menghormati *intended URL*.
- Menambahkan item navigasi *"Dashboard"* pada dropdown akun navbar untuk membuka `/akun` atau `/anggota`, serta toast sambutan Sonner setelah login berhasil.

#### 2. Sistem Layout Global "Garis Pantai" (`PROMPT R0`)
- Memperbarui [design.md](file:///c:/xampp/htdocs/ifaa-app/design.md) dengan panduan **Layout Garis Pantai** (bab bernomor, grid asimetris 5/7, 4/8, 3/9, variasi bentuk foto lengkung/tegak/lingkaran, indeks samping menempel, dan ritme section).
- Menambahkan primitif baru di `resources/js/Components/layout/`: `Section`, `SectionHeading`, `PageHeader`, `StickyIndex`, `ArchImage`, `ImageMask` (lengkap dengan `srcSet`, `sizes`, dan dimensi eksplisit), serta `Marquee`.
- Merancang ulang `Navbar` (mega-menu Produk 3 kolom, dropdown Organisasi, drawer layar penuh mobile bernomor) dan `Footer` (latar `navy` kontur halus, pembatas `WaveDivider`, baris ajakan dinamis lewat `resolveMembershipCta`).

#### 3. Redesain Halaman Publik Utama (`PROMPT R1 – R7`)
- **Beranda (`R1`)**: Memecah halaman ke 8 bab modular di `resources/js/Pages/Public/Home/sections/` (Hero kolase `ArchImage` + Marquee statistik, Peta Sebaran Indonesia tembus kontainer + Fakta Perikanan, Berita majalah + rel tanggal, Jelajah Produk *accordion hover* 3 panel, satu bab kontras navy Kenapa Bergabung + pratinjau KTA, Teaser Program Kerja, Cerita Anggota + Marquee Mitra, serta Penutup `WaveDivider`).
- **Organisasi (`R2`)**: Struktur bersama `OrganizationLayout` dengan segmen menempel `DPP | DPW | DPC`. DPP menampilkan bagan garis penghubung tergambar via `anime.js`; DPW menghadirkan kolom kiri menempel (peta mini + pencarian provinsi) dengan transisi geser kanan dan keadaan kosong; DPC menerapkan alur bertingkat *Provinsi (abjad) → Kabupaten/Kota (chip berpencarian) → Hasil*.
- **Produk, Keranjang & Checkout (`R3`)**: Header tiga kelompok berfoto yang melebar menampilkan sub-kategori, sidebar filter menempel / *bottom sheet* mobile dengan chip ringkasan filter aktif, tombol tambah cepat ke `CartDrawer` disertai denyut `CartButton`, detail produk 2 kolom (*lazy-loaded* `ProductGallerySwiper` + miniatur) adaptif untuk 4 `ProductType`, daftar baris bersih keranjang + bilah ringkasan menempel di mobile, serta stepper 3 langkah checkout bergaya selaras wizard pendaftaran.
- **Tentang Kami (`R4`)**: Halaman 6 bab panjang dengan `PageHeader` berfoto, `StickyIndex` *scrollspy* di kiri (menjadi tab geser di bawah header pada mobile), garis waktu horizontal *lazy-loaded* (`HistoryTimelineSwiper`), satu bab kontras navy Visi & Misi, *accordion* Program Kerja publik yang dapat diakses keyboard, 4 Nilai tanpa ikon lingkaran, daftar bergaris Legalitas dengan dialog pratinjau, serta potret Tim lengkung & tegak.
- **Kemitraan (`R5`)**: `PageHeader` pernyataan satu kalimat, 3 langkah skema (*Ajukan → Seleksi → Kerja Sama*) terhubung garis ombak `anime.js`, dinding logo mitra berfilter jenis (*Pemerintah, Swasta, Akademisi, Komunitas*) + dialog detail, daftar manfaat dua kolom bergaris, serta panel formulir menempel di kanan bervalidasi Zod + honeypot + rate limit.
- **Artikel & Berita (`R6`)**: Artikel utama besar di atas daftar bergaya baris editorial dengan sorotan berkala, chip kategori geser, detail artikel berkolom baca `68ch` (`RichText` sanitasi XSS + `aspect-[16/9]` gambar + kutipan garis samping `aqua`), bilah progres baca, daftar isi otomatis dengan *scrollspy*, rel bagikan menempel, 3 baris artikel terkait, serta ajakan keanggotaan.
- **Kontak (`R7`)**: Layar terbagi panel kiri `navy` (info sekretariat, jalur cepat WhatsApp & salin email, tautan sosial, peta Leaflet `ContactLocationMap` berpenanda kustom) dan panel kanan putih formulir berpenghitung 3.000 karakter + Zod, diikuti 5 FAQ dari CMS `pages` (atau baku `ContactController::defaultFaqs()`) dalam *accordion* berpencarian dan akses keyboard.

#### 4. Audit Akhir, Kualitas Kode & Performa (`PROMPT R8`)
- Audit anti-slop (`design.md` Bagian 1 & 11): menghapus gradien dekoratif dan efek blur berlebih di `PageHeader`, `MapSection`, `FinalCtaSection`, `WhyJoinSection`, dan `MemberVerification`, memastikan maksimal satu bab kontras `navy` per halaman dan `aqua` khusus sebagai aksen/garis penanda, serta menyelaraskan `Program/Show.tsx` dan `Checkout/Success.tsx` memakai primitif R0 + `RichText`.
- Performa & Aksesibilitas: menambahkan dukungan `srcSet` & `sizes` pada `ImageMask`, memisahkan bundel `Swiper` lewat `React.lazy` + `Suspense` (berpenahan rasio tetap), memastikan seluruh elemen menempel memakai `--header-h`, serta menghormati `prefers-reduced-motion`.
- Kebersihan kode penuh: memperbaiki seluruh error TypeScript dan ESLint (`npm run typecheck`, `npm run lint`), menjalankan Laravel Pint (`./vendor/bin/pint`), kompilasi produksi `npm run build`, dan memastikan seluruh rangkaian uji `php artisan test` lulus 100%.

---

### Prompt Revisi: Banner Membership Tetap Menempel (Sticky) & Dinamis Header

#### 1. Perilaku Sticky Terpadu (`<header class="sticky top-0 z-50">`)
- Menggabungkan `Navbar` dan `MembershipPromoBar` ke dalam satu wadah `<header ref={headerRef} className="sticky top-0 z-50 w-full bg-white transition-shadow duration-200">` di [PublicLayout.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Layouts/PublicLayout.tsx).
- Menghapus perilaku lama auto-scroll hilang: banner tetap menempel bersama navbar di atas layar selama di-scroll dan berpindah halaman publik tanpa berkedip (persisten).
- Satu-satunya cara menutup banner adalah menekan tombol X.

#### 2. Tinggi Header Dinamis via ResizeObserver & CSS Variable `--header-h`
- Mengukur tinggi header aktual menggunakan `ResizeObserver` dan menyimpannya secara dinamis pada CSS variable `--header-h` di elemen `<html>`.
- Menggunakan `--header-h` untuk:
  - `html { scroll-padding-top: calc(var(--header-h, 72px) + 16px); }` pada [resources/css/app.css](file:///c:/xampp/htdocs/ifaa-app/resources/css/app.css) agar tautan anchor `#section` dan `#konten` tidak tertutup header.
  - Elemen sticky lain di halaman seperti filter produk ([Product/Index.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Public/Product/Index.tsx)) dan ringkasan keranjang/checkout ([Cart/Index.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Public/Cart/Index.tsx), [Checkout/Index.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Public/Checkout/Index.tsx)) memakai `top: calc(var(--header-h, 72px) + 16px)`.
- Animasi penutupan banner menggunakan Framer Motion mengikis tinggi dan opasitas ke 0 secara mulus (langsung hilang seketika jika `prefers-reduced-motion` aktif), dengan `ResizeObserver` memperbarui `--header-h` secara kontinu tanpa layout shift.

#### 3. Tampilan Ringkas & Stacking Context
- Desktop 44–48px satu baris, mobile maksimal 2 baris dengan teks 13px; total tinggi navbar + banner di mobile terjaga di bawah 120px.
- Saat di-scroll melewati ambang scroll, navbar mengecil secara halus dari 72px ke 60px dan bayangan halus (`shadow-soft`) muncul di bawah wadah header.
- Latar `mist` solid dengan garis bawah `line`, memastikan teks selalu kontras dan terbaca di atas konten apa pun.
- Hierarki Z-Index rapi: Wadah header di `z-50`, semua Drawer ([MobileDrawer](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/MobileDrawer.tsx), [CartDrawer](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/CartDrawer.tsx), [AddressDrawer](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/AddressDrawer.tsx), [OrdersDrawer](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/OrdersDrawer.tsx), [ProfileDrawer](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/ProfileDrawer.tsx)) dan [Modal](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/ui/Modal.tsx) di `z-[60]` sehingga menu mobile dan modal menutupi banner sepenuhnya.
- Tombol X memiliki tap target 44x44px di mobile, `aria-label="Tutup notifikasi"`, dan mendukung navigasi keyboard (Tab, Enter/Space, serta tombol Escape saat fokus).

#### 4. Logika Penyimpanan Dismiss & Akses Alternatif
- Penutupan banner disimpan dengan aman (`try/catch`):
  - `non_member`: 7 hari di `localStorage` + cookie.
  - Status lain: disimpan di `sessionStorage` dengan menyertakan nilai status (`nsa_promo_dismissed_<status>`); otomatis muncul kembali jika status keanggotaan berubah (misal dari `pending_review` ke `awaiting_payment`).
- Navigasi akun tetap menyediakan akses kembali ke pendaftaran via menu akun navbar ([UserDropdown.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/UserDropdown.tsx) & [MobileDrawer.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/MobileDrawer.tsx)) dengan item adaptif *"Gabung Jadi Anggota"* atau *"Lanjutkan Pendaftaran"*, serta CTA Beranda.

---

### Prompt Revisi: Alur Redirect Setelah Sign Up ke Beranda + Banner Ajakan Membership

#### 1. Alur Redirect Autentikasi Terpusat (`ResolveHomeRoute`)
- Memperbarui Action [ResolveHomeRoute.php](file:///c:/xampp/htdocs/ifaa-app/app/Actions/ResolveHomeRoute.php) untuk membedakan sumber autentikasi:
  - **Setelah SIGN UP** (`source = 'signup'`): diarahkan ke Beranda Utama (`"/"` / `route('home')`) dengan notifikasi toast Sonner sekali tampil: *"Akun berhasil dibuat. Selamat datang di NSA."*
  - **Setelah LOGIN**:
    - Admin / Superadmin → `/admin`
    - Anggota Resmi Approved → `/anggota`
    - Pengguna Biasa lainnya (non_member, draft, in-process) → `/akun` (Dashboard sederhana, tidak berubah).
  - **Akses Rute Tamu (`/login` & `/register`)**: Pengguna yang sudah login yang mencoba membuka halaman tamu otomatis dialihkan sesuai aturan LOGIN terpusat via konfigurasi `$middleware->redirectUsersTo(...)` di `bootstrap/app.php`.
- Mengirim surel sambutan [WelcomeUserMail.php](file:///c:/xampp/htdocs/ifaa-app/app/Mail/WelcomeUserMail.php) dengan tombol aksi *"Daftar Jadi Anggota"*.

#### 2. Banner Notifikasi Ajakan Keanggotaan (`MembershipPromoBar`)
- Menambahkan komponen [MembershipPromoBar.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/layout/MembershipPromoBar.tsx) tepat di bawah navbar pada [PublicLayout.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Layouts/PublicLayout.tsx) (tampil di semua halaman publik).
- Aturan tampil dan konfigurasi teks diisolasi sebagai fungsi murni pada [resources/js/lib/membershipPromo.ts](file:///c:/xampp/htdocs/ifaa-app/resources/js/lib/membershipPromo.ts):
  - Tampil hanya bagi pengguna login dengan `role: user` dan status selain `approved`.
  - Teks adaptif sesuai status:
    - `non_member`: *"Gabung jadi anggota NSA dan nikmati manfaatnya."* (Tombol: *"Daftar Sekarang"* → `/akun/keanggotaan/daftar`).
    - `draft`: *"Pendaftaran Anda belum selesai (langkah X dari 9)."* (Tombol: *"Lanjutkan"* → `/akun/keanggotaan/daftar`).
    - `pending_review`: *"Pendaftaran sedang diverifikasi admin."* (Tombol: *"Lihat Status"* → `/akun/keanggotaan/status`).
    - `revision`: *"Ada data yang perlu diperbaiki."* (Tombol: *"Perbaiki Data"* → `/akun/keanggotaan/status`, status penting dengan badge).
    - `awaiting_payment`: *"Pendaftaran lolos verifikasi. Selesaikan pembayaran."* (Tombol: *"Bayar Sekarang"* → `/akun/keanggotaan/status`, status penting dengan badge).
    - `pending_approval`: *"Pembayaran diterima, menunggu persetujuan admin."* (Tombol: *"Lihat Status"* → `/akun/keanggotaan/status`).
    - `rejected`: *"Pendaftaran belum dapat disetujui."* (Tombol: *"Lihat Alasan"* → `/akun/keanggotaan/status`, status penting dengan badge).
  - Mekanisme Tutup (*Dismiss*):
    - Status `non_member`: penutupan disimpan 7 hari (cookie + localStorage).
    - Status lain: penutupan hanya berlaku untuk sesi berjalan (sessionStorage) dan akan muncul kembali secara otomatis jika status pendaftaran berubah.
  - Tamu (*guest*), staf admin, dan halaman `/admin` serta `/akun/keanggotaan/daftar` dikecualikan dari rendering banner.
- Data dikirimkan secara hemat melalui shared props Inertia `membershipPromo` pada [HandleInertiaRequests.php](file:///c:/xampp/htdocs/ifaa-app/app/Http/Middleware/HandleInertiaRequests.php).

#### 3. Tampilan & Desain Editorial
- Latar `mist` dengan border bawah `sand/line`, tinggi ~48px pada desktop, teks 14px navy, dan tombol aksi terjangkau (tap target >= 44px di mobile).
- Animasi transisi tinggi turun halus (*smooth drop-down*) menggunakan Framer Motion dengan memperhatikan `prefers-reduced-motion`.
- Navbar tetap sticky menempel di atas layar, sementara banner ikut ter-scroll hilang bersama konten halaman.

#### 4. Penyesuaian Bagian Ajakan Beranda (CTA Akhir)
- Memperbarui [FinalCtaSection.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Components/sections/home/FinalCtaSection.tsx) di Beranda agar teks, judul, dan tombol aksi CTA bersumber dari konfigurasi yang sama dengan banner promo, memastikan tidak ada duplikasi pesan yang kontradiktif.

#### 5. Pengujian & Dokumentasi
- Menambahkan test suite [SignUpHomeRedirectAndPromoBarTest.php](file:///c:/xampp/htdocs/ifaa-app/tests/Feature/SignUpHomeRedirectAndPromoBarTest.php) (4 skenario komprehensif, 87 assertions).
- Memperbarui dokumentasi alur sistem pada [prd.md](file:///c:/xampp/htdocs/ifaa-app/prd.md) dan [prompts-revisi-nsa.md](file:///c:/xampp/htdocs/ifaa-app/prompts-revisi-nsa.md).

---

### Prompt 10: Penyesuaian Statistik, Pembersihan Kode Legacy, Master Keanggotaan & Finishing

#### 1. Penyesuaian Agregasi Statistik Beranda (`StatisticService`)
- Memperbarui `StatisticService.php` agar sumber data anggota resmi disetujui (`approved`) bersumber langsung dari arsitektur data baru:
  - Wilayah budidaya/usaha diambil dari `member_locations` (prioritas `kind = 'business'`, kemudian `kind = 'domicile'`), dengan fallback ke data legacy `member_businesses`.
  - Pemetaan kategori ikan budidaya bersumber dari relasi `member_fish_activities` (berdasarkan `fish_category_id`), dengan fallback ke `member_commodities` demi backward compatibility data seeder.
  - Daftar anggota terbaru (`getLatestMembers`) mengambil nama usaha dari `member_businesses` multi-unit atau `institution_name` lembaga, serta kota/kabupaten dari `member_locations`.
  - Pembersihan cache otomatis `StatisticService::clearCache()` berjalan saat verifikator menyetujui pemohon (`ApproveMember` action).

#### 2. Pembersihan Kode Legacy
- Menghapus komponen langkah formulir lama yang tidak terpakai:
  - Menghapus komponen usang di `resources/js/Pages/Member/Register/Steps/`: `Step1Account.tsx`, `Step2Personal.tsx`, `Step3Business.tsx`, `Step4Document.tsx`, `Step7Membership.tsx`.
  - Menghapus folder `resources/js/Pages/Member/Steps/` dan halaman `Registration.tsx`.
  - Mengarahkan `MembershipRegistrationController::index` ke route wizard 9 langkah baru (`account.membership.register`).
  - Menandai tabel lama (`member_commodities`, `member_social_links`, `member_statements`) sebagai deprecated di dokumentasi tanpa menghapus tabel fisik di database.

#### 3. Menu Master Keanggotaan & Pengaturan CMS NSA
- **Master Kategori Keanggotaan** (`/admin/master-keanggotaan/kategori`):
  - Controller `MembershipCategoryController.php` & View `Categories.tsx`.
  - Fitur tambah, ubah, dan hapus kategori keanggotaan dengan penghitungan sub-jenis aktif.
- **Master Jenis Keanggotaan** (`/admin/master-keanggotaan/jenis`):
  - Controller `MembershipTypeController.php` & View `Types.tsx`.
  - Fitur kelola jenis keanggotaan terikat kategori, deskripsi hak/kewajiban, dan ketentuan AD/ART spesifik.
- **Tarif & Iuran Keanggotaan (Khusus Superadmin)** (`/admin/master-keanggotaan/biaya`):
  - Controller `MembershipFeeItemController.php` & View `FeeItems.tsx`.
  - Dilindungi middleware `role:superadmin` dan gate policy `manage-settings`.
  - Kelola komponen biaya pendaftaran, iuran wajib tahunan, serta opsi ukuran atribut rompi/seragam.
- **Pengaturan Global Situs & Pendaftaran (Khusus Superadmin)** (`/admin/pengaturan`):
  - Penambahan saklar verifikasi awal: `membership.require_initial_verification` (default `true`).
  - Penambahan saklar kewajiban NIK/KTP WNI: `membership.require_ktp_for_wni` (default `true`).
  - Pengelolaan rekening bank tujuan transfer NSA (`bank_name`, `bank_account_number`, `bank_account_holder`).
  - Pengelolaan teks persetujuan AD/ART (`membership_statement_template`), Syarat & Ketentuan (`terms_content`), dan Kebijakan Privasi (`privacy_policy_content`).
- **Navigasi Sidebar Admin**:
  - Memperbarui `AdminLayout.tsx` dengan penambahan seksi *"Master Keanggotaan"* (Kategori, Jenis, Biaya & Iuran [Superadmin], dan Program Kerja).

#### 4. Audit Tampilan, Responsivitas & Aksesibilitas (design.md Bagian 11)
- Memastikan responsivitas tata letak di seluruh breakpoint (360px mobile, 768px tablet, 1280px desktop) pada kedua dashboard (`/akun` dan `/anggota`), formulir pendaftaran 9 langkah, serta halaman Tentang Kami.
- Penerapan hook `usePrefersReducedMotion()` pada animasi Framer Motion untuk menghormati preferensi aksesibilitas pengguna.
- Ukuran target interaksi (*tap targets*) minimal 44px pada tombol, tautan navigasi, dan kontrol formulir.

#### 5. Optimasi Kueri & Pencegahan N+1
- Mengoptimalkan kueri daftar anggota di `Admin/MemberController.php`:
  - Eager-loading relasi `application.businesses`, `application.locations.province`, `application.locations.regency`, dan `application.membershipType`.
  - Menghilangkan query N+1 pada rendering tabel antrean anggota CMS dan ekspor CSV.
  - Memastikan indeks database aktif pada seluruh foreign key dan kolom filter utama.

#### 6. Pengujian Menyeluruh (End-to-End Test Suite)
- Menambahkan test suite `tests/Feature/EndToEndMembershipJourneyTest.php`:
  - Mensimulasikan siklus hidup pendaftaran anggota secara penuh:
    1. Sign up user baru → berstatus `non_member` → diarahkan ke dashboard sederhana `/akun`.
    2. Akses wizard pendaftaran `/akun/keanggotaan/daftar`.
    3. Pengisian lengkap seluruh 9 langkah pendaftaran baru (Identitas WNI, Kategori, Profil Usaha, Aktivitas Perikanan, Jaringan Bisnis, Minat Program, Lokasi & Dokumen KTP/NIB, Paket Administrasi, Persetujuan Legalitas).
    4. Pengiriman formulir → status berpindah ke `pending_review`.
    5. Admin memeriksa dan meloloskan verifikasi awal di CMS → status menjadi `awaiting_payment` dengan invoice otomatis terbit.
    6. Pemohon mengunggah bukti transfer pembayaran → status menjadi `pending_approval`.
    7. Admin memberikan persetujuan akhir → status menjadi `approved`, NTA format resmi (`NSA-YYYY-XXXXX`) terbit, dan cache statistik dibersihkan.
    8. Anggota membuka seluruh 7 modul Portal Anggota (`/anggota`), KTA digital, dan validasi publik `/verifikasi/{token}`.
    9. Pengecekan batasan hak akses role admin dan superadmin pada master biaya dan pengaturan sistem.
- Menjalankan `vendor/bin/pint` untuk standardisasi gaya kode PSR-12/Laravel.
- Menjalankan kompilasi frontend `npm run build` (0 errors).
- Seluruh 212 tests pada 27 test suite berhasil dengan 1806 assertions (`PASS`).

---

### Prompt 9: Dashboard Membership Anggota Resmi NSA (/anggota)

#### 1. Arsitektur & Perlindungan Rute
- Seluruh rute `/anggota/*` berada di `routes/member.php`, diproteksi oleh middleware `member.approved`. Pengguna non-approved dialihkan ke `/akun` dengan pemberitahuan flash.
- Memanfaatkan tata letak bersama `PortalLayout.tsx` dan `PageBanner.tsx`, dengan `areaLabel="PORTAL ANGGOTA"` dan menu terpadu `defaultMemberMenuItems` (Dashboard, Profil & Verifikasi, Kartu Anggota, Usaha & Legalitas, Program NSA, Iuran & Administrasi, Pesanan Saya, Pengaturan).
- Sidebar menampilkan kartu profil anggota: inisial bulat, nama, label status badge "Anggota" resmi, dan nomor NTA kecil.

#### 2. Tujuh Modul Dashboard Anggota
1. **DASHBOARD (`/anggota`)** ([Dashboard.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/Dashboard.tsx)):
   - Banner *"Halo, {nama}"* bergradien biru tua NSA.
   - 4 Kartu ringkasan interaktif: Status Keanggotaan Aktif, Masa Berlaku KTA, Jumlah Program NSA yang Diikuti, serta Total Tagihan Iuran Belum Dibayar.
   - Daftar program aktif yang sedang diikuti dan warta pengumuman resmi terbaru NSA.
2. **PROFIL & VERIFIKASI (`/anggota/profil`)** ([ProfileVerification.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/ProfileVerification.tsx)):
   - Data identitas resmi dengan penyamaran (*masking*) NIK (`3201********0001`) dan Paspor (`A1****78`).
   - Status keabsahan verifikasi per berkas dokumen persyaratan dengan tautan *signed URL*.
   - Formulir pembaruan data dasar (nomor kontak, tempat/tanggal lahir, alamat domisili).
   - Pengajuan permohonan perubahan data penting (nama, kewarganegaraan, kategori) tersimpan ke tabel `member_change_requests` dengan status peninjauan admin.
3. **KARTU ANGGOTA DIGITAL (`/anggota/kartu`)** ([Card.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/Card.tsx)):
   - KTA digital berdimensi kartu standar dengan efek foil hologram NSA, foto profil, nama, nomor NTA, tipe/kategori keanggotaan, masa berlaku, dan QR code terenkripsi.
   - Fitur cetak/unduh kartu langsung (PDF/Cetak).
   - Halaman verifikasi publik `GET /verifikasi/{token}` ([MemberVerification.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Public/MemberVerification.tsx)): hanya menampilkan nama, nomor NTA, tipe anggota, dan status aktif tanpa membocorkan data pribadi (tanpa NIK, email, no HP, alamat).
4. **USAHA & LEGALITAS (`/anggota/usaha`)** ([BusinessLegal.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/BusinessLegal.tsx)):
   - Banner *"Profil Usaha dan Perizinan"*.
   - Kartu ringkasan status perizinan utama (NIB, NPWP, CBIB) dan ringkasan operasional budidaya & jangkauan pasar (Langkah 4–5).
   - Manajemen multi-unit usaha (`member_businesses` hasMany): tambah, ubah, dan hapus unit usaha.
   - Manajemen dokumen perizinan per unit dengan penanda masa berlaku (badge *"Segera berakhir"* bila < 60 hari).
   - Formulir permohonan pendampingan usaha/perizinan NSA tersimpan ke tabel `mentorship_requests` (status: Diajukan, Diproses, Selesai).
5. **PROGRAM NSA (`/anggota/program`)** ([Programs.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/Programs.tsx)):
   - Katalog program kerja terbitan dengan tab filter kategori.
   - Penanda lencana khusus *"Sesuai Minat Anda"* berdasarkan pilihan minat program calon anggota pada Langkah 6 pendaftaran.
   - Tombol pendaftaran satu-klik (`program_registrations`) dan pembatalan keikutsertaan.
6. **IURAN & ADMINISTRASI (`/anggota/iuran`)** ([Invoices.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/Invoices.tsx)):
   - Rincian seluruh tagihan iuran pendaftaran dan iuran tahunan anggota.
   - Formulir modal unggah bukti transfer pembayaran untuk tagihan baru.
   - Halaman kuitansi pembayaran resmi NSA yang dapat dicetak langsung ([Receipt.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/Receipt.tsx)).
   - Informasi ketentuan dan besaran iuran organisasi yang bersumber langsung dari CMS.
7. **PENGATURAN (`/anggota/pengaturan`)** ([Settings.tsx](file:///c:/xampp/htdocs/ifaa-app/resources/js/Pages/Member/Settings.tsx)):
   - Perbarui kata sandi akun anggota.
   - Preferensi notifikasi surel.
   - Fitur keamanan keluar dari seluruh sesi login perangkat lain (*logout other devices*).

#### 3. Database & Migrasi
- Migrasi `2026_11_19_000016_create_member_change_and_mentorship_requests_tables.php`:
  - Menambahkan kolom `verification_token` pada tabel `users`.
  - Membuat tabel `member_change_requests` (permintaan perubahan data sensitif/penting).
  - Membuat tabel `mentorship_requests` (permohonan pendampingan usaha dan perizinan).

#### 4. Pengujian Otomatis
- Menambahkan test suite `tests/Feature/MemberDashboardTest.php` (7 skenario pengujian komprehensif, 125 assertions):
  - Pengujian proteksi middleware `member.approved`.
  - Aksesibilitas seluruh 7 modul halaman portal anggota.
  - Akurasi data KTA digital dan QR token.
  - Pencegahan kebocoran data pribadi pada rute verifikasi publik.
  - Perubahan data dasar dan pengajuan permohonan perubahan data penting.
  - Penambahan unit usaha dan izin dengan penanda masa berlaku.
  - Pendaftaran dan pembatalan program kerja.
- Total pengujian proyek: **211 tests passing (1759 assertions)**.

---

### Prompt 8: Alur Verifikasi, Pembayaran, dan Persetujuan Keanggotaan NSA

#### 1. Arsitektur Alur & Siklus Hidup Status Keanggotaan
- Mengimplementasikan alur status penuh:
  `pending_review` → (admin loloskan) → `awaiting_payment` → (user bayar & unggah bukti) → `pending_approval` → (admin setujui & terbitkan NTA) → `approved`.
- Cabang `revision` (admin meminta perbaikan per bagian, pemohon memperbaiki data dan mengirim ulang).
- Cabang `rejected` (admin menolak pendaftaran dengan alasan wajib minimal 5 karakter).
- Saklar `membership.require_initial_verification` (default `true`): bila disetel `false`, pengiriman form langsung menuju `awaiting_payment` dan menerbitkan tagihan aktif.

#### 2. Sisi Pengguna / Calon Anggota (`/akun/keanggotaan` & `/akun/keanggotaan/status`)
- **Garis Waktu 5 Tahap Responsif**:
  1. Pendaftaran Diajukan
  2. Verifikasi Awal
  3. Pembayaran Administrasi
  4. Persetujuan Akhir
  5. Anggota Resmi NSA
  - Menyorot tahap aktif, riwayat tahap selesai, serta indikator dinamis bila dalam perbaikan (`revision`) atau ditolak (`rejected`).
- **Tagihan Administrasi & Pembayaran Manual (`awaiting_payment`)**:
  - Menampilkan kartu tagihan resmi NSA dengan rincian item biaya, batas waktu bayar, serta rekening tujuan asosiasi (nomor rekening, nama bank, atas nama) lengkap dengan tombol salin rekening satu-klik.
  - Formulir unggah bukti transfer: validasi berkas (JPG, PNG, WEBP, PDF maks 3 MB), nama pengirim, bank pengirim, tanggal transfer, dan catatan transfer.
  - Setelah unggah: status tagihan menjadi `waiting_confirmation` dan status pendaftar menjadi `pending_approval`.
- **Panel Perbaikan Data (`revision`)**:
  - Menampilkan daftar bagian yang perlu diperbaiki beserta catatan instruksi dari verifikator NSA.
  - Tombol "Perbaiki Data" yang mengarahkan langsung ke langkah wizard bersangkutan.
- **Pengalihan Otomatis Saat Disetujui (`approved`)**:
  - Pendaftar yang telah disetujui dialihkan langsung ke Portal Anggota (`/anggota`).

#### 3. Sisi Verifikator & Admin CMS (`/admin/members` & `/admin/members/{member}`)
- **Antrean Pendaftaran dengan 5 Tab Kategori**:
  1. *Verifikasi Awal* (`verifikasi_awal`)
  2. *Menunggu Pembayaran* (`menunggu_pembayaran`)
  3. *Menunggu Persetujuan* (`menunggu_persetujuan`)
  4. *Disetujui* (`disetujui`)
  5. *Ditolak / Revisi* (`ditolak`)
  - Dilengkapi badge penghitung real-time (`tabCounts`) per status.
- **Detail Lengkap Pendaftar 9 Langkah (`Admin/Members/Show.tsx`)**:
  - Menampilkan data terstruktur: Identitas (WNI/WNA, NIK/Paspor), Kategori, Profil Usaha & Legalitas (NIB, NPWP, CBIB), Aktivitas Perikanan, Jaringan Bisnis, Minat Program, Lokasi & Koordinat Peta, Foto Usaha, Dokumen Pendukung (signed URL), Paket & Tagihan Invoice, serta Log Pemeriksaan.
- **Kartu Khusus Bukti Pembayaran**:
  - Menampilkan detail transfer (pengirim, bank, tanggal, nominal) dan tautan/pratinjau berkas bukti bayar bertanda tangan.
- **Aksi Cepat Berbasis Status**:
  - Pada status `pending_review`: tombol *Loloskan Verifikasi Awal* (terbitkan tagihan resmi + kirim email `MemberInitialVerifiedMail`), *Minta Revisi* (pilihan langkah yang perlu diperbaiki), dan *Tolak*.
  - Pada status `pending_approval`: tombol *Konfirmasi Pembayaran & Setujui* (terbitkan NTA unik format `NSA-YYYY-00001` dengan kunci transaksi `lockForUpdate`, status invoice `paid`, kirim email `MemberApprovedMail`), *Tolak Bukti Bayar* (status kembali ke `awaiting_payment`, invoice kembali ke `unpaid`, kirim email `PaymentProofRejectedMail`), *Minta Revisi*, dan *Tolak*.
- **Pencatatan Audit Trail**:
  - Seluruh tindakan tercatat otomatis pada `member_review_logs` dan `activity_logs`.
- **Otorisasi Ketat**:
  - Seluruh endpoint verifikasi dilindungi Gate `verifyMember` (khusus role Admin dan Superadmin; pengguna biasa mendapat HTTP 403 Forbidden).

#### 4. Pengujian Otomatis
- Menambahkan test suite `tests/Feature/MembershipVerificationFlowTest.php` (7 skenario pengujian komprehensif):
  1. Alur penuh dari verifikasi awal, penerbitan tagihan, unggah bukti bayar, konfirmasi persetujuan akhir, hingga penerbitan NTA.
  2. Pengujian saklar bypass verifikasi awal saat dimatikan.
  3. Pengujian penolakan bukti bayar dan kemampuan pemohon untuk mengunggah ulang bukti baru.
  4. Pengujian permintaan revisi dokumen dan pencatatan review logs.
  5. Pengujian penolakan pendaftaran dengan alasan wajib.
  6. Pengujian keunikan penerbitan NTA format `NSA-YYYY-00001` tanpa risiko collision.
  7. Pengujian proteksi otorisasi pengguna biasa mendapatkan status HTTP 403.
- Total test suite aplikasi: **204 tests passing (1634 assertions)**.

---

### Prompt 7: Langkah 7 (Lokasi, Foto, Dokumen), 8 (Paket & Administrasi), & 9 (Pemeriksaan & Pengiriman)

#### 1. Langkah 7: Lokasi, Foto, dan Dokumen (`Step7LocationDocuments.tsx`)
- **Kartu 1: Alamat Domisili atau Usaha**:
  - `RegionSelect` 4 tingkat (Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan/Desa).
  - Kolom kode pos dan textarea alamat lengkap dengan penghitung karakter `0/250`.
  - Centang "Alamat usaha berbeda dengan domisili" yang secara reaktif membuka subform alamat fasilitas usaha terpisah (RegionSelect 4 tingkat + kode pos + alamat lengkap).
  - Tersimpan ke tabel `member_locations` dengan `kind` = `domicile` dan `kind` = `business`, serta disinkronkan ke `member_businesses` untuk kemudahan pelaporan wilayah dan sensus statistik.
- **Kartu 2: Titik Koordinat Lokasi Kegiatan**:
  - Integrasi `MapPicker` (Leaflet, pencarian lokasi, geser pin GPS).
  - Repeater multi-titik koordinat: mendukung penambahan lebih dari satu lokasi fasilitas/tambak/hatchery, tersimpan ke `member_locations` dengan `kind` = `activity`.
- **Kartu 3: Foto Fasilitas Usaha (Opsional, 1–5 Foto)**:
  - Unggah 1–5 foto fasilitas atau tempat usaha ke disk publik (`member-photos/{application_id}`).
  - Pratinjau thumbnail responsif dengan tombol hapus foto interaktif.
  - Endpoint `POST /akun/keanggotaan/foto` dan `DELETE /akun/keanggotaan/foto/{photo}` terintegrasi di controller dan tabel `member_photos`.
- **Kartu 4: Dokumen Pendukung Dinamis**:
  - Menghasilkan satu `DocumentUploadCard` per berkas yang dibutuhkan berdasarkan data Langkah 1–3:
    - Identitas: KTP jika WNI (diatur oleh saklar `membership.require_ktp_for_wni`) atau Paspor jika WNA.
    - Izin usaha: berkas persyaratan untuk setiap izin yang dicantumkan pada Langkah 3 (NIB, NPWP, CBIB, SK Kemenkumham, SIUP, Izin Lokasi, dll.).
  - Disimpan pada storage disk privat dengan URL bertanda tangan (signed URL).

#### 2. Langkah 8: Paket Keanggotaan dan Administrasi (`Step8Administration.tsx`)
- **Daftar Biaya Dinamis dari Database (`membership_fee_items`)**:
  - Tidak di-hardcode: mengambil data langsung dari tabel `membership_fee_items` (Biaya Registrasi, KTA Fisik RFID, Iuran Tahunan Anggota, Rompi Resmi NSA, Kemeja Resmi NSA).
  - Item wajib (`type === 'required'` atau `recurring`) otomatis tercentang dan terkunci dengan ikon gembok.
  - Item seragam opsional dapat dicentang, dipilih ukurannya (S, M, L, XL, XXL), dan diatur kuantitasnya (1–10).
- **Kalkulasi Akumulasi Total Live**:
  - Kartu estimasi draf invoice dengan animasi angka tabular yang menghitung total secara langsung setiap kali item atau jumlah diubah.
- **Pemberitahuan Status Pembayaran Adaptif**:
  - Menyesuaikan dengan saklar pengaturan `membership.require_initial_verification`:
    - Bila `true`: "Pembayaran dilakukan setelah berkas pendaftaran Anda lolos verifikasi awal oleh tim pengurus NSA."
    - Bila `false`: "Pembayaran administrasi dapat langsung diselesaikan setelah formulir pendaftaran ini Anda kirimkan."
  - Data tersimpan sebagai draf invoice belum ditagihkan pada `member_invoices` dan `member_invoice_items`.

#### 3. Langkah 9: Pemeriksaan Akhir dan Pengiriman (`Step9Review.tsx`)
- **Ringkasan Komprehensif Seluruh 8 Langkah**:
  - Rincian ringkas per langkah (Identitas dengan masking NIK `************1234` atau Paspor `****5678`, Kategori, Profil Usaha, Aktivitas Perikanan, Jaringan Bisnis, Minat Program, Lokasi & Dokumen, Paket Administrasi).
  - Tombol "Ubah" pada setiap kartu yang mengarahkan pengguna kembali ke langkah bersangkutan.
- **Deteksi Kelengkapan Data & Dokumen**:
  - Menampilkan peringatan kelengkapan data jika ada kolom atau berkas wajib yang belum diunggah dan memblokir tombol kirim sampai seluruh persyaratan terpenuhi.
- **Centang Persetujuan Wajib & Modal Dokumen Hukum**:
  - Checkbox wajib persetujuan Ketentuan & AD/ART NSA serta Kebijakan Privasi NSA.
  - Tautan pembuka modal dialog yang memuat naskah AD/ART dan Kebijakan Privasi dari tabel `settings` (CMS-driven).
- **Aksi Server `SubmitRegistration` Terpusat**:
  - Validasi ulang seluruh 9 langkah di sisi server (Server-Side Re-validation).
  - Mengubah status keanggotaan pengguna dan aplikasi sesuai saklar:
    - `pending_review` bila verifikasi awal aktif.
    - `awaiting_payment` bila verifikasi awal dinonaktifkan.
  - Mencatat review log pendaftaran anggota baru.
  - Mengirim email konfirmasi ke pemohon (`MembershipApplicationSubmitted`) dan notifikasi ke admin (`AdminNewMembershipNotification`) dalam satu transaksi database (`DB::transaction`).

#### 4. Pengujian Otomatis
- Menambahkan test suite `tests/Feature/WizardSteps7To9Test.php` (8 skenario pengujian komprehensif):
  - Pengujian penyimpanan domisili dan koordinat kegiatan.
  - Pengujian penyimpanan alamat usaha terpisah.
  - Pengujian unggah dan hapus foto usaha hingga 5 foto.
  - Pengujian kalkulasi total draf invoice administrasi dan ukuran seragam.
  - Pengujian validasi penolakan submit tanpa centang persetujuan.
  - Pengujian penegakan berkas dokumen wajib berdasarkan kewarganegaraan dan izin usaha.
  - Pengujian perubahan status target sesuai saklar `membership.require_initial_verification`.
  - Pengujian pengiriman email notifikasi pemohon dan admin.
- Seluruh 197 tes fitur dan unit lulus 100% (1.592 asersi).

---

### Prompt 6: Langkah 4 (Aktivitas Perikanan Dinamis), 5 (Jaringan Bisnis), & 6 (Minat Program)

#### 1. Langkah 4: Data Aktivitas Perikanan Berbasis Konfigurasi (`config/activity_forms.php`)
- **Desain Config-Driven**:
  - Membuat `config/activity_forms.php` yang memetakan kategori keanggotaan ke field spesifik:
    - `pembudidaya`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `seed_need`, `feed_need`, `notes`.
    - `pembenih`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `notes`.
    - `buyer` / `buyer-eksportir`: `fish_category_id`, `purchase_capacity` + unit + periode, `notes`.
    - `pengolah`: `fish_category_id`, `farming_system`, `production_amount`, `purchase_capacity`, `notes`.
    - `pakan-sarana`: `farming_system`, `production_amount`, `notes`.
    - `akademisi`, `konsultan`, `lainnya`: `fields => []`, `is_skippable => true`.
- **Aturan Validasi Terpusat (`ActivityFormRules`)**:
  - Kelas `App\Support\ActivityFormRules` menghasilkan aturan dan pesan validasi Laravel langsung dari konfigurasi, menghindari duplikasi aturan.
  - Memeriksa apakah langkah dapat dilewati (`isSkippable`).
- **Komponen Frontend**:
  - `DynamicActivityForm.tsx`: Komponen form dinamis yang merender berbagai jenis input (select_fish, select, number, number_unit_period, text, textarea) dan repeater "Tambah Komoditas Lain" dengan animasi halus Framer Motion.
  - Kartu Kategori Tidak Wajib: Menampilkan pesan informatif dan tombol "Lewati Langkah Ini" untuk kategori non-akuakultur langsung (Akademisi, Konsultan, dll.) dan menandai langkah sebagai selesai.
  - `Step4FishActivities.tsx`: Membungkus form dinamis pada alur pendaftaran wizard.

#### 2. Langkah 5: Jaringan dan Aktivitas Bisnis (`Step5NetworkProfile.tsx`)
- **Informasi Pemasaran**: Textarea saluran dan metode pemasaran hasil panen atau produk.
- **Wilayah Distribusi**: Multi-select provinsi interaktif dengan chip badge yang dapat ditambah dan dihapus.
- **Kebutuhan Pasokan**: Textarea untuk mendeskripsikan kebutuhan bahan baku atau sarana rutin.
- **Jenis Kerja Sama**: Checkbox pilihan (pasokan, distribusi, investasi, teknologi, penelitian, lainnya + input teks kustom).
- **Kegiatan Profesional**: Textarea untuk mencatat keaktifan dalam kelompok tani, komunitas, atau asosiasi.
- **Sifat Fleksibel**: Seluruh kolom bersifat opsional dan dapat disimpan kosong / dilewati. Tersimpan ke tabel `member_network_profiles`.

#### 3. Langkah 6: Kebutuhan dan Minat Program NSA (`Step6ProgramInterests.tsx`)
- **Pilihan Multi Kartu Program**:
  - Pelatihan & Workshop (Ikon `GraduationCap`)
  - Pendampingan Teknis Farm (Ikon `Users`)
  - Informasi & Intelijen Pasar (Ikon `TrendingUp`)
  - Akses Kemitraan & Permodalan (Ikon `Handshake`)
  - Teknologi & Inovasi Budidaya (Ikon `Cpu`)
  - Pengembangan Skala Usaha (Ikon `Building2`)
- Setiap kartu dilengkapi ringkasan manfaat satu kalimat dan indikator centang teranimasi saat dipilih.
- Kolom catatan tambahan opsional untuk kebutuhan pelatihan/konsultasi spesifik.
- Tersimpan ke tabel `member_program_interests` dengan backed enum `App\Enums\ProgramCategory`.

#### 4. Form Request, Controller & Backend
- Membuat Form Request terisolasi dengan pesan Bahasa Indonesia:
  - `SaveFishActivitiesStepRequest` (menggunakan `ActivityFormRules`)
  - `SaveNetworkProfileStepRequest`
  - `SaveProgramInterestsStepRequest`
- Memperbarui `SaveRegistrationStep` untuk menyimpan secara atomik ke `member_fish_activities`, `member_network_profiles`, dan `member_program_interests`.
- Memperbarui `MemberRegistrationController` untuk menyalurkan props `activityFormConfig`, `programCategories`, dan draft data Steps 4, 5, 6 ke frontend.

#### 5. Pengujian & Kompilasi
- Membuat `tests/Feature/WizardSteps4To6Test.php` (8 skenario tes, 36 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes: **189 tests passed, 1562 assertions** (0 gagal).
- Kompilasi build frontend: `npm run build` sukses tanpa galat kompilasi (9.04s - 11.96s).

---

### Prompt 5: Restrukturisasi Wizard 9 Langkah Baru & Pengerjaan Langkah 1–3

#### 1. Arsitektur 9 Langkah Pendaftaran Anggota (`MemberApplication::STEPS`)
- Memetakan ulang 9 langkah pendaftaran dengan slug baru:
  1. `identitas`: Identitas Calon Anggota (WNI / WNA)
  2. `kategori-keanggotaan`: Kategori Kegiatan & Jenis Keanggotaan
  3. `profil-usaha`: Profil Pekerjaan atau Usaha & Legalitas
  4. `aktivitas-perikanan`: Aktivitas Perikanan (Form Dinamis)
  5. `jaringan-bisnis`: Jaringan & Aktivitas Bisnis
  6. `minat-program`: Minat Program Kerja NSA
  7. `lokasi-dokumen`: Titik Lokasi & Unggah Berkas Legalitas
  8. `paket-administrasi`: Paket Keanggotaan & Administrasi
  9. `pemeriksaan`: Pemeriksaan Akhir & Pernyataan
- Menghapus komponen langkah lama yang tidak digunakan lagi: `Step5Social.tsx`, `Step6Commodity.tsx`, `Step8Statement.tsx`.
- Mempertahankan kompatibilitas langkah lama pada level controller & model via `MemberApplication::LEGACY_STEPS`.

#### 2. Langkah 1: Identitas Calon Anggota (`Step1Identity.tsx`)
- **Segmented Control Kewarganegaraan**: WNI vs WNA dengan transisi animasi halus Framer Motion (`AnimatePresence`).
- **Data Umum**: Nama lengkap, jenis kelamin (pilihan tombol interaktif), tempat lahir, tanggal lahir, nomor telepon (+62 otomatis), dan email (terkunci sesuai akun login).
- **Usia Otomatis**: Dihitung secara real-time dari tanggal lahir sebagai badge readonly tanpa input terpisah.
- **WNI Form**:
  - Kolom NIK 16 digit terenkripsi (`encrypted` casting pada `MemberIdentity`).
  - Alamat domisili sesuai KTP lengkap menggunakan komponen cascading `RegionSelect` (provinsi, kabupaten, kecamatan, desa) + alamat jalan.
  - Diatur oleh saklar dinamis `membership.require_ktp_for_wni` (default `true`) di tabel `settings`.
- **WNA Form**:
  - Kolom nomor paspor terenkripsi.
  - Pilihan negara asal (`COUNTRY_OPTIONS`) dan lama tinggal di Indonesia (angka tahun).
- **Validasi**: Kolom tersembunyi (mis. WNA saat memilih WNI) otomatis tidak ikut divalidasi.

#### 3. Langkah 2: Kategori dan Jenis Keanggotaan (`Step2Category.tsx`)
- **Kategori Kegiatan**: Kartu pilihan interaktif yang bersumber dari tabel `membership_categories` dengan opsi "Lainnya" yang membuka input teks dinamis untuk kategori kustom.
- **Status Pendaftar**: Pilihan radio kartu antara "Individu" dan "Perwakilan Lembaga".
  - Jika "Perwakilan Lembaga" dipilih, form dinamis membuka input nama lembaga dan jabatan pendaftar.
- **Jenis Keanggotaan**: Kartu pilihan yang bersumber dari tabel `membership_types` dengan penjelasan ringkas aturan AD/ART organisasi.

#### 4. Langkah 3: Profil Pekerjaan atau Usaha (`Step3BusinessProfile.tsx`)
- **Tata Letak FormCard 2 Kolom**:
  - **Kartu 1 (Profil Usaha)**: Nama usaha / lembaga, bidang kegiatan, lama berusaha (tahun), skala usaha (Mikro, Kecil, Menengah, Besar dengan tooltip penjelasan kriteria permodalan/omzet), dan informasi operasional (textarea maks. 500 karakter dengan penghitung).
  - **Centang Individu Tanpa Usaha**: Opsi "Saya belum memiliki badan usaha" mengubah form menjadi input "Pekerjaan / profesi utama".
  - **Kartu 2 (Perizinan & Legalitas)**: Memakai komponen repeater `LegalDocumentRepeater` untuk mencatat jenis izin (NIB, NPWP, CBIB, Lainnya), nomor dokumen, tanggal terbit, dan masa berlaku.
  - **Izin Wajib Dinamis**: Penanda izin wajib otomatis membaca konfigurasi `config('membership.required_legalities')` sesuai kategori yang dipilih di Langkah 2 (misalnya Eksportir wajib mencantumkan NIB).

#### 5. Form Request & Tindakan Penyimpanan
- Membuat form request dengan pesan validasi berbahasa Indonesia:
  - `SaveIdentityStepRequest`: menangani validasi dinamis WNI vs WNA dan saklar KTP.
  - `SaveCategoryStepRequest`: menangani validasi kategori, opsi kustom, dan data perwakilan lembaga.
  - `SaveBusinessProfileStepRequest`: menangani validasi usaha/pekerjaan dan penegakan izin legalitas wajib per kategori.
- Memperbarui `SaveRegistrationStep` untuk menyimpan langsung ke entitas relasional `MemberIdentity`, `MemberApplication`, `MemberBusiness`, dan `MemberLegalDocument`.

#### 6. Pengujian & Verifikasi
- Membuat rangkaian pengujian fitur `tests/Feature/WizardSteps1To3Test.php` (10 skenario pengujian, 64 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes aplikasi: 181 pengujian (1526 assertions) lulus tanpa kegagalan.
- Memverifikasi build aset frontend: `npm run build` sukses tanpa galat kompilasi TypeScript atau Vite.

## [Unreleased] - 2026-11-19

### Prompt 0: Rebrand ke NSA & Sinkronisasi Dokumen

#### 1. Pemusatan Identitas Brand & Konfigurasi Global
- **Berkas Konfigurasi**: Membuat `config/brand.php` sebagai sumber kebenaran identitas organisasi (`name`, `short_name`, `tagline`, `domain`, `portal_name`, `support_phone`, `support_email`, `address`, `logo_light`, `logo_dark`, `social`).
- **Kelas & Helper Brand**:
  - Membuat `App\Support\Brand` untuk membaca konfigurasi brand secara dinamis dari tabel `settings` (dapat diubah Superadmin via CMS) dengan fallback ke `config/brand.php`.
  - Membuat helper global `brand(?string $key = null, mixed $default = null)` di `app/helpers.php` dan mendaftarkannya pada autoload Composer serta `AppServiceProvider`.
- **Props Inertia Bersama**:
  - Menyuntikkan props bersama `brand` secara lazy pada `app/Http/Middleware/HandleInertiaRequests.php`.
  - Menambahkan antarmuka TypeScript `Brand` dan properti `brand` ke `PageProps` di `resources/js/types/index.d.ts`.
  - Membuat custom React Hook `useBrand` di `resources/js/hooks/useBrand.ts`.

#### 2. Slot Logo Terang & Gelap
- Memperbarui `app/Http/Controllers/Admin/SettingController.php` dan `resources/js/Pages/Admin/Settings/Index.tsx` untuk menyediakan slot unggah mandiri:
  - **Logo Terang (`logo_light`)**: untuk latar gelap / navy (digunakan di Footer, Sidebar, dll.).
  - **Logo Gelap (`logo_dark`)**: untuk latar terang / putih (digunakan di Navbar, kartu putih, dll.).
- Memperbarui komponen `resources/js/Components/layout/Logo.tsx` untuk menampilkan logo unggahan sesuai tone latar atau merender placeholder wordmark SVG `NSA`.

#### 3. Penyesuaian Identitas Kode, Seeder, Mail, dan Views
- Mengubah seluruh penyebutan organisasi dari "IFAA" / "Indonesian Fisheries and Aquaculture Association" menjadi memakai brand NSA:
  - **Nomor Anggota (NTA)**: Berformat `NSA-YYYY-XXXXX` pada `App\Actions\Admin\ApproveMember` dan factories.
  - **Email Notifikasi (6 Mailable)**: `AdminNewMembershipNotification`, `ContactMessageReceived`, `MemberApprovedMail`, `MemberRejectedMail`, `MemberRevisionRequestedMail`, `MembershipApplicationSubmitted` kini memakai metode dinamis `Brand::name()`, `Brand::shortName()`, dan `Brand::supportEmail()`.
  - **Seeders**: `DemoSeeder.php`, `UserSeeder.php`, dan `MembershipPlanSeeder.php` dimutakhirkan ke domain `@nsa.test` dan nama organisasi NSA.
  - **React Components & Views**: 75 berkas di `resources/js/` (Navbar, Footer, AdminLayout, AuthLayout, Status, Registration, Contact, About, Cart, dll.) diselaraskan ke NSA.
  - **Kustom Event**: Penamaan event drawer diselaraskan (`nsa:open-cart-drawer`, `nsa:open-orders-drawer`, `nsa:open-profile-drawer`, `nsa:open-address-drawer`).
  - **Struktur Folder & Namespace**: Tetap dipertahankan (`App\...`, direktori proyek) tanpa perubahan yang merusak kompatibilitas.

#### 4. Pemutakhiran Dokumen Arsitektur & Spesifikasi
- **`prd.md`**:
  - Menyelaraskan nama proyek menjadi NSA (Nusantara Sustainable Aquatic) dan area anggota menjadi "Portal Anggota".
  - Mencatat alur sistem baru (login/signup -> pembagian dua dashboard: sederhana `/akun` vs membership `/anggota`).
  - Mendokumentasikan 9 langkah pendaftaran baru (WNI/WNA, kategori & jenis keanggotaan, profil usaha & legalitas, form dinamis aktivitas perikanan, jaringan & aktivitas bisnis, minat program NSA, lokasi & dokumen, paket administrasi & biaya, pemeriksaan & persetujuan).
  - Mendokumentasikan status keanggotaan baru (`MembershipStatus`: `pending_review`, `awaiting_payment`, `pending_approval`) dan saklar `membership.require_initial_verification`.
  - Mendokumentasikan skema tabel baru dan tabel deprecated (`member_social_links`, `member_statements`, `member_commodities`).
- **`design.md`**:
  - Menyelaraskan identitas visual ke NSA.
  - Menambahkan panduan desain tata letak dua dashboard, header putih ("Portal Anggota" + tombol "Ke Web Utama"), sidebar navigasi profil, dan banner judul konten bergradien biru tua (`navy` ke `ocean`).
  - Mempertahankan palet warna asli sesuai arahan klien.
- **`readme.md`**:
  - Memperbarui nama proyek, kredensial seeder akun pengujian, variabel konfigurasi brand di `.env`, konfigurasi domain server Nginx, dan Supervisor.

---

### Prompt 7: Langkah 7 (Lokasi, Foto, Dokumen), 8 (Paket & Administrasi), & 9 (Pemeriksaan & Pengiriman)

#### 1. Langkah 7: Lokasi, Foto, dan Dokumen (`Step7LocationDocuments.tsx`)
- **Kartu 1: Alamat Domisili atau Usaha**:
  - `RegionSelect` 4 tingkat (Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan/Desa).
  - Kolom kode pos dan textarea alamat lengkap dengan penghitung karakter `0/250`.
  - Centang "Alamat usaha berbeda dengan domisili" yang secara reaktif membuka subform alamat fasilitas usaha terpisah (RegionSelect 4 tingkat + kode pos + alamat lengkap).
  - Tersimpan ke tabel `member_locations` dengan `kind` = `domicile` dan `kind` = `business`, serta disinkronkan ke `member_businesses` untuk kemudahan pelaporan wilayah dan sensus statistik.
- **Kartu 2: Titik Koordinat Lokasi Kegiatan**:
  - Integrasi `MapPicker` (Leaflet, pencarian lokasi, geser pin GPS).
  - Repeater multi-titik koordinat: mendukung penambahan lebih dari satu lokasi fasilitas/tambak/hatchery, tersimpan ke `member_locations` dengan `kind` = `activity`.
- **Kartu 3: Foto Fasilitas Usaha (Opsional, 1–5 Foto)**:
  - Unggah 1–5 foto fasilitas atau tempat usaha ke disk publik (`member-photos/{application_id}`).
  - Pratinjau thumbnail responsif dengan tombol hapus foto interaktif.
  - Endpoint `POST /akun/keanggotaan/foto` dan `DELETE /akun/keanggotaan/foto/{photo}` terintegrasi di controller dan tabel `member_photos`.
- **Kartu 4: Dokumen Pendukung Dinamis**:
  - Menghasilkan satu `DocumentUploadCard` per berkas yang dibutuhkan berdasarkan data Langkah 1–3:
    - Identitas: KTP jika WNI (diatur oleh saklar `membership.require_ktp_for_wni`) atau Paspor jika WNA.
    - Izin usaha: berkas persyaratan untuk setiap izin yang dicantumkan pada Langkah 3 (NIB, NPWP, CBIB, SK Kemenkumham, SIUP, Izin Lokasi, dll.).
  - Disimpan pada storage disk privat dengan URL bertanda tangan (signed URL).

#### 2. Langkah 8: Paket Keanggotaan dan Administrasi (`Step8Administration.tsx`)
- **Daftar Biaya Dinamis dari Database (`membership_fee_items`)**:
  - Tidak di-hardcode: mengambil data langsung dari tabel `membership_fee_items` (Biaya Registrasi, KTA Fisik RFID, Iuran Tahunan Anggota, Rompi Resmi NSA, Kemeja Resmi NSA).
  - Item wajib (`type === 'required'` atau `recurring`) otomatis tercentang dan terkunci dengan ikon gembok.
  - Item seragam opsional dapat dicentang, dipilih ukurannya (S, M, L, XL, XXL), dan diatur kuantitasnya (1–10).
- **Kalkulasi Akumulasi Total Live**:
  - Kartu estimasi draf invoice dengan animasi angka tabular yang menghitung total secara langsung setiap kali item atau jumlah diubah.
- **Pemberitahuan Status Pembayaran Adaptif**:
  - Menyesuaikan dengan saklar pengaturan `membership.require_initial_verification`:
    - Bila `true`: "Pembayaran dilakukan setelah berkas pendaftaran Anda lolos verifikasi awal oleh tim pengurus NSA."
    - Bila `false`: "Pembayaran administrasi dapat langsung diselesaikan setelah formulir pendaftaran ini Anda kirimkan."
  - Data tersimpan sebagai draf invoice belum ditagihkan pada `member_invoices` dan `member_invoice_items`.

#### 3. Langkah 9: Pemeriksaan Akhir dan Pengiriman (`Step9Review.tsx`)
- **Ringkasan Komprehensif Seluruh 8 Langkah**:
  - Rincian ringkas per langkah (Identitas dengan masking NIK `************1234` atau Paspor `****5678`, Kategori, Profil Usaha, Aktivitas Perikanan, Jaringan Bisnis, Minat Program, Lokasi & Dokumen, Paket Administrasi).
  - Tombol "Ubah" pada setiap kartu yang mengarahkan pengguna kembali ke langkah bersangkutan.
- **Deteksi Kelengkapan Data & Dokumen**:
  - Menampilkan peringatan kelengkapan data jika ada kolom atau berkas wajib yang belum diunggah dan memblokir tombol kirim sampai seluruh persyaratan terpenuhi.
- **Centang Persetujuan Wajib & Modal Dokumen Hukum**:
  - Checkbox wajib persetujuan Ketentuan & AD/ART NSA serta Kebijakan Privasi NSA.
  - Tautan pembuka modal dialog yang memuat naskah AD/ART dan Kebijakan Privasi dari tabel `settings` (CMS-driven).
- **Aksi Server `SubmitRegistration` Terpusat**:
  - Validasi ulang seluruh 9 langkah di sisi server (Server-Side Re-validation).
  - Mengubah status keanggotaan pengguna dan aplikasi sesuai saklar:
    - `pending_review` bila verifikasi awal aktif.
    - `awaiting_payment` bila verifikasi awal dinonaktifkan.
  - Mencatat review log pendaftaran anggota baru.
  - Mengirim email konfirmasi ke pemohon (`MembershipApplicationSubmitted`) dan notifikasi ke admin (`AdminNewMembershipNotification`) dalam satu transaksi database (`DB::transaction`).

#### 4. Pengujian Otomatis
- Menambahkan test suite `tests/Feature/WizardSteps7To9Test.php` (8 skenario pengujian komprehensif):
  - Pengujian penyimpanan domisili dan koordinat kegiatan.
  - Pengujian penyimpanan alamat usaha terpisah.
  - Pengujian unggah dan hapus foto usaha hingga 5 foto.
  - Pengujian kalkulasi total draf invoice administrasi dan ukuran seragam.
  - Pengujian validasi penolakan submit tanpa centang persetujuan.
  - Pengujian penegakan berkas dokumen wajib berdasarkan kewarganegaraan dan izin usaha.
  - Pengujian perubahan status target sesuai saklar `membership.require_initial_verification`.
  - Pengujian pengiriman email notifikasi pemohon dan admin.
- Seluruh 197 tes fitur dan unit lulus 100% (1.592 asersi).

---

### Prompt 6: Langkah 4 (Aktivitas Perikanan Dinamis), 5 (Jaringan Bisnis), & 6 (Minat Program)

#### 1. Langkah 4: Data Aktivitas Perikanan Berbasis Konfigurasi (`config/activity_forms.php`)
- **Desain Config-Driven**:
  - Membuat `config/activity_forms.php` yang memetakan kategori keanggotaan ke field spesifik:
    - `pembudidaya`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `seed_need`, `feed_need`, `notes`.
    - `pembenih`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `notes`.
    - `buyer` / `buyer-eksportir`: `fish_category_id`, `purchase_capacity` + unit + periode, `notes`.
    - `pengolah`: `fish_category_id`, `farming_system`, `production_amount`, `purchase_capacity`, `notes`.
    - `pakan-sarana`: `farming_system`, `production_amount`, `notes`.
    - `akademisi`, `konsultan`, `lainnya`: `fields => []`, `is_skippable => true`.
- **Aturan Validasi Terpusat (`ActivityFormRules`)**:
  - Kelas `App\Support\ActivityFormRules` menghasilkan aturan dan pesan validasi Laravel langsung dari konfigurasi, menghindari duplikasi aturan.
  - Memeriksa apakah langkah dapat dilewati (`isSkippable`).
- **Komponen Frontend**:
  - `DynamicActivityForm.tsx`: Komponen form dinamis yang merender berbagai jenis input (select_fish, select, number, number_unit_period, text, textarea) dan repeater "Tambah Komoditas Lain" dengan animasi halus Framer Motion.
  - Kartu Kategori Tidak Wajib: Menampilkan pesan informatif dan tombol "Lewati Langkah Ini" untuk kategori non-akuakultur langsung (Akademisi, Konsultan, dll.) dan menandai langkah sebagai selesai.
  - `Step4FishActivities.tsx`: Membungkus form dinamis pada alur pendaftaran wizard.

#### 2. Langkah 5: Jaringan dan Aktivitas Bisnis (`Step5NetworkProfile.tsx`)
- **Informasi Pemasaran**: Textarea saluran dan metode pemasaran hasil panen atau produk.
- **Wilayah Distribusi**: Multi-select provinsi interaktif dengan chip badge yang dapat ditambah dan dihapus.
- **Kebutuhan Pasokan**: Textarea untuk mendeskripsikan kebutuhan bahan baku atau sarana rutin.
- **Jenis Kerja Sama**: Checkbox pilihan (pasokan, distribusi, investasi, teknologi, penelitian, lainnya + input teks kustom).
- **Kegiatan Profesional**: Textarea untuk mencatat keaktifan dalam kelompok tani, komunitas, atau asosiasi.
- **Sifat Fleksibel**: Seluruh kolom bersifat opsional dan dapat disimpan kosong / dilewati. Tersimpan ke tabel `member_network_profiles`.

#### 3. Langkah 6: Kebutuhan dan Minat Program NSA (`Step6ProgramInterests.tsx`)
- **Pilihan Multi Kartu Program**:
  - Pelatihan & Workshop (Ikon `GraduationCap`)
  - Pendampingan Teknis Farm (Ikon `Users`)
  - Informasi & Intelijen Pasar (Ikon `TrendingUp`)
  - Akses Kemitraan & Permodalan (Ikon `Handshake`)
  - Teknologi & Inovasi Budidaya (Ikon `Cpu`)
  - Pengembangan Skala Usaha (Ikon `Building2`)
- Setiap kartu dilengkapi ringkasan manfaat satu kalimat dan indikator centang teranimasi saat dipilih.
- Kolom catatan tambahan opsional untuk kebutuhan pelatihan/konsultasi spesifik.
- Tersimpan ke tabel `member_program_interests` dengan backed enum `App\Enums\ProgramCategory`.

#### 4. Form Request, Controller & Backend
- Membuat Form Request terisolasi dengan pesan Bahasa Indonesia:
  - `SaveFishActivitiesStepRequest` (menggunakan `ActivityFormRules`)
  - `SaveNetworkProfileStepRequest`
  - `SaveProgramInterestsStepRequest`
- Memperbarui `SaveRegistrationStep` untuk menyimpan secara atomik ke `member_fish_activities`, `member_network_profiles`, dan `member_program_interests`.
- Memperbarui `MemberRegistrationController` untuk menyalurkan props `activityFormConfig`, `programCategories`, dan draft data Steps 4, 5, 6 ke frontend.

#### 5. Pengujian & Kompilasi
- Membuat `tests/Feature/WizardSteps4To6Test.php` (8 skenario tes, 36 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes: **189 tests passed, 1562 assertions** (0 gagal).
- Kompilasi build frontend: `npm run build` sukses tanpa galat kompilasi (9.04s - 11.96s).

---

### Prompt 5: Restrukturisasi Wizard 9 Langkah Baru & Pengerjaan Langkah 1–3

#### 1. Arsitektur 9 Langkah Pendaftaran Anggota (`MemberApplication::STEPS`)
- Memetakan ulang 9 langkah pendaftaran dengan slug baru:
  1. `identitas`: Identitas Calon Anggota (WNI / WNA)
  2. `kategori-keanggotaan`: Kategori Kegiatan & Jenis Keanggotaan
  3. `profil-usaha`: Profil Pekerjaan atau Usaha & Legalitas
  4. `aktivitas-perikanan`: Aktivitas Perikanan (Form Dinamis)
  5. `jaringan-bisnis`: Jaringan & Aktivitas Bisnis
  6. `minat-program`: Minat Program Kerja NSA
  7. `lokasi-dokumen`: Titik Lokasi & Unggah Berkas Legalitas
  8. `paket-administrasi`: Paket Keanggotaan & Administrasi
  9. `pemeriksaan`: Pemeriksaan Akhir & Pernyataan
- Menghapus komponen langkah lama yang tidak digunakan lagi: `Step5Social.tsx`, `Step6Commodity.tsx`, `Step8Statement.tsx`.
- Mempertahankan kompatibilitas langkah lama pada level controller & model via `MemberApplication::LEGACY_STEPS`.

#### 2. Langkah 1: Identitas Calon Anggota (`Step1Identity.tsx`)
- **Segmented Control Kewarganegaraan**: WNI vs WNA dengan transisi animasi halus Framer Motion (`AnimatePresence`).
- **Data Umum**: Nama lengkap, jenis kelamin (pilihan tombol interaktif), tempat lahir, tanggal lahir, nomor telepon (+62 otomatis), dan email (terkunci sesuai akun login).
- **Usia Otomatis**: Dihitung secara real-time dari tanggal lahir sebagai badge readonly tanpa input terpisah.
- **WNI Form**:
  - Kolom NIK 16 digit terenkripsi (`encrypted` casting pada `MemberIdentity`).
  - Alamat domisili sesuai KTP lengkap menggunakan komponen cascading `RegionSelect` (provinsi, kabupaten, kecamatan, desa) + alamat jalan.
  - Diatur oleh saklar dinamis `membership.require_ktp_for_wni` (default `true`) di tabel `settings`.
- **WNA Form**:
  - Kolom nomor paspor terenkripsi.
  - Pilihan negara asal (`COUNTRY_OPTIONS`) dan lama tinggal di Indonesia (angka tahun).
- **Validasi**: Kolom tersembunyi (mis. WNA saat memilih WNI) otomatis tidak ikut divalidasi.

#### 3. Langkah 2: Kategori dan Jenis Keanggotaan (`Step2Category.tsx`)
- **Kategori Kegiatan**: Kartu pilihan interaktif yang bersumber dari tabel `membership_categories` dengan opsi "Lainnya" yang membuka input teks dinamis untuk kategori kustom.
- **Status Pendaftar**: Pilihan radio kartu antara "Individu" dan "Perwakilan Lembaga".
  - Jika "Perwakilan Lembaga" dipilih, form dinamis membuka input nama lembaga dan jabatan pendaftar.
- **Jenis Keanggotaan**: Kartu pilihan yang bersumber dari tabel `membership_types` dengan penjelasan ringkas aturan AD/ART organisasi.

#### 4. Langkah 3: Profil Pekerjaan atau Usaha (`Step3BusinessProfile.tsx`)
- **Tata Letak FormCard 2 Kolom**:
  - **Kartu 1 (Profil Usaha)**: Nama usaha / lembaga, bidang kegiatan, lama berusaha (tahun), skala usaha (Mikro, Kecil, Menengah, Besar dengan tooltip penjelasan kriteria permodalan/omzet), dan informasi operasional (textarea maks. 500 karakter dengan penghitung).
  - **Centang Individu Tanpa Usaha**: Opsi "Saya belum memiliki badan usaha" mengubah form menjadi input "Pekerjaan / profesi utama".
  - **Kartu 2 (Perizinan & Legalitas)**: Memakai komponen repeater `LegalDocumentRepeater` untuk mencatat jenis izin (NIB, NPWP, CBIB, Lainnya), nomor dokumen, tanggal terbit, dan masa berlaku.
  - **Izin Wajib Dinamis**: Penanda izin wajib otomatis membaca konfigurasi `config('membership.required_legalities')` sesuai kategori yang dipilih di Langkah 2 (misalnya Eksportir wajib mencantumkan NIB).

#### 5. Form Request & Tindakan Penyimpanan
- Membuat form request dengan pesan validasi berbahasa Indonesia:
  - `SaveIdentityStepRequest`: menangani validasi dinamis WNI vs WNA dan saklar KTP.
  - `SaveCategoryStepRequest`: menangani validasi kategori, opsi kustom, dan data perwakilan lembaga.
  - `SaveBusinessProfileStepRequest`: menangani validasi usaha/pekerjaan dan penegakan izin legalitas wajib per kategori.
- Memperbarui `SaveRegistrationStep` untuk menyimpan langsung ke entitas relasional `MemberIdentity`, `MemberApplication`, `MemberBusiness`, dan `MemberLegalDocument`.

#### 6. Pengujian & Verifikasi
- Membuat rangkaian pengujian fitur `tests/Feature/WizardSteps1To3Test.php` (10 skenario pengujian, 64 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes aplikasi: 181 pengujian (1526 assertions) lulus tanpa kegagalan.
- Memverifikasi build aset frontend: `npm run build` sukses tanpa galat kompilasi TypeScript atau Vite.

### Prompt 1: Perubahan Database & Status Keanggotaan Baru

#### 1. Pemutakhiran Enum Status Keanggotaan & Kategori Program
- **`App\Enums\MembershipStatus`**:
  - Diperbarui menjadi 8 status: `non_member`, `draft`, `pending_review` (menunggu verifikasi awal), `revision`, `awaiting_payment`, `pending_approval` (sudah bayar, menunggu persetujuan akhir), `approved`, `rejected`.
  - Menambahkan method `label(): string` dalam Bahasa Indonesia dan `color(): string` untuk token warna badge UI (`neutral`, `warning`, `sky`, `info`, `success`, `danger`).
  - Menyelaraskan status badge di antarmuka frontend (`resources/js/lib/status.ts` dan `resources/js/types/index.d.ts`).
- **`App\Enums\ProgramCategory`**:
  - Membuat Enum baru dengan kategori program kerja: `pelatihan`, `pendampingan`, `informasi_pasar`, `akses_kemitraan`, `teknologi_budidaya`, `pengembangan_usaha`, lengkap dengan method `label(): string`.

#### 2. Saklar Pengaturan Verifikasi Awal
- Menambahkan kunci `membership.require_initial_verification` (default `true` / `1`) pada tabel `settings`.
- Implementasi pada `App\Actions\Membership\SubmitMembershipApplication` dan `App\Actions\Member\SubmitRegistration`:
  - Jika `true`: status setelah pendaftaran langsung diarahkan ke `pending_review` (verifikasi awal pengurus).
  - Jika `false`: status langsung diarahkan ke `awaiting_payment` (langsung pembayaran sebelum persetujuan).

#### 3. Migrasi Database Terpisah per Topik (13 Berkas Migrasi)
1. `2026_11_19_000001_update_membership_statuses_and_settings.php`: Migrasi data lama dari `'pending'` ke `'pending_review'` dan inisialisasi setting saklar verifikasi.
2. `2026_11_19_000002_create_membership_categories_and_types_tables.php`: Tabel `membership_categories` dan `membership_types` (nama, deskripsi, aturan AD/ART, status aktif).
3. `2026_11_19_000003_enhance_member_applications_table.php`: Menambahkan kolom `membership_category`, `applicant_type` (individual | institution), dan `membership_type_id`.
4. `2026_11_19_000004_create_member_identities_table.php`: Tabel identitas lengkap calon anggota (`nationality` wni/wna, `full_name`, `gender`, `birth_place`, `birth_date`, `phone`, `email`, encrypted `nik`, `ktp_address`, encrypted `passport_number`, `origin_country`, `years_in_indonesia`).
5. `2026_11_19_000005_update_member_businesses_for_has_many.php`: Mengubah `member_businesses` menjadi relasi `hasMany`, menambahkan `institution_name`, `activity_field`, `years_operating`, `scale`, `operational_info`, dan `is_primary`.
6. `2026_11_19_000006_create_member_legal_documents_table.php`: Tabel dokumen legalitas per unit usaha (`business_id`, `type`: nib/npwp/cbib/other, `number`, `label`, masa berlaku, `file_path`).
7. `2026_11_19_000007_create_member_fish_activities_table.php`: Tabel form dinamis aktivitas perikanan (`farming_system`, `pond_count`, `production_amount`, `production_unit`, `period`, `seed_need`, `feed_need`, `purchase_capacity`, `notes`).
8. `2026_11_19_000008_create_member_network_profiles_table.php`: Tabel jaringan bisnis (`marketing_info`, `distribution_areas` JSON provinsi, `supply_needs`, `cooperation_types` JSON, `professional_activities`).
9. `2026_11_19_000009_create_member_program_interests_table.php`: Tabel preferensi minat program kerja NSA (`category`, `note`).
10. `2026_11_19_000010_create_member_locations_and_photos_tables.php`: Tabel `member_locations` (`kind`: domicile/business/activity, hirarki wilayah lengkap, koordinat lat/long) dan `member_photos` (foto lapangan & kolam).
11. `2026_11_19_000011_create_programs_and_registrations_tables.php`: Tabel satu pintu `programs` NSA (kategori, ringkasan, isi, jadwal, status publikasi) dan `program_registrations` (pendaftaran anggota ke program).
12. `2026_11_19_000012_create_membership_fee_items_and_invoices_tables.php`: Tabel `membership_fee_items` (tarif administrasi, KTA, seragam, iuran tahunan yang dapat diedit di CMS), `member_invoices` (tagihan keanggotaan), dan `member_invoice_items` (snapshot rincian tagihan).
13. `2026_11_19_000013_make_payments_polymorphic.php`: Mengubah tabel `payments` menjadi relasi polimorfik (`payable_type`, `payable_id`) untuk mendukung pesanan toko dan tagihan keanggotaan, dengan tetap menjaga integritas data pesanan lama (`order_id` backfill).

#### 4. Catatan Deprecasi Tabel Lama (Data Preservation)
- Tabel `member_social_links`, `member_statements`, dan `member_commodities` ditandai **`@deprecated`** pada level model Eloquent (`MemberSocialLink`, `MemberStatement`, `MemberCommodity`).
- **Data historis tidak dihapus** dari database guna menjaga integritas riwayat keanggotaan sebelumnya.

#### 5. Model, Factory, dan Seeders Contoh
- Membuat model Eloquent baru dengan relasi lengkap, casting enkripsi, dan helper methods:
  - `MembershipCategory`, `MembershipType`, `MemberIdentity`, `MemberLegalDocument`, `MemberFishActivity`, `MemberNetworkProfile`, `MemberProgramInterest`, `MemberLocation`, `MemberPhoto`, `Program`, `ProgramRegistration`, `MembershipFeeItem`, `MemberInvoice`, `MemberInvoiceItem`.
- Menyesuaikan relasi pada model `Payment` (`payable()` morphTo), `MemberApplication`, `MemberBusiness`, `User`, dan `Order`.
- Menyediakan Factory dan Seeders data contoh resmi NSA yang dapat diedit via CMS:
  - `MembershipCategorySeeder`: Kategori dan jenis keanggotaan menurut contoh AD/ART.
  - `MembershipFeeItemSeeder`: Item biaya pendaftaran, KTA fisik, iuran tahunan, rompi, dan kemeja lapangan.
  - `ProgramSeeder`: Program kerja contoh mencakup pelatihan, sertifikasi CBIB, intelijen pasar, offtaker ekspor, IoT/bioflok, dan KUR maritim.
  - Didaftarkan ke `DatabaseSeeder.php`.

#### 6. Pengujian & Verifikasi
- Pengujian rollback dan migrasi ulang (`migrate:rollback` & `migrate`) berjalan bersih tanpa error.
- Membuat pengujian komprehensif `tests/Feature/NsaDatabaseAndStatusTest.php` (5 pengujian, 54 assertions) memvalidasi Enum, saklar verifikasi awal, pembayaran polimorfik pesanan toko & tagihan, enkripsi identitas, dan seluruh relasi model baru.
- Seluruh rangkaian pengujian sistem (**152 tests, 1200 assertions**) dan kompilasi build frontend (`npm run build`) lulus 100%.

---

### Prompt 7: Langkah 7 (Lokasi, Foto, Dokumen), 8 (Paket & Administrasi), & 9 (Pemeriksaan & Pengiriman)

#### 1. Langkah 7: Lokasi, Foto, dan Dokumen (`Step7LocationDocuments.tsx`)
- **Kartu 1: Alamat Domisili atau Usaha**:
  - `RegionSelect` 4 tingkat (Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan/Desa).
  - Kolom kode pos dan textarea alamat lengkap dengan penghitung karakter `0/250`.
  - Centang "Alamat usaha berbeda dengan domisili" yang secara reaktif membuka subform alamat fasilitas usaha terpisah (RegionSelect 4 tingkat + kode pos + alamat lengkap).
  - Tersimpan ke tabel `member_locations` dengan `kind` = `domicile` dan `kind` = `business`, serta disinkronkan ke `member_businesses` untuk kemudahan pelaporan wilayah dan sensus statistik.
- **Kartu 2: Titik Koordinat Lokasi Kegiatan**:
  - Integrasi `MapPicker` (Leaflet, pencarian lokasi, geser pin GPS).
  - Repeater multi-titik koordinat: mendukung penambahan lebih dari satu lokasi fasilitas/tambak/hatchery, tersimpan ke `member_locations` dengan `kind` = `activity`.
- **Kartu 3: Foto Fasilitas Usaha (Opsional, 1–5 Foto)**:
  - Unggah 1–5 foto fasilitas atau tempat usaha ke disk publik (`member-photos/{application_id}`).
  - Pratinjau thumbnail responsif dengan tombol hapus foto interaktif.
  - Endpoint `POST /akun/keanggotaan/foto` dan `DELETE /akun/keanggotaan/foto/{photo}` terintegrasi di controller dan tabel `member_photos`.
- **Kartu 4: Dokumen Pendukung Dinamis**:
  - Menghasilkan satu `DocumentUploadCard` per berkas yang dibutuhkan berdasarkan data Langkah 1–3:
    - Identitas: KTP jika WNI (diatur oleh saklar `membership.require_ktp_for_wni`) atau Paspor jika WNA.
    - Izin usaha: berkas persyaratan untuk setiap izin yang dicantumkan pada Langkah 3 (NIB, NPWP, CBIB, SK Kemenkumham, SIUP, Izin Lokasi, dll.).
  - Disimpan pada storage disk privat dengan URL bertanda tangan (signed URL).

#### 2. Langkah 8: Paket Keanggotaan dan Administrasi (`Step8Administration.tsx`)
- **Daftar Biaya Dinamis dari Database (`membership_fee_items`)**:
  - Tidak di-hardcode: mengambil data langsung dari tabel `membership_fee_items` (Biaya Registrasi, KTA Fisik RFID, Iuran Tahunan Anggota, Rompi Resmi NSA, Kemeja Resmi NSA).
  - Item wajib (`type === 'required'` atau `recurring`) otomatis tercentang dan terkunci dengan ikon gembok.
  - Item seragam opsional dapat dicentang, dipilih ukurannya (S, M, L, XL, XXL), dan diatur kuantitasnya (1–10).
- **Kalkulasi Akumulasi Total Live**:
  - Kartu estimasi draf invoice dengan animasi angka tabular yang menghitung total secara langsung setiap kali item atau jumlah diubah.
- **Pemberitahuan Status Pembayaran Adaptif**:
  - Menyesuaikan dengan saklar pengaturan `membership.require_initial_verification`:
    - Bila `true`: "Pembayaran dilakukan setelah berkas pendaftaran Anda lolos verifikasi awal oleh tim pengurus NSA."
    - Bila `false`: "Pembayaran administrasi dapat langsung diselesaikan setelah formulir pendaftaran ini Anda kirimkan."
  - Data tersimpan sebagai draf invoice belum ditagihkan pada `member_invoices` dan `member_invoice_items`.

#### 3. Langkah 9: Pemeriksaan Akhir dan Pengiriman (`Step9Review.tsx`)
- **Ringkasan Komprehensif Seluruh 8 Langkah**:
  - Rincian ringkas per langkah (Identitas dengan masking NIK `************1234` atau Paspor `****5678`, Kategori, Profil Usaha, Aktivitas Perikanan, Jaringan Bisnis, Minat Program, Lokasi & Dokumen, Paket Administrasi).
  - Tombol "Ubah" pada setiap kartu yang mengarahkan pengguna kembali ke langkah bersangkutan.
- **Deteksi Kelengkapan Data & Dokumen**:
  - Menampilkan peringatan kelengkapan data jika ada kolom atau berkas wajib yang belum diunggah dan memblokir tombol kirim sampai seluruh persyaratan terpenuhi.
- **Centang Persetujuan Wajib & Modal Dokumen Hukum**:
  - Checkbox wajib persetujuan Ketentuan & AD/ART NSA serta Kebijakan Privasi NSA.
  - Tautan pembuka modal dialog yang memuat naskah AD/ART dan Kebijakan Privasi dari tabel `settings` (CMS-driven).
- **Aksi Server `SubmitRegistration` Terpusat**:
  - Validasi ulang seluruh 9 langkah di sisi server (Server-Side Re-validation).
  - Mengubah status keanggotaan pengguna dan aplikasi sesuai saklar:
    - `pending_review` bila verifikasi awal aktif.
    - `awaiting_payment` bila verifikasi awal dinonaktifkan.
  - Mencatat review log pendaftaran anggota baru.
  - Mengirim email konfirmasi ke pemohon (`MembershipApplicationSubmitted`) dan notifikasi ke admin (`AdminNewMembershipNotification`) dalam satu transaksi database (`DB::transaction`).

#### 4. Pengujian Otomatis
- Menambahkan test suite `tests/Feature/WizardSteps7To9Test.php` (8 skenario pengujian komprehensif):
  - Pengujian penyimpanan domisili dan koordinat kegiatan.
  - Pengujian penyimpanan alamat usaha terpisah.
  - Pengujian unggah dan hapus foto usaha hingga 5 foto.
  - Pengujian kalkulasi total draf invoice administrasi dan ukuran seragam.
  - Pengujian validasi penolakan submit tanpa centang persetujuan.
  - Pengujian penegakan berkas dokumen wajib berdasarkan kewarganegaraan dan izin usaha.
  - Pengujian perubahan status target sesuai saklar `membership.require_initial_verification`.
  - Pengujian pengiriman email notifikasi pemohon dan admin.
- Seluruh 197 tes fitur dan unit lulus 100% (1.592 asersi).

---

### Prompt 6: Langkah 4 (Aktivitas Perikanan Dinamis), 5 (Jaringan Bisnis), & 6 (Minat Program)

#### 1. Langkah 4: Data Aktivitas Perikanan Berbasis Konfigurasi (`config/activity_forms.php`)
- **Desain Config-Driven**:
  - Membuat `config/activity_forms.php` yang memetakan kategori keanggotaan ke field spesifik:
    - `pembudidaya`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `seed_need`, `feed_need`, `notes`.
    - `pembenih`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `notes`.
    - `buyer` / `buyer-eksportir`: `fish_category_id`, `purchase_capacity` + unit + periode, `notes`.
    - `pengolah`: `fish_category_id`, `farming_system`, `production_amount`, `purchase_capacity`, `notes`.
    - `pakan-sarana`: `farming_system`, `production_amount`, `notes`.
    - `akademisi`, `konsultan`, `lainnya`: `fields => []`, `is_skippable => true`.
- **Aturan Validasi Terpusat (`ActivityFormRules`)**:
  - Kelas `App\Support\ActivityFormRules` menghasilkan aturan dan pesan validasi Laravel langsung dari konfigurasi, menghindari duplikasi aturan.
  - Memeriksa apakah langkah dapat dilewati (`isSkippable`).
- **Komponen Frontend**:
  - `DynamicActivityForm.tsx`: Komponen form dinamis yang merender berbagai jenis input (select_fish, select, number, number_unit_period, text, textarea) dan repeater "Tambah Komoditas Lain" dengan animasi halus Framer Motion.
  - Kartu Kategori Tidak Wajib: Menampilkan pesan informatif dan tombol "Lewati Langkah Ini" untuk kategori non-akuakultur langsung (Akademisi, Konsultan, dll.) dan menandai langkah sebagai selesai.
  - `Step4FishActivities.tsx`: Membungkus form dinamis pada alur pendaftaran wizard.

#### 2. Langkah 5: Jaringan dan Aktivitas Bisnis (`Step5NetworkProfile.tsx`)
- **Informasi Pemasaran**: Textarea saluran dan metode pemasaran hasil panen atau produk.
- **Wilayah Distribusi**: Multi-select provinsi interaktif dengan chip badge yang dapat ditambah dan dihapus.
- **Kebutuhan Pasokan**: Textarea untuk mendeskripsikan kebutuhan bahan baku atau sarana rutin.
- **Jenis Kerja Sama**: Checkbox pilihan (pasokan, distribusi, investasi, teknologi, penelitian, lainnya + input teks kustom).
- **Kegiatan Profesional**: Textarea untuk mencatat keaktifan dalam kelompok tani, komunitas, atau asosiasi.
- **Sifat Fleksibel**: Seluruh kolom bersifat opsional dan dapat disimpan kosong / dilewati. Tersimpan ke tabel `member_network_profiles`.

#### 3. Langkah 6: Kebutuhan dan Minat Program NSA (`Step6ProgramInterests.tsx`)
- **Pilihan Multi Kartu Program**:
  - Pelatihan & Workshop (Ikon `GraduationCap`)
  - Pendampingan Teknis Farm (Ikon `Users`)
  - Informasi & Intelijen Pasar (Ikon `TrendingUp`)
  - Akses Kemitraan & Permodalan (Ikon `Handshake`)
  - Teknologi & Inovasi Budidaya (Ikon `Cpu`)
  - Pengembangan Skala Usaha (Ikon `Building2`)
- Setiap kartu dilengkapi ringkasan manfaat satu kalimat dan indikator centang teranimasi saat dipilih.
- Kolom catatan tambahan opsional untuk kebutuhan pelatihan/konsultasi spesifik.
- Tersimpan ke tabel `member_program_interests` dengan backed enum `App\Enums\ProgramCategory`.

#### 4. Form Request, Controller & Backend
- Membuat Form Request terisolasi dengan pesan Bahasa Indonesia:
  - `SaveFishActivitiesStepRequest` (menggunakan `ActivityFormRules`)
  - `SaveNetworkProfileStepRequest`
  - `SaveProgramInterestsStepRequest`
- Memperbarui `SaveRegistrationStep` untuk menyimpan secara atomik ke `member_fish_activities`, `member_network_profiles`, dan `member_program_interests`.
- Memperbarui `MemberRegistrationController` untuk menyalurkan props `activityFormConfig`, `programCategories`, dan draft data Steps 4, 5, 6 ke frontend.

#### 5. Pengujian & Kompilasi
- Membuat `tests/Feature/WizardSteps4To6Test.php` (8 skenario tes, 36 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes: **189 tests passed, 1562 assertions** (0 gagal).
- Kompilasi build frontend: `npm run build` sukses tanpa galat kompilasi (9.04s - 11.96s).

---

### Prompt 5: Restrukturisasi Wizard 9 Langkah Baru & Pengerjaan Langkah 1–3

#### 1. Arsitektur 9 Langkah Pendaftaran Anggota (`MemberApplication::STEPS`)
- Memetakan ulang 9 langkah pendaftaran dengan slug baru:
  1. `identitas`: Identitas Calon Anggota (WNI / WNA)
  2. `kategori-keanggotaan`: Kategori Kegiatan & Jenis Keanggotaan
  3. `profil-usaha`: Profil Pekerjaan atau Usaha & Legalitas
  4. `aktivitas-perikanan`: Aktivitas Perikanan (Form Dinamis)
  5. `jaringan-bisnis`: Jaringan & Aktivitas Bisnis
  6. `minat-program`: Minat Program Kerja NSA
  7. `lokasi-dokumen`: Titik Lokasi & Unggah Berkas Legalitas
  8. `paket-administrasi`: Paket Keanggotaan & Administrasi
  9. `pemeriksaan`: Pemeriksaan Akhir & Pernyataan
- Menghapus komponen langkah lama yang tidak digunakan lagi: `Step5Social.tsx`, `Step6Commodity.tsx`, `Step8Statement.tsx`.
- Mempertahankan kompatibilitas langkah lama pada level controller & model via `MemberApplication::LEGACY_STEPS`.

#### 2. Langkah 1: Identitas Calon Anggota (`Step1Identity.tsx`)
- **Segmented Control Kewarganegaraan**: WNI vs WNA dengan transisi animasi halus Framer Motion (`AnimatePresence`).
- **Data Umum**: Nama lengkap, jenis kelamin (pilihan tombol interaktif), tempat lahir, tanggal lahir, nomor telepon (+62 otomatis), dan email (terkunci sesuai akun login).
- **Usia Otomatis**: Dihitung secara real-time dari tanggal lahir sebagai badge readonly tanpa input terpisah.
- **WNI Form**:
  - Kolom NIK 16 digit terenkripsi (`encrypted` casting pada `MemberIdentity`).
  - Alamat domisili sesuai KTP lengkap menggunakan komponen cascading `RegionSelect` (provinsi, kabupaten, kecamatan, desa) + alamat jalan.
  - Diatur oleh saklar dinamis `membership.require_ktp_for_wni` (default `true`) di tabel `settings`.
- **WNA Form**:
  - Kolom nomor paspor terenkripsi.
  - Pilihan negara asal (`COUNTRY_OPTIONS`) dan lama tinggal di Indonesia (angka tahun).
- **Validasi**: Kolom tersembunyi (mis. WNA saat memilih WNI) otomatis tidak ikut divalidasi.

#### 3. Langkah 2: Kategori dan Jenis Keanggotaan (`Step2Category.tsx`)
- **Kategori Kegiatan**: Kartu pilihan interaktif yang bersumber dari tabel `membership_categories` dengan opsi "Lainnya" yang membuka input teks dinamis untuk kategori kustom.
- **Status Pendaftar**: Pilihan radio kartu antara "Individu" dan "Perwakilan Lembaga".
  - Jika "Perwakilan Lembaga" dipilih, form dinamis membuka input nama lembaga dan jabatan pendaftar.
- **Jenis Keanggotaan**: Kartu pilihan yang bersumber dari tabel `membership_types` dengan penjelasan ringkas aturan AD/ART organisasi.

#### 4. Langkah 3: Profil Pekerjaan atau Usaha (`Step3BusinessProfile.tsx`)
- **Tata Letak FormCard 2 Kolom**:
  - **Kartu 1 (Profil Usaha)**: Nama usaha / lembaga, bidang kegiatan, lama berusaha (tahun), skala usaha (Mikro, Kecil, Menengah, Besar dengan tooltip penjelasan kriteria permodalan/omzet), dan informasi operasional (textarea maks. 500 karakter dengan penghitung).
  - **Centang Individu Tanpa Usaha**: Opsi "Saya belum memiliki badan usaha" mengubah form menjadi input "Pekerjaan / profesi utama".
  - **Kartu 2 (Perizinan & Legalitas)**: Memakai komponen repeater `LegalDocumentRepeater` untuk mencatat jenis izin (NIB, NPWP, CBIB, Lainnya), nomor dokumen, tanggal terbit, dan masa berlaku.
  - **Izin Wajib Dinamis**: Penanda izin wajib otomatis membaca konfigurasi `config('membership.required_legalities')` sesuai kategori yang dipilih di Langkah 2 (misalnya Eksportir wajib mencantumkan NIB).

#### 5. Form Request & Tindakan Penyimpanan
- Membuat form request dengan pesan validasi berbahasa Indonesia:
  - `SaveIdentityStepRequest`: menangani validasi dinamis WNI vs WNA dan saklar KTP.
  - `SaveCategoryStepRequest`: menangani validasi kategori, opsi kustom, dan data perwakilan lembaga.
  - `SaveBusinessProfileStepRequest`: menangani validasi usaha/pekerjaan dan penegakan izin legalitas wajib per kategori.
- Memperbarui `SaveRegistrationStep` untuk menyimpan langsung ke entitas relasional `MemberIdentity`, `MemberApplication`, `MemberBusiness`, dan `MemberLegalDocument`.

#### 6. Pengujian & Verifikasi
- Membuat rangkaian pengujian fitur `tests/Feature/WizardSteps1To3Test.php` (10 skenario pengujian, 64 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes aplikasi: 181 pengujian (1526 assertions) lulus tanpa kegagalan.
- Memverifikasi build aset frontend: `npm run build` sukses tanpa galat kompilasi TypeScript atau Vite.

### Prompt 2: Alur Login/Sign Up & Pembagian Dua Dashboard

#### 1. Action Terpusat `ResolveHomeRoute`
- Membuat `App\Actions\ResolveHomeRoute` (dan alias `App\Actions\Auth\ResolveHomeRoute`):
  - Admin / Superadmin → `/admin`
  - User status `approved` → `/anggota` (Dashboard Membership)
  - User lain (`non_member`, `draft`, `pending_review`, `revision`, `awaiting_payment`, `pending_approval`, `rejected`) → `/akun` (Dashboard sederhana)
- Diterapkan pada `AuthenticatedSessionController@store`.

#### 2. Sign Up Alur NSA
- Memperbarui `RegisteredUserController@store`:
  - Akun baru otomatis dibuat dengan `role: Role::User` dan `membership_status: MembershipStatus::NonMember`.
  - Setelah registrasi, pengguna diarahkan ke `/akun` (dashboard sederhana).

#### 3. Middleware `member.approved`
- Membuat middleware `App\Http\Middleware\EnsureMemberIsApproved` dan mendaftarkan alias `member.approved` pada `bootstrap/app.php`.
- Melindungi semua rute `/anggota/*`. User non-approved dialihkan ke `/akun` dengan flash toast pesan `"Fitur ini khusus anggota"`.

#### 4. Pemisahan & Perapian Rute (`routes/account.php` & `routes/member.php`)
- **`routes/account.php`**: Berisi seluruh endpoint `/akun/*` (dashboard sederhana, pendaftaran 9 langkah, status, formulir, pesanan, dokumen privat, dan drawer API) dengan prefix `akun` dan name `account.`.
- **`routes/member.php`**: Berisi seluruh endpoint `/anggota/*` (dashboard keanggotaan) dengan prefix `anggota`, name `member.`, serta middleware `['web', 'auth', 'member.approved']`.
- Menghapus deklarasi rute `/akun` ganda dari `routes/web.php`.

#### 5. Dashboard `/akun` & Tombol "Gabung Jadi Anggota"
- Memperbarui `resources/js/Pages/Account/Dashboard.tsx`:
  - Menampilkan informasi akun, ringkasan status keanggotaan, dan akses cepat ke layanan mandiri.
  - Tombol aksi cerdas:
    - Status `non_member` / `draft`: bertuliskan **"Gabung Jadi Anggota"** mengarah ke wizard `/akun/keanggotaan/daftar`.
    - Status dalam proses (`pending_review`, `awaiting_payment`, `pending_approval`, dll.): bertuliskan **"Lihat Status Keanggotaan"** mengarah ke `/akun/keanggotaan/status`.
  - Wizard controller juga mengunci pendaftaran ganda dan mengarahkan pengguna yang sedang diproses ke halaman status.

#### 6. Tombol "Ke Web Utama" di Header Dashboard
- Memperbarui `resources/js/Components/layout/DashboardShell.tsx`:
  - Menyediakan tombol **"Ke Web Utama"** dengan ikon `Home` dan tautan langsung ke `"/"`.
  - Diaktifkan secara default pada `AccountLayout.tsx` dan `MemberLayout.tsx`.

#### 7. Navbar Publik & Menu Akun Kecil
- Memperbarui `resources/js/Components/layout/UserDropdown.tsx` dan `MobileDrawer.tsx`:
  - Saat login, menggantikan tombol Masuk/Daftar dengan menu akun kecil:
    - **Dashboard**: mengarah secara dinamis ke `/admin` (staff), `/anggota` (anggota disetujui), atau `/akun` (pengguna biasa).
    - **Keluar**: tombol logout dengan konfirmasi metode POST.

#### 8. Pengujian & Verifikasi
- Membuat Feature test terintegrasi `tests/Feature/NsaAuthAndDashboardTest.php` (5 pengujian, 70 assertions).
- Memperbarui `tests/Feature/Auth/AuthenticationTest.php` dan `tests/Feature/Auth/RegistrationTest.php`.
- Seluruh rangkaian pengujian sistem (**158 tests, 1276 assertions**) dan kompilasi build frontend (`npm run build`) lulus 100%.

---

### Prompt 7: Langkah 7 (Lokasi, Foto, Dokumen), 8 (Paket & Administrasi), & 9 (Pemeriksaan & Pengiriman)

#### 1. Langkah 7: Lokasi, Foto, dan Dokumen (`Step7LocationDocuments.tsx`)
- **Kartu 1: Alamat Domisili atau Usaha**:
  - `RegionSelect` 4 tingkat (Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan/Desa).
  - Kolom kode pos dan textarea alamat lengkap dengan penghitung karakter `0/250`.
  - Centang "Alamat usaha berbeda dengan domisili" yang secara reaktif membuka subform alamat fasilitas usaha terpisah (RegionSelect 4 tingkat + kode pos + alamat lengkap).
  - Tersimpan ke tabel `member_locations` dengan `kind` = `domicile` dan `kind` = `business`, serta disinkronkan ke `member_businesses` untuk kemudahan pelaporan wilayah dan sensus statistik.
- **Kartu 2: Titik Koordinat Lokasi Kegiatan**:
  - Integrasi `MapPicker` (Leaflet, pencarian lokasi, geser pin GPS).
  - Repeater multi-titik koordinat: mendukung penambahan lebih dari satu lokasi fasilitas/tambak/hatchery, tersimpan ke `member_locations` dengan `kind` = `activity`.
- **Kartu 3: Foto Fasilitas Usaha (Opsional, 1–5 Foto)**:
  - Unggah 1–5 foto fasilitas atau tempat usaha ke disk publik (`member-photos/{application_id}`).
  - Pratinjau thumbnail responsif dengan tombol hapus foto interaktif.
  - Endpoint `POST /akun/keanggotaan/foto` dan `DELETE /akun/keanggotaan/foto/{photo}` terintegrasi di controller dan tabel `member_photos`.
- **Kartu 4: Dokumen Pendukung Dinamis**:
  - Menghasilkan satu `DocumentUploadCard` per berkas yang dibutuhkan berdasarkan data Langkah 1–3:
    - Identitas: KTP jika WNI (diatur oleh saklar `membership.require_ktp_for_wni`) atau Paspor jika WNA.
    - Izin usaha: berkas persyaratan untuk setiap izin yang dicantumkan pada Langkah 3 (NIB, NPWP, CBIB, SK Kemenkumham, SIUP, Izin Lokasi, dll.).
  - Disimpan pada storage disk privat dengan URL bertanda tangan (signed URL).

#### 2. Langkah 8: Paket Keanggotaan dan Administrasi (`Step8Administration.tsx`)
- **Daftar Biaya Dinamis dari Database (`membership_fee_items`)**:
  - Tidak di-hardcode: mengambil data langsung dari tabel `membership_fee_items` (Biaya Registrasi, KTA Fisik RFID, Iuran Tahunan Anggota, Rompi Resmi NSA, Kemeja Resmi NSA).
  - Item wajib (`type === 'required'` atau `recurring`) otomatis tercentang dan terkunci dengan ikon gembok.
  - Item seragam opsional dapat dicentang, dipilih ukurannya (S, M, L, XL, XXL), dan diatur kuantitasnya (1–10).
- **Kalkulasi Akumulasi Total Live**:
  - Kartu estimasi draf invoice dengan animasi angka tabular yang menghitung total secara langsung setiap kali item atau jumlah diubah.
- **Pemberitahuan Status Pembayaran Adaptif**:
  - Menyesuaikan dengan saklar pengaturan `membership.require_initial_verification`:
    - Bila `true`: "Pembayaran dilakukan setelah berkas pendaftaran Anda lolos verifikasi awal oleh tim pengurus NSA."
    - Bila `false`: "Pembayaran administrasi dapat langsung diselesaikan setelah formulir pendaftaran ini Anda kirimkan."
  - Data tersimpan sebagai draf invoice belum ditagihkan pada `member_invoices` dan `member_invoice_items`.

#### 3. Langkah 9: Pemeriksaan Akhir dan Pengiriman (`Step9Review.tsx`)
- **Ringkasan Komprehensif Seluruh 8 Langkah**:
  - Rincian ringkas per langkah (Identitas dengan masking NIK `************1234` atau Paspor `****5678`, Kategori, Profil Usaha, Aktivitas Perikanan, Jaringan Bisnis, Minat Program, Lokasi & Dokumen, Paket Administrasi).
  - Tombol "Ubah" pada setiap kartu yang mengarahkan pengguna kembali ke langkah bersangkutan.
- **Deteksi Kelengkapan Data & Dokumen**:
  - Menampilkan peringatan kelengkapan data jika ada kolom atau berkas wajib yang belum diunggah dan memblokir tombol kirim sampai seluruh persyaratan terpenuhi.
- **Centang Persetujuan Wajib & Modal Dokumen Hukum**:
  - Checkbox wajib persetujuan Ketentuan & AD/ART NSA serta Kebijakan Privasi NSA.
  - Tautan pembuka modal dialog yang memuat naskah AD/ART dan Kebijakan Privasi dari tabel `settings` (CMS-driven).
- **Aksi Server `SubmitRegistration` Terpusat**:
  - Validasi ulang seluruh 9 langkah di sisi server (Server-Side Re-validation).
  - Mengubah status keanggotaan pengguna dan aplikasi sesuai saklar:
    - `pending_review` bila verifikasi awal aktif.
    - `awaiting_payment` bila verifikasi awal dinonaktifkan.
  - Mencatat review log pendaftaran anggota baru.
  - Mengirim email konfirmasi ke pemohon (`MembershipApplicationSubmitted`) dan notifikasi ke admin (`AdminNewMembershipNotification`) dalam satu transaksi database (`DB::transaction`).

#### 4. Pengujian Otomatis
- Menambahkan test suite `tests/Feature/WizardSteps7To9Test.php` (8 skenario pengujian komprehensif):
  - Pengujian penyimpanan domisili dan koordinat kegiatan.
  - Pengujian penyimpanan alamat usaha terpisah.
  - Pengujian unggah dan hapus foto usaha hingga 5 foto.
  - Pengujian kalkulasi total draf invoice administrasi dan ukuran seragam.
  - Pengujian validasi penolakan submit tanpa centang persetujuan.
  - Pengujian penegakan berkas dokumen wajib berdasarkan kewarganegaraan dan izin usaha.
  - Pengujian perubahan status target sesuai saklar `membership.require_initial_verification`.
  - Pengujian pengiriman email notifikasi pemohon dan admin.
- Seluruh 197 tes fitur dan unit lulus 100% (1.592 asersi).

---

### Prompt 6: Langkah 4 (Aktivitas Perikanan Dinamis), 5 (Jaringan Bisnis), & 6 (Minat Program)

#### 1. Langkah 4: Data Aktivitas Perikanan Berbasis Konfigurasi (`config/activity_forms.php`)
- **Desain Config-Driven**:
  - Membuat `config/activity_forms.php` yang memetakan kategori keanggotaan ke field spesifik:
    - `pembudidaya`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `seed_need`, `feed_need`, `notes`.
    - `pembenih`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `notes`.
    - `buyer` / `buyer-eksportir`: `fish_category_id`, `purchase_capacity` + unit + periode, `notes`.
    - `pengolah`: `fish_category_id`, `farming_system`, `production_amount`, `purchase_capacity`, `notes`.
    - `pakan-sarana`: `farming_system`, `production_amount`, `notes`.
    - `akademisi`, `konsultan`, `lainnya`: `fields => []`, `is_skippable => true`.
- **Aturan Validasi Terpusat (`ActivityFormRules`)**:
  - Kelas `App\Support\ActivityFormRules` menghasilkan aturan dan pesan validasi Laravel langsung dari konfigurasi, menghindari duplikasi aturan.
  - Memeriksa apakah langkah dapat dilewati (`isSkippable`).
- **Komponen Frontend**:
  - `DynamicActivityForm.tsx`: Komponen form dinamis yang merender berbagai jenis input (select_fish, select, number, number_unit_period, text, textarea) dan repeater "Tambah Komoditas Lain" dengan animasi halus Framer Motion.
  - Kartu Kategori Tidak Wajib: Menampilkan pesan informatif dan tombol "Lewati Langkah Ini" untuk kategori non-akuakultur langsung (Akademisi, Konsultan, dll.) dan menandai langkah sebagai selesai.
  - `Step4FishActivities.tsx`: Membungkus form dinamis pada alur pendaftaran wizard.

#### 2. Langkah 5: Jaringan dan Aktivitas Bisnis (`Step5NetworkProfile.tsx`)
- **Informasi Pemasaran**: Textarea saluran dan metode pemasaran hasil panen atau produk.
- **Wilayah Distribusi**: Multi-select provinsi interaktif dengan chip badge yang dapat ditambah dan dihapus.
- **Kebutuhan Pasokan**: Textarea untuk mendeskripsikan kebutuhan bahan baku atau sarana rutin.
- **Jenis Kerja Sama**: Checkbox pilihan (pasokan, distribusi, investasi, teknologi, penelitian, lainnya + input teks kustom).
- **Kegiatan Profesional**: Textarea untuk mencatat keaktifan dalam kelompok tani, komunitas, atau asosiasi.
- **Sifat Fleksibel**: Seluruh kolom bersifat opsional dan dapat disimpan kosong / dilewati. Tersimpan ke tabel `member_network_profiles`.

#### 3. Langkah 6: Kebutuhan dan Minat Program NSA (`Step6ProgramInterests.tsx`)
- **Pilihan Multi Kartu Program**:
  - Pelatihan & Workshop (Ikon `GraduationCap`)
  - Pendampingan Teknis Farm (Ikon `Users`)
  - Informasi & Intelijen Pasar (Ikon `TrendingUp`)
  - Akses Kemitraan & Permodalan (Ikon `Handshake`)
  - Teknologi & Inovasi Budidaya (Ikon `Cpu`)
  - Pengembangan Skala Usaha (Ikon `Building2`)
- Setiap kartu dilengkapi ringkasan manfaat satu kalimat dan indikator centang teranimasi saat dipilih.
- Kolom catatan tambahan opsional untuk kebutuhan pelatihan/konsultasi spesifik.
- Tersimpan ke tabel `member_program_interests` dengan backed enum `App\Enums\ProgramCategory`.

#### 4. Form Request, Controller & Backend
- Membuat Form Request terisolasi dengan pesan Bahasa Indonesia:
  - `SaveFishActivitiesStepRequest` (menggunakan `ActivityFormRules`)
  - `SaveNetworkProfileStepRequest`
  - `SaveProgramInterestsStepRequest`
- Memperbarui `SaveRegistrationStep` untuk menyimpan secara atomik ke `member_fish_activities`, `member_network_profiles`, dan `member_program_interests`.
- Memperbarui `MemberRegistrationController` untuk menyalurkan props `activityFormConfig`, `programCategories`, dan draft data Steps 4, 5, 6 ke frontend.

#### 5. Pengujian & Kompilasi
- Membuat `tests/Feature/WizardSteps4To6Test.php` (8 skenario tes, 36 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes: **189 tests passed, 1562 assertions** (0 gagal).
- Kompilasi build frontend: `npm run build` sukses tanpa galat kompilasi (9.04s - 11.96s).

---

### Prompt 5: Restrukturisasi Wizard 9 Langkah Baru & Pengerjaan Langkah 1–3

#### 1. Arsitektur 9 Langkah Pendaftaran Anggota (`MemberApplication::STEPS`)
- Memetakan ulang 9 langkah pendaftaran dengan slug baru:
  1. `identitas`: Identitas Calon Anggota (WNI / WNA)
  2. `kategori-keanggotaan`: Kategori Kegiatan & Jenis Keanggotaan
  3. `profil-usaha`: Profil Pekerjaan atau Usaha & Legalitas
  4. `aktivitas-perikanan`: Aktivitas Perikanan (Form Dinamis)
  5. `jaringan-bisnis`: Jaringan & Aktivitas Bisnis
  6. `minat-program`: Minat Program Kerja NSA
  7. `lokasi-dokumen`: Titik Lokasi & Unggah Berkas Legalitas
  8. `paket-administrasi`: Paket Keanggotaan & Administrasi
  9. `pemeriksaan`: Pemeriksaan Akhir & Pernyataan
- Menghapus komponen langkah lama yang tidak digunakan lagi: `Step5Social.tsx`, `Step6Commodity.tsx`, `Step8Statement.tsx`.
- Mempertahankan kompatibilitas langkah lama pada level controller & model via `MemberApplication::LEGACY_STEPS`.

#### 2. Langkah 1: Identitas Calon Anggota (`Step1Identity.tsx`)
- **Segmented Control Kewarganegaraan**: WNI vs WNA dengan transisi animasi halus Framer Motion (`AnimatePresence`).
- **Data Umum**: Nama lengkap, jenis kelamin (pilihan tombol interaktif), tempat lahir, tanggal lahir, nomor telepon (+62 otomatis), dan email (terkunci sesuai akun login).
- **Usia Otomatis**: Dihitung secara real-time dari tanggal lahir sebagai badge readonly tanpa input terpisah.
- **WNI Form**:
  - Kolom NIK 16 digit terenkripsi (`encrypted` casting pada `MemberIdentity`).
  - Alamat domisili sesuai KTP lengkap menggunakan komponen cascading `RegionSelect` (provinsi, kabupaten, kecamatan, desa) + alamat jalan.
  - Diatur oleh saklar dinamis `membership.require_ktp_for_wni` (default `true`) di tabel `settings`.
- **WNA Form**:
  - Kolom nomor paspor terenkripsi.
  - Pilihan negara asal (`COUNTRY_OPTIONS`) dan lama tinggal di Indonesia (angka tahun).
- **Validasi**: Kolom tersembunyi (mis. WNA saat memilih WNI) otomatis tidak ikut divalidasi.

#### 3. Langkah 2: Kategori dan Jenis Keanggotaan (`Step2Category.tsx`)
- **Kategori Kegiatan**: Kartu pilihan interaktif yang bersumber dari tabel `membership_categories` dengan opsi "Lainnya" yang membuka input teks dinamis untuk kategori kustom.
- **Status Pendaftar**: Pilihan radio kartu antara "Individu" dan "Perwakilan Lembaga".
  - Jika "Perwakilan Lembaga" dipilih, form dinamis membuka input nama lembaga dan jabatan pendaftar.
- **Jenis Keanggotaan**: Kartu pilihan yang bersumber dari tabel `membership_types` dengan penjelasan ringkas aturan AD/ART organisasi.

#### 4. Langkah 3: Profil Pekerjaan atau Usaha (`Step3BusinessProfile.tsx`)
- **Tata Letak FormCard 2 Kolom**:
  - **Kartu 1 (Profil Usaha)**: Nama usaha / lembaga, bidang kegiatan, lama berusaha (tahun), skala usaha (Mikro, Kecil, Menengah, Besar dengan tooltip penjelasan kriteria permodalan/omzet), dan informasi operasional (textarea maks. 500 karakter dengan penghitung).
  - **Centang Individu Tanpa Usaha**: Opsi "Saya belum memiliki badan usaha" mengubah form menjadi input "Pekerjaan / profesi utama".
  - **Kartu 2 (Perizinan & Legalitas)**: Memakai komponen repeater `LegalDocumentRepeater` untuk mencatat jenis izin (NIB, NPWP, CBIB, Lainnya), nomor dokumen, tanggal terbit, dan masa berlaku.
  - **Izin Wajib Dinamis**: Penanda izin wajib otomatis membaca konfigurasi `config('membership.required_legalities')` sesuai kategori yang dipilih di Langkah 2 (misalnya Eksportir wajib mencantumkan NIB).

#### 5. Form Request & Tindakan Penyimpanan
- Membuat form request dengan pesan validasi berbahasa Indonesia:
  - `SaveIdentityStepRequest`: menangani validasi dinamis WNI vs WNA dan saklar KTP.
  - `SaveCategoryStepRequest`: menangani validasi kategori, opsi kustom, dan data perwakilan lembaga.
  - `SaveBusinessProfileStepRequest`: menangani validasi usaha/pekerjaan dan penegakan izin legalitas wajib per kategori.
- Memperbarui `SaveRegistrationStep` untuk menyimpan langsung ke entitas relasional `MemberIdentity`, `MemberApplication`, `MemberBusiness`, dan `MemberLegalDocument`.

#### 6. Pengujian & Verifikasi
- Membuat rangkaian pengujian fitur `tests/Feature/WizardSteps1To3Test.php` (10 skenario pengujian, 64 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes aplikasi: 181 pengujian (1526 assertions) lulus tanpa kegagalan.
- Memverifikasi build aset frontend: `npm run build` sukses tanpa galat kompilasi TypeScript atau Vite.

### Prompt 3: Dashboard Sederhana Pengguna Biasa (Non-Membership)

#### 1. Komponen Tata Letak Terpadu Reusable (`PortalLayout`, `PageBanner`, `SummaryRow`)
- **`resources/js/Layouts/PortalLayout.tsx`**:
  - Komponen layout terpadu yang dirancang untuk dipakai ulang pada Dasbor Sederhana (`/akun`) dan Dasbor Membership (`/anggota` pada Prompt 9).
  - **White Header**: Tinggi terpadu 72px (h-18), latar putih bersih, slot logo NSA, penanda area "Portal Anggota", tombol "Ke Web Utama" (ikon `Home` mengarah ke `/`), serta avatar dan ringkasan profil pengguna.
  - **Sidebar Kiri**: Latar `navy` pekat dengan ornamen kontur air halus (`ContourPattern`), kartu profil pengguna di bagian atas (avatar inisial bulat/foto, nama lengkap, dan status badge).
  - **Label "Calon Anggota"**: Tampil secara otomatis di kartu profil sidebar untuk seluruh pengguna yang berstatus dalam proses (`pending_review`, `awaiting_payment`, `pending_approval`, `revision`), serta label semantik lain untuk status lainnya (`Bukan Anggota`, `Draf Pendaftaran`, `Anggota Resmi`, `Ditolak`).
  - **Menu Navigasi**: Menerima daftar item menu sebagai props dengan penanda `areaLabel` (default: "AREA AKUN"). Menu aktif bergaya latar lembut (`bg-white/15 text-white` dengan aksen border `aqua`), dan menu non-aktif berlatar transparan dengan hover lembut.
  - **Drawer Mobile**: Dukungan drawer navigasi responsif dengan animasi Framer Motion, lock body scroll, dan auto-close saat navigasi, rapi hingga lebar layar 360px.
  - **`AccountLayout.tsx`**: Diperbarui menjadi wrapper yang mendelegasikan secara langsung ke `PortalLayout`.
- **`resources/js/Components/layout/PageBanner.tsx`**:
  - Komponen judul banner bergradien biru tua (`bg-gradient-to-r from-navy via-navy to-ocean`) beraksen kontur air tipis.
  - Memuat eyebrow kapital kecil warna `aqua`, judul besar font display Bricolage Grotesque putih tebal, subjudul deskripsi informatif, dan slot tombol aksi.
- **`resources/js/Components/layout/SummaryRow.tsx`**:
  - Komponen baris grid metrik dan kartu ringkasan responsif (1 hingga 4 kolom).

#### 2. Empat Menu Non-Membership
- Mengimplementasikan 4 menu utama pada `/akun`:
  1. **Dashboard** (`/akun`, exact: true)
  2. **Pesanan Saya** (`/akun/pesanan`)
  3. **Profil** (`/akun/profil`)
  4. **Pengaturan** (`/akun/pengaturan`)

#### 3. Controller & Data Backend Dasbor Sederhana
- **`App\Http\Controllers\Account\DashboardController`**:
  - Mengambil data keanggotaan pengguna, menghitung progres draf langkah (dari 9 langkah), catatan revisi/penolakan, dan tanggal pengajuan.
  - Mengambil 3 pesanan belanja toko terbaru (`latest('id')`) beserta total transaksi dan rincian item.
  - Menghitung jumlah produk aktif di keranjang belanja melalui `CartService`.
  - Mengambil kontak dukungan organisasi dari konfigurasi brand terpusat (`Brand::supportPhone()`, `Brand::supportEmail()`).
- Mendaftarkan rute `GET /akun` mengarah ke `DashboardController@index`.

#### 4. Isi Halaman Dasbor Sederhana (`/akun`)
- **`resources/js/Pages/Account/Dashboard.tsx`**:
  - **PageBanner**: Menyapa pengguna "Selamat datang, {nama}" dengan subjudul kontekstual per status.
  - **Kartu Status Keanggotaan**: Mendukung ke-8 status `MembershipStatus`:
    - `non_member`: Ajakan ramah bergabung ke organisasi NSA + tombol **"Gabung Jadi Anggota"** mengarah ke wizard `/akun/keanggotaan/daftar`.
    - `draft`: Indikator progres langkah (misal "3 dari 9 langkah") dengan progress bar visual + tombol **"Lanjutkan Pendaftaran"**.
    - `pending_review`: Garis waktu 4 tahap proses verifikasi pengurus + informasi berkas diterima + tombol detail pengajuan.
    - `awaiting_payment`: Garis waktu tahap pembayaran aktif + petunjuk transfer iuran + tombol **"Bayar Sekarang"** mengarah ke `/akun/keanggotaan/status`.
    - `pending_approval`: Garis waktu tahap persetujuan aktif + pemberitahuan pembayaran sedang diverifikasi bendahara/ketua.
    - `revision`: Kotak peringatan memuat catatan revisi pengurus + tombol **"Perbaiki Data"**.
    - `rejected`: Kotak informasi penolakan + tombol hubungi sekretariat NSA.
    - `approved`: Pemberitahuan ucapan selamat + kartu nomor tanda anggota resmi (NTA) + tombol **"Buka Portal Anggota"** (`/anggota`).
  - **Kartu Pesanan Terakhir**:
    - Menampilkan ringkasan keranjang belanja jika terdapat produk yang belum dicheckout.
    - Menampilkan daftar 3 transaksi pesanan toko terbaru (kode pesanan, tanggal, nama barang, total harga format Rupiah, dan status pesanan).
    - Keadaan kosong (*empty state*) dirancang estetik dengan tombol ajakan belanja ke katalog toko (`/produk`).
  - **Kartu "Butuh Bantuan?"**:
    - Menampilkan kontak resmi organisasi NSA dari konfigurasi brand (WhatsApp/Telepon langsung dan Email bantuan).
    - Tombol tautan ke halaman `/kontak`.

#### 5. Halaman Profil & Pengaturan Akun
- **`App\Http\Controllers\Account\ProfileController`** & **`resources/js/Pages/Account/Profile.tsx`**:
  - `GET /akun/profil`: Formulir informasi profil pengguna dan kata sandi.
  - `POST /akun/profil`: Memperbarui nama lengkap, nomor telepon, dan unggah foto profil/avatar pengguna (disimpan di disk publik dengan validasi gambar max 2MB).
  - `POST /akun/profil/password`: Memperbarui kata sandi dengan verifikasi kata sandi saat ini dan konfirmasi sandi baru.
- **`App\Http\Controllers\Account\SettingController`** & **`resources/js/Pages/Account/Settings.tsx`**:
  - `GET /akun/pengaturan`: Menampilkan preferensi pemberitahuan email (transaksi pesanan, update status keanggotaan, buletin program kerja NSA) dan informasi privasi/enkripsi data.
  - `POST /akun/pengaturan`: Menyimpan preferensi notifikasi pengguna.
- **`resources/js/Pages/Account/Orders/Index.tsx`**:
  - Diperbarui menggunakan `PortalLayout` dan `PageBanner` terpadu.

#### 6. Pengujian & Verifikasi
- Membuat pengujian fitur komprehensif `tests/Feature/AccountSimpleDashboardTest.php` (7 pengujian, 118 assertions):
  - Memvalidasi tampilan kartu status untuk ke-8 kondisi keanggotaan.
  - Memvalidasi label "Calon Anggota" pada status dalam proses.
  - Memvalidasi tampilan 3 pesanan terbaru dan penanganan keadaan kosong.
  - Memvalidasi pembacaan kontak brand resmi.
  - Memvalidasi formulir update profil, avatar, kata sandi, dan preferensi pengaturan.
- Seluruh rangkaian pengujian sistem (**165 tests, 1394 assertions**) dan kompilasi build frontend (`npm run build`) lulus 100%.

---

### Prompt 7: Langkah 7 (Lokasi, Foto, Dokumen), 8 (Paket & Administrasi), & 9 (Pemeriksaan & Pengiriman)

#### 1. Langkah 7: Lokasi, Foto, dan Dokumen (`Step7LocationDocuments.tsx`)
- **Kartu 1: Alamat Domisili atau Usaha**:
  - `RegionSelect` 4 tingkat (Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan/Desa).
  - Kolom kode pos dan textarea alamat lengkap dengan penghitung karakter `0/250`.
  - Centang "Alamat usaha berbeda dengan domisili" yang secara reaktif membuka subform alamat fasilitas usaha terpisah (RegionSelect 4 tingkat + kode pos + alamat lengkap).
  - Tersimpan ke tabel `member_locations` dengan `kind` = `domicile` dan `kind` = `business`, serta disinkronkan ke `member_businesses` untuk kemudahan pelaporan wilayah dan sensus statistik.
- **Kartu 2: Titik Koordinat Lokasi Kegiatan**:
  - Integrasi `MapPicker` (Leaflet, pencarian lokasi, geser pin GPS).
  - Repeater multi-titik koordinat: mendukung penambahan lebih dari satu lokasi fasilitas/tambak/hatchery, tersimpan ke `member_locations` dengan `kind` = `activity`.
- **Kartu 3: Foto Fasilitas Usaha (Opsional, 1–5 Foto)**:
  - Unggah 1–5 foto fasilitas atau tempat usaha ke disk publik (`member-photos/{application_id}`).
  - Pratinjau thumbnail responsif dengan tombol hapus foto interaktif.
  - Endpoint `POST /akun/keanggotaan/foto` dan `DELETE /akun/keanggotaan/foto/{photo}` terintegrasi di controller dan tabel `member_photos`.
- **Kartu 4: Dokumen Pendukung Dinamis**:
  - Menghasilkan satu `DocumentUploadCard` per berkas yang dibutuhkan berdasarkan data Langkah 1–3:
    - Identitas: KTP jika WNI (diatur oleh saklar `membership.require_ktp_for_wni`) atau Paspor jika WNA.
    - Izin usaha: berkas persyaratan untuk setiap izin yang dicantumkan pada Langkah 3 (NIB, NPWP, CBIB, SK Kemenkumham, SIUP, Izin Lokasi, dll.).
  - Disimpan pada storage disk privat dengan URL bertanda tangan (signed URL).

#### 2. Langkah 8: Paket Keanggotaan dan Administrasi (`Step8Administration.tsx`)
- **Daftar Biaya Dinamis dari Database (`membership_fee_items`)**:
  - Tidak di-hardcode: mengambil data langsung dari tabel `membership_fee_items` (Biaya Registrasi, KTA Fisik RFID, Iuran Tahunan Anggota, Rompi Resmi NSA, Kemeja Resmi NSA).
  - Item wajib (`type === 'required'` atau `recurring`) otomatis tercentang dan terkunci dengan ikon gembok.
  - Item seragam opsional dapat dicentang, dipilih ukurannya (S, M, L, XL, XXL), dan diatur kuantitasnya (1–10).
- **Kalkulasi Akumulasi Total Live**:
  - Kartu estimasi draf invoice dengan animasi angka tabular yang menghitung total secara langsung setiap kali item atau jumlah diubah.
- **Pemberitahuan Status Pembayaran Adaptif**:
  - Menyesuaikan dengan saklar pengaturan `membership.require_initial_verification`:
    - Bila `true`: "Pembayaran dilakukan setelah berkas pendaftaran Anda lolos verifikasi awal oleh tim pengurus NSA."
    - Bila `false`: "Pembayaran administrasi dapat langsung diselesaikan setelah formulir pendaftaran ini Anda kirimkan."
  - Data tersimpan sebagai draf invoice belum ditagihkan pada `member_invoices` dan `member_invoice_items`.

#### 3. Langkah 9: Pemeriksaan Akhir dan Pengiriman (`Step9Review.tsx`)
- **Ringkasan Komprehensif Seluruh 8 Langkah**:
  - Rincian ringkas per langkah (Identitas dengan masking NIK `************1234` atau Paspor `****5678`, Kategori, Profil Usaha, Aktivitas Perikanan, Jaringan Bisnis, Minat Program, Lokasi & Dokumen, Paket Administrasi).
  - Tombol "Ubah" pada setiap kartu yang mengarahkan pengguna kembali ke langkah bersangkutan.
- **Deteksi Kelengkapan Data & Dokumen**:
  - Menampilkan peringatan kelengkapan data jika ada kolom atau berkas wajib yang belum diunggah dan memblokir tombol kirim sampai seluruh persyaratan terpenuhi.
- **Centang Persetujuan Wajib & Modal Dokumen Hukum**:
  - Checkbox wajib persetujuan Ketentuan & AD/ART NSA serta Kebijakan Privasi NSA.
  - Tautan pembuka modal dialog yang memuat naskah AD/ART dan Kebijakan Privasi dari tabel `settings` (CMS-driven).
- **Aksi Server `SubmitRegistration` Terpusat**:
  - Validasi ulang seluruh 9 langkah di sisi server (Server-Side Re-validation).
  - Mengubah status keanggotaan pengguna dan aplikasi sesuai saklar:
    - `pending_review` bila verifikasi awal aktif.
    - `awaiting_payment` bila verifikasi awal dinonaktifkan.
  - Mencatat review log pendaftaran anggota baru.
  - Mengirim email konfirmasi ke pemohon (`MembershipApplicationSubmitted`) dan notifikasi ke admin (`AdminNewMembershipNotification`) dalam satu transaksi database (`DB::transaction`).

#### 4. Pengujian Otomatis
- Menambahkan test suite `tests/Feature/WizardSteps7To9Test.php` (8 skenario pengujian komprehensif):
  - Pengujian penyimpanan domisili dan koordinat kegiatan.
  - Pengujian penyimpanan alamat usaha terpisah.
  - Pengujian unggah dan hapus foto usaha hingga 5 foto.
  - Pengujian kalkulasi total draf invoice administrasi dan ukuran seragam.
  - Pengujian validasi penolakan submit tanpa centang persetujuan.
  - Pengujian penegakan berkas dokumen wajib berdasarkan kewarganegaraan dan izin usaha.
  - Pengujian perubahan status target sesuai saklar `membership.require_initial_verification`.
  - Pengujian pengiriman email notifikasi pemohon dan admin.
- Seluruh 197 tes fitur dan unit lulus 100% (1.592 asersi).

---

### Prompt 6: Langkah 4 (Aktivitas Perikanan Dinamis), 5 (Jaringan Bisnis), & 6 (Minat Program)

#### 1. Langkah 4: Data Aktivitas Perikanan Berbasis Konfigurasi (`config/activity_forms.php`)
- **Desain Config-Driven**:
  - Membuat `config/activity_forms.php` yang memetakan kategori keanggotaan ke field spesifik:
    - `pembudidaya`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `seed_need`, `feed_need`, `notes`.
    - `pembenih`: `fish_category_id`, `farming_system`, `pond_count`, `production_amount` + unit + periode, `notes`.
    - `buyer` / `buyer-eksportir`: `fish_category_id`, `purchase_capacity` + unit + periode, `notes`.
    - `pengolah`: `fish_category_id`, `farming_system`, `production_amount`, `purchase_capacity`, `notes`.
    - `pakan-sarana`: `farming_system`, `production_amount`, `notes`.
    - `akademisi`, `konsultan`, `lainnya`: `fields => []`, `is_skippable => true`.
- **Aturan Validasi Terpusat (`ActivityFormRules`)**:
  - Kelas `App\Support\ActivityFormRules` menghasilkan aturan dan pesan validasi Laravel langsung dari konfigurasi, menghindari duplikasi aturan.
  - Memeriksa apakah langkah dapat dilewati (`isSkippable`).
- **Komponen Frontend**:
  - `DynamicActivityForm.tsx`: Komponen form dinamis yang merender berbagai jenis input (select_fish, select, number, number_unit_period, text, textarea) dan repeater "Tambah Komoditas Lain" dengan animasi halus Framer Motion.
  - Kartu Kategori Tidak Wajib: Menampilkan pesan informatif dan tombol "Lewati Langkah Ini" untuk kategori non-akuakultur langsung (Akademisi, Konsultan, dll.) dan menandai langkah sebagai selesai.
  - `Step4FishActivities.tsx`: Membungkus form dinamis pada alur pendaftaran wizard.

#### 2. Langkah 5: Jaringan dan Aktivitas Bisnis (`Step5NetworkProfile.tsx`)
- **Informasi Pemasaran**: Textarea saluran dan metode pemasaran hasil panen atau produk.
- **Wilayah Distribusi**: Multi-select provinsi interaktif dengan chip badge yang dapat ditambah dan dihapus.
- **Kebutuhan Pasokan**: Textarea untuk mendeskripsikan kebutuhan bahan baku atau sarana rutin.
- **Jenis Kerja Sama**: Checkbox pilihan (pasokan, distribusi, investasi, teknologi, penelitian, lainnya + input teks kustom).
- **Kegiatan Profesional**: Textarea untuk mencatat keaktifan dalam kelompok tani, komunitas, atau asosiasi.
- **Sifat Fleksibel**: Seluruh kolom bersifat opsional dan dapat disimpan kosong / dilewati. Tersimpan ke tabel `member_network_profiles`.

#### 3. Langkah 6: Kebutuhan dan Minat Program NSA (`Step6ProgramInterests.tsx`)
- **Pilihan Multi Kartu Program**:
  - Pelatihan & Workshop (Ikon `GraduationCap`)
  - Pendampingan Teknis Farm (Ikon `Users`)
  - Informasi & Intelijen Pasar (Ikon `TrendingUp`)
  - Akses Kemitraan & Permodalan (Ikon `Handshake`)
  - Teknologi & Inovasi Budidaya (Ikon `Cpu`)
  - Pengembangan Skala Usaha (Ikon `Building2`)
- Setiap kartu dilengkapi ringkasan manfaat satu kalimat dan indikator centang teranimasi saat dipilih.
- Kolom catatan tambahan opsional untuk kebutuhan pelatihan/konsultasi spesifik.
- Tersimpan ke tabel `member_program_interests` dengan backed enum `App\Enums\ProgramCategory`.

#### 4. Form Request, Controller & Backend
- Membuat Form Request terisolasi dengan pesan Bahasa Indonesia:
  - `SaveFishActivitiesStepRequest` (menggunakan `ActivityFormRules`)
  - `SaveNetworkProfileStepRequest`
  - `SaveProgramInterestsStepRequest`
- Memperbarui `SaveRegistrationStep` untuk menyimpan secara atomik ke `member_fish_activities`, `member_network_profiles`, dan `member_program_interests`.
- Memperbarui `MemberRegistrationController` untuk menyalurkan props `activityFormConfig`, `programCategories`, dan draft data Steps 4, 5, 6 ke frontend.

#### 5. Pengujian & Kompilasi
- Membuat `tests/Feature/WizardSteps4To6Test.php` (8 skenario tes, 36 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes: **189 tests passed, 1562 assertions** (0 gagal).
- Kompilasi build frontend: `npm run build` sukses tanpa galat kompilasi (9.04s - 11.96s).

---

### Prompt 5: Restrukturisasi Wizard 9 Langkah Baru & Pengerjaan Langkah 1–3

#### 1. Arsitektur 9 Langkah Pendaftaran Anggota (`MemberApplication::STEPS`)
- Memetakan ulang 9 langkah pendaftaran dengan slug baru:
  1. `identitas`: Identitas Calon Anggota (WNI / WNA)
  2. `kategori-keanggotaan`: Kategori Kegiatan & Jenis Keanggotaan
  3. `profil-usaha`: Profil Pekerjaan atau Usaha & Legalitas
  4. `aktivitas-perikanan`: Aktivitas Perikanan (Form Dinamis)
  5. `jaringan-bisnis`: Jaringan & Aktivitas Bisnis
  6. `minat-program`: Minat Program Kerja NSA
  7. `lokasi-dokumen`: Titik Lokasi & Unggah Berkas Legalitas
  8. `paket-administrasi`: Paket Keanggotaan & Administrasi
  9. `pemeriksaan`: Pemeriksaan Akhir & Pernyataan
- Menghapus komponen langkah lama yang tidak digunakan lagi: `Step5Social.tsx`, `Step6Commodity.tsx`, `Step8Statement.tsx`.
- Mempertahankan kompatibilitas langkah lama pada level controller & model via `MemberApplication::LEGACY_STEPS`.

#### 2. Langkah 1: Identitas Calon Anggota (`Step1Identity.tsx`)
- **Segmented Control Kewarganegaraan**: WNI vs WNA dengan transisi animasi halus Framer Motion (`AnimatePresence`).
- **Data Umum**: Nama lengkap, jenis kelamin (pilihan tombol interaktif), tempat lahir, tanggal lahir, nomor telepon (+62 otomatis), dan email (terkunci sesuai akun login).
- **Usia Otomatis**: Dihitung secara real-time dari tanggal lahir sebagai badge readonly tanpa input terpisah.
- **WNI Form**:
  - Kolom NIK 16 digit terenkripsi (`encrypted` casting pada `MemberIdentity`).
  - Alamat domisili sesuai KTP lengkap menggunakan komponen cascading `RegionSelect` (provinsi, kabupaten, kecamatan, desa) + alamat jalan.
  - Diatur oleh saklar dinamis `membership.require_ktp_for_wni` (default `true`) di tabel `settings`.
- **WNA Form**:
  - Kolom nomor paspor terenkripsi.
  - Pilihan negara asal (`COUNTRY_OPTIONS`) dan lama tinggal di Indonesia (angka tahun).
- **Validasi**: Kolom tersembunyi (mis. WNA saat memilih WNI) otomatis tidak ikut divalidasi.

#### 3. Langkah 2: Kategori dan Jenis Keanggotaan (`Step2Category.tsx`)
- **Kategori Kegiatan**: Kartu pilihan interaktif yang bersumber dari tabel `membership_categories` dengan opsi "Lainnya" yang membuka input teks dinamis untuk kategori kustom.
- **Status Pendaftar**: Pilihan radio kartu antara "Individu" dan "Perwakilan Lembaga".
  - Jika "Perwakilan Lembaga" dipilih, form dinamis membuka input nama lembaga dan jabatan pendaftar.
- **Jenis Keanggotaan**: Kartu pilihan yang bersumber dari tabel `membership_types` dengan penjelasan ringkas aturan AD/ART organisasi.

#### 4. Langkah 3: Profil Pekerjaan atau Usaha (`Step3BusinessProfile.tsx`)
- **Tata Letak FormCard 2 Kolom**:
  - **Kartu 1 (Profil Usaha)**: Nama usaha / lembaga, bidang kegiatan, lama berusaha (tahun), skala usaha (Mikro, Kecil, Menengah, Besar dengan tooltip penjelasan kriteria permodalan/omzet), dan informasi operasional (textarea maks. 500 karakter dengan penghitung).
  - **Centang Individu Tanpa Usaha**: Opsi "Saya belum memiliki badan usaha" mengubah form menjadi input "Pekerjaan / profesi utama".
  - **Kartu 2 (Perizinan & Legalitas)**: Memakai komponen repeater `LegalDocumentRepeater` untuk mencatat jenis izin (NIB, NPWP, CBIB, Lainnya), nomor dokumen, tanggal terbit, dan masa berlaku.
  - **Izin Wajib Dinamis**: Penanda izin wajib otomatis membaca konfigurasi `config('membership.required_legalities')` sesuai kategori yang dipilih di Langkah 2 (misalnya Eksportir wajib mencantumkan NIB).

#### 5. Form Request & Tindakan Penyimpanan
- Membuat form request dengan pesan validasi berbahasa Indonesia:
  - `SaveIdentityStepRequest`: menangani validasi dinamis WNI vs WNA dan saklar KTP.
  - `SaveCategoryStepRequest`: menangani validasi kategori, opsi kustom, dan data perwakilan lembaga.
  - `SaveBusinessProfileStepRequest`: menangani validasi usaha/pekerjaan dan penegakan izin legalitas wajib per kategori.
- Memperbarui `SaveRegistrationStep` untuk menyimpan langsung ke entitas relasional `MemberIdentity`, `MemberApplication`, `MemberBusiness`, dan `MemberLegalDocument`.

#### 6. Pengujian & Verifikasi
- Membuat rangkaian pengujian fitur `tests/Feature/WizardSteps1To3Test.php` (10 skenario pengujian, 64 assertions, 100% lulus).
- Menjalankan seluruh rangkaian tes aplikasi: 181 pengujian (1526 assertions) lulus tanpa kegagalan.
- Memverifikasi build aset frontend: `npm run build` sukses tanpa galat kompilasi TypeScript atau Vite.

### Prompt 4: Program Kerja di Halaman Tentang Kami, Rincian Program, & CMS Program

#### 1. Bagian Program Kerja di Halaman Tentang Kami (`/tentang-kami`)
- **Penempatan**: Ditambahkan tepat setelah bagian "Visi & Misi" (dan sebelum "Nilai-Nilai NSA") tanpa membuat menu navbar baru.
- **Gaya Editorial Daftar Bernomor Besar**:
  - Menggunakan nomor urut 2 digit berukuran besar (`01`, `02`, `03` dengan font display Bricolage Grotesque) yang bertransisi warna saat hover, bukan susunan kartu ikon yang seragam.
  - Menampilkan judul program, ringkasan editorial, tag pill kategori program (`ProgramCategory`: Pelatihan, Pendampingan, Informasi Pasar, Akses Kemitraan, Teknologi Budidaya, Pengembangan Usaha), jadwal pelaksanaan jika tersedia, dan gambar cover thumbnail pada layar desktop.
  - Tombol **"Lihat Detail"** mengarahkan pengguna ke halaman `/program/{slug}`.
  - Bila pengguna yang login adalah anggota terverifikasi (`isApprovedMember`), tombol **"Daftar Program"** langsung tersedia.
- **Animasi Framer Motion**: Menggunakan komponen `RevealGroup` dan `RevealItem` dengan efek muncul bertahap (*staggered fade-up*) yang tetap menghormati preferensi aksesibilitas `reduced-motion`.
- **Query Data Terfilter**: `AboutController` memuat program dengan filter `is_public = true` dan `status = 'published'`, diurutkan berdasarkan kolom `order` (`ordered()`).

#### 2. Halaman Rincian Publik Program (`/program/{slug}`)
- **Controller**: `App\Http\Controllers\Public\ProgramController`:
  - `show`: Menampilkan rincian program kerja lengkap dengan cover, jadwal, status akses, silabus/body HTML, status pendaftaran pengguna, dan penanganan program khusus anggota (tamu diarahkan login, non-approved diarahkan ke `/akun` dengan pesan penjelasan).
  - `register`: Menangani pendaftaran peserta anggota resmi ke tabel `program_registrations` (`firstOrCreate`) dengan status `'registered'`.
- **View**: `resources/js/Pages/Public/Program/Show.tsx`:
  - Tata letak editorial responsif lengkap dengan breadcrumb, header beraksen kontur air, kartu rincian silabus, panel pendaftaran mandiri anggota, dan informasi kontak bantuan sekretariat NSA.

#### 3. Modul CMS Pengelolaan Program Kerja (`/admin/programs`)
- **Hak Akses**: Dapat dikelola oleh Admin dan Superadmin.
- **Rute Admin**: Ditambahkan pada `routes/admin.php` mencakup resource CRUD dan endpoint reorder `POST /admin/programs/reorder`.
- **Menu Navigasi Admin**: Menambahkan tautan "Program Kerja" pada sidebar `AdminLayout.tsx` di bawah kategori Konten & Statistik.
- **Controller Admin**: `App\Http\Controllers\Admin\ProgramController`:
  - Mendukung pencarian teks judul/ringkasan, filter kategori, dan filter status (draft/published).
  - Unggah dan ganti gambar cover program (disimpan pada direktori publik `programs/` dengan validasi file gambar maksimal 3MB).
  - Pembuatan slug otomatis dari judul yang menjamin keunikan rute.
  - Pilihan target audiens: publik vs khusus anggota (`is_public`).
  - Pencatatan seluruh aktivitas CRUD pada `ActivityLog`.
  - Dukungan pengurutan prioritas lewat aksi geser/reorder (`reorder`).
- **Antarmuka CMS**:
  - `resources/js/Pages/Admin/Programs/Index.tsx`: Tabel daftar program dengan kontrol reorder naik/turun, badge audiens dan status publikasi, indikator jumlah pendaftar, dan aksi edit/hapus/pratinjau.
  - `resources/js/Pages/Admin/Programs/Form.tsx`: Formulir pembuatan dan pengeditan program terintegrasi dengan upload cover pratinjau langsung, pemilih jadwal *datetime*, dan pilihan kategori.

#### 4. Pengujian & Verifikasi
- Membuat pengujian fitur komprehensif `tests/Feature/PublicProgramTest.php` (6 skenario pengujian, 70 assertions):
  - Memvalidasi program publik terbit muncul di `/tentang-kami` terurut sesuai kolom `order`.
  - Memvalidasi program khusus anggota (`is_public = false`) dan program berstatus draf tidak muncul pada halaman publik.
  - Memvalidasi proteksi akses program khusus anggota untuk tamu dan non-member.
  - Memvalidasi pendaftaran program oleh anggota terverifikasi pada tabel `program_registrations`.
  - Memvalidasi alur lengkap CMS Admin (list, create dengan cover, edit, reorder, delete) serta proteksi 403 bagi user biasa.
- Seluruh rangkaian pengujian sistem (**171 tests, 1464 assertions**) dan kompilasi build frontend (`npm run build`) lulus 100%.


---

## [M1–M5] Sistem Multi Bahasa Indonesia (`id`) & Inggris (`en`) + Pusat Terjemahan Superadmin

### Ringkasan Perubahan
- **Pondasi Multi Bahasa (M1)**: `config/locales.php`, kolom `users.locale`, macro rute `Route::localized()`, middleware `SetLocale`, helper `lroute()`, `LanguageSwitcher`, SEO `hreflang`/`canonical`/`og:locale`, serta sitemap dua bahasa (`/sitemap.xml`).
- **Mesin Terjemahan Otomatis (M2)**: Kontrak `App\Contracts\Translator` dengan driver `ClaudeTranslator`, `DeepLTranslator`, `GoogleTranslator`, dan `FakeTranslator`; tabel `translation_glossary`, `content_translations`, dan `translation_usage_daily`; trait `HasAutoTranslations`, `TranslateModelJob`, `TranslationValidator`, serta perintah Artisan `translate:backfill`, `translate:retry-failed`, dan `translate:status`.
- **Teks Tetap Dua Bahasa (M3)**: Registry bawaan Inggris di `resources/copy/en/*.php`, resolusi 3 lapis di `CopyService` dengan invalidasi cache dua locale, perintah `copy:translate-defaults`, perluasan `copy:check` (wajib ada bawaan EN), `i18n:audit`, tab `ID | EN` + status/aksi terjemahan di menu Teks Website, mode edit langsung sadar locale, serta Mailable dua bahasa.
- **Konten Dinamis CMS Dua Bahasa (M4)**: Pemasangan `HasAutoTranslations` pada 16 model konten & opsi master (menjaga nama orang/mitra/wilayah tidak diterjemahkan), eager loading `withLocale()` bebas N+1, pencarian dua bahasa di artikel & produk, lokalisasi opsi wizard pendaftaran & statistik beranda, serta invalidasi cache otomatis saat terjemahan selesai.
- **Pusat Terjemahan Superadmin (M5)**: Menu superadmin-only `/admin/terjemahan` (ikon `Languages`, proteksi 403 bagi non-superadmin) dengan 4 tab (*Ringkasan*, *Konten*, *Glosarium* + impor/ekspor CSV & terapkan ke konten terkait, *Pengaturan* tanpa membocorkan kunci API), pencatatan `activity_logs`, serta notifikasi dasbor superadmin bila jumlah terjemahan gagal melewati ambang batas.


---

## Pemasangan Logo Resmi NSA di Navbar & Footer (`BrandLogo`)

- **Skrip Aset (`npm run images:logo`)**: Menambahkan `scripts/build-brand-logo.mjs` (berbasis `sharp`) yang membaca `public/images/logo utama/Logo NSA.svg` (fallback `Logo NSA.png`), menghasilkan varian `1x/2x/3x` WebP & PNG di `public/images/brand/` beserta versi monokrom putih untuk footer navy (`footerMode: mono-white`), serta menulis manifest `resources/js/generated/brand-logo.json`.
- **Komponen Tunggal `BrandLogo.tsx`**: Mendukung `<picture>` WebP/PNG `1x/2x/3x`, dimensi eksplisit anti-CLS, override unggahan Superadmin dari Settings, fallback wordmark teks, serta tautan beranda terlokalisasi (`lroute('home')`).
- **Pemasangan**: Mengganti logo placeholder di `Navbar.tsx` (40px desktop, 34px saat scroll, 32px mobile, `loading="eager"`, `fetchPriority="high"`), `MobileDrawer.tsx`, dan `Footer.tsx` (44px, `mono-white`, `loading="lazy"`).
