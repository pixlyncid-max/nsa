import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TextCounterTextareaProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    maxLength?: number;
    rows?: number;
    disabled?: boolean;
    hint?: string;
}

export default function TextCounterTextarea({
    id = 'address',
    label,
    value = '',
    onChange,
    error,
    required = false,
    placeholder = 'Masukkan alamat lengkap...',
    maxLength = 250,
    rows = 3,
    disabled = false,
    hint,
}: TextCounterTextareaProps) {
    const charCount = value ? value.length : 0;
    const isExceeded = charCount > maxLength;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={id} className="block text-[13px] font-semibold text-navy">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
                <span
                    className={`text-[11px] font-mono ${
                        isExceeded ? 'text-danger font-bold' : 'text-slate'
                    }`}
                >
                    {charCount}/{maxLength}
                </span>
            </div>

            <textarea
                id={id}
                rows={rows}
                value={value}
                maxLength={maxLength}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`block w-full p-3 text-sm rounded-control border bg-white text-ink placeholder:text-slate/60 transition resize-none focus:outline-none focus:border-ocean focus:ring-3 focus:ring-ocean/15 disabled:bg-mist disabled:cursor-not-allowed ${
                    error
                        ? 'border-danger focus:border-danger focus:ring-danger/15'
                        : 'border-line'
                }`}
            />

            {error ? (
                <p className="mt-1.5 text-xs text-danger flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            ) : hint ? (
                <p className="mt-1 text-[11px] text-slate">{hint}</p>
            ) : null}
        </div>
    );
}
