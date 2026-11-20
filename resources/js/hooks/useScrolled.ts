import { useSyncExternalStore } from 'react';

export function useScrolled(threshold = 8): boolean {
    return useSyncExternalStore(
        (notify) => {
            window.addEventListener('scroll', notify, { passive: true });
            return () => window.removeEventListener('scroll', notify);
        },
        () => window.scrollY > threshold,
        () => false
    );
}
