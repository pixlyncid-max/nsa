import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Beranda" />
            <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
                <h1 className="font-display text-6xl font-bold tracking-tight text-navy sm:text-7xl">
                    NSA
                </h1>
                <p className="mt-3 font-sans text-sm font-medium tracking-wide text-slate sm:text-base">
                    Nusantara Sustainable Aquatic
                </p>
            </main>
        </>
    );
}
