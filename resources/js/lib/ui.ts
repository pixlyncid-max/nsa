/** Ring fokus keyboard (design.md bagian 10): ring `ocean`. */
export const focusRing =
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ocean/30';

/** Dasar semua field: tinggi dipasang per komponen. */
export const fieldBase =
    'w-full rounded-control border bg-white text-sm text-ink placeholder:text-slate/70 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-mist disabled:text-slate';

/** Border + ring sesuai state: normal (fokus ocean) atau error (danger). */
export function fieldState(hasError: boolean): string {
    return hasError
        ? 'border-danger focus:border-danger focus:ring-[3px] focus:ring-danger/15'
        : 'border-line hover:border-slate/40 focus:border-ocean focus:ring-[3px] focus:ring-ocean/15';
}
