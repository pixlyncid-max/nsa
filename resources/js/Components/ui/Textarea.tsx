import FieldShell, {
    describedBy,
    type FieldMeta,
} from '@/Components/ui/FieldShell';
import { cx } from '@/lib/cx';
import { fieldBase, fieldState } from '@/lib/ui';
import { useId, type ComponentProps } from 'react';

type TextareaProps = ComponentProps<'textarea'> &
    FieldMeta & {
        /** Tampilkan penghitung karakter (butuh maxLength dan value). */
        showCount?: boolean;
    };

export default function Textarea({
    label,
    required,
    error,
    hint,
    helperText,
    showCount = false,
    className,
    id,
    rows = 4,
    ...props
}: TextareaProps) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const resolvedHint = hint ?? helperText;
    const length = String(props.value ?? '').length;

    return (
        <FieldShell
            id={fieldId}
            label={label}
            required={required}
            error={error}
            hint={resolvedHint}
        >
            <textarea
                {...props}
                id={fieldId}
                rows={rows}
                aria-required={required || undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(fieldId, error, resolvedHint)}
                className={cx(
                    'min-h-[110px] resize-y px-3.5 py-3 leading-relaxed',
                    fieldBase,
                    fieldState(Boolean(error)),
                    className
                )}
            />
            {showCount && props.maxLength ? (
                <p className="mt-1.5 text-right text-[13px] tabular-nums text-slate">
                    {length}/{props.maxLength}
                </p>
            ) : null}
        </FieldShell>
    );
}
