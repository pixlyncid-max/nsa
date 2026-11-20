import FieldShell, {
    describedBy,
    type FieldMeta,
} from '@/Components/ui/FieldShell';
import Spinner from '@/Components/ui/Spinner';
import { cx } from '@/lib/cx';
import { fieldBase, fieldState } from '@/lib/ui';
import { useId, type ComponentProps, type ReactNode } from 'react';

type InputProps = Omit<ComponentProps<'input'>, 'prefix'> &
    FieldMeta & {
        /** Satuan di dalam input, sisi kanan (mis. "Orang", "Rp"). */
        suffix?: ReactNode;
        /** Ikon di sisi kiri. */
        leading?: ReactNode;
        loading?: boolean;
    };

export default function Input({
    label,
    required,
    error,
    hint,
    helperText,
    suffix,
    leading,
    loading = false,
    className,
    id,
    ...props
}: InputProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const resolvedHint = hint ?? helperText;
    const hasTail = Boolean(suffix) || loading;

    return (
        <FieldShell
            id={inputId}
            label={label}
            required={required}
            error={error}
            hint={resolvedHint}
        >
            <div className="relative">
                {leading ? (
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate">
                        {leading}
                    </span>
                ) : null}
                <input
                    {...props}
                    id={inputId}
                    aria-required={required || undefined}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(inputId, error, resolvedHint)}
                    className={cx(
                        'h-11 px-3.5',
                        fieldBase,
                        fieldState(Boolean(error)),
                        Boolean(leading) && 'pl-10',
                        hasTail && 'pr-16',
                        className
                    )}
                />
                {hasTail ? (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2 text-sm text-slate">
                        {loading ? (
                            <Spinner className="h-4 w-4 text-ocean" />
                        ) : null}
                        {suffix}
                    </span>
                ) : null}
            </div>
        </FieldShell>
    );
}
