<?php

namespace App\Repositories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Collection;

class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    public function all(): Collection
    {
        return Payment::all();
    }

    public function findById(int $id): ?Payment
    {
        return Payment::find($id);
    }

    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    public function update(Payment $payment, array $data): bool
    {
        return $payment->update($data);
    }

    public function delete(Payment $payment): bool
    {
        return $payment->delete();
    }
}
