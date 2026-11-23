import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import Checkbox from '@/Components/ui/Checkbox';
import Input from '@/Components/ui/Input';
import RichTextEditor from '@/Components/ui/RichTextEditor';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    Image as ImageIcon,
    Tag,
    UploadCloud,
} from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

interface ProgramDetail {
    id: number;
    title: string;
    slug: string;
    category: string;
    summary: string;
    body: string;
    status: 'draft' | 'published';
    is_public: boolean;
    cover_url: string | null;
    starts_at: string;
    ends_at: string;
    order: number;
}

interface CategoryOption {
    value: string;
    label: string;
}

interface ProgramFormProps {
    program: ProgramDetail | null;
    categories: CategoryOption[];
    nextOrder: number;
}

export default function ProgramForm({
    program,
    categories,
    nextOrder,
}: ProgramFormProps) {
    const isEdit = Boolean(program);
    const [coverPreview, setCoverPreview] = useState<string | null>(
        program?.cover_url || null
    );

    const form = useForm<{
        title: string;
        slug: string;
        category: string;
        summary: string;
        body: string;
        status: 'draft' | 'published';
        is_public: boolean;
        starts_at: string;
        ends_at: string;
        order: number;
        cover: File | null;
        _method?: string;
    }>({
        title: program?.title || '',
        slug: program?.slug || '',
        category: program?.category || (categories[0]?.value ?? 'pelatihan'),
        summary: program?.summary || '',
        body: program?.body || '',
        status: program?.status || 'published',
        is_public: program ? program.is_public : true,
        starts_at: program?.starts_at || '',
        ends_at: program?.ends_at || '',
        order: program?.order ?? nextOrder,
        cover: null,
    });

    const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('cover', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isEdit && program) {
            // Gunakan POST dengan parameter _method=PUT untuk upload file multipart
            router.post(
                `/admin/programs/${program.id}`,
                {
                    ...form.data,
                    _method: 'PUT',
                },
                {
                    preserveScroll: true,
                    forceFormData: true,
                }
            );
        } else {
            form.post('/admin/programs', {
                preserveScroll: true,
                forceFormData: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit Program: ${program?.title}` : 'Tambah Program Kerja Baru'}
        >
            <div className="space-y-6 max-w-4xl">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-line pb-5">
                    <div>
                        <Link
                            href="/admin/programs"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-navy mb-2"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Kembali ke Daftar Program
                        </Link>
                        <h1 className="font-display text-2xl font-bold text-navy">
                            {isEdit ? 'Perbarui Program Kerja' : 'Tambah Program Kerja Baru'}
                        </h1>
                        <p className="text-xs text-slate mt-0.5">
                            Isi detail informasi program kerja, target peserta, dan jadwal pelaksanaan.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Informasi Utama */}
                    <Card className="p-6 border-line shadow-soft bg-white space-y-5">
                        <h2 className="font-display text-base font-bold text-navy border-b border-line pb-3">
                            Informasi Program
                        </h2>

                        <Input
                            label="Judul Program Kerja"
                            required
                            placeholder="Contoh: Pelatihan Budidaya Berkelanjutan & Manajemen Kualitas Air"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            error={form.errors.title}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label="Slug URL (Kustom)"
                                placeholder="otomatis-dibuat-dari-judul"
                                value={form.data.slug}
                                onChange={(e) => form.setData('slug', e.target.value)}
                                error={form.errors.slug}
                                hint="Biarkan kosong untuk membuat slug otomatis dari judul."
                            />

                            <Select
                                label="Kategori Program"
                                required
                                options={categories}
                                value={form.data.category}
                                onChange={(e) =>
                                    form.setData('category', e.target.value)
                                }
                                error={form.errors.category}
                            />
                        </div>

                        <Textarea
                            label="Ringkasan Singkat (Summary)"
                            rows={3}
                            placeholder="Ringkasan 1-2 kalimat untuk kartu daftar di halaman Tentang Kami."
                            value={form.data.summary}
                            onChange={(e) =>
                                form.setData('summary', e.target.value)
                            }
                            error={form.errors.summary}
                            hint="Maksimal 250 karakter untuk keterbacaan yang optimal."
                        />

                        <div>
                            <label
                                htmlFor="program-body-editor"
                                className="mb-1.5 block text-xs font-semibold text-ink"
                            >
                                Rincian Lengkap Program (Deskripsi / Materi / Persyaratan)
                            </label>
                            <RichTextEditor
                                id="program-body-editor"
                                ariaLabel="Rincian Lengkap Program"
                                value={form.data.body}
                                onChange={(val) => form.setData('body', val)}
                                error={form.errors.body}
                                minHeightClass="min-h-[240px]"
                                placeholder="Tuliskan penjelasan lengkap mengenai materi kegiatan, narasumber, lokasi, dan persyaratan peserta..."
                            />
                        </div>
                    </Card>

                    {/* 2. Jadwal & Gambar Cover */}
                    <Card className="p-6 border-line shadow-soft bg-white space-y-5">
                        <h2 className="font-display text-base font-bold text-navy border-b border-line pb-3">
                            Jadwal Pelaksanaan &amp; Berkas Cover
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label="Jadwal Mulai"
                                type="datetime-local"
                                value={form.data.starts_at}
                                onChange={(e) =>
                                    form.setData('starts_at', e.target.value)
                                }
                                error={form.errors.starts_at}
                            />

                            <Input
                                label="Jadwal Selesai"
                                type="datetime-local"
                                value={form.data.ends_at}
                                onChange={(e) =>
                                    form.setData('ends_at', e.target.value)
                                }
                                error={form.errors.ends_at}
                            />
                        </div>

                        {/* Upload Cover */}
                        <div>
                            <label className="block text-xs font-semibold text-slate mb-2">
                                Foto / Banner Cover Program
                            </label>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {coverPreview ? (
                                    <img
                                        src={coverPreview}
                                        alt="Preview Cover"
                                        className="h-28 w-44 rounded-control object-cover border border-line shadow-xs"
                                    />
                                ) : (
                                    <div className="h-28 w-44 rounded-control bg-mist border border-dashed border-slate/30 grid place-items-center text-slate">
                                        <ImageIcon className="h-8 w-8 text-slate/40" />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleCoverChange}
                                        className="block text-xs text-slate file:mr-3 file:py-1.5 file:px-3 file:rounded-control file:border file:border-line file:bg-white file:text-xs file:font-semibold file:text-navy hover:file:bg-mist cursor-pointer"
                                    />
                                    <p className="text-[11px] text-slate">
                                        Rekomendasi rasio 16:9, maksimal 3MB (JPG, PNG, WebP).
                                    </p>
                                    {form.errors.cover ? (
                                        <p className="text-xs text-danger font-medium">
                                            {form.errors.cover}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 3. Pengaturan Publikasi & Urutan */}
                    <Card className="p-6 border-line shadow-soft bg-white space-y-5">
                        <h2 className="font-display text-base font-bold text-navy border-b border-line pb-3">
                            Pengaturan Akses &amp; Publikasi
                        </h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Select
                                label="Status Publikasi"
                                required
                                options={[
                                    { value: 'published', label: 'Terbit (Published)' },
                                    { value: 'draft', label: 'Draf (Draft)' },
                                ]}
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData(
                                        'status',
                                        e.target.value as 'draft' | 'published'
                                    )
                                }
                                error={form.errors.status}
                            />

                            <Input
                                label="Urutan Prioritas (Order)"
                                type="number"
                                min={0}
                                value={form.data.order}
                                onChange={(e) =>
                                    form.setData('order', Number(e.target.value))
                                }
                                error={form.errors.order}
                                hint="Angka lebih kecil tampil lebih awal (misal: 1, 2, 3)."
                            />
                        </div>

                        <div className="pt-2 border-t border-line">
                            <Checkbox
                                label="Tampilkan Terbuka untuk Publik (Halaman Tentang Kami)"
                                description="Bila dicentang, program akan muncul di daftar publik /tentang-kami. Bila tidak dicentang, program menjadi khusus anggota NSA."
                                checked={form.data.is_public}
                                onChange={(e) =>
                                    form.setData('is_public', e.target.checked)
                                }
                            />
                        </div>
                    </Card>

                    {/* Tombol Simpan */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            href="/admin/programs"
                            variant="secondary"
                            size="md"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="md"
                            loading={form.processing}
                            disabled={form.processing}
                        >
                            <Check className="h-4 w-4 mr-1.5" />
                            {isEdit ? 'Simpan Perubahan' : 'Terbitkan Program'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
