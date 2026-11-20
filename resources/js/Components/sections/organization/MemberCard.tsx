import { cx } from '@/lib/cx';
import { Award, User } from 'lucide-react';

export interface OrgMemberItem {
    id: number;
    name: string;
    position: string;
    photo?: string | null;
    order?: number;
    period?: string | null;
    bio?: string | null;
}

interface MemberCardProps {
    member: OrgMemberItem;
    featured?: boolean;
    className?: string;
}

export default function MemberCard({
    member,
    featured = false,
    className,
}: MemberCardProps) {
    if (featured) {
        return (
            <div
                className={cx(
                    'duration-220 group relative overflow-hidden rounded-card border border-line bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-ocean/40 hover:shadow-lift md:p-8',
                    className
                )}
            >
                <div className="grid gap-6 md:grid-cols-12 md:items-center">
                    {/* Foto 1:1 Besar */}
                    <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-card border border-line bg-mist md:col-span-4 md:max-w-none">
                        {member.photo ? (
                            <img
                                src={member.photo}
                                alt={member.name}
                                className="h-full w-full object-cover grayscale-[30%] filter transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0"
                            />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-mist via-white to-line/50 text-slate">
                                <User
                                    size={56}
                                    className="text-sky/60 transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                        )}
                        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-navy/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aqua backdrop-blur-sm">
                            <Award size={12} />
                            Pimpinan
                        </span>
                    </div>

                    {/* Deskripsi & Jabatan */}
                    <div className="flex flex-col justify-center text-center md:col-span-8 md:text-left">
                        <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                            {member.position}
                        </span>
                        <h3 className="t-h2 mt-2 text-navy transition-colors group-hover:text-ocean">
                            {member.name}
                        </h3>
                        {member.period && (
                            <p className="mt-1 text-xs font-medium text-slate">
                                Periode Kepengurusan: {member.period}
                            </p>
                        )}
                        {member.bio && (
                            <p className="measure mt-3 text-sm leading-relaxed text-slate">
                                {member.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cx(
                'duration-220 group flex flex-col justify-between overflow-hidden rounded-card border border-line bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-ocean/40 hover:shadow-lift',
                className
            )}
        >
            <div>
                {/* Foto 1:1 Persegi */}
                <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-control border border-line bg-mist">
                    {member.photo ? (
                        <img
                            src={member.photo}
                            alt={member.name}
                            className="h-full w-full object-cover grayscale-[30%] filter transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-mist via-white to-line/50 text-slate">
                            <User
                                size={44}
                                className="text-sky/60 transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ocean">
                        {member.position}
                    </span>
                    <h4 className="mt-1 line-clamp-2 text-sm font-bold text-navy transition-colors group-hover:text-ocean">
                        {member.name}
                    </h4>
                    {member.period && (
                        <p className="mt-0.5 text-[11px] text-slate">
                            {member.period}
                        </p>
                    )}
                </div>
            </div>

            {member.bio && (
                <p className="mt-3 line-clamp-2 border-t border-line/60 pt-3 text-center text-xs text-slate">
                    {member.bio}
                </p>
            )}
        </div>
    );
}
