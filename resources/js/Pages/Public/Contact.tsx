import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import ContactLocationMap from '@/Components/maps/ContactLocationMap';
import ContourPattern from '@/Components/motion/ContourPattern';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Check,
    ChevronDown,
    Clock,
    Copy,
    ExternalLink,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Search,
    Send,
    X,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

interface SocialMediaItem {
    platform: string;
    handle: string;
    url: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface ContactProps {
    contactInfo: {
        address: string;
        phone: string;
        whatsapp: string;
        email: string;
        hours: string;
        coordinates: {
            lat: number;
            lng: number;
        };
        social_media: SocialMediaItem[];
    };
    faqs?: FaqItem[];
}

const CONTACT_TOPICS = [
    'Umum',
    'Keanggotaan',
    'Produk',
    'Kemitraan',
    'Lainnya',
] as const;

const MAX_MESSAGE_LENGTH = 3000;

const contactSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Nama lengkap minimal 2 karakter.')
        .max(150, 'Nama lengkap maksimal 150 karakter.'),
    email: z
        .string()
        .trim()
        .email('Masukkan alamat email aktif yang valid.')
        .max(150, 'Alamat email maksimal 150 karakter.'),
    topic: z
        .string()
        .trim()
        .min(1, 'Pilih topik pertanyaan atau keperluan Anda.')
        .max(100, 'Topik maksimal 100 karakter.'),
    message: z
        .string()
        .trim()
        .min(10, 'Pesan minimal 10 karakter agar mudah ditindaklanjuti.')
        .max(
            MAX_MESSAGE_LENGTH,
            `Pesan maksimal ${MAX_MESSAGE_LENGTH.toLocaleString('id-ID')} karakter.`
        ),
});

function toWhatsAppUrl(phoneRaw: string): string {
    const digits = phoneRaw.replace(/\D/g, '');
    const normalized = digits.startsWith('0')
        ? `62${digits.slice(1)}`
        : digits;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(
        'Halo Sekretariat NSA, saya ingin menanyakan informasi layanan asosiasi.'
    )}`;
}

export default function Contact({ contactInfo, faqs = [] }: ContactProps) {
    const reduced = usePrefersReducedMotion();
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {}
    );

    // State pencarian & accordion FAQ yang dapat diakses keyboard
    const [faqSearch, setFaqSearch] = useState('');
    const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
    const faqButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        topic: 'Umum',
        message: '',
        fax_number: '', // Honeypot anti-spam
    });

    const filteredFaqs = useMemo(() => {
        const q = faqSearch.trim().toLowerCase();
        if (!q) return faqs;
        return faqs.filter(
            (item) =>
                item.question.toLowerCase().includes(q) ||
                item.answer.toLowerCase().includes(q)
        );
    }, [faqs, faqSearch]);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(contactInfo.email);
            setCopiedEmail(true);
            toast.success('Alamat email disalin ke papan klip.');
            setTimeout(() => setCopiedEmail(false), 2000);
        } catch {
            toast.error('Tidak dapat menyalin alamat email.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = contactSchema.safeParse({
            name: data.name,
            email: data.email,
            topic: data.topic,
            message: data.message,
        });

        if (!parsed.success) {
            const nextErrors: Record<string, string> = {};
            parsed.error.issues.forEach((issue) => {
                const key = String(issue.path[0] ?? '');
                if (key && !nextErrors[key]) {
                    nextErrors[key] = issue.message;
                }
            });
            setClientErrors(nextErrors);
            const firstMsg = Object.values(nextErrors)[0];
            toast.error(firstMsg || 'Mohon periksa kembali isi formulir kontak.');
            return;
        }

        setClientErrors({});
        post('/kontak', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    'Pesan Anda berhasil dikirim ke sekretariat NSA!'
                );
                reset();
            },
            onError: (err) => {
                const firstKey = Object.keys(err)[0];
                toast.error(
                    err[firstKey] ||
                        'Pesan belum dapat dikirim. Silakan periksa isian Anda.'
                );
            },
        });
    };

    const handleFaqKeyDown = (
        e: React.KeyboardEvent<HTMLButtonElement>,
        idx: number
    ) => {
        if (filteredFaqs.length <= 1) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            faqButtonRefs.current[(idx + 1) % filteredFaqs.length]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            faqButtonRefs.current[
                (idx - 1 + filteredFaqs.length) % filteredFaqs.length
            ]?.focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            faqButtonRefs.current[0]?.focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            faqButtonRefs.current[filteredFaqs.length - 1]?.focus();
        }
    };

    const mergedErrors = {
        name: clientErrors.name || errors.name,
        email: clientErrors.email || errors.email,
        topic: clientErrors.topic || errors.topic,
        message: clientErrors.message || errors.message,
    };

    const messageLength = data.message.length;
    const isNearLimit = messageLength >= 2900;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${contactInfo.coordinates.lat},${contactInfo.coordinates.lng}`;
    const whatsappUrl = toWhatsAppUrl(contactInfo.whatsapp);

    return (
        <PublicLayout>
            <Head>
                <title>Kontak Sekretariat · NSA Indonesia</title>
                <meta
                    name="description"
                    content="Hubungi Sekretariat Nasional NSA (Nusantara Sustainable Aquatic). Alamat kantor, telepon, WhatsApp, email, peta lokasi, dan pertanyaan umum."
                />
                <meta
                    property="og:title"
                    content="Kontak Sekretariat · NSA Indonesia"
                />
                <meta
                    property="og:description"
                    content="Saluran komunikasi resmi pembudidaya, mitra industri, dan publik dengan pengurus pusat NSA."
                />
            </Head>

            {/* =================================================================
                LAYAR TERBAGI: Kiri Panel Navy (Info + Peta) | Kanan Panel Putih (Formulir)
               ================================================================= */}
            <section
                aria-label="Informasi Kontak dan Formulir Pesan"
                className="border-b border-line bg-white"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* PANEL KIRI (NAVY, KONTRAS TUNGGAL): Info Sekretariat, Jalur Cepat & Peta */}
                    <div className="relative overflow-hidden bg-navy px-6 py-10 text-white sm:px-10 sm:py-14 lg:col-span-5 lg:px-12 lg:py-16">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 opacity-25"
                        >
                            <ContourPattern
                                tone="aqua"
                                opacity={0.3}
                                rings={8}
                                animate={!reduced}
                            />
                        </div>

                        <div className="relative z-10 mx-auto max-w-xl space-y-8 lg:max-w-none">
                            {/* Breadcrumb Terakses di Latar Navy */}
                            <nav
                                aria-label="Breadcrumb"
                                className="flex items-center gap-2 text-xs font-semibold text-mist/80"
                            >
                                <Link
                                    href="/"
                                    className="transition-colors hover:text-aqua"
                                >
                                    Beranda
                                </Link>
                                <span aria-hidden="true">/</span>
                                <span className="text-white">Kontak</span>
                            </nav>

                            <div>
                                <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
                                    Hubungi Sekretariat Nasional
                                </h1>
                                <p className="mt-4 text-sm leading-relaxed text-mist/85 sm:text-base">
                                    Sampaikan pertanyaan seputar keanggotaan,
                                    katalog produk, atau audiensi kemitraan
                                    langsung kepada pengurus pusat NSA.
                                </p>
                            </div>

                            {/* Jalur Cepat: Tombol WhatsApp + Salin Email */}
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cx(
                                        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control bg-aqua px-4 py-2.5 text-xs font-bold text-navy transition-colors hover:bg-white',
                                        focusRing
                                    )}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>Chat WhatsApp</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={handleCopyEmail}
                                    className={cx(
                                        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20',
                                        focusRing
                                    )}
                                >
                                    {copiedEmail ? (
                                        <>
                                            <Check className="h-4 w-4 text-aqua" />
                                            <span>Email Tersalin</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 text-aqua" />
                                            <span>Salin Email</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Rincian Kontak Bersih Tanpa Kotak Berat */}
                            <dl className="space-y-4 border-t border-white/15 pt-6 text-sm">
                                <div className="flex items-start gap-3.5">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                                    <div>
                                        <dt className="text-[11px] font-bold uppercase tracking-wider text-aqua">
                                            Alamat Sekretariat
                                        </dt>
                                        <dd className="mt-0.5 leading-relaxed text-white/90">
                                            {contactInfo.address}
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                                    <div>
                                        <dt className="text-[11px] font-bold uppercase tracking-wider text-aqua">
                                            Telepon &amp; WhatsApp
                                        </dt>
                                        <dd className="mt-0.5">
                                            <a
                                                href={`tel:${contactInfo.phone.replace(
                                                    /\s+/g,
                                                    ''
                                                )}`}
                                                className="font-medium text-white hover:text-aqua"
                                            >
                                                {contactInfo.phone}
                                            </a>
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                                    <div>
                                        <dt className="text-[11px] font-bold uppercase tracking-wider text-aqua">
                                            Email Resmi
                                        </dt>
                                        <dd className="mt-0.5">
                                            <a
                                                href={`mailto:${contactInfo.email}`}
                                                className="font-mono text-xs text-white hover:text-aqua sm:text-sm"
                                            >
                                                {contactInfo.email}
                                            </a>
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                                    <div>
                                        <dt className="text-[11px] font-bold uppercase tracking-wider text-aqua">
                                            Jam Layanan
                                        </dt>
                                        <dd className="mt-0.5 text-white/90">
                                            {contactInfo.hours}
                                        </dd>
                                    </div>
                                </div>
                            </dl>

                            {/* Tautan Sosial Media */}
                            {contactInfo.social_media.length > 0 ? (
                                <div className="border-t border-white/15 pt-5">
                                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-aqua">
                                        Kanal Media Sosial
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {contactInfo.social_media.map(
                                            (sm, i) => (
                                                <a
                                                    key={i}
                                                    href={sm.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cx(
                                                        'inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-aqua hover:bg-white/20',
                                                        focusRing
                                                    )}
                                                >
                                                    <span>{sm.platform}</span>
                                                    <ExternalLink className="h-3 w-3 text-aqua" />
                                                </a>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            {/* Peta Lokasi dengan Penanda */}
                            <div className="space-y-2.5 border-t border-white/15 pt-5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold uppercase tracking-wider text-aqua">
                                        Lokasi Kantor Pusat
                                    </span>
                                    <a
                                        href={mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-semibold text-white hover:text-aqua"
                                    >
                                        Buka Google Maps
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>

                                <ContactLocationMap
                                    lat={contactInfo.coordinates.lat}
                                    lng={contactInfo.coordinates.lng}
                                    title="Sekretariat Nasional NSA"
                                    address={contactInfo.address}
                                />
                            </div>
                        </div>
                    </div>

                    {/* PANEL KANAN (PUTIH): Formulir Kontak */}
                    <div className="bg-white px-6 py-10 sm:px-10 sm:py-14 lg:col-span-7 lg:px-16 lg:py-16">
                        <div className="mx-auto max-w-2xl">
                            <div>
                                <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                                    Formulir Layanan &amp; Aspirasi
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate">
                                    Isi formulir di bawah ini. Pesan Anda
                                    diteruskan langsung ke kotak masuk divisi
                                    terkait di sekretariat NSA.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                                className="mt-8 space-y-6"
                            >
                                {/* Honeypot anti-spam (wajib kosong) */}
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -left-[9999px] h-0 overflow-hidden opacity-0"
                                >
                                    <label htmlFor="fax_number">
                                        Fax Number
                                    </label>
                                    <input
                                        id="fax_number"
                                        type="text"
                                        name="fax_number"
                                        value={data.fax_number}
                                        onChange={(e) =>
                                            setData(
                                                'fax_number',
                                                e.target.value
                                            )
                                        }
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="contact-name"
                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy"
                                        >
                                            Nama Lengkap *
                                        </label>
                                        <Input
                                            id="contact-name"
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                if (clientErrors.name) {
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        name: '',
                                                    }));
                                                }
                                            }}
                                            placeholder="Contoh: Siti Rahma"
                                            error={mergedErrors.name}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="contact-email"
                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy"
                                        >
                                            Alamat Email *
                                        </label>
                                        <Input
                                            id="contact-email"
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => {
                                                setData(
                                                    'email',
                                                    e.target.value
                                                );
                                                if (clientErrors.email) {
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        email: '',
                                                    }));
                                                }
                                            }}
                                            placeholder="nama@domain.com"
                                            error={mergedErrors.email}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-topic"
                                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy"
                                    >
                                        Topik *
                                    </label>
                                    <select
                                        id="contact-topic"
                                        value={data.topic}
                                        onChange={(e) =>
                                            setData('topic', e.target.value)
                                        }
                                        className={cx(
                                            'h-11 w-full rounded-control border border-line bg-white px-3.5 text-sm font-medium text-ink transition focus:border-ocean',
                                            mergedErrors.topic
                                                ? 'border-danger'
                                                : '',
                                            focusRing
                                        )}
                                    >
                                        {CONTACT_TOPICS.map((topic) => (
                                            <option key={topic} value={topic}>
                                                {topic}
                                            </option>
                                        ))}
                                    </select>
                                    {mergedErrors.topic ? (
                                        <p className="mt-1 text-xs font-medium text-danger">
                                            {mergedErrors.topic}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <div className="mb-1.5 flex items-center justify-between gap-2">
                                        <label
                                            htmlFor="contact-message"
                                            className="block text-xs font-bold uppercase tracking-wider text-navy"
                                        >
                                            Pesan *
                                        </label>
                                        <span
                                            aria-live="polite"
                                            className={cx(
                                                'font-mono text-[11px] font-semibold',
                                                isNearLimit
                                                    ? 'text-danger'
                                                    : 'text-slate'
                                            )}
                                        >
                                            {messageLength.toLocaleString(
                                                'id-ID'
                                            )}{' '}
                                            /{' '}
                                            {MAX_MESSAGE_LENGTH.toLocaleString(
                                                'id-ID'
                                            )}{' '}
                                            karakter
                                        </span>
                                    </div>
                                    <Textarea
                                        id="contact-message"
                                        rows={6}
                                        required
                                        maxLength={MAX_MESSAGE_LENGTH}
                                        value={data.message}
                                        onChange={(e) => {
                                            setData('message', e.target.value);
                                            if (clientErrors.message) {
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    message: '',
                                                }));
                                            }
                                        }}
                                        placeholder="Tuliskan pokok pertanyaan, kendala keanggotaan, atau keperluan Anda secara ringkas dan jelas..."
                                        error={mergedErrors.message}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        loading={processing}
                                        size="lg"
                                        className="w-full justify-center font-bold"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Kirim Pesan Sekarang
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                02 PERTANYAAN UMUM (FAQ) DALAM ACCORDION YANG BISA DICARI
               ================================================================= */}
            <Section
                id="pertanyaan-umum"
                index="02"
                label="Pertanyaan Umum"
                tone="mist"
            >
                <SectionHeading
                    eyebrow="Pusat Bantuan Cepat"
                    title="Pertanyaan yang Sering Diajukan"
                    description="Cari jawaban singkat seputar pendaftaran anggota, verifikasi KTA digital, pemesanan produk, dan pembentukan cabang."
                    align="split"
                    actions={
                        <div className="relative w-full md:w-80">
                            <label htmlFor="faq-search" className="sr-only">
                                Cari pertanyaan umum
                            </label>
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                            <input
                                id="faq-search"
                                type="text"
                                value={faqSearch}
                                onChange={(e) => {
                                    setFaqSearch(e.target.value);
                                    setOpenFaqIdx(0);
                                }}
                                placeholder="Cari topik pertanyaan..."
                                className={cx(
                                    'h-11 w-full rounded-control border border-line bg-white pl-10 pr-9 text-xs font-medium text-ink placeholder:text-slate focus:border-ocean sm:text-sm',
                                    focusRing
                                )}
                            />
                            {faqSearch ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFaqSearch('');
                                        setOpenFaqIdx(0);
                                    }}
                                    aria-label="Hapus pencarian FAQ"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate hover:text-navy"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                    }
                />

                <div className="mt-10">
                    {filteredFaqs.length > 0 ? (
                        <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white shadow-soft">
                            {filteredFaqs.map((faq, idx) => {
                                const isOpen = openFaqIdx === idx;
                                const btnId = `faq-header-${idx}`;
                                const panelId = `faq-panel-${idx}`;

                                return (
                                    <div
                                        key={idx}
                                        className={cx(
                                            'transition-colors',
                                            isOpen
                                                ? 'bg-mist/35'
                                                : 'bg-white hover:bg-mist/20'
                                        )}
                                    >
                                        <h3>
                                            <button
                                                ref={(el) => {
                                                    faqButtonRefs.current[idx] =
                                                        el;
                                                }}
                                                id={btnId}
                                                type="button"
                                                aria-expanded={isOpen}
                                                aria-controls={panelId}
                                                onClick={() =>
                                                    setOpenFaqIdx(
                                                        isOpen ? null : idx
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleFaqKeyDown(e, idx)
                                                }
                                                className={cx(
                                                    'flex min-h-[56px] w-full items-center justify-between gap-4 px-6 py-5 text-left',
                                                    focusRing
                                                )}
                                            >
                                                <div className="flex items-baseline gap-4">
                                                    <span className="font-mono text-xs font-bold text-ocean shrink-0">
                                                        {String(
                                                            idx + 1
                                                        ).padStart(2, '0')}
                                                    </span>
                                                    <span className="font-display text-base font-bold text-navy sm:text-lg">
                                                        {faq.question}
                                                    </span>
                                                </div>

                                                <span
                                                    aria-hidden="true"
                                                    className={cx(
                                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy transition-transform duration-200',
                                                        isOpen
                                                            ? 'rotate-180 border-ocean text-ocean'
                                                            : ''
                                                    )}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </span>
                                            </button>
                                        </h3>

                                        <AnimatePresence initial={false}>
                                            {isOpen ? (
                                                <motion.div
                                                    id={panelId}
                                                    role="region"
                                                    aria-labelledby={btnId}
                                                    initial={
                                                        reduced
                                                            ? undefined
                                                            : {
                                                                  height: 0,
                                                                  opacity: 0,
                                                              }
                                                    }
                                                    animate={{
                                                        height: 'auto',
                                                        opacity: 1,
                                                    }}
                                                    exit={
                                                        reduced
                                                            ? undefined
                                                            : {
                                                                  height: 0,
                                                                  opacity: 0,
                                                              }
                                                    }
                                                    transition={{
                                                        duration: 0.22,
                                                        ease: 'easeOut',
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t border-line/70 px-6 pb-6 pt-4 sm:pl-14">
                                                        <p className="measure text-sm leading-relaxed text-slate sm:text-base">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-card border border-line bg-white p-8">
                            <EmptyState
                                title="Pertanyaan tidak ditemukan"
                                description={`Tidak ada topik FAQ yang cocok dengan kata kunci "${faqSearch}".`}
                                action={
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setFaqSearch('');
                                            setOpenFaqIdx(0);
                                        }}
                                    >
                                        Tampilkan Semua Pertanyaan
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>
            </Section>
        </PublicLayout>
    );
}
