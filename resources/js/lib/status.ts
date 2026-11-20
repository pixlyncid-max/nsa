export type BadgeTone =
    'pending' | 'approved' | 'revision' | 'rejected' | 'info' | 'neutral';

interface StatusMeta {
    label: string;
    tone: BadgeTone;
}

/** Kunci sama dengan nilai Enum di backend (MembershipStatus, OrderStatus). */
export const statusMeta: Record<string, StatusMeta> = {
    non_member: { label: 'Bukan Anggota', tone: 'neutral' },
    draft: { label: 'Draft', tone: 'neutral' },
    pending: { label: 'Menunggu Verifikasi', tone: 'pending' },
    pending_review: { label: 'Menunggu Verifikasi', tone: 'pending' },
    revision: { label: 'Perlu Perbaikan', tone: 'revision' },
    awaiting_payment: { label: 'Menunggu Pembayaran', tone: 'pending' },
    pending_approval: { label: 'Menunggu Persetujuan', tone: 'info' },
    approved: { label: 'Disetujui', tone: 'approved' },
    rejected: { label: 'Ditolak', tone: 'rejected' },
    pending_payment: { label: 'Menunggu Bayar', tone: 'pending' },
    paid: { label: 'Dibayar', tone: 'info' },
    processing: { label: 'Diproses', tone: 'info' },
    shipped: { label: 'Dikirim', tone: 'revision' },
    completed: { label: 'Selesai', tone: 'approved' },
    cancelled: { label: 'Dibatalkan', tone: 'rejected' },
};
