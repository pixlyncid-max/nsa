import React, { useState } from 'react';
import PortalLayout, { defaultMemberMenuItems } from '@/Layouts/PortalLayout';
import PageBanner from '@/Components/layout/PageBanner';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { StatusBadge } from '@/Components/ui/Badge';
import { router, Link } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    ExternalLink,
    FileSpreadsheet,
    FileText,
    Info,
    Receipt,
    Upload,
} from 'lucide-react';

interface InvoiceItem {
    id: number;
    name: string;
    amount: number;
    qty: number;
    size: string | null;
    subtotal: number;
}

interface PaymentRecord {
    id: number;
    amount: number;
    status: string;
    proof_url: string | null;
    sender_name: string | null;
    sender_bank: string | null;
    paid_at: string | null;
}

interface InvoiceRecord {
    id: number;
    number: string;
    status: string;
    total: number;
    due_at: string | null;
    created_at: string;
    items: InvoiceItem[];
    latest_payment: PaymentRecord | null;
}

interface FeeRule {
    id: number;
    code: string;
    name: string;
    amount: number;
    type: string;
    description: string | null;
}

interface InvoiceProps {
    invoices: InvoiceRecord[];
    feeRules: FeeRule[];
    bankInfo: {
        bank_name: string;
        bank_account_number: string;
        bank_account_holder: string;
    };
}

export default function MemberInvoices({ invoices, feeRules, bankInfo }: InvoiceProps) {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
    const [senderName, setSenderName] = useState('');
    const [senderBank, setSenderBank] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenUpload = (invoice: InvoiceRecord) => {
        setSelectedInvoice(invoice);
        setSenderName('');
        setSenderBank('');
        setProofFile(null);
        setNotes('');
        setUploadModalOpen(true);
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice || !proofFile) {
            alert('Harap pilih berkas bukti transfer.');
            return;
        }

        const formData = new FormData();
        formData.append('proof', proofFile);
        formData.append('sender_name', senderName);
        formData.append('sender_bank', senderBank);
        formData.append('payment_date', paymentDate);
        if (notes) formData.append('notes', notes);

        setIsSubmitting(true);
        router.post(`/anggota/iuran/${selectedInvoice.id}/bukti-bayar`, formData, {
            onSuccess: () => setUploadModalOpen(false),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <PortalLayout
            title="Iuran & Administrasi"
            areaLabel="PORTAL ANGGOTA"
            menuItems={defaultMemberMenuItems}
        >
            <div className="space-y-8">
                {/* Banner */}
                <PageBanner
                    eyebrow="IURAN & ADMINISTRASI"
                    title="Riwayat Tagihan & Iuran Keanggotaan"
                    subtitle="Informasi status pembayaran pendaftaran, iuran tahunan anggota, dan bukti kuitansi resmi organisasi."
                />

                {/* 1. Rekening Pembayaran Resmi */}
                <Card className="p-6 border-ocean/30 bg-ocean/5 shadow-soft">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-ocean text-white shrink-0">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-ocean">
                                    Rekening Resmi Pembayaran Iuran
                                </span>
                                <h4 className="font-display text-base font-bold text-navy">
                                    {bankInfo.bank_name} • {bankInfo.bank_account_number}
                                </h4>
                                <p className="text-xs text-slate">
                                    Atas Nama: <strong className="text-navy">{bankInfo.bank_account_holder}</strong>
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(bankInfo.bank_account_number);
                                alert('Nomor rekening berhasil disalin!');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ocean/30 bg-white text-xs font-bold text-ocean hover:bg-ocean hover:text-white transition shadow-xs shrink-0 self-start sm:self-auto"
                        >
                            Salin Nomor Rekening
                        </button>
                    </div>
                </Card>

                {/* 2. Daftar Tagihan */}
                <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-navy flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-ocean" />
                        Daftar Tagihan Anggota
                    </h3>

                    {invoices && invoices.length > 0 ? (
                        <div className="space-y-4">
                            {invoices.map((inv) => (
                                <Card key={inv.id} className="p-6 border-line shadow-soft">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-mono text-base font-bold text-navy">
                                                    #{inv.number}
                                                </h4>
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : inv.status === 'waiting_confirmation'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {inv.status === 'paid' ? 'Lunas' : inv.status === 'waiting_confirmation' ? 'Menunggu Konfirmasi' : 'Belum Dibayar'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate mt-0.5 block">
                                                Diterbitkan: {inv.created_at} {inv.due_at ? `• Batas Bayar: ${inv.due_at}` : ''}
                                            </span>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <span className="text-xs text-slate">Total Tagihan:</span>
                                            <p className="font-display text-lg font-bold text-navy">
                                                Rp {inv.total.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Breakdown Items */}
                                    <div className="py-3 divide-y divide-line/60">
                                        {inv.items.map((item) => (
                                            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                                                <span className="text-navy font-medium">
                                                    {item.name} {item.size ? `(${item.size})` : ''} × {item.qty}
                                                </span>
                                                <span className="font-bold text-navy">
                                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            {inv.latest_payment && (
                                                <span className="text-xs text-slate">
                                                    Bukti terkirim ({inv.latest_payment.sender_name}) • Status bukti:{' '}
                                                    <strong className="text-navy capitalize">{inv.latest_payment.status}</strong>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {inv.status === 'paid' && (
                                                <Link href={`/anggota/iuran/${inv.id}/kuitansi`}>
                                                    <Button size="sm" variant="secondary" className="text-xs">
                                                        <FileText className="w-3.5 h-3.5 mr-1" />
                                                        Kuitansi Resmi
                                                    </Button>
                                                </Link>
                                            )}

                                            {inv.status !== 'paid' && (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => handleOpenUpload(inv)}
                                                    className="text-xs"
                                                >
                                                    <Upload className="w-3.5 h-3.5 mr-1" />
                                                    {inv.latest_payment ? 'Unggah Ulang Bukti' : 'Unggah Bukti Bayar'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-white rounded-xl border border-line">
                            <Receipt className="w-10 h-10 text-slate/40 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-navy">Tidak Ada Tagihan</p>
                            <p className="text-xs text-slate">Seluruh kewajiban iuran keanggotaan Anda telah lunas.</p>
                        </div>
                    )}
                </div>

                {/* 3. Aturan & Ketentuan Iuran Asosiasi dari CMS */}
                <Card className="p-6 border-line shadow-soft">
                    <h3 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-ocean" />
                        Ketentuan Iuran Resmi Anggota NSA
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feeRules.map((fee) => (
                            <div key={fee.id} className="p-4 rounded-xl bg-mist/30 border border-line">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-navy text-sm">
                                        {fee.name}
                                    </h4>
                                    <span className="font-mono text-xs font-bold text-ocean">
                                        Rp {fee.amount.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className="text-xs text-slate mt-1">
                                    {fee.description || 'Ketentuan iuran resmi sesuai keputusan musyawarah pengurus NSA.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Modal Unggah Bukti Bayar */}
                <Modal
                    open={uploadModalOpen}
                    onClose={() => setUploadModalOpen(false)}
                    title={`Unggah Bukti Pembayaran #${selectedInvoice?.number}`}
                >
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-mist/50 border border-line text-xs">
                            <span className="text-slate block">Total yang Harus Dibayar:</span>
                            <span className="font-display font-bold text-navy text-lg">
                                Rp {selectedInvoice?.total.toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Nama Pemilik Rekening Pengirim (Wajib)
                            </label>
                            <Input
                                placeholder="Contoh: Budi Santoso"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Bank Pengirim
                                </label>
                                <Input
                                    placeholder="BCA, Mandiri, BRI, dll."
                                    value={senderBank}
                                    onChange={(e) => setSenderBank(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Tanggal Transfer
                                </label>
                                <Input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Berkas Bukti Transfer (JPG, PNG, PDF maks 3 MB)
                            </label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                required
                                className="block w-full text-xs text-slate file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-ocean/10 file:text-ocean hover:file:bg-ocean/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Catatan Tambahan (Opsional)
                            </label>
                            <Textarea
                                placeholder="Tuliskan catatan transfer jika ada..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setUploadModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PortalLayout>
    );
}
