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

class MemberRevisionRequestedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<string, string>|string  $notes
     */
    public function __construct(
        public User $user,
        public array|string $notes
    ) {
        $this->locale($this->user->locale ?: app()->getLocale());
    }

    public function envelope(): Envelope
    {
        $locale = $this->resolveLocale();
        $brandShort = Brand::shortName();
        $subject = app(CopyService::class)->get('emails.revision.subject', ['brand' => $brandShort], $locale);

        return new Envelope(
            subject: $subject ?: "Perlu Revisi: Pendaftaran Keanggotaan {$brandShort} Anda",
        );
    }

    public function content(): Content
    {
        $locale = $this->resolveLocale();
        $copy = app(CopyService::class);
        $brandName = e(Brand::name());
        $brandShort = e(Brand::shortName());
        $supportEmail = e(Brand::supportEmail());

        $subtitle = e($copy->get('emails.revision.subtitle', [], $locale));
        $body = e($copy->get('emails.revision.body', ['brand' => Brand::shortName()], $locale));
        $ctaLabel = e($copy->get('emails.revision.cta', [], $locale));
        $salutation = $locale === 'en' ? 'Hello' : 'Halo';
        $notesHeading = $locale === 'en' ? 'Verifier Notes:' : 'Catatan Verifikator:';
        $footerPrefix = $locale === 'en' ? 'DPP Secretariat' : 'Sekretariat DPP';

        $notesHtml = '';
        if (is_array($this->notes)) {
            $notesHtml .= '<ul style="color: #b45309; margin: 8px 0; padding-left: 20px;">';
            foreach ($this->notes as $section => $note) {
                $notesHtml .= '<li><strong>'.e(ucfirst($section)).':</strong> '.e($note).'</li>';
            }
            $notesHtml .= '</ul>';
        } else {
            $notesHtml = '<p style="color: #b45309; margin: 8px 0;">'.nl2br(e($this->notes)).'</p>';
        }

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
                    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <strong style="color: #92400e; font-size: 14px;">'.$notesHeading.'</strong>
                        '.$notesHtml.'
                    </div>
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="'.url('/akun/keanggotaan/daftar').'" style="display: inline-block; background-color: #056ED4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">'.$ctaLabel.'</a>
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
