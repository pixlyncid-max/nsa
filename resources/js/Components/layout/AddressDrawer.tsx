import Button from '@/Components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { focusRing } from '@/lib/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MapPin, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface AddressData {
    recipient_name: string;
    phone: string;
    province_id: number | null;
    province_name: string;
    regency_id: number | null;
    regency_name: string;
    postal_code: string;
    address: string;
}

interface RegionOption {
    id: number;
    name: string;
}

export function openAddressDrawer() {
    window.dispatchEvent(new CustomEvent('nsa:open-address-drawer'));
}

export default function AddressDrawer() {
    const reduced = usePrefersReducedMotion();
    const [open, setOpen] = useState(false);
    const [address, setAddress] = useState<AddressData>({
        recipient_name: '',
        phone: '',
        province_id: null,
        province_name: '',
        regency_id: null,
        regency_name: '',
        postal_code: '',
        address: '',
    });
    const [provinces, setProvinces] = useState<RegionOption[]>([]);
    const [regencies, setRegencies] = useState<RegionOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener('nsa:open-address-drawer', handleOpen);
        return () => window.removeEventListener('nsa:open-address-drawer', handleOpen);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    const fetchRegencies = async (provinceId: number) => {
        try {
            const res = await fetch(`/api/regions/regencies?province_id=${provinceId}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const data = await res.json();
                setRegencies(data || []);
            }
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        if (!open) return;
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            setLoading(true);
            try {
                const [addrRes, provRes] = await Promise.all([
                    fetch('/akun/api/alamat', {
                        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    }),
                    fetch('/api/regions/provinces', {
                        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    }),
                ]);

                if (!isMounted) return;

                if (provRes.ok) {
                    const provData = await provRes.json();
                    if (isMounted) setProvinces(provData || []);
                }

                if (addrRes.ok) {
                    const addrData = await addrRes.json();
                    if (isMounted) {
                        setAddress(addrData);
                        if (addrData.province_id) {
                            fetchRegencies(addrData.province_id);
                        }
                    }
                }
            } catch {
                if (isMounted) toast.error('Gagal memuat data alamat');
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [open]);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provId = e.target.value ? Number(e.target.value) : null;
        setAddress((prev) => ({
            ...prev,
            province_id: provId,
            regency_id: null,
        }));
        if (provId) {
            fetchRegencies(provId);
        } else {
            setRegencies([]);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/akun/api/alamat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(address),
            });

            const result = await res.json();
            if (res.ok) {
                toast.success(result.message || 'Alamat pengiriman berhasil disimpan');
            } else {
                toast.error(result.message || 'Gagal menyimpan alamat');
            }
        } catch {
            toast.error('Terjadi kesalahan saat menyimpan alamat');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] overflow-hidden font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Drawer Slide-over Panel */}
                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
                        <motion.aside
                            initial={{ x: reduced ? 0 : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: reduced ? 0 : '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 28,
                                stiffness: 300,
                            }}
                            className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-line"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="address-drawer-title"
                        >
                            {/* Header Mandiri */}
                            <div className="p-5 border-b border-line bg-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-navy/5 text-navy flex items-center justify-center font-display font-bold">
                                        <MapPin className="w-5 h-5 text-ocean" />
                                    </div>
                                    <div>
                                        <h2
                                            id="address-drawer-title"
                                            className="font-display font-bold text-lg text-navy tracking-tight leading-none"
                                        >
                                            Alamat Pengiriman
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Kelola alamat tujuan pemesanan produk Anda
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className={`p-2 text-slate-400 hover:text-navy hover:bg-mist rounded-control transition-colors ${focusRing}`}
                                    aria-label="Tutup panel"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body Form */}
                            <div className="flex-1 overflow-y-auto p-5">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin text-ocean mb-2" />
                                        <p className="text-sm">Memuat data alamat...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSaveAddress} className="space-y-4">
                                        <div className="p-3 bg-mist rounded-xl border border-line text-xs text-slate-600 leading-relaxed">
                                            Alamat ini akan otomatis digunakan saat Anda melakukan checkout produk perikanan di NSA.
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                                                Nama Penerima
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={address.recipient_name}
                                                onChange={(e) =>
                                                    setAddress({
                                                        ...address,
                                                        recipient_name: e.target.value,
                                                    })
                                                }
                                                placeholder="Nama lengkap penerima"
                                                className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-slate-400 ${focusRing}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                                                Nomor Telepon / WhatsApp
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={address.phone}
                                                onChange={(e) =>
                                                    setAddress({ ...address, phone: e.target.value })
                                                }
                                                placeholder="Contoh: 081234567890"
                                                className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-slate-400 ${focusRing}`}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                                                    Provinsi
                                                </label>
                                                <select
                                                    value={address.province_id || ''}
                                                    onChange={handleProvinceChange}
                                                    className={`w-full rounded-control border border-line bg-white px-3 py-2 text-sm text-ink ${focusRing}`}
                                                >
                                                    <option value="">-- Pilih Provinsi --</option>
                                                    {provinces.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                                                    Kabupaten / Kota
                                                </label>
                                                <select
                                                    value={address.regency_id || ''}
                                                    disabled={!address.province_id}
                                                    onChange={(e) =>
                                                        setAddress({
                                                            ...address,
                                                            regency_id: e.target.value
                                                                ? Number(e.target.value)
                                                                : null,
                                                        })
                                                    }
                                                    className={`w-full rounded-control border border-line bg-white px-3 py-2 text-sm text-ink disabled:bg-mist disabled:text-slate-400 ${focusRing}`}
                                                >
                                                    <option value="">-- Pilih Kota/Kab --</option>
                                                    {regencies.map((r) => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                                                Alamat Lengkap (Jalan, RT/RW, Patokan)
                                            </label>
                                            <textarea
                                                rows={3}
                                                required
                                                value={address.address}
                                                onChange={(e) =>
                                                    setAddress({
                                                        ...address,
                                                        address: e.target.value,
                                                    })
                                                }
                                                placeholder="Jl. Bahari No. 12, RT 02/05..."
                                                className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-slate-400 ${focusRing}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                                                Kode Pos
                                            </label>
                                            <input
                                                type="text"
                                                value={address.postal_code}
                                                onChange={(e) =>
                                                    setAddress({
                                                        ...address,
                                                        postal_code: e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: 16110"
                                                className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-slate-400 ${focusRing}`}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={saving}
                                            className="w-full mt-2"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Menyimpan Alamat...
                                                </>
                                            ) : (
                                                'Simpan Alamat Pengiriman'
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </motion.aside>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
