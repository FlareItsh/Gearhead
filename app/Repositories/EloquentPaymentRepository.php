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

    /**
     * Count payments associated with service orders belonging to the given user id.
     *
     * This implementation performs a join between payments and service_orders so
     * we explicitly match payments.service_order_id -> service_orders.service_order_id
     * and then filter by service_orders.user_id.
     */
    public function countByUserId(int $userId): int
    {
        return Payment::join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->where('service_orders.user_id', $userId)
            ->count('payments.payment_id');
    }

    public function totalSpent(int $userId): int
    {
        // Sum the amount of payments for the user's service orders.
        return (int) Payment::join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->where('service_orders.user_id', $userId)
            ->sum('payments.amount');
    }
}
