import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { router } from '@inertiajs/react';
import { Plus, Edit, Trash2, CreditCard, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface FeeItem {
    id: number;
    code: string;
    name: string;
    description: string | null;
    amount: string | number;
    type: 'one_time' | 'annual' | 'monthly';
    has_size_option: boolean;
    size_options: string[] | null;
    is_active: boolean;
    order: number;
    invoice_items_count: number;
}

interface FeeItemsProps {
    feeItems: FeeItem[];
}

export default function FeeItems({ feeItems }: FeeItemsProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FeeItem | null>(null);

    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | string>('');
    const [type, setType] = useState<'one_time' | 'annual' | 'monthly'>('one_time');
    const [hasSizeOption, setHasSizeOption] = useState(false);
    const [sizeOptionsStr, setSizeOptionsStr] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState<number>(0);

    const openCreate = () => {
        setEditingItem(null);
        setCode('');
        setName('');
        setDescription('');
        setAmount('');
        setType('one_time');
        setHasSizeOption(false);
        setSizeOptionsStr('S, M, L, XL, XXL');
        setIsActive(true);
        setOrder(feeItems.length);
        setModalOpen(true);
    };

    const openEdit = (item: FeeItem) => {
        setEditingItem(item);
        setCode(item.code);
        setName(item.name);
        setDescription(item.description || '');
        setAmount(item.amount);
        setType(item.type);
        setHasSizeOption(item.has_size_option);
        setSizeOptionsStr(Array.isArray(item.size_options) ? item.size_options.join(', ') : '');
        setIsActive(item.is_active);
        setOrder(item.order);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sizeOptions = hasSizeOption
            ? sizeOptionsStr.split(',').map((s) => s.trim()).filter(Boolean)
            : null;

        const payload = {
            code,
            name,
            description: description || null,
            amount: Number(amount),
            type,
            has_size_option: hasSizeOption,
            size_options: sizeOptions,
            is_active: isActive,
            order: Number(order),
        };

        if (editingItem) {
            router.put(`/admin/master-keanggotaan/biaya/${editingItem.id}`, payload, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/master-keanggotaan/biaya', payload, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, itemName: string) => {
        if (confirm(`Yakin ingin menghapus komponen biaya "${itemName}"?`)) {
            router.delete(`/admin/master-keanggotaan/biaya/${id}`);
        }
    };

    const formatCurrency = (val: string | number) => {
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    const getTypeBadge = (itemType: string) => {
        switch (itemType) {
            case 'one_time':
                return <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium">Sekali Bayar</span>;
            case 'annual':
                return <span className="px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700 font-medium">Tahunan</span>;
            case 'monthly':
                return <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 font-medium">Bulanan</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-xs bg-sand text-navy">{itemType}</span>;
        }
    };

    return (
        <AdminLayout title="Master Tarif & Iuran Keanggotaan">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-navy tracking-tight font-display">
                                Tarif & Iuran Keanggotaan NSA
                            </h2>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                                <ShieldCheck className="w-3.5 h-3.5" /> Superadmin
                            </span>
                        </div>
                        <p className="text-sm text-steel mt-0.5">
                            Komponen biaya resmi pendaftaran, atribut resmi (rompi/seragam), dan iuran wajib tahunan asosiasi.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Komponen Biaya
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-sand/30 border-b border-sand text-navy font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Kode</th>
                                    <th className="px-4 py-3">Nama Biaya</th>
                                    <th className="px-4 py-3">Nominal Resmi</th>
                                    <th className="px-4 py-3">Periode</th>
                                    <th className="px-4 py-3 text-center">Opsi Ukuran</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sand/40">
                                {feeItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-steel">
                                            Belum ada komponen biaya terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    feeItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-sand/15 transition-colors">
                                            <td className="px-4 py-3 text-steel font-mono text-xs">{item.code}</td>
                                            <td className="px-4 py-3 font-medium text-navy">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-ocean shrink-0" />
                                                    <div>
                                                        <div>{item.name}</div>
                                                        {item.description && (
                                                            <div className="text-xs text-steel font-normal truncate max-w-xs">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-navy">
                                                {formatCurrency(item.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getTypeBadge(item.type)}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs">
                                                {item.has_size_option ? (
                                                    <span className="text-ocean font-medium">
                                                        Ya ({Array.isArray(item.size_options) ? item.size_options.join(', ') : '-'})
                                                    </span>
                                                ) : (
                                                    <span className="text-steel">Tidak</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                                        <XCircle className="w-3.5 h-3.5" /> Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    <Edit className="w-3.5 h-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    disabled={item.invoice_items_count > 0}
                                                    title={item.invoice_items_count > 0 ? 'Biaya ini sudah digunakan pada tagihan' : 'Hapus'}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Modal Form Tambah / Edit */}
                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={editingItem ? 'Edit Komponen Biaya NSA' : 'Tambah Komponen Biaya NSA'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Kode Unik"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                placeholder="mis: registration_fee"
                                required
                            />
                            <Select
                                label="Tipe Pembayaran"
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                options={[
                                    { value: 'one_time', label: 'Sekali Bayar (Pendaftaran)' },
                                    { value: 'annual', label: 'Tahunan (Iuran Wajib)' },
                                    { value: 'monthly', label: 'Bulanan' },
                                ]}
                                required
                            />
                        </div>

                        <Input
                            label="Nama Komponen Biaya"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Uang Pangkal & Registrasi Anggota"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Nominal (Rp)"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="150000"
                                required
                            />
                            <Input
                                label="Nomor Urutan Tampil"
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))}
                                placeholder="1"
                            />
                        </div>

                        <Textarea
                            label="Deskripsi / Catatan Rincian"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Penjelasan komponen biaya ini untuk calon anggota..."
                            rows={2}
                        />

                        <div className="space-y-3 pt-2 border-t border-sand">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="fee_has_size"
                                    checked={hasSizeOption}
                                    onChange={(e) => setHasSizeOption(e.target.checked)}
                                    className="rounded border-sand text-ocean focus:ring-ocean"
                                />
                                <label htmlFor="fee_has_size" className="text-sm font-medium text-navy cursor-pointer">
                                    Memerlukan Pilihan Ukuran (Atribut Rompi/Seragam)
                                </label>
                            </div>

                            {hasSizeOption && (
                                <Input
                                    label="Daftar Ukuran (Pisahkan dengan koma)"
                                    value={sizeOptionsStr}
                                    onChange={(e) => setSizeOptionsStr(e.target.value)}
                                    placeholder="S, M, L, XL, XXL, 3XL"
                                />
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="fee_is_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-sand text-ocean focus:ring-ocean"
                                />
                                <label htmlFor="fee_is_active" className="text-sm font-medium text-navy cursor-pointer">
                                    Status Aktif (Dihitung ke dalam tagihan pendaftar)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-sand">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingItem ? 'Simpan Perubahan' : 'Tambahkan Komponen'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
