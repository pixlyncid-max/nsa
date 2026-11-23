import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import RichTextEditor from '@/Components/ui/RichTextEditor';
import Textarea from '@/Components/ui/Textarea';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    UploadCloud,
    Save,
} from 'lucide-react';

interface CategoryItem {
    id: number;
    name: string;
}

interface PostFormProps {
    post: {
        id: number;
        title: string;
        slug: string;
        type: string;
        category_id: number | null;
        excerpt: string | null;
        body: string;
        cover_url: string | null;
        status: string;
        published_at: string | null;
    } | null;
    categories: CategoryItem[];
}

export default function PostForm({ post, categories }: PostFormProps) {
    const isEdit = !!post;

    const [title, setTitle] = useState(post?.title || '');
    const [type, setType] = useState(post?.type || 'article');
    const [categoryId, setCategoryId] = useState(post?.category_id ? String(post.category_id) : '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [body, setBody] = useState(post?.body || '');
    const [status, setStatus] = useState(post?.status || 'published');
    const [publishedAt, setPublishedAt] = useState(post?.published_at || '');

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(post?.cover_url || null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const plainBody = body.replace(/<[^>]+>/g, '').trim();
        if (!plainBody) {
            setErrors({ body: 'Isi berita atau artikel wajib diisi.' });
            return;
        }
        setSubmitting(true);
        setErrors({});

        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        if (categoryId) formData.append('category_id', categoryId);
        if (excerpt) formData.append('excerpt', excerpt);
        formData.append('body', body);
        formData.append('status', status);
        if (publishedAt) formData.append('published_at', publishedAt);
        if (coverFile) formData.append('cover', coverFile);

        if (isEdit) {
            formData.append('_method', 'PUT');
            router.post(`/admin/pos/${post.id}`, formData, {
                onError: (errs) => {
                    setErrors(errs);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/admin/pos', formData, {
                onError: (errs) => {
                    setErrors(errs);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            });
        }
    };

    return (
        <AdminLayout title={isEdit ? `Edit Pos: ${post.title}` : 'Tulis Berita & Artikel Baru'}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/pos"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Pos
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Kolom Kiri (2 Kolom): Isi Konten */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="p-6 space-y-4">
                            <Input
                                label="Judul Publikasi"
                                placeholder="Tuliskan judul berita atau artikel..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                error={errors.title}
                                required
                            />

                            <Textarea
                                label="Ringkasan Singkat (Opsional)"
                                placeholder="Tulis 1-2 kalimat pengantar singkat untuk kartu daftar artikel..."
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={2}
                            />

                            <div>
                                <label
                                    htmlFor="post-body-editor"
                                    className="mb-1.5 block text-xs font-semibold text-ink"
                                >
                                    Isi Berita / Artikel <span className="text-danger">*</span>
                                </label>
                                <RichTextEditor
                                    id="post-body-editor"
                                    ariaLabel="Isi Berita atau Artikel"
                                    value={body}
                                    onChange={setBody}
                                    error={errors.body}
                                    placeholder="Tulis isi berita atau artikel lengkap di sini. Anda bisa langsung mengetik atau menempelkan tulisan dari Microsoft Word..."
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Kolom Kanan (1 Kolom): Pengaturan Publikasi */}
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            <h2 className="font-display text-base font-bold text-navy">
                                Pengaturan Publikasi
                            </h2>

                            <div>
                                <label
                                    htmlFor="post-type-select"
                                    className="mb-1 block text-xs font-semibold text-ink"
                                >
                                    Tipe Konten
                                </label>
                                <select
                                    id="post-type-select"
                                    className="h-11 w-full cursor-pointer rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="article">Artikel Edukasi</option>
                                    <option value="news">Berita Terkini</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="post-category-select"
                                    className="mb-1 block text-xs font-semibold text-ink"
                                >
                                    Kategori
                                </label>
                                <select
                                    id="post-category-select"
                                    className="h-11 w-full cursor-pointer rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">Umum (Tanpa Kategori)</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="post-status-select"
                                    className="mb-1 block text-xs font-semibold text-ink"
                                >
                                    Status Publikasi
                                </label>
                                <select
                                    id="post-status-select"
                                    className="h-11 w-full cursor-pointer rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="published">Langsung Terbit</option>
                                    <option value="draft">Simpan sebagai Draf</option>
                                    <option value="scheduled">Jadwalkan Tanggal Terbit</option>
                                </select>
                            </div>

                            {(status === 'scheduled' || status === 'published') && (
                                <Input
                                    label="Tanggal & Waktu Terbit"
                                    type="datetime-local"
                                    value={publishedAt}
                                    onChange={(e) => setPublishedAt(e.target.value)}
                                />
                            )}

                            <div>
                                <label
                                    htmlFor="post-cover-upload"
                                    className="mb-1 block text-xs font-semibold text-ink"
                                >
                                    Foto Sampul
                                </label>
                                {coverPreview && (
                                    <img
                                        src={coverPreview}
                                        alt="Pratinjau foto sampul artikel"
                                        width={400}
                                        height={144}
                                        className="mb-2 h-36 w-full rounded-lg object-cover border border-line"
                                    />
                                )}
                                <label
                                    htmlFor="post-cover-upload"
                                    className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-mist/50 transition hover:border-ocean hover:bg-mist"
                                >
                                    <UploadCloud className="h-5 w-5 text-slate" aria-hidden="true" />
                                    <span className="mt-1 text-xs font-semibold text-slate">
                                        Pilih Foto Sampul
                                    </span>
                                    <input
                                        id="post-cover-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleCoverChange}
                                    />
                                </label>
                                <p className="mt-1 text-[11px] text-slate">Maksimal 5MB (JPG, PNG, atau WebP)</p>
                            </div>

                            <div className="pt-4 border-t border-line">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    loading={submitting}
                                >
                                    <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                                    {isEdit ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
