<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return ! $user->isClient();
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return ! $user->isClient();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isFreelancer();
    }

    public function update(User $user, Invoice $invoice): bool
    {
        if ($invoice->status === 'paid') {
            return false;
        }

        return $user->isAdmin() || ($user->isFreelancer() && $invoice->user_id === $user->id);
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin() && $invoice->status !== 'paid';
    }
}
