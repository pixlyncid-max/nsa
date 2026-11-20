import React from 'react';
import Button from '@/Components/ui/Button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Printer } from 'lucide-react';

interface ReceiptProps {
    invoice: {
        id: number;
        number: string;
        status: string;
        total: number;
        created_at: string;
        due_at: string | null;
        items: Array<{
            id: number;
            name: string;
            amount: number;
            qty: number;
            size: string | null;
            subtotal: number;
        }>;
        member: {
            name: string;
            member_number: string;
            email: string;
            phone?: string;
        };
        brand: {
            name: string;
            short_name: string;
            domain?: string;
            support_email?: string;
        };
    };
}

export default function MemberReceipt({ invoice }: ReceiptProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-mist/40 p-4 sm:p-8 text-ink">
            <Head title={`Kuitansi Pembayaran #${invoice.number}`} />

            <div className="max-w-2xl mx-auto space-y-4">
                {/* Print Control Navigation */}
                <div className="flex items-center justify-between print:hidden">
                    <Link
                        href="/anggota/iuran"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-navy"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Iuran & Administrasi
                    </Link>

                    <Button size="sm" variant="primary" onClick={handlePrint}>
                        <Printer className="w-3.5 h-3.5 mr-1.5" />
                        Cetak / Simpan PDF
                    </Button>
                </div>

                {/* Printable Receipt Paper */}
                <div className="bg-white rounded-2xl border border-line p-8 shadow-soft space-y-6 print:shadow-none print:border-none print:p-0">
                    {/* Header */}
                    <div className="flex items-start justify-between pb-6 border-b border-line">
                        <div>
                            <span className="font-display font-extrabold text-navy text-xl">
                                {invoice.brand.short_name}
                            </span>
                            <p className="text-xs text-slate mt-0.5">
                                {invoice.brand.name}
                            </p>
                            <p className="text-[11px] text-slate font-mono">
                                {invoice.brand.domain || 'nsa-aquatic.id'} • {invoice.brand.support_email}
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="text-xs uppercase tracking-wider font-bold text-slate">
                                KUITANSI RESMI
                            </span>
                            <h2 className="font-mono text-base font-bold text-navy mt-0.5">
                                #{invoice.number}
                            </h2>
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                LUNAS (PAID)
                            </span>
                        </div>
                    </div>

                    {/* Member Details */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-slate block font-semibold">Telah Diterima Dari:</span>
                            <strong className="text-navy text-sm block mt-0.5 font-display">
                                {invoice.member.name}
                            </strong>
                            <span className="text-slate block mt-0.5 font-mono">
                                NTA: {invoice.member.member_number}
                            </span>
                            <span className="text-slate block">{invoice.member.email}</span>
                        </div>

                        <div className="text-right">
                            <span className="text-slate block font-semibold">Tanggal Pembayaran:</span>
                            <strong className="text-navy block mt-0.5">
                                {invoice.created_at}
                            </strong>
                            <span className="text-slate block mt-1">Metode: Transfer Manual Terverifikasi</span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border border-line rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-mist text-slate font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-3">Uraian Pembayaran</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Harga</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {invoice.items.map((it) => (
                                    <tr key={it.id}>
                                        <td className="p-3 font-semibold text-navy">
                                            {it.name} {it.size ? `(Ukuran: ${it.size})` : ''}
                                        </td>
                                        <td className="p-3 text-center font-mono">{it.qty}</td>
                                        <td className="p-3 text-right text-slate font-mono">
                                            Rp {it.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-3 text-right font-bold text-navy font-mono">
                                            Rp {it.subtotal.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-mist/50 border-t border-line font-bold">
                                <tr>
                                    <td colSpan={3} className="p-3 text-right text-navy uppercase">
                                        Total Pembayaran:
                                    </td>
                                    <td className="p-3 text-right font-display text-sm text-ocean">
                                        Rp {invoice.total.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Signature stamp placeholder */}
                    <div className="pt-6 flex justify-between items-end text-xs">
                        <p className="text-[11px] text-slate max-w-xs leading-relaxed italic">
                            Kuitansi ini adalah bukti pembayaran elektronik yang sah dan diterbitkan secara digital oleh pengurus resmi {invoice.brand.name}.
                        </p>

                        <div className="text-center min-w-[150px]">
                            <span className="text-slate block text-[11px]">Pengurus NSA Indonesia,</span>
                            <div className="h-14 grid place-items-center">
                                <span className="font-serif italic text-ocean/80 font-bold">[TERVERIFIKASI DIGITAL]</span>
                            </div>
                            <span className="font-bold text-navy border-t border-line block pt-1">
                                Bendahara Umum NSA
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
