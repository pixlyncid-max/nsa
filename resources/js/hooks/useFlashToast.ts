import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useFlashToast(): void {
    const { flash } = usePage<PageProps>().props;
    const success = flash?.success;
    const error = flash?.error;

    useEffect(() => {
        if (success) {
            toast.success(success, { id: `flash-success-${success}` });
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            toast.error(error, { id: `flash-error-${error}` });
        }
    }, [error]);
}
