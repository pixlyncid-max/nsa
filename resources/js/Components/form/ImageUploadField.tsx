import React, { useRef, useState } from 'react';
import { Camera, Trash2, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/Components/ui/Button';

interface ImageUploadFieldProps {
    id?: string;
    label: string;
    currentPhotoUrl?: string | null;
    onChange: (file: File | null) => void;
    error?: string;
    required?: boolean;
    hint?: string;
    maxSizeMb?: number;
}

export default function ImageUploadField({
    id = 'photo-upload',
    label,
    currentPhotoUrl,
    onChange,
    error,
    required = false,
    hint = 'Format JPG, JPEG, atau PNG. Ukuran maksimal 2 MB.',
    maxSizeMb = 2,
}: ImageUploadFieldProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setLocalError('Format foto harus berupa JPG atau PNG.');
            return;
        }

        // Validasi ukuran file (maks 2MB)
        if (file.size > maxSizeMb * 1024 * 1024) {
            setLocalError(`Ukuran foto tidak boleh melebihi ${maxSizeMb} MB.`);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        onChange(file);
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setLocalError(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const displayError = error || localError;

    return (
        <div className="w-full">
            <label className="block text-[13px] font-semibold text-navy mb-2">
                {label} {required && <span className="text-danger">*</span>}
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-line bg-mist/40 hover:bg-mist/70 transition">
                {/* Pratinjau Bulat */}
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full border-2 border-line overflow-hidden bg-white shadow-soft flex items-center justify-center">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Pratinjau Foto Diri"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate">
                                <Camera className="w-8 h-8 text-ocean/50" />
                                <span className="text-[10px] mt-1 font-semibold text-slate/70">Pas Foto</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={triggerUpload}
                        className="absolute inset-0 bg-navy/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Ubah foto"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Kontrol Aksi Unggah & Hapus */}
                <div className="flex-1 text-center sm:text-left">
                    <input
                        ref={fileInputRef}
                        type="file"
                        id={id}
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={triggerUpload}
                            iconLeft={<Upload className="w-3.5 h-3.5 text-ocean" />}
                            className="text-xs"
                        >
                            {previewUrl ? 'Ganti Foto' : 'Unggah Foto'}
                        </Button>

                        {previewUrl && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                iconLeft={<Trash2 className="w-3.5 h-3.5 text-danger" />}
                                className="text-xs text-danger hover:bg-danger/10"
                            >
                                Hapus
                            </Button>
                        )}
                    </div>

                    <p className="mt-2 text-xs text-slate">{hint}</p>
                </div>
            </div>

            {displayError && (
                <p className="mt-2 text-xs text-danger flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{displayError}</span>
                </p>
            )}
        </div>
    );
}
