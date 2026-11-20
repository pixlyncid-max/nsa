import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Toaster } from 'sonner';

/** Sonner: kanan atas di desktop, atas tengah di mobile; kartu putih, garis kiri sesuai status. */
export default function AppToaster() {
    const isDesktop = useMediaQuery('(min-width: 768px)');

    return (
        <Toaster
            position={isDesktop ? 'top-right' : 'top-center'}
            toastOptions={{
                classNames: {
                    toast: 'font-sans !rounded-control !border !border-l-4 !border-line !bg-white !text-ink !shadow-lift',
                    title: '!font-semibold',
                    description: '!text-slate',
                    success: '!border-l-success',
                    error: '!border-l-danger',
                    warning: '!border-l-warning',
                    info: '!border-l-ocean',
                },
            }}
        />
    );
}
