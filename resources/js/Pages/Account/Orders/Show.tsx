import Badge, { StatusBadge } from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import AccountLayout from '@/Layouts/AccountLayout';
import { focusRing } from '@/lib/ui';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileCheck,
    FileText,
    MapPin,
    Package,
    Upload,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface OrderItem {
    id: number;
    name: string;
    price: number;
    qty: number;
    subtotal: number;
}

interface PaymentInfo {
    id: number;
    method: string;
    amount: number;
    status: string;
    proof_url: string | null;
    confirmed_at: string | null;
}

interface OrderAddress {
    recipient_name?: string;
    phone?: string;
    province?: string;
    city?: string;
    postal_code?: string;
    address?: string;
    shipping_option?: string;
}

interface OrderDetail {
    id: number;
    code: string;
    status: string;
    status_label: string;
    subtotal: number;
    shipping_cost: number;
    total: number;
    address: OrderAddress | null;
    note: string | null;
    created_at: string;
    items: OrderItem[];
    payment: PaymentInfo | null;
}

interface PaymentInstructions {
    method: string;
    bank_name: string;
    account_number: string;
    account_holder: string;
    amount: number;
    unique_code: string;
    instructions: string[];
}

interface ShowOrderProps {
    order: OrderDetail;
    instructions: PaymentInstructions;
}

export default function AccountOrderShow({
    order,
    instructions,
}: ShowOrderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 3 * 1024 * 1024) {
                toast.error('Ukuran berkas melebihi batas maksimal 3 MB.');
                return;
            }
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleUploadProof = (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Silakan pilih berkas bukti pembayaran terlebih dahulu.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('proof', file);

        router.post(`/akun/pesanan/${order.code}/bukti-bayar`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Bukti pembayaran berhasil diunggah!');
                setFile(null);
                setPreviewUrl(null);
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] || 'Gagal mengunggah bukti pembayaran.';
                toast.error(msg as string);
            },
            onFinish: () => setUploading(false),
        });
    };

    const hasProof = !!order.payment?.proof_url;

    return (
        <AccountLayout title={`Pesanan ${order.code}`}>
            <div className="space-y-6">
                {/* Back to Orders */}
                <div className="flex items-center justify-between">
                    <Button href="/akun/pesanan" variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali ke Riwayat Pesanan
                    </Button>
                    <StatusBadge status={order.status} />
                </div>

                {/* Header Information */}
                <div className="rounded-card border border-line bg-white p-6 shadow-soft">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
                        <div>
                            <span className="text-xs text-slate">Nomor Kode Pesanan</span>
                            <h1 className="font-mono text-2xl font-bold text-navy mt-0.5">
                                {order.code}
                            </h1>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate">
                            <Calendar className="h-4 w-4 text-ocean" />
                            <span>Dibuat pada {order.created_at}</span>
                        </div>
                    </div>

                    {/* Address & Note details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs">
                        <div>
                            <h3 className="font-bold uppercase tracking-wider text-slate mb-2 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-ocean" />
                                Alamat Pengiriman
                            </h3>
                            {order.address ? (
                                <div className="space-y-1 text-slate">
                                    <p className="font-bold text-navy text-sm">
                                        {order.address.recipient_name} ({order.address.phone})
                                    </p>
                                    <p className="leading-relaxed">
                                        {order.address.address}
                                    </p>
                                    <p>
                                        {order.address.city}, {order.address.province}{' '}
                                        {order.address.postal_code}
                                    </p>
                                    {order.address.shipping_option && (
                                        <p className="text-ocean font-semibold mt-1">
                                            Opsi Ekspedisi: {order.address.shipping_option}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-slate">Alamat tidak tercatat.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold uppercase tracking-wider text-slate mb-2 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-ocean" />
                                Catatan Pesanan
                            </h3>
                            <p className="text-slate italic leading-relaxed">
                                {order.note || 'Tidak ada catatan tambahan untuk pesanan ini.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Item Snapshots Table */}
                <div className="rounded-card border border-line bg-white shadow-soft overflow-hidden">
                    <div className="border-b border-line bg-mist/40 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate">
                        Item Pesanan (Snapshot Transaksi)
                    </div>

                    <ul className="divide-y divide-line">
                        {order.items.map((item) => (
                            <li key={item.id} className="p-4 sm:px-6 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-control bg-mist flex items-center justify-center text-ocean shrink-0">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-navy text-sm">{item.name}</p>
                                        <p className="text-slate">
                                            {item.qty} × Rp {Number(item.price).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-display font-bold text-navy text-sm">
                                        Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Breakdown Biaya */}
                    <div className="border-t border-line bg-mist/20 p-6 space-y-2 text-xs">
                        <div className="flex justify-between text-slate">
                            <span>Subtotal Barang</span>
                            <span className="font-semibold text-navy">
                                Rp {Number(order.subtotal).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate">
                            <span>Biaya Pengiriman</span>
                            <span className="font-semibold text-navy">
                                {order.shipping_cost === 0
                                    ? 'Gratis'
                                    : `Rp ${Number(order.shipping_cost).toLocaleString('id-ID')}`}
                            </span>
                        </div>
                        <div className="border-t border-line pt-2.5 flex justify-between items-baseline">
                            <span className="font-bold text-sm text-navy">Total Tagihan</span>
                            <span className="font-display text-2xl font-bold text-navy">
                                Rp {Number(order.total).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bagian Pembayaran & Bukti Transfer */}
                <div className="rounded-card border border-line bg-white p-6 shadow-soft space-y-6">
                    <div className="border-b border-line pb-4 flex items-center gap-2.5">
                        <CreditCard className="h-5 w-5 text-ocean" />
                        <div>
                            <h2 className="font-display text-lg font-bold text-navy">
                                Status & Bukti Pembayaran
                            </h2>
                            <p className="text-xs text-slate">
                                Verifikasi transfer bank manual oleh tim keuangan NSA.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Info Rekening NSA */}
                        <div className="rounded-control border border-line bg-mist/30 p-4 space-y-2 text-xs">
                            <span className="font-bold uppercase tracking-wider text-slate block">
                                Rekening Resmi NSA
                            </span>
                            <p className="font-semibold text-navy text-sm">
                                {instructions.bank_name}
                            </p>
                            <p className="font-mono text-base font-bold text-navy">
                                {instructions.account_number}
                            </p>
                            <p className="text-slate">
                                Atas Nama: <strong>{instructions.account_holder}</strong>
                            </p>
                            <div className="pt-2 border-t border-line/60">
                                <span className="text-[11px] text-slate">
                                    Total Transfer Tepat: <strong className="text-navy">Rp {Number(order.total).toLocaleString('id-ID')}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Formulir / Status Bukti Bayar */}
                        <div>
                            {hasProof ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-success font-semibold text-xs">
                                        <FileCheck className="h-4 w-4" />
                                        <span>Bukti Pembayaran Telah Diunggah</span>
                                    </div>

                                    {order.payment?.proof_url && (
                                        <div className="overflow-hidden rounded-control border border-line bg-mist max-w-xs">
                                            <a
                                                href={order.payment.proof_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block hover:opacity-90 transition-opacity"
                                            >
                                                <img
                                                    src={order.payment.proof_url}
                                                    alt="Bukti Transfer"
                                                    className="h-44 w-full object-cover"
                                                />
                                            </a>
                                        </div>
                                    )}

                                    <div className="text-xs text-slate">
                                        Status: <Badge tone={order.payment?.status === 'confirmed' ? 'approved' : 'pending'}>
                                            {order.payment?.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu Verifikasi'}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUploadProof} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-1.5">
                                            Unggah Foto Bukti Transfer (JPG, PNG, PDF, WEBP maks 3MB)
                                        </label>
                                        <input
                                            type="file"
                                            required
                                            accept="image/jpeg,image/png,image/webp,application/pdf"
                                            onChange={handleFileChange}
                                            className={`w-full rounded-control border border-line bg-white p-2 text-xs text-navy file:mr-3 file:rounded-control file:border-0 file:bg-mist file:px-3 file:py-1 file:text-xs file:font-semibold file:text-navy hover:file:bg-ocean/10 ${focusRing}`}
                                        />
                                    </div>

                                    {previewUrl && (
                                        <div className="overflow-hidden rounded-control border border-line bg-mist max-w-xs">
                                            <img
                                                src={previewUrl}
                                                alt="Pratinjau Bukti"
                                                className="h-36 w-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        size="md"
                                        disabled={uploading || !file}
                                        className="w-full sm:w-auto justify-center"
                                    >
                                        <Upload className="h-4 w-4 mr-1.5" />
                                        {uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
}
