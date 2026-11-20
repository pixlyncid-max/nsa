import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, 
    Building2, 
    Camera, 
    FileText, 
    Plus, 
    Trash2, 
    UploadCloud, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import RegionSelect from '@/Components/form/RegionSelect';
import MapPicker from '@/Components/form/MapPicker';
import DocumentUploadCard, { DocumentConfig, UploadedDocItem } from '@/Components/form/DocumentUploadCard';

interface ActivityPoint {
    id?: number;
    latitude: number | null;
    longitude: number | null;
    label?: string;
}

interface PhotoItem {
    id: number;
    path: string;
    url: string;
    caption?: string;
}

interface Step7Props {
    data: {
        domicile?: {
            province_id?: number | null;
            regency_id?: number | null;
            district_id?: number | null;
            village_id?: number | null;
            postal_code?: string;
            address?: string;
        };
        is_business_address_different?: boolean;
        business_address?: {
            province_id?: number | null;
            regency_id?: number | null;
            district_id?: number | null;
            village_id?: number | null;
            postal_code?: string;
            address?: string;
        };
        activity_locations?: ActivityPoint[];
        photos?: PhotoItem[];
        [key: string]: any;
    };
    onChange: (data: any) => void;
    errors?: Record<string, string>;
    userDocuments?: UploadedDocItem[];
    requiredDocsList?: Array<{
        type: string;
        title: string;
        description: string;
        required: boolean;
    }>;
    memberDocumentsConfig?: Record<string, any>;
    [key: string]: any;
}

export default function Step7LocationDocuments({
    data = {},
    onChange,
    errors = {},
    userDocuments = [],
    requiredDocsList = [],
    memberDocumentsConfig = {},
}: Step7Props) {
    const domicile = data.domicile || {
        province_id: null,
        regency_id: null,
        district_id: null,
        village_id: null,
        postal_code: '',
        address: '',
    };

    const isBusinessDifferent = Boolean(data.is_business_address_different);

    const businessAddress = data.business_address || {
        province_id: null,
        regency_id: null,
        district_id: null,
        village_id: null,
        postal_code: '',
        address: '',
    };

    const activityLocations: ActivityPoint[] = data.activity_locations && data.activity_locations.length > 0
        ? data.activity_locations
        : [{ latitude: -6.2088, longitude: 106.8456, label: 'Lokasi Utama' }];

    const photos: PhotoItem[] = data.photos || [];

    // State lokal untuk dokumen yang diunggah
    const [docs, setDocs] = useState<UploadedDocItem[]>(userDocuments);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

    const updateDomicile = (fields: Partial<typeof domicile>) => {
        onChange({
            ...data,
            domicile: {
                ...domicile,
                ...fields,
            },
        });
    };

    const updateBusinessAddress = (fields: Partial<typeof businessAddress>) => {
        onChange({
            ...data,
            business_address: {
                ...businessAddress,
                ...fields,
            },
        });
    };

    const toggleBusinessDifferent = (checked: boolean) => {
        onChange({
            ...data,
            is_business_address_different: checked,
            // Jika dimatikan, salin nilai domisili ke business_address
            business_address: checked ? businessAddress : { ...domicile },
        });
    };

    const handleAddActivityLocation = () => {
        const nextLocations = [
            ...activityLocations,
            { latitude: -6.2088, longitude: 106.8456, label: `Titik Kegiatan ${activityLocations.length + 1}` },
        ];
        onChange({
            ...data,
            activity_locations: nextLocations,
        });
    };

    const handleRemoveActivityLocation = (index: number) => {
        if (activityLocations.length <= 1) {
            toast.error('Minimal satu titik lokasi kegiatan harus tersedia.');
            return;
        }
        const nextLocations = activityLocations.filter((_, i) => i !== index);
        onChange({
            ...data,
            activity_locations: nextLocations,
        });
    };

    const handleUpdateActivityLocation = (index: number, coords: { latitude: number; longitude: number }, label?: string) => {
        const nextLocations = [...activityLocations];
        nextLocations[index] = {
            ...nextLocations[index],
            latitude: coords.latitude,
            longitude: coords.longitude,
            label: label !== undefined ? label : nextLocations[index].label,
        };
        onChange({
            ...data,
            activity_locations: nextLocations,
        });
    };

    // Upload Foto Usaha (1-5 foto)
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (photos.length >= 5) {
            toast.error('Maksimal 5 foto usaha telah tercapai.');
            return;
        }

        const file = files[0];
        const formData = new FormData();
        formData.append('photo', file);

        setIsUploadingPhoto(true);
        setPhotoError(null);

        try {
            const response = await axios.post('/akun/keanggotaan/foto', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success && response.data.photo) {
                const nextPhotos = [...photos, response.data.photo];
                onChange({
                    ...data,
                    photos: nextPhotos,
                });
                toast.success('Foto usaha berhasil diunggah.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gagal mengunggah foto usaha.';
            setPhotoError(msg);
            toast.error(msg);
        } finally {
            setIsUploadingPhoto(false);
            e.target.value = '';
        }
    };

    const handleDeletePhoto = async (photoId: number) => {
        try {
            await axios.delete(`/akun/keanggotaan/foto/${photoId}`);
            const nextPhotos = photos.filter((p) => p.id !== photoId);
            onChange({
                ...data,
                photos: nextPhotos,
            });
            toast.success('Foto usaha berhasil dihapus.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menghapus foto.');
        }
    };

    // Handler dokumen pendukung
    const handleDocumentUploaded = (newDoc: UploadedDocItem) => {
        setDocs((prev) => {
            const filtered = prev.filter((d) => d.id !== newDoc.id && d.type !== newDoc.type);
            return [...filtered, newDoc];
        });
    };

    const handleDocumentDeleted = (docId: number) => {
        setDocs((prev) => prev.filter((d) => d.id !== docId));
    };

    return (
        <div className="space-y-8">
            {/* KARTU 1: ALAMAT DOMISILI ATAU USAHA */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-7 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-base md:text-lg">
                            Alamat Domisili Calon Anggota
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Pilih wilayah administrasi 4 tingkat sesuai tempat tinggal atau KTP resmi Anda.
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Region Select 4 Tingkat */}
                    <RegionSelect
                        provinceId={domicile.province_id ?? null}
                        regencyId={domicile.regency_id ?? null}
                        districtId={domicile.district_id ?? null}
                        villageId={domicile.village_id ?? null}
                        onChange={(regs) => updateDomicile({
                            province_id: regs.province_id,
                            regency_id: regs.regency_id,
                            district_id: regs.district_id,
                            village_id: regs.village_id,
                        })}
                        errors={errors}
                        fieldPrefix="domicile"
                        required
                    />

                    {/* Kode Pos & Alamat Lengkap */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Kode Pos <span className="text-muted-foreground font-normal">(Opsional)</span>
                            </label>
                            <input
                                type="text"
                                maxLength={10}
                                value={domicile.postal_code || ''}
                                onChange={(e) => updateDomicile({ postal_code: e.target.value })}
                                placeholder="Misal: 16120"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            />
                        </div>

                        <div className="md:col-span-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-foreground">
                                    Alamat Lengkap Domisili <span className="text-destructive">*</span>
                                </label>
                                <span className={`text-[11px] font-mono ${(domicile.address?.length || 0) > 240 ? 'text-warning font-semibold' : 'text-muted-foreground'}`}>
                                    {domicile.address?.length || 0}/250
                                </span>
                            </div>
                            <textarea
                                rows={2}
                                maxLength={250}
                                value={domicile.address || ''}
                                onChange={(e) => updateDomicile({ address: e.target.value })}
                                placeholder="Jalan, nomor rumah, RT/RW, gang, atau patokan lokasi..."
                                className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none ${
                                    errors['domicile.address'] ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'
                                }`}
                            />
                            {errors['domicile.address'] && (
                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors['domicile.address']}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Checkbox: Alamat Usaha Berbeda dengan Domisili */}
                    <div className="pt-2 border-t border-border/60">
                        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isBusinessDifferent}
                                onChange={(e) => toggleBusinessDifferent(e.target.checked)}
                                className="w-4 h-4 rounded border-input text-primary focus:ring-primary transition"
                            />
                            <span className="text-sm font-medium text-foreground">
                                Alamat operasional atau tempat usaha berbeda dengan domisili
                            </span>
                        </label>
                    </div>

                    {/* Form Alamat Usaha (Tampil jika dicentang) */}
                    <AnimatePresence>
                        {isBusinessDifferent && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="pt-4 space-y-4 border-t border-dashed border-border"
                            >
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    <h4 className="text-sm font-semibold text-foreground">
                                        Alamat Fasilitas / Tempat Usaha
                                    </h4>
                                </div>

                                <RegionSelect
                                    provinceId={businessAddress.province_id ?? null}
                                    regencyId={businessAddress.regency_id ?? null}
                                    districtId={businessAddress.district_id ?? null}
                                    villageId={businessAddress.village_id ?? null}
                                    onChange={(regs) => updateBusinessAddress({
                                        province_id: regs.province_id,
                                        regency_id: regs.regency_id,
                                        district_id: regs.district_id,
                                        village_id: regs.village_id,
                                    })}
                                    errors={errors}
                                    fieldPrefix="business_address"
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-1 space-y-1.5">
                                        <label className="block text-xs font-semibold text-foreground">
                                            Kode Pos Usaha
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            value={businessAddress.postal_code || ''}
                                            onChange={(e) => updateBusinessAddress({ postal_code: e.target.value })}
                                            placeholder="Kode pos"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-foreground">
                                                Alamat Lengkap Usaha <span className="text-destructive">*</span>
                                            </label>
                                            <span className={`text-[11px] font-mono ${(businessAddress.address?.length || 0) > 240 ? 'text-warning font-semibold' : 'text-muted-foreground'}`}>
                                                {businessAddress.address?.length || 0}/250
                                            </span>
                                        </div>
                                        <textarea
                                            rows={2}
                                            maxLength={250}
                                            value={businessAddress.address || ''}
                                            onChange={(e) => updateBusinessAddress({ address: e.target.value })}
                                            placeholder="Alamat tambak, gudang, kolam, atau kantor operasional..."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* KARTU 2: LOKASI KEGIATAN (MAP PICKER REPEATER) */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-7 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-primary shrink-0">
                            <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-base md:text-lg">
                                Titik Koordinat Kegiatan & Sarana
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                Tentukan koordinat GPS fasilitas atau kolam Anda. Anda dapat menambahkan lebih dari satu lokasi kegiatan.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddActivityLocation}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold transition shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Titik Lokasi
                    </button>
                </div>

                <div className="space-y-6">
                    {activityLocations.map((loc, idx) => (
                        <div
                            key={idx}
                            className="p-4 md:p-5 rounded-xl border border-border/70 bg-muted/20 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={loc.label || ''}
                                        onChange={(e) => handleUpdateActivityLocation(idx, { latitude: loc.latitude ?? 0, longitude: loc.longitude ?? 0 }, e.target.value)}
                                        placeholder={`Misal: Tambak Blok ${idx + 1} / Kolam Pembenihan`}
                                        className="text-xs md:text-sm font-semibold text-foreground bg-transparent border-b border-dashed border-border focus:border-primary focus:outline-none px-1 py-0.5"
                                    />
                                </div>
                                {activityLocations.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveActivityLocation(idx)}
                                        className="text-muted-foreground hover:text-destructive text-xs flex items-center gap-1 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Hapus Titik
                                    </button>
                                )}
                            </div>

                            <MapPicker
                                latitude={loc.latitude}
                                longitude={loc.longitude}
                                onChange={(coords) => handleUpdateActivityLocation(idx, coords)}
                                label="Pilih Titik di Peta"
                                required
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* KARTU 3: FOTO USAHA (OPSIONAL: 1-5 FOTO) */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-7 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground text-base md:text-lg">
                                Foto Fasilitas atau Kegiatan Usaha
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                                Opsional (1–5 Foto)
                            </span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Unggah foto kolam, tambak, armada, atau tempat kerja Anda untuk mempercepat verifikasi lapangan.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Grid Thumbnail Foto yang Sudah Diunggah */}
                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="group relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/40 shadow-xs"
                                >
                                    <img
                                        src={photo.url}
                                        alt={photo.caption || 'Foto Usaha'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePhoto(photo.id)}
                                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white hover:bg-destructive transition opacity-0 group-hover:opacity-100"
                                        title="Hapus Foto"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Area Unggah Foto Jika Masih < 5 */}
                    {photos.length < 5 && (
                        <div>
                            <label
                                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                                    isUploadingPhoto
                                        ? 'border-primary/50 bg-primary/5'
                                        : 'border-border hover:border-primary/50 hover:bg-muted/20'
                                }`}
                            >
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePhotoUpload}
                                    disabled={isUploadingPhoto}
                                    className="hidden"
                                />
                                {isUploadingPhoto ? (
                                    <div className="flex items-center gap-2 text-primary text-xs font-semibold py-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Mengunggah foto usaha...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                            <UploadCloud className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-semibold text-foreground">
                                            Klik untuk memilih foto fasilitas ({photos.length}/5 foto)
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Format JPG, PNG, atau WEBP (Maksimal 5 MB per foto)
                                        </p>
                                    </div>
                                )}
                            </label>
                            {photoError && (
                                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {photoError}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* KARTU 4: DOKUMEN PENDUKUNG (DYNAMIC CARDS DARI LANGKAH 1-3) */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-7 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-base md:text-lg">
                            Dokumen Pendukung & Legalitas
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Berkas persyaratan disesuaikan otomatis dengan identitas dan izin yang Anda isi di langkah sebelumnya.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {requiredDocsList.map((docReq) => {
                        const fallbackCfg = memberDocumentsConfig[docReq.type] || {};
                        const docConfig: DocumentConfig = {
                            type: docReq.type,
                            title: docReq.title,
                            description: docReq.description,
                            required: docReq.required,
                            multiple: Boolean(fallbackCfg.multiple),
                            min_files: fallbackCfg.min_files || (docReq.required ? 1 : 0),
                            max_files: fallbackCfg.max_files || 1,
                            max_size_kb: fallbackCfg.max_size_kb || 5120,
                            allowed_mimes: fallbackCfg.allowed_mimes || ['image/jpeg', 'image/png', 'application/pdf'],
                            allowed_extensions: fallbackCfg.allowed_extensions || ['jpg', 'jpeg', 'png', 'pdf'],
                        };

                        const uploadedForThisType = docs.filter((d) => d.type === docReq.type);

                        return (
                            <DocumentUploadCard
                                key={docReq.type}
                                config={docConfig}
                                documents={uploadedForThisType}
                                onDocumentUploaded={handleDocumentUploaded}
                                onDocumentDeleted={handleDocumentDeleted}
                                error={errors[`doc_${docReq.type}`]}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
