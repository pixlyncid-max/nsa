import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, 
    Users, 
    TrendingUp, 
    Handshake, 
    Cpu, 
    Building2, 
    CheckCircle2, 
    Sparkles, 
    HelpCircle 
} from 'lucide-react';

interface ProgramCategoryCard {
    category: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface Step6Props {
    data: {
        interests?: string[];
        note?: string;
        [key: string]: any;
    };
    onChange: (data: any) => void;
    errors?: Record<string, string>;
    [key: string]: any;
}

const PROGRAM_CARDS: ProgramCategoryCard[] = [
    {
        category: 'pelatihan',
        title: 'Pelatihan & Workshop',
        description: 'Bimbingan teknis budidaya, manajemen kualitas air, manajemen pakan, dan biosecurity terkini.',
        icon: GraduationCap,
    },
    {
        category: 'pendampingan',
        title: 'Pendampingan Teknis Farm',
        description: 'Konsultasi berkala dengan pakar dan praktisi budidaya berpengalaman langsung ke fasilitas Anda.',
        icon: Users,
    },
    {
        category: 'informasi_pasar',
        title: 'Informasi & Intelijen Pasar',
        description: 'Pembaruan data tren harga komoditas perikanan regional/nasional dan proyeksi permintaan pasar.',
        icon: TrendingUp,
    },
    {
        category: 'akses_kemitraan',
        title: 'Akses Kemitraan & Permodalan',
        description: 'Penghubung strategis ke off-taker terpercaya, lembaga perbankan, dan investor budidaya.',
        icon: Handshake,
    },
    {
        category: 'teknologi_budidaya',
        title: 'Teknologi & Inovasi Budidaya',
        description: 'Pengenalan sensor kualitas air digital, bioflok modern, dan sistem aerasi hemat energi.',
        icon: Cpu,
    },
    {
        category: 'pengembangan_usaha',
        title: 'Pengembangan Skala Usaha',
        description: 'Bantuan sertifikasi resmi (CBIB, CPIB, NIB), standardisasi ekspor, dan manajemen bisnis perikanan.',
        icon: Building2,
    },
];

export default function Step6ProgramInterests({
    data = {},
    onChange,
    errors = {},
}: Step6Props) {
    const selectedInterests = Array.isArray(data.interests) ? data.interests : [];

    const handleToggleInterest = (category: string) => {
        const next = selectedInterests.includes(category)
            ? selectedInterests.filter((c) => c !== category)
            : [...selectedInterests, category];

        onChange({
            ...data,
            interests: next,
        });
    };

    const handleNoteChange = (val: string) => {
        onChange({
            ...data,
            note: val,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Subjudul */}
            <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-semibold text-foreground">
                    Kebutuhan dan Minat Program NSA
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Pilih program kerja yang relevan dengan kebutuhan usaha Anda. Anda dapat memilih lebih dari satu program.
                </p>
            </div>

            {/* Grid Kartu Minat Program */}
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROGRAM_CARDS.map((card) => {
                        const Icon = card.icon;
                        const isSelected = selectedInterests.includes(card.category);

                        return (
                            <motion.button
                                key={card.category}
                                type="button"
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleToggleInterest(card.category)}
                                className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                                        : 'border-border/70 bg-card hover:border-border hover:bg-muted/30'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>

                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                >
                                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <h4 className="text-xs font-semibold text-foreground mb-1">
                                        {card.title}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {errors.interests && (
                    <p className="text-xs text-danger mt-2">{errors.interests}</p>
                )}
            </div>

            {/* Kolom Catatan Tambahan */}
            <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-2 shadow-sm max-w-2xl">
                <label className="block text-xs font-medium text-foreground">
                    Catatan atau Kebutuhan Program Spesifik (Opsional)
                </label>
                <textarea
                    rows={3}
                    maxLength={1000}
                    value={data.note || ''}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Tuliskan jika Anda membutuhkan topik pelatihan tertentu, kendala penyakit udang yang sedang dihadapi, atau fasilitas kemitraan lainnya..."
                    className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span>Maksimum 1000 karakter.</span>
                    <span>{(data.note || '').length} / 1000</span>
                </div>
                {errors.note && (
                    <p className="text-xs text-danger mt-1">{errors.note}</p>
                )}
            </div>
        </div>
    );
}
