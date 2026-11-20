<?php

namespace App\Mail;

use App\Models\User;
use App\Services\CopyService;
use App\Support\Brand;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemberApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user
    ) {
        $this->locale($this->user->locale ?: app()->getLocale());
    }

    public function envelope(): Envelope
    {
        $locale = $this->resolveLocale();
        $brandShort = Brand::shortName();
        $subject = app(CopyService::class)->get('emails.approved.subject', ['brand' => $brandShort], $locale);

        return new Envelope(
            subject: $subject ?: "Selamat! Pendaftaran Keanggotaan {$brandShort} Anda Telah Disetujui",
        );
    }

    public function content(): Content
    {
        $locale = $this->resolveLocale();
        $copy = app(CopyService::class);
        $brandName = e(Brand::name());
        $brandShort = e(Brand::shortName());
        $supportEmail = e(Brand::supportEmail());

        $subtitle = e($copy->get('emails.approved.subtitle', [], $locale));
        $body = e($copy->get('emails.approved.body', ['brand' => Brand::shortName()], $locale));
        $ctaLabel = e($copy->get('emails.approved.cta', [], $locale));
        $salutation = $locale === 'en' ? 'Hello' : 'Halo';
        $ntaLabel = $locale === 'en' ? 'Official Member Number' : 'Nomor Tanda Anggota (NTA) Resmi';
        $footerPrefix = $locale === 'en' ? 'DPP Secretariat' : 'Sekretariat DPP';

        return new Content(
            htmlString: '
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #014081; margin: 0;">'.$brandName.'</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">'.$subtitle.'</p>
                </div>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                    <p>'.$salutation.', <strong>'.e($this->user->name).'</strong>,</p>
                    <p>'.$body.'</p>
                    <div style="background-color: #ffffff; border: 2px dashed #056ED4; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                        <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">'.$ntaLabel.'</span>
                        <div style="font-size: 24px; font-weight: bold; color: #014081; margin-top: 6px;">'.e($this->user->member_number).'</div>
                    </div>
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="'.url('/akun/keanggotaan').'" style="display: inline-block; background-color: #056ED4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">'.$ctaLabel.'</a>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">'.$footerPrefix.' '.$brandShort.' &bull; '.$supportEmail.'</p>
                </div>
            </div>
            ',
        );
    }

    private function resolveLocale(): string
    {
        return $this->locale ?: ($this->user->locale ?: app()->getLocale());
    }
}
