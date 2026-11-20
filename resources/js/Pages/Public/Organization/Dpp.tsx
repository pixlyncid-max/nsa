import ArchImage from '@/Components/layout/ArchImage';
import Section from '@/Components/layout/Section';
import type { OrgMemberItem } from '@/Components/sections/organization/MemberCard';
import OrganizationLayout from '@/Components/sections/organization/OrganizationLayout';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Head } from '@inertiajs/react';
import { animate } from 'animejs';
import { Award, Check, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface DppProps {
    members: OrgMemberItem[];
}

function getInitials(name: string): string {
    return name
        .replace(/^(Dr\.|Ir\.|Prof\.|H\.|Hj\.)\s*/gi, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

function AvatarCircle({
    name,
    photo,
    size = 'md',
}: {
    name: string;
    photo?: string | null;
    size?: 'sm' | 'md';
}) {
    const dim = size === 'sm' ? 'h-11 w-11 text-xs' : 'h-14 w-14 text-sm';

    if (photo) {
        return (
            <img
                src={photo}
                alt={name}
                loading="lazy"
                className={cx(
                    'shrink-0 rounded-full border border-line object-cover',
                    dim
                )}
            />
        );
    }

    return (
        <div
            aria-hidden="true"
            className={cx(
                'flex shrink-0 items-center justify-center rounded-full border border-ocean/25 bg-ocean/10 font-display font-bold text-navy',
                dim
            )}
        >
            {getInitials(name)}
        </div>
    );
}

export default function Dpp({ members }: DppProps) {
    const reduced = usePrefersReducedMotion();
    const chartRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const hqAddress =
        'Gedung Mina Bahari Nusantara Lt. 4, Jl. Medan Merdeka Timur No. 16, Jakarta Pusat';

    const leader =
        members.find(
            (m) =>
                m.position.toLowerCase().includes('ketua umum') || m.order === 1
        ) ?? members[0];

    const nonLeaders = members.filter((m) => m.id !== leader?.id);

    // Pisahkan Sekjen & Bendahara (tier 2) dan Bidang-bidang (tier 3)
    const executives = nonLeaders.filter((m) => {
        const pos = m.position.toLowerCase();
        return pos.includes('sekretaris') || pos.includes('bendahara');
    });

    const executiveIds = new Set(executives.map((m) => m.id));
    const departments = nonLeaders.filter((m) => !executiveIds.has(m.id));

    const period = leader?.period || '2024–2029';

    // Gambar garis penghubung bagan struktur dengan anime.js saat masuk viewport
    useEffect(() => {
        const root = chartRef.current;
        if (!root) return;

        const paths = Array.from(
            root.querySelectorAll<SVGPathElement>('[data-org-line]')
        );
        if (paths.length === 0) return;

        if (reduced) {
            paths.forEach((p) => {
                p.style.strokeDasharray = '';
                p.style.strokeDashoffset = '0';
            });
            return;
        }

        paths.forEach((path) => {
            const len = path.getTotalLength();
            path.style.strokeDasharray = `${len}`;
            path.style.strokeDashoffset = `${len}`;
        });

        let drawn = false;
        const observer = new IntersectionObserver(
            (entries) => {
                if (drawn) return;
                if (entries.some((entry) => entry.isIntersecting)) {
                    drawn = true;
                    paths.forEach((path, idx) => {
                        const len = path.getTotalLength();
                        const state = { offset: len };
                        try {
                            animate(state, {
                                offset: 0,
                                duration: 900,
                                delay: idx * 140,
                                ease: 'outQuad',
                                onUpdate: () => {
                                    path.style.strokeDashoffset = `${state.offset}`;
                                },
                            });
                        } catch {
                            path.style.strokeDashoffset = '0';
                        }
                    });
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(root);
        return () => observer.disconnect();
    }, [reduced, members.length]);

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(hqAddress);
            setCopied(true);
            toast.success('Alamat Sekretariat Pusat disalin.');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Tidak dapat menyalin alamat.');
        }
    };

    return (
        <OrganizationLayout
            current="dpp"
            title={`Dewan Pengurus Pusat (DPP) ${period}`}
            description="Pimpinan tertinggi kelembagaan asosiasi yang menetapkan arah strategis perikanan budidaya, advokasi regulasi, dan konsolidasi nasional."
            barMeta={
                <span className="font-semibold text-navy">
                    Masa Bakti {period} · {members.length} Pengurus Inti
                </span>
            }
        >
            <Head>
                <title>Dewan Pengurus Pusat (DPP) · Organisasi NSA</title>
                <meta
                    name="description"
                    content={`Susunan Dewan Pengurus Pusat (DPP) NSA (Nusantara Sustainable Aquatic) periode ${period}.`}
                />
            </Head>

            {/* 01 BAGAN STRUKTUR PENGURUS PUSAT */}
            <Section
                index="01"
                label="Bagan Struktur"
                tone="white"
                className="!pt-12 border-b border-line"
            >
                <div ref={chartRef} className="mx-auto max-w-5xl">
                    {/* Puncak: Ketua Umum dengan Potret Besar Bentuk Lengkung */}
                    {leader ? (
                        <div className="mx-auto max-w-2xl rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
                            <div className="grid items-center gap-6 sm:grid-cols-12">
                                <div className="mx-auto w-44 sm:col-span-5 sm:w-full">
                                    <ArchImage
                                        src={leader.photo}
                                        alt={`${leader.name}, ${leader.position}`}
                                        aspectRatio="aspect-[4/5]"
                                        priority
                                        className="shadow-soft"
                                    />
                                </div>
                                <div className="text-center sm:col-span-7 sm:text-left">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ocean">
                                        <Award className="h-3.5 w-3.5 text-aqua" />
                                        {leader.position}
                                    </span>
                                    <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                                        {leader.name}
                                    </h2>
                                    <p className="mt-1 text-xs font-semibold text-slate">
                                        Periode Kepengurusan {period}
                                    </p>
                                    {leader.bio ? (
                                        <p className="mt-3 text-sm leading-relaxed text-slate">
                                            {leader.bio}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Garis Penghubung SVG (Ketua Umum -> Sekjen & Bendahara) */}
                    {executives.length > 0 ? (
                        <>
                            <div
                                aria-hidden="true"
                                className="mx-auto flex h-12 max-w-2xl justify-center"
                            >
                                <svg
                                    viewBox="0 0 400 48"
                                    fill="none"
                                    className="h-full w-full max-w-md stroke-ocean/60"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        data-org-line
                                        d="M 200 0 L 200 24"
                                    />
                                    <path
                                        data-org-line
                                        d="M 100 24 L 300 24"
                                    />
                                    <path
                                        data-org-line
                                        d="M 100 24 L 100 48"
                                    />
                                    <path
                                        data-org-line
                                        d="M 300 24 L 300 48"
                                    />
                                </svg>
                            </div>

                            {/* Tingkat 2: Sekjen & Bendahara */}
                            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
                                {executives.map((exec) => (
                                    <div
                                        key={exec.id}
                                        className="flex items-center gap-4 rounded-card border border-line bg-mist/60 p-5 shadow-xs transition-colors hover:border-ocean/40 hover:bg-white"
                                    >
                                        <AvatarCircle
                                            name={exec.name}
                                            photo={exec.photo}
                                            size="md"
                                        />
                                        <div className="min-w-0">
                                            <span className="block text-[11px] font-bold uppercase tracking-wider text-ocean">
                                                {exec.position}
                                            </span>
                                            <h3 className="mt-0.5 truncate font-display text-base font-bold text-navy">
                                                {exec.name}
                                            </h3>
                                            {exec.period ? (
                                                <span className="text-[11px] text-slate">
                                                    Periode {exec.period}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}

                    {/* Garis Penghubung SVG (Tier 2 -> Bidang-bidang) */}
                    {departments.length > 0 ? (
                        <>
                            <div
                                aria-hidden="true"
                                className="mx-auto flex h-12 max-w-3xl justify-center"
                            >
                                <svg
                                    viewBox="0 0 600 48"
                                    fill="none"
                                    className="h-full w-full max-w-2xl stroke-ocean/50"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        data-org-line
                                        d="M 300 0 L 300 24"
                                    />
                                    <path
                                        data-org-line
                                        d="M 90 24 L 510 24"
                                    />
                                    <path
                                        data-org-line
                                        d="M 90 24 L 90 48"
                                    />
                                    <path
                                        data-org-line
                                        d="M 300 24 L 300 48"
                                    />
                                    <path
                                        data-org-line
                                        d="M 510 24 L 510 48"
                                    />
                                </svg>
                            </div>

                            {/* Tingkat 3: Bidang-bidang dalam Baris */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {departments.map((dept) => (
                                    <div
                                        key={dept.id}
                                        className="rounded-card border border-line bg-white p-5 shadow-xs transition-colors hover:border-ocean/40"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <AvatarCircle
                                                name={dept.name}
                                                photo={dept.photo}
                                                size="sm"
                                            />
                                            <div className="min-w-0">
                                                <span className="block text-[10px] font-bold uppercase tracking-wider text-ocean">
                                                    {dept.position}
                                                </span>
                                                <h4 className="mt-0.5 truncate font-display text-sm font-bold text-navy">
                                                    {dept.name}
                                                </h4>
                                            </div>
                                        </div>
                                        {dept.bio ? (
                                            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate">
                                                {dept.bio}
                                            </p>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </Section>

            {/* 02 DAFTAR LENGKAP PENGURUS PUSAT (Daftar Baris, Bukan Kartu Seragam) */}
            {nonLeaders.length > 0 ? (
                <Section
                    index="02"
                    label="Daftar Pengurus"
                    tone="mist"
                    className="!py-16"
                >
                    <div className="grid gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                                Jajaran Pengurus Harian &amp; Bidang
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate">
                                Seluruh jajaran pengurus pusat periode {period}{' '}
                                yang menggerakkan program kerja dan layanan
                                keanggotaan nasional.
                            </p>
                        </div>

                        <div className="lg:col-span-8">
                            <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white shadow-soft">
                                {nonLeaders.map((member) => (
                                    <li
                                        key={member.id}
                                        className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-mist/35 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <AvatarCircle
                                                name={member.name}
                                                photo={member.photo}
                                                size="sm"
                                            />
                                            <div>
                                                <p className="font-display text-base font-bold text-navy">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs font-semibold text-ocean">
                                                    {member.position}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="self-start rounded-full border border-line bg-mist px-3 py-1 text-[11px] font-medium text-slate sm:self-center">
                                            {member.period || period}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Section>
            ) : null}

            {/* 03 SEKRETARIAT JENDERAL DPP */}
            <Section index="03" label="Sekretariat Pusat" tone="white" className="!py-14">
                <div className="rounded-card border border-line bg-mist/50 p-6 sm:p-8">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                                Kantor Sekretariat Jenderal DPP
                            </span>
                            <h3 className="mt-1 font-display text-xl font-bold text-navy">
                                Sekretariat Nasional NSA
                            </h3>
                            <p className="mt-2 flex items-start gap-2 text-sm text-slate">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                                <span>{hqAddress}</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleCopyAddress}
                                className={cx(
                                    'inline-flex min-h-[42px] items-center gap-2 rounded-control border border-line bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:text-ocean',
                                    focusRing
                                )}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        Tersalin
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5 text-ocean" />
                                        Salin Alamat
                                    </>
                                )}
                            </button>

                            <a
                                href="tel:+622187654321"
                                className={cx(
                                    'inline-flex min-h-[42px] items-center gap-2 rounded-control border border-line bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ocean hover:text-ocean',
                                    focusRing
                                )}
                            >
                                <Phone className="h-3.5 w-3.5 text-ocean" />
                                +62 21 8765 4321
                            </a>

                            <a
                                href="mailto:sekretariat@nsa.test"
                                className={cx(
                                    'inline-flex min-h-[42px] items-center gap-2 rounded-control border border-line bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ocean hover:text-ocean',
                                    focusRing
                                )}
                            >
                                <Mail className="h-3.5 w-3.5 text-ocean" />
                                sekretariat@nsa.test
                            </a>
                        </div>
                    </div>
                </div>
            </Section>
        </OrganizationLayout>
    );
}
