<?php

namespace App\Repositories;

use App\Models\ServiceOrder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EloquentServiceOrderRepository implements ServiceOrderRepositoryInterface
{
    public function all(): Collection
    {
        return ServiceOrder::all();
    }

    public function findById(int $id): ?ServiceOrder
    {
        return ServiceOrder::find($id);
    }

    public function create(array $data): ServiceOrder
    {
        return ServiceOrder::create($data);
    }

    public function update(ServiceOrder $order, array $data): bool
    {
        return $order->update($data);
    }

    public function delete(ServiceOrder $order): bool
    {
        return $order->delete();
    }

    public function upcomingBookings(int $userId)
    {
        return DB::table('service_orders')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('services', 'service_order_details.service_id', '=', 'services.service_id')
            ->where('service_orders.user_id', $userId)
            ->whereIn('service_orders.status', ['pending', 'in_progress'])
            ->select(
                'service_orders.service_order_id',
                'service_orders.order_date',
                'service_orders.order_type',
                'service_orders.status',
                DB::raw('GROUP_CONCAT(services.service_name SEPARATOR ", ") as service_names'),
                DB::raw('SUM(services.price * service_order_details.quantity) as total_amount')
            )
            ->groupBy(
                'service_orders.service_order_id',
                'service_orders.order_date',
                'service_orders.order_type',
                'service_orders.status'
            )
            // Custom ordering: in_progress first, then pending; within each group most recent first
            ->orderByRaw("
            FIELD(service_orders.status, 'in_progress', 'pending') ASC,
            service_orders.order_date DESC
        ")
            ->get();
    }

    /**
     * Get service orders with optional status filter.
     *
     * @param  string|null  $status  'pending', 'in_progress', 'completed', 'cancelled' or null for all
     * @return \Illuminate\Support\Collection
     */
    public function getOrdersWithStatus(?string $status = null)
    {
        $query = DB::table('service_orders as so')
            ->select(
                'so.service_order_id',
                'so.status',
                'so.order_date',
                'so.order_type',
                'so.user_id',
                'p.amount as payment_amount',
                'p.payment_method',
                'p.gcash_reference',
                DB::raw('GROUP_CONCAT(s.name SEPARATOR ", ") as services')
            )
            ->join('service_order_details as sod', 'so.service_order_id', '=', 'sod.service_order_id')
            ->join('services as s', 'sod.service_id', '=', 's.service_id')
            ->leftJoin('payments as p', 'so.service_order_id', '=', 'p.service_order_id')
            ->groupBy('so.service_order_id', 'so.status', 'so.order_date', 'so.order_type', 'so.user_id', 'p.amount', 'p.payment_method', 'p.gcash_reference')
            ->orderBy('so.order_date', 'desc');

        if ($status && $status !== 'all') {
            if ($status === 'upcoming') {
                // upcoming = pending or in_progress
                $query->whereIn('so.status', ['pending', 'in_progress']);
            } else {
                $query->where('so.status', $status);
            }
        }

        return $query->get();
    }

    /**
     * {@inheritdoc}
     */
    public function getPendingOrders()
    {
        return DB::table('service_orders as so')
            ->join('users as u', 'u.user_id', '=', 'so.user_id')
            ->join('service_order_details as sod', 'sod.service_order_id', '=', 'so.service_order_id')
            ->join('services as s', 's.service_id', '=', 'sod.service_id')
            ->where('so.status', 'pending')
            ->select([
                'so.service_order_id',
                // Build full customer name from first/middle/last name
                DB::raw("CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) as customer_name"),
                // Concatenate all service names for the order
                DB::raw('GROUP_CONCAT(DISTINCT s.service_name SEPARATOR ", ") as service_name'),
                DB::raw('TIME(so.order_date) as time'),
                DB::raw('DATE(so.order_date) as order_date_only'),
                'so.status',
            ])
            ->groupBy(
                'so.service_order_id',
                'u.first_name',
                'u.middle_name',
                'u.last_name',
                'so.order_date',
                'so.status'
            )
            ->orderBy('so.order_date', 'asc')
            ->get();
    }
}
