import React from 'react';
import { AlertCircle, Phone } from 'lucide-react';

interface PhoneInputProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    hint?: string;
}

export default function PhoneInput({
    id = 'phone',
    label,
    value,
    onChange,
    error,
    required = false,
    placeholder = '81234567890',
    disabled = false,
    hint,
}: PhoneInputProps) {
    // Normalisasi value saat ditampilkan (buang awalan +62 atau 0 jika ada untuk input angka murni)
    const displayValue = value
        ? value.replace(/^\+62/, '').replace(/^62/, '').replace(/^0/, '')
        : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        // Simpan dalam format standar berawalan +62
        const formatted = raw ? `+62${raw}` : '';
        onChange(formatted);
    };

    const digitCount = displayValue.length;
    const isValidLength = digitCount >= 9 && digitCount <= 13;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={id} className="block text-[13px] font-semibold text-navy">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
                {displayValue && (
                    <span className={`text-[11px] font-medium ${isValidLength ? 'text-slate' : 'text-warning font-semibold'}`}>
                        {digitCount} digit {isValidLength ? '' : '(disarankan 9-13 digit)'}
                    </span>
                )}
            </div>

            <div className="relative flex rounded-control shadow-soft">
                {/* Prefix Badge +62 */}
                <div className="inline-flex items-center gap-1.5 px-3 rounded-l-control border border-r-0 border-line bg-mist text-xs font-bold text-navy select-none">
                    <Phone className="w-3.5 h-3.5 text-ocean" />
                    <span>+62</span>
                </div>

                {/* Input Angka Nomor HP */}
                <input
                    type="tel"
                    id={id}
                    value={displayValue}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    maxLength={14}
                    className={`block w-full h-[44px] px-3.5 text-sm rounded-r-control border bg-white text-ink placeholder:text-slate/60 transition focus:outline-none focus:border-ocean focus:ring-3 focus:ring-ocean/15 disabled:bg-mist disabled:cursor-not-allowed ${
                        error
                            ? 'border-danger focus:border-danger focus:ring-danger/15'
                            : 'border-line'
                    }`}
                />
            </div>

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
