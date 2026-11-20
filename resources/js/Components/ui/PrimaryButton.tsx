import Button, { type ButtonSize } from '@/Components/ui/Button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
    size?: ButtonSize;
    icon?: ReactNode;
    iconLeft?: ReactNode;
};

/** Tombol utama selebar form (dipakai halaman autentikasi). */
export default function PrimaryButton({
    isLoading = false,
    type = 'submit',
    ...props
}: PrimaryButtonProps) {
    return (
        <Button
            {...props}
            type={type}
            variant="primary"
            loading={isLoading}
            fullWidth
        />
    );
}
