# NSA Website (Nusantara Sustainable Aquatic)

Website resmi **NSA (Nusantara Sustainable Aquatic)**: portal asosiasi perikanan & akuakultur berkelanjutan Indonesia, registrasi Portal Anggota 9 langkah, katalog & transaksi sarana budidaya perikanan, serta pusat informasi industri maritim nasional.

> Dokumen acuan: [`prd.md`](./prd.md) (spesifikasi fungsional) · [`design.md`](./design.md) (design system & visual) · [`prompts-revisi-nsa.md`](./prompts-revisi-nsa.md) · [`CHANGELOG.md`](./CHANGELOG.md)

---

## 1. Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Backend** | Laravel 12, PHP 8.2+ | Arsitektur Action/Service, Form Request, Policy, Enum |
| **Frontend** | React 19, TypeScript, Inertia.js v2 | Single-page application tanpa API terpisah |
| **Brand Centralization** | `config/brand.php`, Setting Model, `brand()` Helper | Konfigurasi terpusat yang dapat disunting superadmin via CMS |
| **Database** | MySQL 8 | Relasi terindeks, cascading wilayah, storage privat |
| **Styling** | Tailwind CSS | Token desain: `#014081` (navy), `#056ED4` (ocean), `#27AAE1` (sky), `#3AD1F3` (aqua) |
| **Tipografi** | Bricolage Grotesque & Plus Jakarta Sans | Google Fonts (`display=swap`) |
| **Animasi** | Framer Motion & anime.js | Garis kontur air SVG, ombak, `prefers-reduced-motion` |
| **UI Pendukung** | Lucide React, Sonner, Swiper, Recharts | Desain premium berstandar editorial |
| **Keamanan** | SecurityHeaders Middleware, Private Disk, Honeypot | Rate limiting login & formulir kontak/kemitraan |

---

## 2. Kebutuhan Sistem

- PHP ≥ 8.2 (ekstensi wajib: `mbstring`, `gd`, `intl`, `pdo_mysql`, `fileinfo`, `openssl`, `tokenizer`, `xml`)
- Composer ≥ 2.7
- Node.js ≥ 20.x dan npm ≥ 10.x
- MySQL Server ≥ 8.0

---

## 3. Instalasi Lingkungan Pengembangan (Development)

```bash
# 1. Klon repositori
git clone <url-repo> ifaa-app && cd ifaa-app

# 2. Pasang dependensi PHP dan Node.js
composer install
npm install

# 3. Salin konfigurasi environment
cp .env.example .env
php artisan key:generate
```

Sesuaikan konfigurasi koneksi database dan brand pada `.env`:

```env
APP_NAME="NSA (Nusantara Sustainable Aquatic)"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ifaa
DB_USERNAME=root
DB_PASSWORD=

BRAND_NAME="NSA (Nusantara Sustainable Aquatic)"
BRAND_SHORT_NAME="NSA"
BRAND_TAGLINE="Asosiasi Akuakultur dan Perikanan Berkelanjutan Nusantara"
BRAND_DOMAIN="nsa.or.id"
BRAND_PORTAL_NAME="Portal Anggota"
BRAND_SUPPORT_PHONE="+62 812-3456-7890"
BRAND_SUPPORT_EMAIL="info@nsa.or.id"
```

Jalankan migrasi, data awal (seeder), dan tautan media penyimpanan:

```bash
# 4. Migrasi & Seeding Data
php artisan migrate --seed

# 5. Buat symbolic link untuk public storage
php artisan storage:link

# 6. Jalankan server (dua terminal terpisah)
# Terminal 1:
php artisan serve

# Terminal 2:
npm run dev
```

Aplikasi dapat diakses melalui browser di `http://127.0.0.1:8000`.

---

## 4. Akun Default Pengujian (Hasil Seeder)

| Role | Email | Kata Sandi | Keterangan |
|---|---|---|---|
| Superadmin | `superadmin@nsa.test` | `password` | Hak akses penuh sistem, konfigurasi brand & manajemen admin |
| Admin Verifikator | `admin@nsa.test` | `password` | Pengelola anggota, pesanan, program, dan konten |
| Anggota Aktif | `anggota@nsa.test` | `password` | Status membership `approved` (akses Portal Anggota penuh & harga member) |
| Pengguna Umum | `user@nsa.test` | `password` | Status membership `non_member` (Dashboard sederhana `/akun`) |

> **PERINGATAN KEAMANAN:** Seluruh akun pengujian di atas wajib diganti kata sandinya atau dihapus sebelum aplikasi diluncurkan ke server produksi publik.

---

## 5. Konfigurasi Saklar & Master Keanggotaan (CMS)

### 5.1. Saklar Pengaturan Sistem (Superadmin)
Dapat dikonfigurasi melalui panel **CMS NSA → Pengaturan Situs (`/admin/pengaturan`)**:

| Kunci Pengaturan | Tipe | Nilai Default | Penjelasan |
|---|---|---|---|
| `membership.require_initial_verification` | `boolean` | `true` | Bila `true`, pendaftar baru masuk antrean `pending_review` untuk verifikasi berkas awal oleh admin sebelum tagihan diterbitkan. Bila `false`, pendaftar langsung diarahkan ke `awaiting_payment`. |
| `membership.require_ktp_for_wni` | `boolean` | `true` | Bila `true`, calon anggota WNI wajib mengisi 16 digit NIK dan mengunggah berkas KTP. Bila `false`, NIK bersifat opsional. |
| `bank_name` / `bank_account_number` / `bank_account_holder` | `string` | Rekening NSA BCA | Informasi rekening bank tujuan transfer pembayaran biaya keanggotaan dan pesanan toko. |
| `membership_statement_template` | `text` | Template AD/ART | Klausul komitmen kepatuhan AD/ART dan kode etik budidaya perikanan berkelanjutan pada Langkah 9. |
| `terms_content` / `privacy_policy_content` | `text` | Teks Legal NSA | Dokumen modal Syarat & Ketentuan serta Kebijakan Privasi data anggota. |

### 5.2. Master Data Keanggotaan (`/admin/master-keanggotaan/*`)
- **Kategori Keanggotaan (`/kategori`)**: Pengelolaan kategori peran (Pembudidaya, Pembenih, Pengolah/Buyer, dll).
- **Jenis Keanggotaan (`/jenis`)**: Sub-tipe keanggotaan terikat kategori (Anggota Biasa, Luar Biasa, Kehormatan).
- **Tarif & Iuran (`/biaya` - Superadmin)**: Komponen biaya pendaftaran, atribut rompi/seragam dengan opsi ukuran, dan iuran tahunan.
- **Program Kerja (`/admin/programs`)**: Manajemen program editorial publik dan program khusus anggota.

### 5.3. Catatan Deprecasi (Legacy Data Compatibility)
Tabel data lama (`member_commodities`, `member_social_links`, `member_statements`) ditandai sebagai **deprecated** demi kompatibilitas riwayat pendaftaran sebelumnya. Arsitektur data pendaftaran baru menggunakan:
- `member_identities` (Identitas & kewarganegaraan terenkripsi)
- `member_businesses` & `member_legal_documents` (Multi-unit usaha & legalitas NIB/NPWP/CBIB)
- `member_fish_activities` (Data aktivitas perikanan dinamis config-driven)
- `member_network_profiles` (Rantai pasok benih, pakan, & pasar)
- `member_program_interests` (Minat program kerja asosiasi)
- `member_locations` & `member_photos` (Titik GPS budidaya & foto kolam)
- `membership_fee_items` & `member_invoices` (Rincian tagihan & pembayaran resmi)

---

## 5. Panduan Deployment Produksi (Production Guide)

### 5.1. Build & Optimasi Cache

```bash
# 1. Build aset frontend produksi
npm run build

# 2. Cache konfigurasi, route, dan view Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Beri izin hak akses direktori storage dan bootstrap
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 5.2. Konfigurasi Nginx Web Server

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name nsa.or.id www.nsa.or.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nsa.or.id www.nsa.or.id;
    root /var/www/ifaa-app/public;

    ssl_certificate /etc/letsencrypt/live/nsa.or.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nsa.or.id/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # Proteksi berkas privat dan direktori dot
    location ~ /\.(?!well-known).* {
        deny all;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 5.3. Konfigurasi Supervisor (Queue Worker)

Untuk memproses pengiriman email notifikasi dan tugas asinkron di background, buat berkas `/etc/supervisor/conf.d/nsa-worker.conf`:

```ini
[program:nsa-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ifaa-app/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/ifaa-app/storage/logs/worker.log
stopwaitsecs=3600
```

Aktifkan dengan perintah:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start nsa-worker:*
```

### 5.4. Task Scheduler (Cron Job)

Tambahkan entri cron job pada server (`crontab -e -u www-data`):

```cron
* * * * * cd /var/www/ifaa-app && php artisan schedule:run >> /dev/null 2>&1
```

---

## 7. Menambah Teks Website Baru (Copy Registry)

Seluruh teks antarmuka yang dapat diubah Superadmin terdaftar secara terpusat di `resources/copy/` (satu file per kelompok, mis. `global.php`, `home.php`, `products.php`).

Langkah menambah teks baru:
1. Tambahkan entri baru pada file kelompok terkait di `resources/copy/<kelompok>.php` dengan format key `kelompok.bagian.nama`:
   ```php
   'home.hero.title' => [
       'label'        => 'Judul Utama Hero',
       'hint'         => 'Beranda → Hero (teks paling besar)',
       'type'         => 'text', // text | textarea | richtext | button | link
       'default'      => 'Menguatkan Budidaya Perikanan Berkelanjutan Nusantara',
       'max'          => 80,
       'placeholders' => [], // contoh: ['step', 'total']
   ],
   ```
2. Gunakan di komponen React melalui hook `useCopy()`:
   ```tsx
   const { t } = useCopy();
   <h1>{t('home.hero.title')}</h1>
   <span>{t('registration.progress', { step: 3, total: 9 })}</span>
   ```
   Untuk teks bertipe `richtext`, gunakan komponen `<RichCopy k="global.footer.legal_note" />` (HTML sudah disanitasi di server).
3. Pastikan pemetaan nama route ke kelompok sudah terdaftar di `config/copy_routes.php`.
4. Jalankan pemeriksaan konsistensi registry:
   ```bash
   php artisan copy:seed
   php artisan copy:check
   ```
   `copy:check` akan gagal (exit code `1`) jika ada pemanggilan `t('...')` di `resources/js` yang belum terdaftar di `resources/copy/`.

---

## 8. Mesin Terjemahan Otomatis (`id` → `en`)

Konten model (`Post`, `Product`, `Program`, `Page`) yang memakai trait `HasAutoTranslations` diterjemahkan secara otomatis di latar belakang melalui antrean `translations` dengan dedup berbasis `source_hash` dan glosarium domain (`translation_glossary`).

### 8.1. Variabel `.env` & Mengganti Driver
Atur driver di `.env` (jangan pernah menyimpan kunci API di repositori):
```env
# Pilihan driver: fake (pengujian/lokal), claude, deepl, google
TRANSLATION_DRIVER=fake
TRANSLATION_QUEUE=translations
TRANSLATION_DAILY_CHAR_LIMIT=100000

# Isi sesuai driver yang dipilih:
ANTHROPIC_API_KEY=
TRANSLATION_CLAUDE_MODEL=claude-3-5-sonnet-latest
DEEPL_API_KEY=
GOOGLE_TRANSLATE_API_KEY=
```
Untuk mengganti driver, cukup ubah nilai `TRANSLATION_DRIVER` dan isi kunci API yang sesuai lalu jalankan `php artisan config:clear`.

### 8.2. Menjalankan Worker & Perintah Artisan
```bash
# Jalankan worker khusus antrean terjemahan
php artisan queue:work --queue=translations --tries=3

# Isi glosarium contoh (NSA, DPP/DPW/DPC, Lele, Nila, Mas, Pembudidaya)
php artisan db:seed --class=TranslationGlossarySeeder

# Terjemahkan data lama yang belum punya terjemahan
php artisan translate:backfill
php artisan translate:backfill post --force

# Coba ulang terjemahan yang gagal (juga dijadwalkan tiap jam di scheduler)
php artisan translate:retry-failed

# Pantau status dan pemakaian karakter harian
php artisan translate:status
```

---

## 9. Pengujian & Kualitas Kode

| Perintah | Deskripsi |
|---|---|
| `php artisan test` | Menjalankan seluruh test suite PHPUnit/Pest |
| `php artisan copy:check` | Memeriksa konsistensi key teks antara `resources/copy` dan `resources/js` |
| `npm run typecheck && npm run lint && npm run build` | Pemeriksaan TypeScript, ESLint, dan kompilasi bundle produksi (Vite) |
| `vendor/bin/pint` | Standardisasi gaya penulisan kode PHP (Laravel Pint) |

---

## 9. Lisensi

Hak cipta © 2026 **NSA (Nusantara Sustainable Aquatic)**. Seluruh hak dilindungi undang-undang.


---

## 9. Mengganti Logo Utama

1. Letakkan berkas sumber logo di `public/images/logo utama/` (jangan ubah atau hapus struktur foldernya):
   - Prioritas utama: `Logo NSA.svg` (vektor, tajam di semua kepadatan layar).
   - Fallback raster: `Logo NSA.png` (disarankan tinggi minimal `120px`).
   - Opsional untuk footer navy: `Logo NSA putih.svg` atau `Logo NSA putih.png`.
2. Jalankan perintah berikut untuk menghasilkan seluruh file turunan bebas spasi (`1x/2x/3x` WebP & PNG) di `public/images/brand/` serta manifest `resources/js/generated/brand-logo.json`:
   ```bash
   npm run images:logo
   ```
3. Bila perlu menimpa mode tampilan logo di footer (`original`, `mono-white`, atau `white-badge`), atur `BRAND_LOGO_FOOTER_MODE` di `.env` atau `config/brand.php` (`logo.footer_mode`). Unggahan logo oleh Superadmin melalui Pengaturan Situs tetap menimpa logo bawaan secara otomatis.
