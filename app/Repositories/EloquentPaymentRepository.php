<?php

namespace App\Repositories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

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

    public function countByUserId(int $userId): int
    {
        return Payment::join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->where('service_orders.user_id', $userId)
            ->count('payments.payment_id');
    }

    public function totalSpent(int $userId): int
    {
        return (int) Payment::join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->where('service_orders.user_id', $userId)
            ->sum('payments.amount');
    }

    /**
     * Get all payments for a specific user, including services.
     */
    public function getPaymentsForUser(int $userId)
    {
        return DB::table('payments')
            ->join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('services', 'service_order_details.service_id', '=', 'services.service_id')
            ->where('service_orders.user_id', $userId)
            ->select(
                'payments.payment_id',
                'service_orders.order_date as date',
                DB::raw('GROUP_CONCAT(services.service_name SEPARATOR ", ") as services'), // <- updated here
                'payments.amount',
                'payments.payment_method',
                'payments.gcash_reference'
            )
            ->groupBy(
                'payments.payment_id',
                'service_orders.order_date',
                'payments.amount',
                'payments.payment_method',
                'payments.gcash_reference'
            )
            ->get();
    }
}
