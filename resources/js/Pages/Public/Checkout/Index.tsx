import { dur, ease } from '@/animations/variants';
import Container from '@/Components/layout/Container';
import PageHeader from '@/Components/layout/PageHeader';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    FileText,
    MapPin,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface CartItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    type: string;
    category_name: string;
    image: string | null;
    qty: number;
    unit_price: number;
    subtotal: number;
    is_member_price_applied: boolean;
}

interface CartData {
    items: CartItem[];
    total_qty: number;
    total_weight: number;
    subtotal: number;
}

interface DefaultAddress {
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    postal_code: string;
    address: string;
}

interface PaymentInfo {
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
}

interface CheckoutProps {
    cart: CartData;
    defaultAddress: DefaultAddress;
    paymentInfo: PaymentInfo;
}

const CHECKOUT_STEPS = [
    { number: 1 as const, title: 'Data Alamat & Kontak' },
    { number: 2 as const, title: 'Pengiriman & Pembayaran' },
    { number: 3 as const, title: 'Konfirmasi Pesanan' },
];

export default function CheckoutIndex({
    cart,
    defaultAddress,
    paymentInfo,
}: CheckoutProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Step 1: Data Alamat
    const [recipientName, setRecipientName] = useState(
        defaultAddress.recipient_name || ''
    );
    const [phone, setPhone] = useState(defaultAddress.phone || '');
    const [province, setProvince] = useState(defaultAddress.province || '');
    const [city, setCity] = useState(defaultAddress.city || '');
    const [postalCode, setPostalCode] = useState(
        defaultAddress.postal_code || ''
    );
    const [address, setAddress] = useState(defaultAddress.address || '');

    // Step 2: Pengiriman & Pembayaran
    const [shippingOption, setShippingOption] = useState<
        'regular' | 'express' | 'pickup'
    >('regular');
    const paymentMethod = 'manual_transfer';

    // Step 3: Catatan
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const shippingCosts = {
        regular: 25000,
        express: 45000,
        pickup: 0,
    };

    const currentShippingCost = shippingCosts[shippingOption];
    const totalAmount = cart.subtotal + currentShippingCost;

    const isStep1Complete = Boolean(
        recipientName.trim() &&
            phone.trim() &&
            province.trim() &&
            city.trim() &&
            address.trim()
    );

    const handleNextToStep2 = (e: FormEvent) => {
        e.preventDefault();
        if (!isStep1Complete) {
            toast.error(
                'Harap lengkapi semua kolom alamat pengiriman yang wajib diisi.'
            );
            return;
        }
        setStep(2);
    };

    const handleNextToStep3 = (e: FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    const handlePlaceOrder = () => {
        setIsSubmitting(true);
        router.post(
            '/checkout',
            {
                recipient_name: recipientName,
                phone,
                province,
                city,
                postal_code: postalCode,
                address,
                shipping_option: shippingOption,
                payment_method: paymentMethod,
                note,
            },
            {
                onError: (errs) => {
                    setIsSubmitting(false);
                    const msg =
                        Object.values(errs)[0] ||
                        'Gagal memproses pesanan Anda.';
                    toast.error(msg as string);
                },
            }
        );
    };

    const currentStepConfig =
        CHECKOUT_STEPS.find((s) => s.number === step) ?? CHECKOUT_STEPS[0];
    const progressPercent = Math.round((step / CHECKOUT_STEPS.length) * 100);

    return (
        <PublicLayout>
            <Head title="Checkout Pesanan · NSA" />

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Keranjang', href: '/keranjang' },
                    { label: 'Checkout' },
                ]}
                eyebrow="Penyelesaian Transaksi"
                title="Checkout Pesanan"
                description="Lengkapi alamat tujuan, pilih metode pengiriman, dan konfirmasi rincian pesanan Anda."
            />

            <Container className="py-8 md:py-12">
                {/* Stepper 3 Langkah Bergaya Sama dengan WizardStepper Pendaftaran */}
                <div className="w-full">
                    {/* Mobile (< 768px): Bar Ringkas + Progress Bar Animasi */}
                    <div className="mb-6 block rounded-xl border border-line bg-white p-3.5 shadow-soft md:hidden">
                        <div className="mb-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-ocean">
                                    Langkah {step} dari 3
                                </span>
                                <h2 className="truncate font-display text-sm font-bold text-navy">
                                    {currentStepConfig.title}
                                </h2>
                            </div>
                            <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-navy">
                                {progressPercent}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                            <motion.div
                                className="h-full rounded-full bg-ocean"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />
                        </div>
                    </div>

                    {/* Desktop (>= 768px): 3 Lingkaran Bernomor + Label + Indikator Aktif */}
                    <div className="mb-8 hidden rounded-2xl border border-line bg-white p-6 shadow-soft md:block">
                        <div className="relative flex items-center justify-between">
                            <div className="absolute left-16 right-16 top-4 z-0 h-0.5 bg-line" />

                            {CHECKOUT_STEPS.map((s) => {
                                const isCompleted = s.number < step;
                                const isCurrent = s.number === step;
                                const isAccessible =
                                    s.number === 1 ||
                                    (s.number === 2 && isStep1Complete) ||
                                    (s.number === 3 &&
                                        isStep1Complete &&
                                        step >= 2);

                                return (
                                    <div
                                        key={s.number}
                                        className="relative z-10 flex flex-1 flex-col items-center"
                                    >
                                        <button
                                            type="button"
                                            disabled={!isAccessible}
                                            onClick={() =>
                                                isAccessible &&
                                                setStep(s.number)
                                            }
                                            className={cx(
                                                'group flex flex-col items-center transition focus:outline-none',
                                                !isAccessible
                                                    ? 'cursor-not-allowed opacity-60'
                                                    : 'cursor-pointer'
                                            )}
                                        >
                                            <div
                                                className={cx(
                                                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                                                    isCompleted
                                                        ? 'bg-success text-white shadow-soft'
                                                        : isCurrent
                                                        ? 'scale-110 bg-ocean text-white shadow-soft ring-4 ring-ocean/20'
                                                        : 'border-2 border-line bg-white text-slate group-hover:border-ocean/50'
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <Check className="h-4 w-4 stroke-[2.5]" />
                                                ) : (
                                                    <span>{s.number}</span>
                                                )}
                                            </div>

                                            <div className="mt-2 text-center">
                                                <span
                                                    className={cx(
                                                        'block text-xs leading-tight transition-colors',
                                                        isCurrent
                                                            ? 'font-bold text-ocean'
                                                            : isCompleted
                                                            ? 'font-semibold text-navy'
                                                            : 'font-medium text-slate'
                                                    )}
                                                >
                                                    {s.title}
                                                </span>

                                                {isCurrent ? (
                                                    <motion.div
                                                        layoutId="checkoutStepperIndicator"
                                                        className="mt-1 h-0.5 w-full rounded-full bg-ocean"
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 350,
                                                            damping: 30,
                                                        }}
                                                    />
                                                ) : null}
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    {/* Kolom Formulir Langkah (8 kolom) */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: dur.base, ease }}
                            >
                                {/* LANGKAH 1: DATA ALAMAT */}
                                {step === 1 ? (
                                    <form
                                        onSubmit={handleNextToStep2}
                                        className="space-y-6 rounded-card border border-line bg-white p-6 shadow-soft sm:p-8"
                                    >
                                        <div className="flex items-center gap-2.5 border-b border-line pb-4">
                                            <MapPin className="h-5 w-5 text-ocean" />
                                            <div>
                                                <h2 className="font-display text-lg font-bold text-navy">
                                                    Langkah 1: Data Alamat &amp;
                                                    Kontak Penerima
                                                </h2>
                                                <p className="text-xs text-slate">
                                                    Pastikan nomor telepon aktif
                                                    untuk koordinasi pengiriman.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                                                    Nama Penerima{' '}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={recipientName}
                                                    onChange={(e) =>
                                                        setRecipientName(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Contoh: Budi Prasetyo"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                                                    Nomor WhatsApp / HP{' '}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <Input
                                                    type="tel"
                                                    required
                                                    value={phone}
                                                    onChange={(e) =>
                                                        setPhone(e.target.value)
                                                    }
                                                    placeholder="0812xxxxxxxx"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                                                    Provinsi{' '}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={province}
                                                    onChange={(e) =>
                                                        setProvince(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Contoh: Jawa Barat"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                                                    Kota / Kabupaten{' '}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={city}
                                                    onChange={(e) =>
                                                        setCity(e.target.value)
                                                    }
                                                    placeholder="Contoh: Kab. Bogor"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                                                    Kode Pos (Opsional)
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={postalCode}
                                                    onChange={(e) =>
                                                        setPostalCode(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="16xxx"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                                                Alamat Lengkap (Jalan, RT/RW,
                                                Patokan Kolam){' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <Textarea
                                                required
                                                rows={3}
                                                value={address}
                                                onChange={(e) =>
                                                    setAddress(e.target.value)
                                                }
                                                placeholder="Jl. Raya Perikanan No. 12, Kolam Budidaya Blok B"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between border-t border-line pt-4">
                                            <Button
                                                href="/keranjang"
                                                variant="ghost"
                                                size="sm"
                                            >
                                                ← Kembali ke Keranjang
                                            </Button>
                                            <Button type="submit" size="md">
                                                Lanjut ke Pengiriman &amp;
                                                Pembayaran
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>
                                ) : null}

                                {/* LANGKAH 2: PENGIRIMAN & PEMBAYARAN */}
                                {step === 2 ? (
                                    <form
                                        onSubmit={handleNextToStep3}
                                        className="space-y-6 rounded-card border border-line bg-white p-6 shadow-soft sm:p-8"
                                    >
                                        <div className="flex items-center gap-2.5 border-b border-line pb-4">
                                            <Truck className="h-5 w-5 text-ocean" />
                                            <div>
                                                <h2 className="font-display text-lg font-bold text-navy">
                                                    Langkah 2: Opsi Pengiriman
                                                    &amp; Pembayaran
                                                </h2>
                                                <p className="text-xs text-slate">
                                                    Pilih layanan ekspedisi dan
                                                    rekening pembayaran resmi
                                                    NSA.
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate">
                                                Pilih Opsi Pengiriman
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                <label
                                                    className={cx(
                                                        'flex cursor-pointer flex-col justify-between rounded-control border p-4 transition-all',
                                                        shippingOption ===
                                                            'regular'
                                                            ? 'border-ocean bg-ocean/5 ring-2 ring-ocean/30'
                                                            : 'border-line hover:border-slate/40'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className="block text-sm font-bold text-navy">
                                                                Kurir Reguler
                                                            </span>
                                                            <span className="mt-0.5 block text-xs text-slate">
                                                                Estimasi 2–3
                                                                hari kerja
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="shipping_opt"
                                                            checked={
                                                                shippingOption ===
                                                                'regular'
                                                            }
                                                            onChange={() =>
                                                                setShippingOption(
                                                                    'regular'
                                                                )
                                                            }
                                                            className="text-ocean"
                                                        />
                                                    </div>
                                                    <span className="mt-3 font-display text-sm font-bold text-navy">
                                                        Rp 25.000
                                                    </span>
                                                </label>

                                                <label
                                                    className={cx(
                                                        'flex cursor-pointer flex-col justify-between rounded-control border p-4 transition-all',
                                                        shippingOption ===
                                                            'express'
                                                            ? 'border-ocean bg-ocean/5 ring-2 ring-ocean/30'
                                                            : 'border-line hover:border-slate/40'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className="block text-sm font-bold text-navy">
                                                                Kurir Kilat /
                                                                Oxygen
                                                            </span>
                                                            <span className="mt-0.5 block text-xs text-slate">
                                                                Khusus benih
                                                                hidup (1 hari)
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="shipping_opt"
                                                            checked={
                                                                shippingOption ===
                                                                'express'
                                                            }
                                                            onChange={() =>
                                                                setShippingOption(
                                                                    'express'
                                                                )
                                                            }
                                                            className="text-ocean"
                                                        />
                                                    </div>
                                                    <span className="mt-3 font-display text-sm font-bold text-navy">
                                                        Rp 45.000
                                                    </span>
                                                </label>

                                                <label
                                                    className={cx(
                                                        'flex cursor-pointer flex-col justify-between rounded-control border p-4 transition-all',
                                                        shippingOption ===
                                                            'pickup'
                                                            ? 'border-ocean bg-ocean/5 ring-2 ring-ocean/30'
                                                            : 'border-line hover:border-slate/40'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className="block text-sm font-bold text-navy">
                                                                Ambil di Lokasi
                                                            </span>
                                                            <span className="mt-0.5 block text-xs text-slate">
                                                                Sentra DPW /
                                                                Mitra
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="shipping_opt"
                                                            checked={
                                                                shippingOption ===
                                                                'pickup'
                                                            }
                                                            onChange={() =>
                                                                setShippingOption(
                                                                    'pickup'
                                                                )
                                                            }
                                                            className="text-ocean"
                                                        />
                                                    </div>
                                                    <span className="mt-3 font-display text-sm font-bold text-success">
                                                        Gratis (Rp 0)
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="border-t border-line pt-6">
                                            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate">
                                                Metode Pembayaran
                                            </h3>
                                            <div className="space-y-3 rounded-control border-2 border-ocean bg-ocean/5 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-5 w-5 text-ocean" />
                                                        <span className="text-sm font-bold text-navy">
                                                            Transfer Bank Manual
                                                            (Rekening Resmi NSA)
                                                        </span>
                                                    </div>
                                                    <span className="rounded bg-ocean px-2 py-0.5 text-[10px] font-bold text-white">
                                                        Resmi
                                                    </span>
                                                </div>

                                                <div className="space-y-1 rounded-control border border-line bg-white p-3.5 text-xs text-slate">
                                                    <p className="font-semibold text-ink">
                                                        Bank Tujuan:{' '}
                                                        <span className="text-navy">
                                                            {
                                                                paymentInfo.bank_name
                                                            }
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Nomor Rekening:{' '}
                                                        <span className="font-mono text-sm font-bold text-navy">
                                                            {
                                                                paymentInfo.bank_account_number
                                                            }
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Atas Nama:{' '}
                                                        <span className="font-semibold text-navy">
                                                            {
                                                                paymentInfo.bank_account_holder
                                                            }
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-line pt-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setStep(1)}
                                            >
                                                <ArrowLeft className="mr-1 h-4 w-4" />
                                                Kembali ke Data Alamat
                                            </Button>
                                            <Button type="submit" size="md">
                                                Lanjut ke Konfirmasi
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>
                                ) : null}

                                {/* LANGKAH 3: KONFIRMASI PESANAN */}
                                {step === 3 ? (
                                    <div className="space-y-6 rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
                                        <div className="flex items-center gap-2.5 border-b border-line pb-4">
                                            <FileText className="h-5 w-5 text-ocean" />
                                            <div>
                                                <h2 className="font-display text-lg font-bold text-navy">
                                                    Langkah 3: Konfirmasi
                                                    Pesanan Akhir
                                                </h2>
                                                <p className="text-xs text-slate">
                                                    Tinjau kembali data pesanan
                                                    Anda sebelum membuat kode
                                                    transaksi.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5 rounded-control border border-line bg-mist/25 p-4 text-xs">
                                                <div className="flex items-center justify-between font-bold text-navy">
                                                    <span>
                                                        Tujuan Pengiriman
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setStep(1)
                                                        }
                                                        className="text-[11px] text-ocean hover:underline"
                                                    >
                                                        Ubah
                                                    </button>
                                                </div>
                                                <p className="font-semibold text-ink">
                                                    {recipientName} ({phone})
                                                </p>
                                                <p className="leading-relaxed text-slate">
                                                    {address}, {city},{' '}
                                                    {province} {postalCode}
                                                </p>
                                            </div>

                                            <div className="space-y-1.5 rounded-control border border-line bg-mist/25 p-4 text-xs">
                                                <div className="flex items-center justify-between font-bold text-navy">
                                                    <span>
                                                        Pengiriman &amp; Bayar
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setStep(2)
                                                        }
                                                        className="text-[11px] text-ocean hover:underline"
                                                    >
                                                        Ubah
                                                    </button>
                                                </div>
                                                <p className="font-semibold text-ink">
                                                    Ekspedisi:{' '}
                                                    {shippingOption ===
                                                    'regular'
                                                        ? 'Kurir Reguler'
                                                        : shippingOption ===
                                                          'express'
                                                        ? 'Kurir Kilat Benih'
                                                        : 'Ambil di Lokasi'}
                                                </p>
                                                <p className="text-slate">
                                                    Metode: Transfer Bank Manual
                                                    ({paymentInfo.bank_name})
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate">
                                                Catatan untuk Penjual / Kurir
                                                (Opsional)
                                            </label>
                                            <Textarea
                                                rows={2}
                                                value={note}
                                                onChange={(e) =>
                                                    setNote(e.target.value)
                                                }
                                                placeholder="Contoh: Kirimkan pagi hari atau hubungi sebelum tiba"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between border-t border-line pt-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setStep(2)}
                                            >
                                                <ArrowLeft className="mr-1 h-4 w-4" />
                                                Kembali
                                            </Button>
                                            <Button
                                                type="button"
                                                size="lg"
                                                disabled={isSubmitting}
                                                onClick={handlePlaceOrder}
                                                className="font-bold"
                                            >
                                                {isSubmitting
                                                    ? 'Memproses Pesanan...'
                                                    : 'Buat Pesanan & Bayar Sekarang'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Ringkasan Pesanan Menempel di Kanan (4 kolom) */}
                    <aside
                        className="lg:sticky lg:col-span-4"
                        style={{ top: 'calc(var(--header-h, 72px) + 20px)' }}
                    >
                        <div className="space-y-5 rounded-card border border-line bg-white p-6 shadow-soft">
                            <h2 className="border-b border-line pb-3 font-display text-base font-bold text-navy">
                                Rincian Pesanan ({cart.items.length} Item)
                            </h2>

                            <ul className="max-h-60 divide-y divide-line overflow-y-auto pr-1">
                                {cart.items.map((it) => (
                                    <li
                                        key={it.id}
                                        className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0"
                                    >
                                        <div className="flex-1 pr-2">
                                            <p className="line-clamp-1 font-semibold text-navy">
                                                {it.name}
                                            </p>
                                            <p className="text-[11px] text-slate">
                                                {it.qty} × Rp{' '}
                                                {Number(
                                                    it.unit_price
                                                ).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <span className="whitespace-nowrap font-bold text-navy">
                                            Rp{' '}
                                            {Number(it.subtotal).toLocaleString(
                                                'id-ID'
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-2 border-t border-line pt-3 text-xs">
                                <div className="flex justify-between text-slate">
                                    <span>Subtotal Produk</span>
                                    <span className="font-semibold text-navy">
                                        Rp{' '}
                                        {Number(cart.subtotal).toLocaleString(
                                            'id-ID'
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-slate">
                                    <span>Ongkos Kirim</span>
                                    <span className="font-semibold text-navy">
                                        {currentShippingCost === 0
                                            ? 'Gratis'
                                            : `Rp ${Number(
                                                  currentShippingCost
                                              ).toLocaleString('id-ID')}`}
                                    </span>
                                </div>

                                <div className="flex items-baseline justify-between border-t border-line pt-2.5">
                                    <span className="text-sm font-bold text-navy">
                                        Total Pembayaran
                                    </span>
                                    <span className="font-display text-xl font-extrabold text-navy">
                                        Rp{' '}
                                        {Number(totalAmount).toLocaleString(
                                            'id-ID'
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 rounded-control border border-line/60 bg-mist/50 p-3 text-[11px] text-slate">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                                <span>
                                    Stok produk dikunci secara aman dan otomatis
                                    dikurangi saat pesanan dibuat.
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </Container>
        </PublicLayout>
    );
}
