function resolveIntlLocale(locale?: string): string {
    const loc =
        locale ??
        (typeof document !== 'undefined'
            ? document.documentElement.lang
            : 'id');

    return loc === 'en' ? 'en-US' : 'id-ID';
}

/**
 * Format angka mengikuti bahasa aktif (id: 1.250, en: 1,250).
 */
export function formatNumber(
    value: number,
    locale?: string,
    options?: Intl.NumberFormatOptions
): string {
    return new Intl.NumberFormat(resolveIntlLocale(locale), options).format(
        value
    );
}

/**
 * Format mata uang Rupiah: simbol "Rp" tetap dipakai di kedua bahasa,
 * pemisah ribuan mengikuti bahasa aktif (id: "Rp 120.000", en: "Rp 120,000").
 */
export function formatCurrency(amount: number, locale?: string): string {
    const formatted = formatNumber(Math.round(amount), locale, {
        maximumFractionDigits: 0,
    });
    return `Rp ${formatted}`;
}

/**
 * Format tanggal mengikuti bahasa aktif (id: "20 November 2026", en: "November 20, 2026").
 */
export function formatDate(
    input: string | Date | null | undefined,
    locale?: string,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }
): string {
    if (!input) return '-';
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat(resolveIntlLocale(locale), options).format(
        date
    );
}

/**
 * Format tanggal dan waktu mengikuti bahasa aktif.
 */
export function formatDateTime(
    input: string | Date | null | undefined,
    locale?: string
): string {
    return formatDate(input, locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
