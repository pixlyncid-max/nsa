import InputError from '@/Components/ui/InputError';
import { cx } from '@/lib/cx';
import { useId, type ComponentProps, type ReactNode } from 'react';

type RadioProps = Omit<ComponentProps<'input'>, 'type'> & {
    label: ReactNode;
    description?: string;
    invalid?: boolean;
};

export function Radio({
    label,
    description,
    invalid = false,
    className,
    id,
    ...props
}: RadioProps) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
        <label
            htmlFor={inputId}
            className={cx(
                'flex min-h-[44px] cursor-pointer items-start gap-3 py-2',
                props.disabled && 'cursor-not-allowed opacity-60',
                className
            )}
        >
            <input
                {...props}
                id={inputId}
                type="radio"
                className={cx(
                    'mt-0.5 h-5 w-5 shrink-0 border bg-white text-navy transition-colors focus:ring-[3px] focus:ring-offset-0 disabled:cursor-not-allowed',
                    invalid
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
    );
}

interface RadioGroupProps {
    name: string;
    legend: string;
    options: { value: string; label: string; description?: string }[];
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
}

export function RadioGroup({
    name,
    legend,
    options,
    value,
    onChange,
    required,
    error,
}: RadioGroupProps) {
    const errorId = `${name}-error`;

    return (
        <fieldset aria-describedby={error ? errorId : undefined}>
            <legend className="mb-1 text-[13px] font-semibold text-ink">
                {legend}
                {required ? <span className="ml-1 text-danger">*</span> : null}
            </legend>
            {options.map((option) => (
                <Radio
                    key={option.value}
                    name={name}
                    value={option.value}
                    label={option.label}
                    description={option.description}
                    checked={value === option.value}
                    invalid={Boolean(error)}
                    onChange={() => onChange(option.value)}
                />
            ))}
            <InputError id={errorId} message={error} />
        </fieldset>
    );
}

export default Radio;
