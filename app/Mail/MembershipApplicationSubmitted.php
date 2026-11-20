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

class MembershipApplicationSubmitted extends Mailable
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
        $subject = app(CopyService::class)->get('emails.application_submitted.subject', ['brand' => $brandShort], $locale);

        return new Envelope(
            subject: $subject ?: "Konfirmasi Pendaftaran Anggota {$brandShort} - Berkas Diterima",
        );
    }

    public function content(): Content
    {
        $locale = $this->resolveLocale();
        $copy = app(CopyService::class);
        $brandName = e(Brand::name());
        $brandShort = e(Brand::shortName());
        $supportEmail = e(Brand::supportEmail());

        $subtitle = e($copy->get('emails.application_submitted.subtitle', [], $locale));
        $body = e($copy->get('emails.application_submitted.body', ['brand' => Brand::shortName()], $locale));
        $ctaLabel = e($copy->get('emails.application_submitted.cta', [], $locale));
        $salutation = $locale === 'en' ? 'Hello' : 'Halo';
        $contactNote = $locale === 'en'
            ? "If you have further questions, please contact our secretariat team at {$supportEmail}."
            : "Apabila ada pertanyaan lebih lanjut, silakan hubungi tim sekretariat kami di {$supportEmail}.";

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
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="'.url('/akun/keanggotaan').'" style="display: inline-block; background-color: #056ED4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">'.$ctaLabel.'</a>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">'.$contactNote.'</p>
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
