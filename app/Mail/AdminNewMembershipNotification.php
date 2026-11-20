<?php

namespace App\Mail;

use App\Models\User;
use App\Support\Brand;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNewMembershipNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $applicant
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $brandShort = Brand::shortName();

        return new Envelope(
            subject: "[Pemberitahuan Admin] Pengajuan Anggota Baru {$brandShort}: ".($this->applicant->business?->name ?? $this->applicant->name),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $applicantName = e($this->applicant->name);
        $businessName = e($this->applicant->business?->name ?? '-');
        $planName = e($this->applicant->application?->plan?->name ?? '-');
        $adminUrl = url('/admin/keanggotaan');
        $brandName = e(Brand::name());
        $brandShort = e(Brand::shortName());

        return new Content(
            htmlString: '
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #014081; margin: 0;">'.$brandShort.' Admin Notification</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Pendaftaran Anggota Baru Perlu Verifikasi</p>
                </div>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                    <p>Halo Administrator '.$brandShort.',</p>
                    <p>Terdapat pengajuan pendaftaran anggota baru yang telah melengkapi seluruh persyaratan pendaftaran dan siap untuk diverifikasi:</p>
                    <ul style="line-height: 1.8;">
                        <li><strong>Nama Pemohon:</strong> '.$applicantName.'</li>
                        <li><strong>Nama Usaha:</strong> '.$businessName.'</li>
                        <li><strong>Paket Keanggotaan:</strong> '.$planName.'</li>
                        <li><strong>Waktu Pengajuan:</strong> '.now()->translatedFormat('d F Y H:i').' WIB</li>
                    </ul>
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="'.$adminUrl.'" style="display: inline-block; background-color: #014081; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Buka Panel Verifikasi Admin</a>
                    </div>
                </div>
            </div>
            ',
        );
    }
}
