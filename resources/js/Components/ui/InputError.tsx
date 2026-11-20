import { AlertCircle } from 'lucide-react';
import { HTMLAttributes } from 'react';

interface InputErrorProps extends HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

export default function InputError({
    message,
    className = '',
    ...props
}: InputErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <p
            {...props}
            className={`mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-danger ${className}`}
        >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{message}</span>
        </p>
    );
}
