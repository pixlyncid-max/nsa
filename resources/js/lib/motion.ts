/**
 * NSA Motion Tokens
 * Didefinisikan di design.md (bagian 7: Gerak / Animasi)
 * Prinsip: gerak melayani pemahaman, bukan hiasan.
 *
 * Sumber tunggal ada di `@/animations/variants`; file ini menjaga
 * kompatibilitas impor lama.
 */
import { dur, ease, fadeUp, staggerContainer } from '@/animations/variants';

export { dur, ease };

export const reveal = fadeUp;

export const stagger = staggerContainer();
