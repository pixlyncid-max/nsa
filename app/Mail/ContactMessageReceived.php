<?php

namespace App\Mail;

use App\Models\ContactMessage;
use App\Support\Brand;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contactMessage)
    {
        $this->locale(app()->getLocale());
    }

    public function envelope(): Envelope
    {
        $locale = $this->locale ?: app()->getLocale();
        $short = Brand::shortName();

        if ($locale === 'en') {
            $subject = $this->contactMessage->topic === 'kemitraan'
                ? "[{$short}] New Partnership Proposal from ".$this->contactMessage->name
                : "[{$short}] New Contact Message: ".$this->contactMessage->topic;
        } else {
            $subject = $this->contactMessage->topic === 'kemitraan'
                ? "[{$short}] Pengajuan Kemitraan Baru dari ".$this->contactMessage->name
                : "[{$short}] Pesan Kontak Baru: ".$this->contactMessage->topic;
        }

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        $locale = $this->locale ?: app()->getLocale();
        $brandName = e(Brand::name());
        $brandShort = e(Brand::shortName());

        $isEn = $locale === 'en';
        $heading = $isEn ? "Message Notification {$brandShort}" : "Notifikasi Pesan {$brandShort}";
        $greeting = $isEn ? "Hello {$brandShort} Board," : "Halo Pengurus {$brandShort},";
        $intro = $isEn ? 'You received a new message via the website form:' : 'Anda menerima pesan masuk baru melalui formulir website:';
        $nameLabel = $isEn ? 'Name:' : 'Nama:';
        $topicLabel = $isEn ? 'Topic:' : 'Topik:';
        $messageLabel = $isEn ? 'Message:' : 'Pesan:';
        $footer = $isEn
            ? "This message was sent automatically by the {$brandName} portal."
            : "Pesan ini dikirim otomatis oleh portal {$brandName}.";

        return new Content(
            htmlString: '
                <div style="font-family: sans-serif; line-height: 1.6; color: #0b1f36; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #014081; border-bottom: 2px solid #27aae1; padding-bottom: 10px;">'.$heading.'</h2>
                    <p>'.$greeting.'</p>
                    <p>'.$intro.'</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr><td style="padding: 8px; font-weight: bold; width: 140px;">'.$nameLabel.'</td><td style="padding: 8px;">'.e($this->contactMessage->name).'</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">'.e($this->contactMessage->email).'</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">'.$topicLabel.'</td><td style="padding: 8px;">'.e($this->contactMessage->topic).'</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">'.$messageLabel.'</td><td style="padding: 8px; background: #f4f8fc; border-radius: 8px;">'.nl2br(e($this->contactMessage->message)).'</td></tr>
                    </table>
                    <p style="font-size: 12px; color: #5b6b7f;">'.$footer.'</p>
                </div>
            '
        );
    }
}
