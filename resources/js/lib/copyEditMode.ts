import { useSyncExternalStore } from 'react';

let editModeActive = false;
const listeners = new Set<() => void>();

export function getCopyEditMode(): boolean {
    return editModeActive;
}

export function setCopyEditMode(next: boolean): void {
    if (editModeActive === next) return;
    editModeActive = next;
    listeners.forEach((listener) => listener());
}

export function subscribeCopyEditMode(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useCopyEditMode(): boolean {
    return useSyncExternalStore(
        subscribeCopyEditMode,
        getCopyEditMode,
        () => false
    );
}
