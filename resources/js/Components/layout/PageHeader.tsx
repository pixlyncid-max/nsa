import Breadcrumb, { type BreadcrumbItem } from '@/Components/ui/Breadcrumb';
import Container from '@/Components/layout/Container';
import ArchImage from '@/Components/layout/ArchImage';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { animate } from 'animejs';
import React, { useEffect, useRef } from 'react';

export interface PageHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    eyebrow?: string;
    title: string;
    description?: string;
    variant?: 'default' | 'with-image';
    imageSrc?: string;
    imageAlt?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Primitif PageHeader: tajuk halaman editorial Garis Pantai NSA.
 * Menampilkan breadcrumb, judul display sangat besar, subjudul,
 * dan animasi garis kontur air anime.js di sisi kanan.
 */
export default function PageHeader({
    breadcrumbs,
    eyebrow: _eyebrow,
    title,
    description,
    variant = 'default',
    imageSrc,
    imageAlt,
    className,
    children,
}: PageHeaderProps) {
    void _eyebrow;
    const svgRef = useRef<SVGSVGElement>(null);
    const reducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (reducedMotion || !svgRef.current) return;

        const paths = svgRef.current.querySelectorAll<SVGPathElement>('path');
        if (paths.length === 0) return;

        paths.forEach((path, i) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;

            const state = { offset: length };
            try {
                animate(state, {
                    offset: 0,
                    duration: 2200,
                    delay: i * 180,
                    ease: 'outQuad',
                    onUpdate: () => {
                        path.style.strokeDashoffset = `${state.offset}`;
                    },
                });
            } catch {
                path.style.strokeDashoffset = '0';
            }
        });
    }, [reducedMotion]);

    return (
        <header
            className={cx(
                'relative overflow-hidden border-b border-line bg-mist/45 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20',
                className
            )}
        >
            {/* Animasi Garis Kontur Air Anime.js di Latar Kanan */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 sm:h-96 sm:w-96 lg:h-[480px] lg:w-[480px] opacity-25"
            >
                <svg
                    ref={svgRef}
                    viewBox="0 0 400 400"
                    fill="none"
                    className="h-full w-full stroke-ocean"
                    strokeWidth="1.25"
                >
                    <path d="M 50,200 C 100,120 180,80 250,110 C 320,140 360,220 340,300 C 320,380 220,390 150,350 C 80,310 0,280 50,200 Z" />
                    <path d="M 90,200 C 130,140 190,110 240,130 C 290,150 320,210 300,270 C 280,330 200,340 150,310 C 100,280 50,260 90,200 Z" />
                    <path d="M 130,200 C 160,160 200,140 230,150 C 260,160 280,200 270,240 C 260,280 200,290 170,270 C 140,250 100,240 130,200 Z" />
                    <path d="M 170,200 C 185,180 210,170 225,175 C 240,180 250,200 245,220 C 240,240 210,245 195,235 C 180,225 155,220 170,200 Z" />
                </svg>
            </div>

            <Container className="relative">
                {breadcrumbs && breadcrumbs.length > 0 ? (
                    <div className="mb-6">
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                ) : null}

                {variant === 'with-image' && imageSrc ? (
                    <div className="grid items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy leading-[1.08]">
                                {title}
                            </h1>
                            {description ? (
                                <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate max-w-xl">
                                    {description}
                                </p>
                            ) : null}
                            {children ? <div className="mt-8">{children}</div> : null}
                        </div>
                        <div className="lg:col-span-5">
                            <ArchImage
                                src={imageSrc}
                                alt={imageAlt ?? title}
                                aspectRatio="aspect-[4/3] sm:aspect-[4/5]"
                                priority
                            />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl">
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy leading-[1.08]">
                            {title}
                        </h1>
                        {description ? (
                            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate max-w-2xl">
                                {description}
                            </p>
                        ) : null}
                        {children ? <div className="mt-8">{children}</div> : null}
                    </div>
                )}
            </Container>
        </header>
    );
}
