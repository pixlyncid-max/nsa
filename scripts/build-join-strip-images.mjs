import fs from 'node:fs';
import path from 'node:path';

const STRIP_DIR = path.resolve(process.cwd(), 'public', 'images', 'join-strip');

const TARGETS = [
    {
        name: 'desktop',
        master: path.join(STRIP_DIR, 'join-strip-desktop.webp'),
        base: path.join(STRIP_DIR, 'join-strip-desktop'),
        widths: [1280, 1920, 2560],
        expected: '2560x320',
    },
    {
        name: 'mobile',
        master: path.join(STRIP_DIR, 'join-strip-mobile.webp'),
        base: path.join(STRIP_DIR, 'join-strip-mobile'),
        widths: [540, 1080],
        expected: '1080x720',
    },
];

async function run() {
    fs.mkdirSync(STRIP_DIR, { recursive: true });

    const existingTargets = TARGETS.filter((t) => fs.existsSync(t.master));

    if (existingTargets.length === 0) {
        console.log(
            '[images:join-strip] Belum ada gambar master join-strip yang ditemukan. Tidak ada file yang diproses.'
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
            '[images:join-strip] Paket "sharp" belum terpasang. Jalankan "npm install -D sharp" untuk menghasilkan varian AVIF & WebP.'
        );
        process.exit(0);
    }

    for (const target of TARGETS) {
        if (!fs.existsSync(target.master)) {
            console.log(
                `[images:join-strip] Master ${target.name} belum ada (${path.relative(process.cwd(), target.master)}), dilewati.`
            );
            continue;
        }

        console.log(
            `[images:join-strip] Memproses ${target.name} dari ${path.relative(process.cwd(), target.master)}...`
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

    console.log('[images:join-strip] Selesai menghasilkan seluruh varian FooterJoinStrip.');
}

run().catch((err) => {
    console.error('[images:join-strip] Terjadi kesalahan:', err);
    process.exit(1);
});
