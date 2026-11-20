import React, { useRef, useState } from 'react';
import axios from 'axios';
import {
    UploadCloud,
    FileText,
    Image as ImageIcon,
    Trash2,
    Eye,
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

export interface UploadedDocItem {
    id: number;
    type: string;
    path: string;
    original_name?: string;
    file_size?: number;
    formatted_size?: string;
    mime_type?: string;
    status: string; // 'pending' | 'approved' | 'rejected' | 'revision'
    signed_url?: string;
}

export interface DocumentConfig {
    type: string;
    title: string;
    description: string;
    required: boolean;
    multiple: boolean;
    min_files?: number;
    max_files?: number;
    max_size_kb: number;
    allowed_mimes: string[];
    allowed_extensions: string[];
}

interface DocumentUploadCardProps {
    config: DocumentConfig;
    documents: UploadedDocItem[];
    onDocumentUploaded: (doc: UploadedDocItem) => void;
    onDocumentDeleted: (docId: number) => void;
    error?: string;
}

export default function DocumentUploadCard({
    config,
    documents,
    onDocumentUploaded,
    onDocumentDeleted,
    error,
}: DocumentUploadCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Filter dokumen yang sesuai dengan jenis kartu ini
    const typeDocs = documents.filter((doc) => doc.type === config.type);
    const hasFiles = typeDocs.length > 0;
    const canUploadMore = config.multiple
        ? typeDocs.length < (config.max_files || 5)
        : typeDocs.length === 0;

    // Handle File Upload
    const handleFileUpload = async (file: File) => {
        // Validasi ukuran klien
        const maxBytes = config.max_size_kb * 1024;
        if (file.size > maxBytes) {
            toast.error(
                `Ukuran berkas ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal ${Math.round(config.max_size_kb / 1024)} MB.`
            );
            return;
        }

        const formData = new FormData();
        formData.append('type', config.type);
        formData.append('file', file);

        setIsUploading(true);
        setUploadProgress(10);

        try {
            const res = await axios.post('/akun/keanggotaan/dokumen', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                },
            });

            if (res.data?.success && res.data?.document) {
                toast.success(`${config.title} berhasil diunggah.`);
                onDocumentUploaded(res.data.document);
            }
        } catch (err: any) {
            const msg =
                err.response?.data?.errors?.file?.[0] ||
                err.response?.data?.message ||
                `Gagal mengunggah berkas ${config.title}.`;
            toast.error(msg);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Handle Delete Document
    const handleDelete = async (docId: number) => {
        setDeletingId(docId);
        try {
            const res = await axios.delete(`/akun/keanggotaan/dokumen/${docId}`);
            if (res.data?.success) {
                toast.success('Berkas berhasil dihapus.');
                onDocumentDeleted(docId);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menghapus berkas.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const isImageFile = (mime?: string, name?: string) => {
        if (mime?.startsWith('image/')) return true;
        if (name && /\.(jpg|jpeg|png|webp)$/i.test(name)) return true;
        return false;
    };

    return (
        <div className="rounded-2xl border border-line bg-white p-5 md:p-6 shadow-soft transition-all hover:border-ocean/30 space-y-4">
            {/* Header Kartu Dokumen */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-line pb-3">
                <div>
                    <h3 className="font-display text-sm font-bold text-navy flex items-center gap-2">
                        {config.title}
                        {config.required ? (
                            <span className="text-danger font-bold">*</span>
                        ) : (
                            <span className="text-[11px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                Opsional
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-slate mt-0.5">{config.description}</p>
                </div>

                {/* Badge Status Ringkas */}
                <div>
                    {hasFiles ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/10 border border-success/30 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {config.multiple ? `${typeDocs.length} Berkas Terunggah` : 'Terunggah'}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                            Belum diunggah
                        </span>
                    )}
                </div>
            </div>

            {/* List Berkas yang Sudah Diunggah */}
            {hasFiles && (
                <div className="space-y-2.5">
                    {typeDocs.map((doc) => {
                        const isImg = isImageFile(doc.mime_type, doc.original_name);
                        const isRevision = doc.status === 'revision' || doc.status === 'rejected';

                        return (
                            <div
                                key={doc.id}
                                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                                    isRevision
                                        ? 'border-warning/30 bg-warning/10/50'
                                        : 'border-slate-200 bg-mist/20 hover:bg-mist/40'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Icon / Thumbnail Preview */}
                                    <div className="h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {isImg && doc.signed_url ? (
                                            <img
                                                src={doc.signed_url}
                                                alt={doc.original_name || config.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : isImg ? (
                                            <ImageIcon className="h-5 w-5 text-ocean" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-danger" />
                                        )}
                                    </div>

                                    {/* Info File & Ukuran */}
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-navy truncate">
                                            {doc.original_name || basename(doc.path)}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-slate mt-0.5">
                                            <span>{doc.formatted_size || 'Berkas'}</span>
                                            <span>•</span>
                                            {isRevision ? (
                                                <span className="text-warning font-semibold flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Perlu diperbaiki
                                                </span>
                                            ) : (
                                                <span className="text-success font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Terverifikasi aman
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Aksi File: Buka & Hapus */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {doc.signed_url && (
                                        <a
                                            href={doc.signed_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-500 hover:text-ocean hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                                            title="Buka Dokumen"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </a>
                                    )}

                                    <button
                                        type="button"
                                        disabled={deletingId === doc.id}
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-slate-400 hover:text-danger hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors disabled:opacity-50"
                                        title="Hapus Dokumen"
                                    >
                                        {deletingId === doc.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-danger" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Area Unggah (Dropzone) Jika Masih Bisa Mengunggah */}
            {canUploadMore ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-xl border-2 border-dashed p-4 md:p-6 text-center cursor-pointer transition-all ${
                        isDragging
                            ? 'border-ocean bg-ocean/5 scale-[1.005]'
                            : 'border-slate-300 hover:border-ocean hover:bg-mist/30'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={config.allowed_extensions.map((ext) => `.${ext}`).join(',')}
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                            }
                        }}
                        className="hidden"
                    />

                    {isUploading ? (
                        <div className="space-y-2 py-2">
                            <Loader2 className="h-7 w-7 text-ocean animate-spin mx-auto" />
                            <p className="text-xs font-semibold text-navy">Mengunggah berkas... {uploadProgress}%</p>
                            <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                    className="h-full bg-ocean transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <div className="h-10 w-10 rounded-full bg-ocean/10 text-ocean flex items-center justify-center mx-auto mb-2">
                                <UploadCloud className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-medium text-slate-700">
                                <span className="font-bold text-ocean">Klik untuk memilih</span> atau seret & lepas berkas ke sini
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Format: {config.allowed_extensions.map((e) => e.toUpperCase()).join(', ')} • Maksimal {Math.round(config.max_size_kb / 1024)} MB
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                !config.multiple && hasFiles && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean hover:text-navy transition-colors px-3 py-1.5 rounded-lg border border-ocean/30 bg-ocean/5 hover:bg-ocean/10"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={config.allowed_extensions.map((ext) => `.${ext}`).join(',')}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleFileUpload(e.target.files[0]);
                                    }
                                }}
                                className="hidden"
                            />
                            <RefreshCw className="h-3.5 w-3.5" />
                            Ganti Berkas
                        </button>
                    </div>
                )
            )}

            {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>
    );
}

function basename(path: string): string {
    return path.split('/').pop() || path;
}
