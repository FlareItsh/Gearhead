<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class BookingRepository
{
    /**
     * Get all bookings for a user with services and payment info
     */
    public function getBookingsByUser(int $userId, ?string $status = null)
    {
        $query = DB::table('service_orders')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('service_variants', 'service_order_details.service_variant', '=', 'service_variants.service_variant')
            ->join('services', 'service_variants.service_id', '=', 'services.service_id')
            ->leftJoin('payments', 'service_orders.service_order_id', '=', 'payments.service_order_id')
            ->where('service_orders.user_id', $userId)
            ->select(
                'service_orders.service_order_id',
                'service_orders.status as order_status',
                'service_orders.order_date',
                'service_orders.order_type',
                DB::raw('GROUP_CONCAT(services.service_name SEPARATOR ", ") as services'),
                DB::raw('SUM(service_order_details.quantity * service_variants.price) as total_amount'),
                DB::raw('MAX(payments.payment_method) as payment_method')
            )
            ->groupBy(
                'service_orders.service_order_id',
                'service_orders.status',
                'service_orders.order_date',
                'service_orders.order_type'
            );

        if ($status && $status !== 'all') {
            $query->where('service_orders.status', $status);
        }

        // Order by most recent first
        return $query->orderByDesc('service_orders.order_date')->get();
    }
}
