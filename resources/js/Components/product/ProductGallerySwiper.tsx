import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export interface ProductGalleryImage {
    id: number;
    path: string;
}

interface ProductGallerySwiperProps {
    images: ProductGalleryImage[];
    productName: string;
    onSwiper: (swiper: SwiperType) => void;
    onSlideChange: (activeIndex: number) => void;
}

export default function ProductGallerySwiper({
    images,
    productName,
    onSwiper,
    onSlideChange,
}: ProductGallerySwiperProps) {
    return (
        <Swiper
            modules={[Navigation, Pagination]}
            onSwiper={onSwiper}
            onSlideChange={(s) => onSlideChange(s.activeIndex)}
            navigation={images.length > 1}
            pagination={{ clickable: true }}
            className="aspect-[4/3] w-full"
        >
            {images.map((img, idx) => (
                <SwiperSlide key={img.id}>
                    <img
                        src={img.path}
                        alt={productName}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="h-full w-full object-cover"
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
