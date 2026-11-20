import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, 
    Check, 
    Lock, 
    Info, 
    ShieldCheck, 
    Sparkles, 
    Shirt, 
    Plus, 
    Minus, 
    Calendar,
    Tag,
    Receipt
} from 'lucide-react';

interface FeeItemState {
    fee_item_id: number;
    code: string;
    name: string;
    description?: string;
    amount: number;
    type: 'required' | 'optional' | 'recurring';
    has_size_option: boolean;
    size_options?: string[];
    selected: boolean;
    qty: number;
    size?: string;
}

interface Step8Props {
    data: {
        items?: FeeItemState[];
        [key: string]: any;
    };
    onChange: (data: any) => void;
    errors?: Record<string, string>;
    membershipFeeItems?: any[];
    requireInitialVerification?: boolean;
    [key: string]: any;
}

export default function Step8Administration({
    data = {},
    onChange,
    errors = {},
    membershipFeeItems = [],
    requireInitialVerification = true,
}: Step8Props) {
    // Gabungkan data tersimpan dengan daftar resmi dari server
    const items: FeeItemState[] = useMemo(() => {
        const savedMap = new Map((data.items || []).map((it) => [it.fee_item_id, it]));

        return membershipFeeItems.map((fee) => {
            const saved = savedMap.get(fee.id);
            const isRequired = fee.type === 'required' || fee.type === 'recurring';
            const defaultSize = fee.has_size_option && Array.isArray(fee.size_options) && fee.size_options.length > 0
                ? fee.size_options[0]
                : undefined;

            return {
                fee_item_id: fee.id,
                code: fee.code,
                name: fee.name,
                description: fee.description,
                amount: parseFloat(fee.amount) || 0,
                type: fee.type,
                has_size_option: Boolean(fee.has_size_option),
                size_options: fee.size_options || ['S', 'M', 'L', 'XL', 'XXL'],
                selected: isRequired ? true : Boolean(saved?.selected),
                qty: isRequired ? 1 : Math.max(1, saved?.qty || 1),
                size: saved?.size || defaultSize,
            };
        });
    }, [membershipFeeItems, data.items]);

    const updateItem = (feeId: number, patch: Partial<FeeItemState>) => {
        const updated = items.map((it) => (it.fee_item_id === feeId ? { ...it, ...patch } : it));
        onChange({
            ...data,
            items: updated,
        });
    };

    const toggleOptionalItem = (feeId: number, selected: boolean) => {
        updateItem(feeId, { selected });
    };

    const handleQtyChange = (feeId: number, delta: number) => {
        const item = items.find((it) => it.fee_item_id === feeId);
        if (!item) return;
        const newQty = Math.max(1, Math.min(10, item.qty + delta));
        updateItem(feeId, { qty: newQty });
    };

    const handleSizeChange = (feeId: number, size: string) => {
        updateItem(feeId, { size });
    };

    // Hitung total akumulasi live
    const totalAmount = useMemo(() => {
        return items.reduce((acc, it) => {
            if (it.selected) {
                return acc + it.amount * it.qty;
            }
            return acc;
        }, 0);
    }, [items]);

    const formatCurrency = (val: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="space-y-8">
            {/* Header / Kartu Penjelasan Biaya */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-7 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-base md:text-lg">
                            Rincian Paket Keanggotaan & Administrasi
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Rincian biaya sesuai keputusan resmi NSA. Item wajib telah terkunci dan item seragam dapat disesuaikan.
                        </p>
                    </div>
                </div>

                {/* Daftar Item Biaya dari membership_fee_items */}
                <div className="space-y-3.5">
                    {items.map((item) => {
                        const isRequired = item.type === 'required' || item.type === 'recurring';

                        return (
                            <div
                                key={item.fee_item_id}
                                className={`p-4 md:p-5 rounded-xl border transition-all ${
                                    item.selected
                                        ? 'border-primary/40 bg-card shadow-xs'
                                        : 'border-border/60 bg-muted/10 opacity-75'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3.5 flex-1">
                                        {/* Checkbox / Lock Icon */}
                                        <div className="pt-0.5">
                                            {isRequired ? (
                                                <div
                                                    className="w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center cursor-not-allowed"
                                                    title="Wajib (Bagian dari ketetapan resmi organisasi)"
                                                >
                                                    <Lock className="w-3 h-3" />
                                                </div>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={item.selected}
                                                    onChange={(e) => toggleOptionalItem(item.fee_item_id, e.target.checked)}
                                                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary cursor-pointer transition"
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm md:text-base font-semibold text-foreground">
                                                    {item.name}
                                                </h4>
                                                {item.type === 'required' && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-primary/10 text-primary">
                                                        Wajib
                                                    </span>
                                                )}
                                                {item.type === 'recurring' && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-secondary text-secondary-foreground">
                                                        Iuran Tahunan
                                                    </span>
                                                )}
                                                {item.type === 'optional' && (
                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground">
                                                        Pilihan Tambahan
                                                    </span>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Kolom Harga Nominal */}
                                    <div className="text-right sm:shrink-0 sm:pl-4">
                                        <span className="text-xs text-muted-foreground block">Tarif Satuan</span>
                                        <span className="text-sm md:text-base font-bold text-foreground tabular-nums">
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Opsi Ukuran & Kuantitas bila Aktif & Memiliki Pilihan */}
                                <AnimatePresence>
                                    {item.selected && item.has_size_option && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-3.5 border-t border-dashed border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <Shirt className="w-3.5 h-3.5 text-primary" />
                                                    Pilih Ukuran:
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {item.size_options?.map((sz) => (
                                                        <button
                                                            key={sz}
                                                            type="button"
                                                            onClick={() => handleSizeChange(item.fee_item_id, sz)}
                                                            className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                                                                item.size === sz
                                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                                    : 'bg-background hover:bg-muted text-muted-foreground border-input'
                                                            }`}
                                                        >
                                                            {sz}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Counter Kuantitas untuk Item Opsional */}
                                            {item.type === 'optional' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-muted-foreground">Jumlah:</span>
                                                    <div className="inline-flex items-center border border-input rounded-lg overflow-hidden bg-background">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(item.fee_item_id, -1)}
                                                            disabled={item.qty <= 1}
                                                            className="p-1 hover:bg-muted text-muted-foreground disabled:opacity-40 transition"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="w-7 text-center font-bold text-foreground tabular-nums">
                                                            {item.qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(item.fee_item_id, 1)}
                                                            disabled={item.qty >= 10}
                                                            className="p-1 hover:bg-muted text-muted-foreground disabled:opacity-40 transition"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* KARTU RINGKASAN TOTAL DENGAN ANIMASI ANGKA */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-primary font-mono block">
                            ESTIMASI DRAF INVOICE
                        </span>
                        <h4 className="text-base md:text-lg font-bold text-foreground">
                            Total Administrasi Keanggotaan
                        </h4>
                    </div>

                    <div className="text-left sm:text-right">
                        <motion.span
                            key={totalAmount}
                            initial={{ scale: 0.95, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-2xl md:text-3xl font-extrabold text-primary font-mono tracking-tight block tabular-nums"
                        >
                            {formatCurrency(totalAmount)}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">
                            (Belum ditagihkan, disimpan sebagai draf invoice pendaftaran)
                        </span>
                    </div>
                </div>

                {/* Catatan Sesuai Setting membership.require_initial_verification */}
                <div className="p-4 rounded-xl bg-card border border-border/80 flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground leading-relaxed">
                        {requireInitialVerification ? (
                            <p>
                                <strong className="text-foreground">Catatan Pembayaran:</strong> Pembayaran dilakukan setelah berkas pendaftaran Anda lolos verifikasi awal oleh tim pengurus NSA. Anda akan menerima instruksi tagihan resmi dan nomor rekening virtual di dasbor akun.
                            </p>
                        ) : (
                            <p>
                                <strong className="text-foreground">Catatan Pembayaran:</strong> Pembayaran administrasi dapat langsung diselesaikan setelah formulir pendaftaran ini Anda kirimkan.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
