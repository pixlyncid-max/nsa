import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
                    if (id.includes('leaflet')) return 'vendor-maps';
                    if (id.includes('swiper')) return 'vendor-swiper';
                    if (id.includes('framer-motion') || id.includes('motion')) return 'vendor-motion';
                    if (id.includes('animejs')) return 'vendor-anime';
                    if (id.includes('react') || id.includes('@inertiajs')) return 'vendor-core';
                },
            },
        },
    },
});
