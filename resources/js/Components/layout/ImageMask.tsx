import ContourPattern from '@/Components/motion/ContourPattern';
import { cx } from '@/lib/cx';
import { useState } from 'react';

export type ImageShape = 'arch' | 'tall' | 'circle' | 'rect';

export interface ImageMaskProps {
    src?: string | null;
    srcSet?: string;
    sizes?: string;
    alt: string;
    shape: ImageShape;
    /** Kelas rasio Tailwind. Wajib tetap agar tidak ada layout shift. */
    aspectRatio?: string;
    width?: number;
    height?: number;
    caption?: string;
    priority?: boolean;
    className?: string;
    imageClassName?: string;
}

const shapeClass: Record<ImageShape, string> = {
    arch: 'rounded-t-[999px] rounded-b-card',
    tall: 'rounded-card',
    circle: 'rounded-full',
    rect: 'rounded-card',
};

const defaultRatio: Record<ImageShape, string> = {
    arch: 'aspect-[4/5]',
    tall: 'aspect-[3/4]',
    circle: 'aspect-square',
    rect: 'aspect-[4/3]',
};

/**
 * Foto dengan bentuk Garis Pantai (lengkung atas, tegak, lingkaran).
 * Bila berkas belum ada atau gagal dimuat, tampil placeholder berlabel
 * supaya tidak tampak seperti foto final.
 */
export default function ImageMask({
    src,
    srcSet,
    sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
    alt,
    shape,
    aspectRatio,
    width = 800,
    height = 1000,
    caption,
    priority = false,
    className,
    imageClassName,
}: ImageMaskProps) {
    const [failed, setFailed] = useState(!src);

    return (
        <figure className={cx('relative', className)}>
            <div
                className={cx(
                    'relative w-full overflow-hidden border border-line bg-mist',
                    aspectRatio ?? defaultRatio[shape],
                    shapeClass[shape]
                )}
            >
                {failed ? (
                    <div className="absolute inset-0 grid place-items-center p-4 text-center">
                        <ContourPattern tone="sky" opacity={0.35} rings={6} animate={false} className="absolute inset-0" />
                        <span className="relative max-w-[80%] text-xs font-semibold text-slate">
                            [Foto] {alt}
                        </span>
                    </div>
                ) : (
                    <img
                        src={src ?? undefined}
                        srcSet={srcSet}
                        sizes={srcSet ? sizes : undefined}
                        alt={alt}
                        width={width}
                        height={height}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        decoding="async"
                        onError={() => setFailed(true)}
                        className={cx('absolute inset-0 h-full w-full object-cover', imageClassName)}
                    />
                )}
            </div>
            {caption ? <figcaption className="mt-2 text-xs text-slate">{caption}</figcaption> : null}
        </figure>
    );
}
