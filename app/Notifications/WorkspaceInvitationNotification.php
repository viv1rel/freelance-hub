<?php

namespace App\Notifications;

use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkspaceInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly WorkspaceInvitation $invitation,
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
        $url = url("/invitations/{$this->invitation->token}/accept");

        return (new MailMessage)
            ->subject("You're invited to join {$this->invitation->tenant->name}")
            ->greeting('Hello!')
            ->line("You've been invited to join the workspace **{$this->invitation->tenant->name}** as a {$this->invitation->role}.")
            ->action('Accept Invitation', $url)
            ->line('This invitation expires in 7 days.');
    }
}
