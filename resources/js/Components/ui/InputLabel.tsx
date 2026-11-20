import { LabelHTMLAttributes } from 'react';

interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    value?: string;
    required?: boolean;
}

export default function InputLabel({
    value,
    required = false,
    className = '',
    children,
    ...props
}: InputLabelProps) {
    return (
        <label
            {...props}
            className={`mb-1.5 block text-[13px] font-semibold text-ink ${className}`}
        >
            {value ? value : children}
            {required && <span className="ml-1 text-danger">*</span>}
        </label>
    );
}
