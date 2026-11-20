const forms = require('@tailwindcss/forms');

/**
 * Design tokens IFAA (design.md). Semua nilai warna/radius/shadow/gerak
 * didefinisikan sekali di sini dan dipakai lewat kelas utilitas.
 *
 * Catatan arsitektur: Menggunakan ekstensi `.cjs` (CommonJS) karena
 * `package.json` memakai `"type": "module"`. Pada Node.js 22.12+/24,
 * `require(esm)` di-cache permanen di ESM Module Map V8 sehingga
 * `delete require.cache[file]` milik Tailwind v3 gagal me-reload perubahan
 * konfigurasi di server Vite yang sedang berjalan. Dengan `.cjs`, cache
 * CommonJS dapat dibersihkan sempurna saat HMR.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],

    theme: {
        extend: {
            colors: {
                navy: { DEFAULT: '#014081', 900: '#012B57' },
                ocean: { DEFAULT: '#056ED4', 600: '#0459AD' },
                sky: '#27AAE1',
                aqua: '#3AD1F3',
                mist: '#F4F8FC',
                line: '#E1E9F2',
                slate: '#5B6B7F',
                ink: '#0B1F36',
                success: '#1E9E5A',
                warning: '#E59A12',
                danger: '#D64545',
            },
            fontFamily: {
                display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
                sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            },
            maxWidth: {
                container: '1240px',
            },
            /* Skala jarak section: 64px mobile / 96px desktop / 128px hero */
            spacing: {
                section: '6rem',
                'section-sm': '4rem',
                hero: '8rem',
            },
            borderRadius: {
                card: '16px',
                control: '10px',
            },
            boxShadow: {
                soft: '0 1px 2px rgba(1,64,129,.06), 0 8px 24px -12px rgba(1,64,129,.18)',
                lift: '0 2px 4px rgba(1,64,129,.08), 0 18px 40px -16px rgba(1,64,129,.28)',
            },
            transitionTimingFunction: {
                brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
            },
            transitionDuration: {
                220: '220ms',
            },
            keyframes: {
                marquee: {
                    from: { transform: 'translate3d(0, 0, 0)' },
                    to: { transform: 'translate3d(-50%, 0, 0)' },
                },
            },
            animation: {
                marquee: 'marquee var(--marquee-duration, 40s) linear infinite',
            },
        },
    },

    plugins: [forms],
};

