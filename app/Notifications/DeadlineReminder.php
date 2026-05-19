<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeadlineReminder extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  'task'|'invoice'  $type
     */
    public function __construct(
        public string $type,
        public string $title,
        public string $deadline,
        public ?string $url = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->type === 'task'
            ? 'Скоро дедлайн задачи: '.$this->title
            : 'Скоро срок оплаты счёта: '.$this->title;

        $body = $this->type === 'task'
            ? 'Срок выполнения задачи "'.$this->title.'" — '.$this->deadline.'.'
            : 'Срок оплаты счёта "'.$this->title.'" — '.$this->deadline.'.';

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting('Напоминание')
            ->line($body);

        if ($this->url) {
            $message->action('Открыть', $this->url);
        }

        return $message;
    }
}
