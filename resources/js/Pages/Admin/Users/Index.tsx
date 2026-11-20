import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Modal from '@/Components/ui/Modal';
import Badge from '@/Components/ui/Badge';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { useState } from 'react';
import { Plus, Edit, Trash2, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';

interface AdminUserItem {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    created_at: string;
}

interface AdminUsersProps {
    users: AdminUserItem[];
}

export default function AdminUsersIndex({ users }: AdminUsersProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUserId = auth.user?.id;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('admin');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const openCreate = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setPhone('');
        setRole('admin');
        setPassword('');
        setPasswordConfirmation('');
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (u: AdminUserItem) => {
        setEditingUser(u);
        setName(u.name);
        setEmail(u.email);
        setPhone(u.phone || '');
        setRole(u.role);
        setPassword('');
        setPasswordConfirmation('');
        setErrors({});
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const payload: Record<string, any> = {
            name,
            email,
            phone: phone || null,
            role,
        };

        if (password) {
            payload.password = password;
            payload.password_confirmation = passwordConfirmation;
        }

        if (editingUser) {
            router.put(`/admin/kelola-admin/${editingUser.id}`, payload, {
                onError: (errs) => setErrors(errs),
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/kelola-admin', payload, {
                onError: (errs) => setErrors(errs),
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, userName: string) => {
        if (confirm(`Hapus akun pengelola "${userName}"?`)) {
            router.delete(`/admin/kelola-admin/${id}`);
        }
    };

    return (
        <AdminLayout title="Kelola Akun Admin (Khusus Superadmin)">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">
                                Hak Akses Superadmin
                            </span>
                        </div>
                        <h2 className="font-display text-xl font-bold text-navy mt-1">
                            Manajemen Akun Pengelola & Staf
                        </h2>
                        <p className="text-sm text-slate">
                            Atur izin staf CMS (Admin) dan pemilik sistem (Superadmin)
                        </p>
                    </div>
                    <Button variant="primary" size="md" onClick={openCreate}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Akun Admin
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line bg-mist text-xs font-semibold uppercase text-slate">
                                <tr>
                                    <th className="px-4 py-3.5">Nama Staf</th>
                                    <th className="px-4 py-3.5">Email & Kontak</th>
                                    <th className="px-4 py-3.5">Peran / Role</th>
                                    <th className="px-4 py-3.5">Terdaftar Sejak</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {users.map((u) => (
                                    <tr key={u.id} className="h-16 transition hover:bg-mist/70">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-10 w-10 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-ink">
                                                        {u.name}{' '}
                                                        {u.id === currentUserId && (
                                                            <span className="text-xs text-slate font-normal">(Anda)</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-ink">{u.email}</div>
                                            <div className="text-xs text-slate">{u.phone || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.role === 'superadmin' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-0.5 text-xs font-bold text-white">
                                                    <ShieldCheck className="h-3.5 w-3.5 text-aqua" /> Superadmin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-0.5 text-xs font-bold text-ocean border border-line">
                                                    <UserCheck className="h-3.5 w-3.5 text-ocean" /> Admin CMS
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate">
                                            {u.created_at}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink hover:bg-mist"
                                                >
                                                    <Edit className="h-3.5 w-3.5" /> Edit
                                                </button>
                                                {u.id !== currentUserId && (
                                                    <button
                                                        onClick={() => handleDelete(u.id, u.name)}
                                                        className="inline-flex h-8 items-center rounded-lg border border-line px-2 text-xs font-semibold text-danger hover:bg-danger/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal Tambah/Edit Admin */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingUser ? 'Edit Akun Pengelola' : 'Tambah Akun Admin Baru'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="p-1">
                    <div className="space-y-4">
                        <Input
                            label="Nama Lengkap"
                            placeholder="Contoh: Siti Rahmawati"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={errors.name}
                            required
                        />

                        <Input
                            label="Alamat Email"
                            type="email"
                            placeholder="siti@nsa.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Nomor WhatsApp"
                            placeholder="+62 812-..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            error={errors.phone}
                        />

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Hak Akses (Role)
                            </label>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="admin">Admin (Verifikasi, Produk, Pesanan, Pos, Organisasi)</option>
                                <option value="superadmin">Superadmin (Akses Penuh + Akun & Pengaturan)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label={editingUser ? 'Password Baru (Kosongkan bila tetap)' : 'Password'}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                required={!editingUser}
                            />

                            <Input
                                label="Konfirmasi Password"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required={!editingUser || !!password}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" size="md">
                            Simpan Akun
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
