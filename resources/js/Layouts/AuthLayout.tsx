import ContourPattern from '@/Components/motion/ContourPattern';
import Reveal from '@/Components/motion/Reveal';
import WaveDivider from '@/Components/motion/WaveDivider';
import Logo from '@/Components/layout/Logo';
import { PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
}

export default function AuthLayout({
    title,
    subtitle,
    children,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-mist/40 py-12 sm:px-6 lg:px-8">
            {/* Garis kontur air khas NSA (anime.js path draw) */}
            <div className="pointer-events-none absolute inset-0 opacity-35">
                <ContourPattern tone="sky" opacity={0.35} size="100%" />
            </div>

            <div className="relative z-10 px-6 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo & Brand Header */}
                <div className="flex flex-col items-center text-center">
                    <Logo />
                    <h1 className="t-h2 mt-6 text-navy">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-sm text-slate">{subtitle}</p>
                    )}
                </div>

                {/* Form Card */}
                <Reveal y={16} className="relative mt-8 overflow-hidden rounded-card border border-line bg-white p-6 shadow-lift sm:p-8">
                    <div className="pointer-events-none absolute -top-1 left-0 right-0">
                        <WaveDivider tone="sky" />
                    </div>
                    <div className="relative z-10 pt-2">
                        {children}
                    </div>
                </Reveal>

                {/* Footer copyright note */}
                <p className="mt-8 text-center text-xs text-slate">
                    © {new Date().getFullYear()} NSA (Nusantara Sustainable Aquatic). Hak Cipta Dilindungi.
                </p>
            </div>
        </div>
    );
}
