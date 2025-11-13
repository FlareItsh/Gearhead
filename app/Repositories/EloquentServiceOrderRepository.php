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
            ->limit(4)
            ->get();
    }
}
