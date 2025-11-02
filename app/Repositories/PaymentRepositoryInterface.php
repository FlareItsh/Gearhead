<?php

namespace App\Repositories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Collection;

interface PaymentRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?Payment;

    public function create(array $data): Payment;

    public function update(Payment $payment, array $data): bool;

    public function delete(Payment $payment): bool;

    /**
     * Return the total number of payments for a given user id.
     */
    public function countByUserId(int $userId): int;
}
