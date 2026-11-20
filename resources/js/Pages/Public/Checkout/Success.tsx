import PageHeader from '@/Components/layout/PageHeader';
import Section from '@/Components/layout/Section';
import Button from '@/Components/ui/Button';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Check,
    CheckCircle2,
    Copy,
    FileUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderItem {
    id: number;
    name_snapshot: string;
    price_snapshot: number;
    qty: number;
}

interface PaymentRecord {
    id: number;
    method: string;
    amount: number;
    status: string;
}

interface OrderData {
    id: number;
    code: string;
    total: number;
    subtotal: number;
    shipping_cost: number;
    status: string;
    items: OrderItem[];
    payment: PaymentRecord;
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

interface SuccessProps {
    order: OrderData;
    instructions: PaymentInstructions;
}

export default function CheckoutSuccess({
    order,
    instructions,
}: SuccessProps) {
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedAmount, setCopiedAmount] = useState(false);

    const handleCopy = (text: string, type: 'account' | 'amount') => {
        navigator.clipboard.writeText(text);
        if (type === 'account') {
            setCopiedAccount(true);
            toast.success('Nomor rekening berhasil disalin!');
            setTimeout(() => setCopiedAccount(false), 2000);
        } else {
            setCopiedAmount(true);
            toast.success('Nominal transfer berhasil disalin!');
            setTimeout(() => setCopiedAmount(false), 2000);
        }
    };

    return (
        <PublicLayout>
            <Head title="Pesanan Berhasil Dibuat · NSA" />

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Produk', href: '/produk' },
                    { label: 'Pesanan Berhasil' },
                ]}
                eyebrow="Transaksi Diterima"
                title="Pesanan Anda Berhasil Dibuat"
                description={`Kode Pesanan: ${order.code}`}
            >
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Stok Terkunci &amp; Menunggu Pembayaran</span>
                </div>
            </PageHeader>

            <Section index="01" label="Instruksi Pembayaran" tone="white">
                <div className="mx-auto max-w-2xl space-y-8">
                    <div className="space-y-6 rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                            <div className="flex items-center gap-2.5">
                                <Building2 className="h-5 w-5 text-ocean" />
                                <h2 className="font-display text-lg font-bold text-navy">
                                    Instruksi Transfer Manual
                                </h2>
                            </div>
                            <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
                                Menunggu Pembayaran
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2 rounded-control border border-line bg-mist/40 p-4">
                                <span className="block text-xs font-bold uppercase tracking-wider text-slate">
                                    Bank Tujuan ({instructions.bank_name})
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-lg font-bold text-navy">
                                        {instructions.account_number}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy(
                                                instructions.account_number,
                                                'account'
                                            )
                                        }
                                        className="p-2 text-slate transition-colors hover:text-ocean"
                                        aria-label="Salin nomor rekening"
                                    >
                                        {copiedAccount ? (
                                            <Check className="h-4 w-4 text-success" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-slate">
                                    a.n.{' '}
                                    <strong className="text-navy">
                                        {instructions.account_holder}
                                    </strong>
                                </p>
                            </div>

                            <div className="space-y-2 rounded-control border border-ocean/30 bg-ocean/5 p-4">
                                <span className="block text-xs font-bold uppercase tracking-wider text-ocean">
                                    Nominal Tepat Ditransfer
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="font-display text-2xl font-bold text-navy">
                                        Rp{' '}
                                        {Number(order.total).toLocaleString(
                                            'id-ID'
                                        )}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy(
                                                order.total.toString(),
                                                'amount'
                                            )
                                        }
                                        className="p-2 text-slate transition-colors hover:text-ocean"
                                        aria-label="Salin jumlah transfer"
                                    >
                                        {copiedAmount ? (
                                            <Check className="h-4 w-4 text-success" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate">
                                    Harap transfer sesuai angka di atas agar verifikasi berjalan cepat.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-line pt-4">
                            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate">
                                Langkah Penyelesaian Pesanan
                            </h3>
                            <ol className="list-inside list-decimal space-y-2 text-xs leading-relaxed text-slate">
                                {instructions.instructions.map((inst, idx) => (
                                    <li key={idx}>
                                        <span>{inst}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            href={`/akun/pesanan/${order.code}`}
                            size="lg"
                            className="flex-1 justify-center"
                        >
                            <FileUp className="mr-1.5 h-5 w-5" />
                            Unggah Bukti Pembayaran Sekarang
                        </Button>
                        <Button
                            href="/produk"
                            variant="secondary"
                            size="lg"
                            className="flex-1 justify-center"
                        >
                            Lanjut Belanja Katalog
                        </Button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/"
                            className="text-xs font-semibold text-slate transition-colors hover:text-ocean"
                        >
                            ← Kembali ke Halaman Utama
                        </Link>
                    </div>
                </div>
            </Section>
        </PublicLayout>
    );
}
