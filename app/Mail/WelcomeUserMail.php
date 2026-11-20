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

class WelcomeUserMail extends Mailable
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
        $subject = app(CopyService::class)->get('emails.welcome.subject', ['brand' => $brandShort], $locale);

        return new Envelope(
            subject: $subject ?: "Selamat Datang di {$brandShort}! Mulai Langkah Anda",
        );
    }

    public function content(): Content
    {
        $locale = $this->resolveLocale();
        $copy = app(CopyService::class);
        $brandName = e(Brand::name());
        $brandShort = e(Brand::shortName());
        $supportEmail = e(Brand::supportEmail());
        $registerMemberUrl = url('/akun/keanggotaan/daftar');

        $subtitle = e($copy->get('emails.welcome.subtitle', [], $locale));
        $greeting = e($copy->get('emails.welcome.greeting', ['name' => $this->user->name], $locale));
        $bodyHtml = $copy->get('emails.welcome.body', [], $locale);
        $ctaLabel = e($copy->get('emails.welcome.cta', [], $locale));
        $footnote = e($copy->get('emails.welcome.footnote', [], $locale));
        $footerPrefix = $locale === 'en' ? 'DPP Secretariat' : 'Sekretariat DPP';

        return new Content(
            htmlString: '
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #014081; margin: 0;">'.$brandName.'</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">'.$subtitle.'</p>
                </div>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                    <p><strong>'.$greeting.'</strong></p>
                    <div>'.$bodyHtml.'</div>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="'.$registerMemberUrl.'" style="display: inline-block; background-color: #056ED4; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">'.$ctaLabel.'</a>
                    </div>
                    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">'.$footnote.'</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">'.$footerPrefix.' '.$brandShort.' &bull; '.$supportEmail.'</p>
                </div>
            </div>',
        );
    }

    private function resolveLocale(): string
    {
        return $this->locale ?: ($this->user->locale ?: app()->getLocale());
    }
}
