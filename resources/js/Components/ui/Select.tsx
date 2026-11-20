import FieldShell, {
    describedBy,
    type FieldMeta,
} from '@/Components/ui/FieldShell';
import { cx } from '@/lib/cx';
import { fieldBase, fieldState } from '@/lib/ui';
import { ChevronDown } from 'lucide-react';
import { useId, type ComponentProps } from 'react';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

type SelectProps = Omit<ComponentProps<'select'>, 'children'> &
    FieldMeta & {
        options: SelectOption[];
        placeholder?: string;
    };

export default function Select({
    label,
    required,
    error,
    hint,
    options,
    placeholder,
    className,
    id,
    ...props
}: SelectProps) {
    const autoId = useId();
    const selectId = id ?? autoId;

    return (
        <FieldShell
            id={selectId}
            label={label}
            required={required}
            error={error}
            hint={hint}
        >
            <div className="relative">
                <select
                    {...props}
                    id={selectId}
                    aria-required={required || undefined}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(selectId, error, hint)}
                    className={cx(
                        'h-11 appearance-none bg-none pl-3.5 pr-10',
                        fieldBase,
                        fieldState(Boolean(error)),
                        className
                    )}
                >
                    {placeholder ? (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    ) : null}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate"
                    strokeWidth={1.75}
                    aria-hidden="true"
                />
            </div>
        </FieldShell>
    );
}
