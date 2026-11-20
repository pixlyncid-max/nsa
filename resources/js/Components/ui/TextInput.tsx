import { cx } from '@/lib/cx';
import { fieldBase, fieldState } from '@/lib/ui';
import type { ComponentProps } from 'react';

type TextInputProps = ComponentProps<'input'> & {
    isError?: boolean;
};

export default function TextInput({
    className,
    isError = false,
    type = 'text',
    ...props
}: TextInputProps) {
    return (
        <input
            {...props}
            type={type}
            className={cx(
                'h-11 px-3.5',
                fieldBase,
                fieldState(isError),
                className
            )}
        />
    );
}
