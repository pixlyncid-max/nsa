import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface EditPageProps {
    page: {
        id: number;
        slug: string;
        title: string;
        body: any;
    };
}

export default function PageEdit({ page }: EditPageProps) {
    const [title, setTitle] = useState(page.title);
    const [subtitle, setSubtitle] = useState(page.body?.subtitle || '');
    const [history, setHistory] = useState(page.body?.history || '');
    const [vision, setVision] = useState(page.body?.vision || '');
    const [missions, setMissions] = useState<string[]>(
        Array.isArray(page.body?.missions) ? page.body.missions : ['']
    );
    const [values, setValues] = useState<Array<{ title: string; desc: string }>>(
        Array.isArray(page.body?.values) ? page.body.values : []
    );
    const [legalities, setLegalities] = useState<Array<{ label: string; value: string }>>(
        Array.isArray(page.body?.legalities) ? page.body.legalities : []
    );
    const [submitting, setSubmitting] = useState(false);

    const handleAddMission = () => {
        setMissions([...missions, '']);
    };

    const handleMissionChange = (index: number, val: string) => {
        const next = [...missions];
        next[index] = val;
        setMissions(next);
    };

    const handleRemoveMission = (index: number) => {
        setMissions(missions.filter((_, i) => i !== index));
    };

    const handleAddValue = () => {
        setValues([...values, { title: '', desc: '' }]);
    };

    const handleValueChange = (index: number, field: 'title' | 'desc', val: string) => {
        const next = [...values];
        next[index] = { ...next[index], [field]: val };
        setValues(next);
    };

    const handleRemoveValue = (index: number) => {
        setValues(values.filter((_, i) => i !== index));
    };

    const handleAddLegality = () => {
        setLegalities([...legalities, { label: '', value: '' }]);
    };

    const handleLegalityChange = (index: number, field: 'label' | 'value', val: string) => {
        const next = [...legalities];
        next[index] = { ...next[index], [field]: val };
        setLegalities(next);
    };

    const handleRemoveLegality = (index: number) => {
        setLegalities(legalities.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const updatedBody = {
            ...page.body,
            subtitle,
            history,
            vision,
            missions: missions.filter((m) => m.trim().length > 0),
            ...(page.slug === 'tentang-kami' && {
                values: values.filter((v) => v.title.trim().length > 0),
                legalities: legalities.filter((l) => l.label.trim().length > 0),
            }),
        };

        router.put(
            `/admin/halaman/${page.id}`,
            {
                title,
                body: updatedBody,
            },
            {
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <AdminLayout title={`Edit Halaman: ${page.title}`}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/halaman"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Halaman
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                    <Card className="p-6 space-y-4">
                        <h3 className="font-display text-base font-bold text-navy">
                            Struktur Konten Halaman
                        </h3>

                        <Input
                            label="Judul Halaman"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <Input
                            label="Subjudul / Tagline Halaman"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                        />

                        <Textarea
                            label="Sejarah Pendirian & Latar Belakang"
                            value={history}
                            onChange={(e) => setHistory(e.target.value)}
                            rows={4}
                        />

                        <Textarea
                            label="Visi Organisasi"
                            value={vision}
                            onChange={(e) => setVision(e.target.value)}
                            rows={3}
                        />

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-semibold text-ink">
                                    Poin-Poin Misi Organisasi
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddMission}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:underline"
                                >
                                    <Plus className="h-3 w-3" /> Tambah Misi
                                </button>
                            </div>

                            <div className="space-y-2">
                                {missions.map((m, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className="h-10 flex-1 rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                            value={m}
                                            onChange={(e) => handleMissionChange(idx, e.target.value)}
                                            placeholder={`Misi ${idx + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMission(idx)}
                                            className="p-2 text-slate hover:text-danger transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {page.slug === 'tentang-kami' && (
                            <>
                                {/* Nilai-Nilai Organisasi */}
                                <div className="pt-4 border-t border-line">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-semibold text-ink">
                                            Nilai-Nilai Prinsip Organisasi
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddValue}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:underline"
                                        >
                                            <Plus className="h-3 w-3" /> Tambah Nilai
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {values.map((v, idx) => (
                                            <div key={idx} className="flex items-start gap-2 rounded-lg border border-line bg-mist/50 p-3">
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        className="h-10 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                                        value={v.title}
                                                        onChange={(e) => handleValueChange(idx, 'title', e.target.value)}
                                                        placeholder="Judul Nilai (mis. Keberlanjutan Ekosistem)"
                                                    />
                                                    <textarea
                                                        className="w-full rounded-control border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                                        value={v.desc}
                                                        onChange={(e) => handleValueChange(idx, 'desc', e.target.value)}
                                                        placeholder="Penjelasan ringkas nilai..."
                                                        rows={2}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveValue(idx)}
                                                    className="p-2 text-slate hover:text-danger transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Legalitas Hukum */}
                                <div className="pt-4 border-t border-line">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-semibold text-ink">
                                            Ketetapan & Dokumen Legalitas
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddLegality}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:underline"
                                        >
                                            <Plus className="h-3 w-3" /> Tambah Legalitas
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {legalities.map((l, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    className="h-10 w-1/3 rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                                    value={l.label}
                                                    onChange={(e) => handleLegalityChange(idx, 'label', e.target.value)}
                                                    placeholder="Nama Berkas (mis. SK Kemenkumham)"
                                                />
                                                <input
                                                    type="text"
                                                    className="h-10 flex-1 rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                                    value={l.value}
                                                    onChange={(e) => handleLegalityChange(idx, 'value', e.target.value)}
                                                    placeholder="Nomor Ketetapan / Keterangan"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLegality(idx)}
                                                    className="p-2 text-slate hover:text-danger transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4 border-t border-line flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                loading={submitting}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan Halaman
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
