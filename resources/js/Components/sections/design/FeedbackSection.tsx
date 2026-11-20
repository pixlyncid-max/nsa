import DesignSection, {
    Specimen,
} from '@/Components/sections/design/DesignSection';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import Skeleton, { SkeletonText } from '@/Components/ui/Skeleton';
import Tabs from '@/Components/ui/Tabs';
import { useState } from 'react';
import { toast } from 'sonner';

const tabItems = [
    { id: 'semua', label: 'Semua', count: 48 },
    { id: 'pending', label: 'Menunggu', count: 6 },
    { id: 'disetujui', label: 'Disetujui', count: 40 },
    { id: 'arsip', label: 'Arsip', disabled: true },
];

export default function FeedbackSection() {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(4);

    return (
        <DesignSection
            id="umpan-balik"
            eyebrow="03 · Umpan balik"
            title="Modal, tab, kerangka, dan keadaan kosong"
        >
            <div className="grid gap-10 md:grid-cols-2">
                <Specimen label="Modal dan toast" className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={() => setOpen(true)}>
                            Buka modal
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => toast.success('Data tersimpan.')}
                        >
                            Toast sukses
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => toast.error('Gagal menyimpan.')}
                        >
                            Toast gagal
                        </Button>
                    </div>
                </Specimen>

                <Specimen label="Skeleton" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                            <SkeletonText lines={2} />
                        </div>
                    </div>
                </Specimen>
            </div>

            <Specimen label="Tabs">
                <Tabs items={tabItems} ariaLabel="Contoh tab status" />
            </Specimen>

            <Specimen label="Pagination">
                <Pagination page={page} lastPage={12} onChange={setPage} />
            </Specimen>

            <Specimen label="Empty state">
                <EmptyState
                    title="Belum ada pesanan"
                    description="Pesanan yang Anda buat akan muncul di sini."
                    action={<Button variant="secondary">Lihat produk</Button>}
                />
            </Specimen>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Kirim permohonan?"
                description="Data tidak bisa diubah setelah dikirim."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={() => setOpen(false)}>Kirim</Button>
                    </>
                }
            >
                <p className="text-sm text-slate">
                    Tim NSA akan memeriksa dalam 3 hari kerja.
                </p>
            </Modal>
        </DesignSection>
    );
}
