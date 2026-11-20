import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    UploadCloud,
    Trash2,
    Image as ImageIcon,
    Save,
    GripVertical,
} from 'lucide-react';

interface CategoryItem {
    id: number;
    name: string;
    group: string;
}

interface ProductFormProps {
    product: {
        id: number;
        category_id: number;
        type: string;
        name: string;
        slug: string;
        description: string | null;
        price: number;
        member_price: number | null;
        stock: number;
        weight: number;
        location: string | null;
        is_active: boolean;
        images: Array<{
            id: number;
            path: string;
            order: number;
        }>;
    } | null;
    categories: CategoryItem[];
    typeOptions: Array<{ value: string; label: string }>;
}

export default function ProductForm({
    product,
    categories,
    typeOptions,
}: ProductFormProps) {
    const isEdit = !!product;

    const [name, setName] = useState(product?.name || '');
    const [categoryId, setCategoryId] = useState<number | string>(product?.category_id || (categories[0]?.id ?? ''));
    const [type, setType] = useState(product?.type || 'physical');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price || '');
    const [memberPrice, setMemberPrice] = useState(product?.member_price || '');
    const [stock, setStock] = useState(product?.stock ?? 10);
    const [weight, setWeight] = useState(product?.weight ?? 1000);
    const [location, setLocation] = useState(product?.location || '');
    const [isActive, setIsActive] = useState(product?.is_active ?? true);

    // Existing & new images
    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);
        setNewImages((prev) => [...prev, ...filesArray]);

        const previews = filesArray.map((f) => URL.createObjectURL(f));
        setNewImagePreviews((prev) => [...prev, ...previews]);
    };

    const handleRemoveExistingImage = (id: number) => {
        setExistingImages((prev) => prev.filter((img) => img.id !== id));
        setRemovedImageIds((prev) => [...prev, id]);
    };

    const handleRemoveNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category_id', String(categoryId));
        formData.append('type', type);
        formData.append('description', description);
        formData.append('price', String(price));
        if (memberPrice) formData.append('member_price', String(memberPrice));
        formData.append('stock', String(stock));
        formData.append('weight', String(weight));
        if (location) formData.append('location', location);
        formData.append('is_active', isActive ? '1' : '0');

        if (isEdit) {
            formData.append('_method', 'PUT');
            removedImageIds.forEach((id) => formData.append('remove_image_ids[]', String(id)));
            newImages.forEach((file) => formData.append('new_images[]', file));

            router.post(`/admin/produk/${product.id}`, formData, {
                onError: (errs) => {
                    setErrors(errs);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            });
        } else {
            newImages.forEach((file) => formData.append('images[]', file));

            router.post('/admin/produk', formData, {
                onError: (errs) => {
                    setErrors(errs);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            });
        }
    };

    return (
        <AdminLayout title={isEdit ? `Edit Produk: ${product.name}` : 'Tambah Produk Baru'}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/produk"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Katalog
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left 2 Cols: Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="p-6 space-y-4">
                            <h3 className="font-display text-base font-bold text-navy">
                                Informasi Dasar Produk
                            </h3>

                            <Input
                                label="Nama Produk / Layanan"
                                placeholder="Contoh: Pakan Ikan Apung Premium 30kg"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                error={errors.name}
                                required
                            />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-ink">
                                        Kategori Produk <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        required
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.group})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="mt-1 text-xs text-danger">{errors.category_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-ink">
                                        Tipe Produk <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        required
                                    >
                                        {typeOptions.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Textarea
                                label="Deskripsi Lengkap"
                                placeholder="Jelaskan spesifikasi, kandungan nutrisi, atau ketentuan layanan..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                            />
                        </Card>

                        {/* Galeri Gambar */}
                        <Card className="p-6 space-y-4">
                            <h3 className="font-display text-base font-bold text-navy">
                                Galeri Gambar Produk
                            </h3>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative group rounded-lg overflow-hidden border border-line">
                                        <img src={img.path} alt="Gambar Produk" className="h-28 w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(img.id)}
                                            className="absolute top-1 right-1 rounded-full bg-danger/90 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {newImagePreviews.map((src, idx) => (
                                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-ocean">
                                        <img src={src} alt="Preview Baru" className="h-28 w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(idx)}
                                            className="absolute top-1 right-1 rounded-full bg-danger/90 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}

                                <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-mist/50 transition hover:border-ocean hover:bg-mist">
                                    <UploadCloud className="h-6 w-6 text-slate" />
                                    <span className="mt-1 text-xs font-semibold text-slate">Unggah Foto</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate">
                                Format JPG/PNG/WebP, maksimal 5MB per berkas.
                            </p>
                        </Card>
                    </div>

                    {/* Right 1 Col: Pricing & Stock */}
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            <h3 className="font-display text-base font-bold text-navy">
                                Harga & Stok
                            </h3>

                            <Input
                                label="Harga Reguler (Publik)"
                                placeholder="Rp 150000"
                                type="number"
                                min={0}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                error={errors.price}
                                required
                            />

                            <Input
                                label="Harga Khusus Anggota (Member Price)"
                                placeholder="Rp 135000 (opsional)"
                                type="number"
                                min={0}
                                value={memberPrice}
                                onChange={(e) => setMemberPrice(e.target.value)}
                                error={errors.member_price}
                                hint="Hanya berlaku bagi anggota yang telah disetujui (Approved)."
                            />

                            <Input
                                label="Jumlah Stok Unit"
                                type="number"
                                min={0}
                                value={stock}
                                onChange={(e) => setStock(Number(e.target.value))}
                                error={errors.stock}
                            />

                            <Input
                                label="Berat Produk (Gram)"
                                type="number"
                                min={0}
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                                error={errors.weight}
                            />

                            <Input
                                label="Lokasi / Asal Pengiriman"
                                placeholder="Contoh: Kab. Bogor, Jawa Barat"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-line text-ocean focus:ring-ocean"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <span className="text-sm font-semibold text-ink">
                                        Tampilkan Produk di Katalog Publik
                                    </span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-line">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    loading={submitting}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEdit ? 'Simpan Perubahan' : 'Terbitkan Produk'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
