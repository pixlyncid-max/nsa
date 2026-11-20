<?php

namespace App\Enums;

enum MembershipStatus: string
{
    case NonMember = 'non_member';
    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case Revision = 'revision';
    case AwaitingPayment = 'awaiting_payment';
    case PendingApproval = 'pending_approval';
    case Approved = 'approved';
    case Rejected = 'rejected';

    /**
     * Label status dalam Bahasa Indonesia untuk tampilan UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::NonMember => 'Bukan Anggota',
            self::Draft => 'Draft',
            self::PendingReview => 'Menunggu Verifikasi Awal',
            self::Revision => 'Perlu Perbaikan',
            self::AwaitingPayment => 'Menunggu Pembayaran',
            self::PendingApproval => 'Menunggu Persetujuan Akhir',
            self::Approved => 'Disetujui',
            self::Rejected => 'Ditolak',
        };
    }

    /**
     * Token warna badge untuk komponen UI / StatusBadge.
     */
    public function color(): string
    {
        return match ($this) {
            self::NonMember => 'neutral',
            self::Draft => 'neutral',
            self::PendingReview => 'warning',
            self::Revision => 'sky',
            self::AwaitingPayment => 'warning',
            self::PendingApproval => 'info',
            self::Approved => 'success',
            self::Rejected => 'danger',
        };
    }
}
