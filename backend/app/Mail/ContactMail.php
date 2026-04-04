<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $data) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Contact Message from ' . $this->data['name'],
            replyTo: [
                new \Illuminate\Mail\Mailables\Address(
                    $this->data['email'],
                    $this->data['name']
                ),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'email.contact',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}