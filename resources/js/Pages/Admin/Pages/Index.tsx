import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { Link } from '@inertiajs/react';
import { FileText, Edit, ExternalLink } from 'lucide-react';

interface PageItem {
    id: number;
    title: string;
    slug: string;
    updated_at: string;
}

interface PagesProps {
    pages: PageItem[];
}

export default function PagesIndex({ pages }: PagesProps) {
    return (
        <AdminLayout title="Halaman Statis">
            <div className="space-y-6">
                <div>
                    <h2 className="font-display text-xl font-bold text-navy">
                        Kelola Halaman Statis & Editorial
                    </h2>
                    <p className="text-sm text-slate">
                        Sunting konten editorial seperti Tentang Kami, Sejarah, Visi Misi, dan Legalitas
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {pages.map((p) => (
                        <Card key={p.id} className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="grid h-12 w-12 place-items-center rounded-xl bg-ocean/10 text-ocean">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-navy text-base">
                                        {p.title}
                                    </h3>
                                    <p className="font-mono text-xs text-slate">/{p.slug}</p>
                                    <span className="text-[11px] text-slate">Diperbarui: {p.updated_at}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`/${p.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-xs font-semibold text-slate hover:text-navy hover:bg-mist"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Lihat Publik
                                </a>
                                <Link
                                    href={`/admin/halaman/${p.id}/edit`}
                                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-navy px-3 text-xs font-semibold text-white hover:bg-navy/90"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    Edit Konten
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
