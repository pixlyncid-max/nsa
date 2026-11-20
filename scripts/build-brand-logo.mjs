import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIR = path.resolve(process.cwd(), 'public', 'images', 'logo utama');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'images', 'brand');
const MANIFEST_PATH = path.resolve(
    process.cwd(),
    'resources',
    'js',
    'generated',
    'brand-logo.json'
);

const PRIMARY_CANDIDATES = ['Logo NSA.svg', 'Logo NSA.png'];
const WHITE_CANDIDATES = ['Logo NSA putih.svg', 'Logo NSA putih.png'];

function findFirstExisting(dir, names) {
    for (const name of names) {
        const full = path.join(dir, name);
        if (fs.existsSync(full)) {
            return full;
        }
    }
    return null;
}

function writeManifest(payload) {
    fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

async function analyzeImage(sharp, filePath) {
    const isSvg = filePath.toLowerCase().endsWith('.svg');
    const instance = isSvg ? sharp(filePath, { density: 300 }) : sharp(filePath);
    const meta = await instance.metadata();
    const { data, info } = await instance.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    let transparentPx = 0;
    let opaquePx = 0;
    let lumSum = 0;

    const corners = [
        0,
        (info.width - 1) * 4,
        (info.height - 1) * info.width * 4,
        ((info.height - 1) * info.width + (info.width - 1)) * 4,
    ];
    const transparentCorners = corners.filter((i) => data[i + 3] < 16).length;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 16) {
            transparentPx++;
        } else {
            opaquePx++;
            lumSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
    }

    const totalPx = info.width * info.height;
    const transparentRatio = totalPx > 0 ? transparentPx / totalPx : 0;
    const avgLuminance = opaquePx > 0 ? Math.round(lumSum / opaquePx) : 0;
    const isTransparentBg = Boolean(meta.hasAlpha) && transparentRatio > 0.05 && transparentCorners >= 3;

    return {
        width: meta.width ?? info.width,
        height: meta.height ?? info.height,
        ratio: +((meta.width ?? info.width) / Math.max(1, meta.height ?? info.height)).toFixed(4),
        format: meta.format ?? (isSvg ? 'svg' : 'png'),
        hasAlpha: Boolean(meta.hasAlpha),
        transparentRatio: +transparentRatio.toFixed(4),
        isTransparentBg,
        avgLuminance,
    };
}

async function generateVariants(sharp, sourcePath, prefix, baseHeight, monoWhite = false) {
    const isSvg = sourcePath.toLowerCase().endsWith('.svg');
    const scales = [1, 2, 3];
    const webp = {};
    const png = {};

    for (const scale of scales) {
        const targetHeight = baseHeight * scale;
        const pipeline = (isSvg ? sharp(sourcePath, { density: 300 }) : sharp(sourcePath)).resize({
            height: targetHeight,
            withoutEnlargement: !isSvg,
            fit: 'inside',
        });

        let finalSharp = pipeline;

        if (monoWhite) {
            const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
            const whiteBuf = Buffer.alloc(data.length);
            for (let i = 0; i < data.length; i += 4) {
                whiteBuf[i] = 255;
                whiteBuf[i + 1] = 255;
                whiteBuf[i + 2] = 255;
                whiteBuf[i + 3] = data[i + 3];
            }
            finalSharp = sharp(whiteBuf, {
                raw: { width: info.width, height: info.height, channels: 4 },
            });
        }

        const webpFile = `${prefix}@${scale}x.webp`;
        const pngFile = `${prefix}@${scale}x.png`;

        await finalSharp.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT_DIR, webpFile));
        await finalSharp.clone().png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, pngFile));

        webp[`${scale}x`] = `/images/brand/${webpFile}`;
        png[`${scale}x`] = `/images/brand/${pngFile}`;
    }

    return { webp, png };
}

async function run() {
    const primarySource = findFirstExisting(SOURCE_DIR, PRIMARY_CANDIDATES);
    const whiteSource = findFirstExisting(SOURCE_DIR, WHITE_CANDIDATES);

    if (!primarySource) {
        console.log(
            '[images:logo] Berkas sumber logo tidak ditemukan di public/images/logo utama/ (Logo NSA.svg atau Logo NSA.png). Komponen akan memakai fallback teks.'
        );
        writeManifest({
            available: false,
            source: null,
            width: 0,
            height: 0,
            ratio: 1,
            footerMode: 'original',
            navbar: null,
            footer: null,
        });
        process.exit(0);
    }

    let sharp;
    try {
        const mod = await import('sharp');
        sharp = mod.default ?? mod;
    } catch {
        console.warn('[images:logo] Paket "sharp" belum terpasang. Jalankan "npm install -D sharp".');
        process.exit(0);
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });

    const info = await analyzeImage(sharp, primarySource);
    const relSource = path.relative(process.cwd(), primarySource).replace(/\\/g, '/');

    if (info.format !== 'svg' && info.height < 120) {
        console.warn(
            `[images:logo] PERINGATAN: Tinggi sumber (${info.height}px) < 120px; logo bisa tampak buram di layar retina.`
        );
    }

    let footerMode;
    let footerModeReason;

    if (whiteSource) {
        footerMode = 'original';
        footerModeReason = 'Ditemukan file khusus Logo NSA putih di folder sumber.';
    } else if (info.isTransparentBg) {
        if (info.avgLuminance >= 170) {
            footerMode = 'original';
            footerModeReason = `Logo berlatar transparan dan cukup terang (luminans ${info.avgLuminance}/255) di atas navy.`;
        } else {
            footerMode = 'mono-white';
            footerModeReason = `Logo berlatar transparan (${Math.round(info.transparentRatio * 100)}%) dan dominan gelap (luminans ${info.avgLuminance}/255), sehingga dibuat versi putih monokrom agar kontras jelas di atas footer navy.`;
        }
    } else {
        footerMode = 'white-badge';
        footerModeReason = 'Logo memiliki latar solid sehingga ditampilkan di dalam lencana putih di atas footer navy.';
    }

    console.log(`[images:logo] Sumber utama : ${relSource} (${info.width}x${info.height}, rasio ${info.ratio}, format ${info.format})`);
    console.log(`[images:logo] Footer mode  : ${footerMode} — ${footerModeReason}`);

    const navbarVariants = await generateVariants(sharp, primarySource, 'logo-navbar', 40, false);
    const footerOriginalVariants = await generateVariants(
        sharp,
        whiteSource ?? primarySource,
        'logo-footer',
        44,
        false
    );

    let footerWhiteVariants = null;
    if (!whiteSource && info.isTransparentBg) {
        footerWhiteVariants = await generateVariants(sharp, primarySource, 'logo-footer-white', 44, true);
    }

    const navbarWidth = Math.round(40 * info.ratio);
    const footerWidth = Math.round(44 * info.ratio);

    writeManifest({
        available: true,
        source: relSource,
        whiteSource: whiteSource ? path.relative(process.cwd(), whiteSource).replace(/\\/g, '/') : null,
        format: info.format,
        width: info.width,
        height: info.height,
        ratio: info.ratio,
        hasAlpha: info.hasAlpha,
        avgLuminance: info.avgLuminance,
        footerMode,
        footerModeReason,
        navbar: {
            displayWidth: navbarWidth,
            displayHeight: 40,
            webp: navbarVariants.webp,
            png: navbarVariants.png,
            src: navbarVariants.png['1x'],
        },
        footer: {
            displayWidth: footerWidth,
            displayHeight: 44,
            webp: footerOriginalVariants.webp,
            png: footerOriginalVariants.png,
            src: footerOriginalVariants.png['1x'],
            whiteWebp: footerWhiteVariants?.webp ?? null,
            whitePng: footerWhiteVariants?.png ?? null,
            whiteSrc: footerWhiteVariants?.png['1x'] ?? null,
        },
    });

    console.log(`[images:logo] ✓ Varian disimpan di public/images/brand/ dan manifest ditulis ke ${path.relative(process.cwd(), MANIFEST_PATH)}`);
}

run().catch((err) => {
    console.error('[images:logo] Terjadi kesalahan:', err);
    process.exit(1);
});
