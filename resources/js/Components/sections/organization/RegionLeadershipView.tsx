import ArchImage from '@/Components/layout/ArchImage';
import type { OrgMemberItem } from '@/Components/sections/organization/MemberCard';
import { focusRing } from '@/lib/ui';
import { cx } from '@/lib/cx';
import { Award, Building2, Check, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface RegionOrganizationData {
    id: number;
    name: string;
    address: string;
    phone?: string | null;
    email?: string | null;
    period?: string | null;
    members: OrgMemberItem[];
}

interface RegionLeadershipViewProps {
    level: 'DPW' | 'DPC';
    regionName: string;
    data: RegionOrganizationData;
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

/**
 * Tampilan hasil bersama untuk DPW dan DPC:
 * - Info sekretariat + tombol salin alamat
 * - Potret Ketua besar berbentuk lengkung atas (ArchImage)
 * - Pengurus lain dalam daftar baris dengan foto lingkaran kecil
 */
export default function RegionLeadershipView({
    level,
    regionName,
    data,
}: RegionLeadershipViewProps) {
    const [copied, setCopied] = useState(false);

    const leader =
        data.members.find(
            (m) => m.position.toLowerCase().includes('ketua') || m.order === 1
        ) ?? data.members[0];

    const otherMembers = data.members.filter((m) => m.id !== leader?.id);

    const handleCopyAddress = async () => {
        if (!data.address) return;
        try {
            await navigator.clipboard.writeText(data.address);
            setCopied(true);
            toast.success('Alamat sekretariat disalin ke papan klip.');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Tidak dapat menyalin alamat secara otomatis.');
        }
    };

    return (
        <div className="space-y-8">
            {/* Kartu Sekretariat & Kontak */}
            <div className="rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ocean">
                                <Building2 className="h-3.5 w-3.5" />
                                {level} Aktif
                            </span>
                            {data.period ? (
                                <span className="rounded-full border border-line bg-mist px-3 py-1 text-[11px] font-semibold text-slate">
                                    Periode {data.period}
                                </span>
                            ) : null}
                        </div>

                        <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                            {data.name}
                        </h2>

                        {data.address ? (
                            <div className="flex flex-wrap items-start gap-2 pt-1 text-sm text-slate">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                                <span className="max-w-xl leading-relaxed">
                                    {data.address}
                                </span>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {data.address ? (
                            <button
                                type="button"
                                onClick={handleCopyAddress}
                                className={cx(
                                    'inline-flex min-h-[42px] items-center gap-2 rounded-control border border-line bg-mist px-4 py-2 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-white hover:text-ocean',
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
                        ) : null}

                        {data.phone ? (
                            <a
                                href={`tel:${data.phone.replace(/\s+/g, '')}`}
                                className={cx(
                                    'inline-flex min-h-[42px] items-center gap-2 rounded-control border border-line bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ocean hover:text-ocean',
                                    focusRing
                                )}
                            >
                                <Phone className="h-3.5 w-3.5 text-ocean" />
                                {data.phone}
                            </a>
                        ) : null}

                        {data.email ? (
                            <a
                                href={`mailto:${data.email}`}
                                className={cx(
                                    'inline-flex min-h-[42px] items-center gap-2 rounded-control border border-line bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ocean hover:text-ocean',
                                    focusRing
                                )}
                            >
                                <Mail className="h-3.5 w-3.5 text-ocean" />
                                {data.email}
                            </a>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Potret Ketua Besar (ArchImage) */}
            {leader ? (
                <div className="overflow-hidden rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
                    <div className="grid items-center gap-8 md:grid-cols-12">
                        <div className="mx-auto w-full max-w-[240px] md:col-span-4 md:max-w-none">
                            <ArchImage
                                src={leader.photo}
                                alt={`${leader.name}, ${leader.position}`}
                                aspectRatio="aspect-[4/5]"
                                className="shadow-soft"
                            />
                        </div>

                        <div className="md:col-span-8">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ocean">
                                <Award className="h-4 w-4 text-aqua" />
                                {leader.position}
                            </span>

                            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                                {leader.name}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-slate">
                                Pimpinan {level} {regionName}
                                {leader.period || data.period
                                    ? ` · Masa Bakti ${leader.period || data.period}`
                                    : ''}
                            </p>

                            {leader.bio ? (
                                <p className="measure mt-4 text-sm leading-relaxed text-slate sm:text-base">
                                    {leader.bio}
                                </p>
                            ) : (
                                <p className="measure mt-4 text-sm leading-relaxed text-slate">
                                    Mengkoordinasikan pembinaan pembudidaya, kemitraan rantai pasok, serta layanan pendampingan anggota di wilayah {regionName}.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Pengurus Lain dalam Daftar Baris */}
            {otherMembers.length > 0 ? (
                <div className="overflow-hidden rounded-card border border-line bg-white shadow-soft">
                    <div className="border-b border-line bg-mist/60 px-6 py-4">
                        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                            Susunan Pengurus {level} ({otherMembers.length})
                        </h3>
                    </div>

                    <ul className="divide-y divide-line">
                        {otherMembers.map((member) => (
                            <li
                                key={member.id}
                                className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-mist/35 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    {member.photo ? (
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            loading="lazy"
                                            className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
                                        />
                                    ) : (
                                        <div
                                            aria-hidden="true"
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ocean/20 bg-ocean/10 font-display text-sm font-bold text-navy"
                                        >
                                            {getInitials(member.name)}
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-display text-base font-bold text-navy">
                                            {member.name}
                                        </p>
                                        <p className="text-xs font-semibold text-ocean">
                                            {member.position}
                                        </p>
                                    </div>
                                </div>

                                {member.period || data.period ? (
                                    <span className="self-start rounded-full border border-line bg-mist px-3 py-1 text-[11px] font-medium text-slate sm:self-center">
                                        {member.period || data.period}
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
