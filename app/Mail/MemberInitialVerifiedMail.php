<?php

namespace App\Mail;

use App\Models\MemberInvoice;
use App\Models\User;
use App\Services\CopyService;
use App\Support\Brand;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemberInitialVerifiedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public ?MemberInvoice $invoice = null
    ) {
        $this->locale($this->user->locale ?: app()->getLocale());
    }

    public function envelope(): Envelope
    {
        $locale = $this->resolveLocale();
        $brandShort = Brand::shortName();
        $subject = app(CopyService::class)->get('emails.initial_verified.subject', ['brand' => $brandShort], $locale);

        return new Envelope(
            subject: $subject ?: "Verifikasi Awal Berhasil - Tagihan Administrasi Keanggotaan {$brandShort}",
        );
    }

    public function content(): Content
    {
        $locale = $this->resolveLocale();
        $copy = app(CopyService::class);
        $brandName = e(Brand::name());
        $brandShort = e(Brand::shortName());
        $supportEmail = e(Brand::supportEmail());
        $invoiceNumber = e($this->invoice?->number ?? '-');
        $invoiceTotal = 'Rp '.number_format($this->invoice?->total ?? 0, 0, ',', '.');
        $dueDate = e($this->invoice?->due_at?->format('d/m/Y') ?? '-');

        $subtitle = e($copy->get('emails.initial_verified.subtitle', [], $locale));
        $body = e($copy->get('emails.initial_verified.body', ['brand' => Brand::shortName()], $locale));
        $ctaLabel = e($copy->get('emails.initial_verified.cta', [], $locale));
        $salutation = $locale === 'en' ? 'Hello' : 'Halo';
        $invLabel = $locale === 'en' ? 'Invoice Number' : 'Nomor Tagihan';
        $totalLabel = $locale === 'en' ? 'Total Amount' : 'Total Tagihan';
        $dueLabel = $locale === 'en' ? 'Payment Due Date' : 'Batas Waktu Pembayaran';
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
                    <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">'.$invLabel.': <strong>'.$invoiceNumber.'</strong></div>
                        <div style="font-size: 20px; font-weight: bold; color: #014081; margin-bottom: 6px;">'.$totalLabel.': '.$invoiceTotal.'</div>
                        <div style="font-size: 12px; color: #ef4444;">'.$dueLabel.': '.$dueDate.'</div>
                    </div>
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="'.url('/akun/keanggotaan').'" style="display: inline-block; background-color: #056ED4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">'.$ctaLabel.'</a>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">'.$footerPrefix.' '.$brandShort.' &bull; '.$supportEmail.'</p>
                </div>
            </div>
            '
        );
    }

    private function resolveLocale(): string
    {
        return $this->locale ?: ($this->user->locale ?: app()->getLocale());
    }
}
