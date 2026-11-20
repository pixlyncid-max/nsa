import InputError from '@/Components/ui/InputError';
import { cx } from '@/lib/cx';
import { useId, type ComponentProps, type ReactNode } from 'react';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
    label: ReactNode;
    description?: string;
    error?: string;
};

export default function Checkbox({
    label,
    description,
    error,
    className,
    id,
    ...props
}: CheckboxProps) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
        <div className={className}>
            <label
                htmlFor={inputId}
                className={cx(
                    'flex min-h-[44px] cursor-pointer items-start gap-3 py-2',
                    props.disabled && 'cursor-not-allowed opacity-60'
                )}
            >
                <input
                    {...props}
                    id={inputId}
                    type="checkbox"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    className={cx(
                        'mt-0.5 h-5 w-5 shrink-0 rounded-md border bg-white text-navy transition-colors focus:ring-[3px] focus:ring-offset-0 disabled:cursor-not-allowed',
                        error
                            ? 'border-danger focus:ring-danger/20'
                            : 'border-line hover:border-slate/50 focus:ring-ocean/30'
                    )}
                />
                <span className="text-sm leading-snug text-ink">
                    <span className="font-semibold">{label}</span>
                    {description ? (
                        <span className="mt-0.5 block text-[13px] text-slate">
                            {description}
                        </span>
                    ) : null}
                </span>
            </label>
            <InputError id={`${inputId}-error`} message={error} />
        </div>
    );
}
