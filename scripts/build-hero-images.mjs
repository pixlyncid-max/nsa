import fs from 'node:fs';
import path from 'node:path';

const HERO_DIR = path.resolve(process.cwd(), 'public', 'images', 'hero');

const TARGETS = [
    {
        name: 'desktop',
        master: path.join(HERO_DIR, 'hero-desktop.webp'),
        base: path.join(HERO_DIR, 'hero-desktop'),
        widths: [1280, 1920, 2560],
        expected: '2560x1100',
    },
    {
        name: 'mobile',
        master: path.join(HERO_DIR, 'hero-mobile.webp'),
        base: path.join(HERO_DIR, 'hero-mobile'),
        widths: [540, 810, 1080],
        expected: '1080x1440',
    },
];

async function run() {
    fs.mkdirSync(HERO_DIR, { recursive: true });

    const existingTargets = TARGETS.filter((t) => fs.existsSync(t.master));

    if (existingTargets.length === 0) {
        console.log(
            '[images:hero] Belum ada gambar master hero yang ditemukan. Tidak ada file yang diproses.'
        );
        for (const t of TARGETS) {
            console.log(
                `  - Letakkan master ${t.name} (${t.expected}) di: ${path.relative(process.cwd(), t.master)}`
            );
        }
        process.exit(0);
    }

    let sharp;
    try {
        const mod = await import('sharp');
        sharp = mod.default ?? mod;
    } catch {
        console.warn(
            '[images:hero] Paket "sharp" belum terpasang. Jalankan "npm install -D sharp" untuk menghasilkan varian AVIF & WebP.'
        );
        process.exit(0);
    }

    for (const target of TARGETS) {
        if (!fs.existsSync(target.master)) {
            console.log(
                `[images:hero] Master ${target.name} belum ada (${path.relative(process.cwd(), target.master)}), dilewati.`
            );
            continue;
        }

        console.log(
            `[images:hero] Memproses ${target.name} dari ${path.relative(process.cwd(), target.master)}...`
        );

        for (const width of target.widths) {
            const webpOut = `${target.base}-${width}.webp`;
            const avifOut = `${target.base}-${width}.avif`;

            await sharp(target.master)
                .resize({ width, withoutEnlargement: true })
                .webp({ quality: 82 })
                .toFile(webpOut);

            await sharp(target.master)
                .resize({ width, withoutEnlargement: true })
                .avif({ quality: 62 })
                .toFile(avifOut);

            console.log(
                `  ✓ ${path.relative(process.cwd(), webpOut)} & ${path.relative(process.cwd(), avifOut)}`
            );
        }
    }

    console.log('[images:hero] Selesai menghasilkan seluruh varian Hero.');
}

run().catch((err) => {
    console.error('[images:hero] Terjadi kesalahan:', err);
    process.exit(1);
});
