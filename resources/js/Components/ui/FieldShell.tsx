import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import type { ReactNode } from 'react';

export interface FieldMeta {
    label?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    helperText?: string;
}

interface FieldShellProps extends FieldMeta {
    id: string;
    className?: string;
    children: ReactNode;
}

/** Label di atas, kontrol, lalu pesan error atau petunjuk di bawah. */
export default function FieldShell({
    id,
    label,
    required,
    error,
    hint,
    helperText,
    className,
    children,
}: FieldShellProps) {
    const resolvedHint = hint ?? helperText;
    return (
        <div className={className}>
            {label ? (
                <InputLabel htmlFor={id} required={required}>
                    {label}
                </InputLabel>
            ) : null}
            {children}
            {error ? (
                <InputError id={`${id}-error`} message={error} />
            ) : resolvedHint ? (
                <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-slate">
                    {resolvedHint}
                </p>
            ) : null}
        </div>
    );
}

export function describedBy(
    id: string,
    error?: string,
    hint?: string
): string | undefined {
    if (error) {
        return `${id}-error`;
    }
    return hint ? `${id}-hint` : undefined;
}
