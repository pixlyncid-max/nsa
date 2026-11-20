import ImageMask, { type ImageMaskProps } from '@/Components/layout/ImageMask';

export type ArchImageProps = Omit<ImageMaskProps, 'shape'>;

/** Foto lengkung atas, ciri bentuk Garis Pantai. */
export default function ArchImage(props: ArchImageProps) {
    return <ImageMask {...props} shape="arch" />;
}
