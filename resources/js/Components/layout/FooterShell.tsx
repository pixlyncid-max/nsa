import Footer from '@/Components/layout/Footer';
import FooterJoinStrip from '@/Components/layout/FooterJoinStrip';
import WaveDivider from '@/Components/motion/WaveDivider';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Pembungkus Footer publik yang mengatur tepat satu gelombang tipis di tepi atas:
 * - Bila FooterJoinStrip tampil: gelombang masuk ke ocean (#056ED4), lalu Footer navy menempel langsung tanpa celah.
 * - Bila FooterJoinStrip tidak tampil: gelombang langsung masuk ke Footer navy (#014081).
 */
export default function FooterShell() {
    const joinStrip = usePage<PageProps>().props.joinStrip;
    const showStrip = Boolean(joinStrip?.visible);

    return (
        <div className="relative mt-14 sm:mt-16">
            <WaveDivider
                fill={showStrip ? 'ocean' : 'navy'}
                tone="aqua"
                className="-mb-px"
            />
            {showStrip && joinStrip ? (
                <FooterJoinStrip
                    ctaLabel={joinStrip.ctaLabel}
                    ctaHref={joinStrip.ctaHref}
                    media={joinStrip.media}
                />
            ) : null}
            <Footer />
        </div>
    );
}
