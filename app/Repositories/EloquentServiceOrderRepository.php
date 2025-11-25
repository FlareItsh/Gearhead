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

    /**
     * Create a service order with details inside a DB transaction.
     */
    public function createWithDetails(array $orderData, array $details): ServiceOrder
    {
        return DB::transaction(function () use ($orderData, $details) {
            $order = ServiceOrder::create($orderData);

            // Ensure details are mapped to expected fields (service_id, quantity)
            $mapped = array_map(function ($d) {
                return [
                    'service_id' => $d['service_id'] ?? null,
                    'quantity' => $d['quantity'] ?? 1,
                ];
            }, $details);

            // Create relation records
            $order->details()->createMany($mapped);

            return $order->fresh('details');
        });
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
        return DB::table('service_orders as so')
            ->join('service_order_details as sod', 'so.service_order_id', '=', 'sod.service_order_id')
            ->join('services as s', 'sod.service_id', '=', 's.service_id')
            ->where('so.user_id', $userId)
            ->whereIn('so.status', ['pending', 'in_progress'])
            ->select(
                'so.service_order_id',
                'so.order_date',
                'so.order_type',
                'so.status',
                DB::raw('GROUP_CONCAT(s.service_name SEPARATOR ", ") as service_names'),
                DB::raw('COALESCE(SUM(s.price * sod.quantity), 0) as total_amount')
            )
            ->groupBy(
                'so.service_order_id',
                'so.order_date',
                'so.order_type',
                'so.status'
            )
            ->orderByRaw("FIELD(so.status, 'in_progress', 'pending')")
            ->orderByDesc('so.order_date')
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
            ->join('service_order_details as sod', 'so.service_order_id', '=', 'sod.service_order_id')
            ->join('services as s', 'sod.service_id', '=', 's.service_id')
            ->leftJoin('payments as p', 'so.service_order_id', '=', 'p.service_order_id')
            ->select(
                'so.service_order_id',
                'so.status',
                'so.order_date',
                'so.order_type',
                'so.user_id',
                'p.amount as payment_amount',
                'p.payment_method',
                'p.gcash_reference',
                DB::raw('GROUP_CONCAT(s.service_name SEPARATOR ", ") as services')
            )
            ->groupBy('so.service_order_id', 'so.status', 'so.order_date', 'so.order_type', 'so.user_id', 'p.amount', 'p.payment_method', 'p.gcash_reference')
            ->orderByDesc('so.order_date');

        if ($status && $status !== 'all') {
            if ($status === 'upcoming') {
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
            ->whereIn('so.status', ['pending', 'in_progress'])
            ->whereRaw('DATE(so.order_date) = CURDATE()')
            ->select(
                'so.service_order_id',
                DB::raw("CONCAT_WS(' ', u.first_name, NULLIF(u.middle_name, ''), u.last_name) as customer_name"),
                DB::raw('GROUP_CONCAT(DISTINCT s.service_name SEPARATOR ", ") as service_name'),
                'so.order_date',
                'so.status'
            )
            ->groupBy('so.service_order_id', 'so.order_date', 'so.status', 'u.first_name', 'u.middle_name', 'u.last_name')
            ->orderBy('so.order_date')
            ->get();
    }

    /**
     * {@inheritdoc}
     */
    public function getAllBookings(?string $startDate = null, ?string $endDate = null)
    {
        $query = DB::table('service_orders as so')
            ->join('users as u', 'u.user_id', '=', 'so.user_id')
            ->join('service_order_details as sod', 'sod.service_order_id', '=', 'so.service_order_id')
            ->join('services as s', 's.service_id', '=', 'sod.service_id')
            ->select(
                'so.service_order_id',
                DB::raw("CONCAT_WS(' ', u.first_name, NULLIF(u.middle_name, ''), u.last_name) as customer_name"),
                DB::raw('GROUP_CONCAT(DISTINCT s.service_name SEPARATOR ", ") as service_names'),
                DB::raw('COALESCE(SUM(s.price * sod.quantity), 0) as total_price'),
                'so.order_date',
                'so.status'
            )
            ->groupBy('so.service_order_id', 'so.order_date', 'so.status', 'u.first_name', 'u.middle_name', 'u.last_name');

        if ($startDate) {
            $query->whereDate('so.order_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('so.order_date', '<=', $endDate);
        }

        return $query->orderByRaw("FIELD(so.status, 'pending', 'in_progress', 'completed', 'cancelled')")
            ->orderByDesc('so.order_date')
            ->get();
    }

    public function deleteServiceOrderDetails(int $serviceOrderId): bool
    {
        return DB::table('service_order_details')
            ->where('service_order_id', $serviceOrderId)
            ->delete() > 0;
    }

    public function replaceServiceOrderDetails(int $serviceOrderId, array $serviceIds): void
    {
        // Delete existing details
        DB::table('service_order_details')
            ->where('service_order_id', $serviceOrderId)
            ->delete();

        // Insert new details
        foreach ($serviceIds as $serviceId) {
            DB::table('service_order_details')->insert([
                'service_order_id' => $serviceOrderId,
                'service_id' => $serviceId,
                'quantity' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function getTodayBookings()
    {
        $today = now()->format('Y-m-d');

        return DB::table('service_orders as so')
            ->join('users as u', 'so.user_id', '=', 'u.user_id')
            ->join('service_order_details as sod', 'so.service_order_id', '=', 'sod.service_order_id')
            ->join('services as s', 'sod.service_id', '=', 's.service_id')
            ->where('so.status', 'pending')
            ->where('so.order_type', 'R')
            ->whereDate('so.order_date', $today)
            ->select(
                'so.service_order_id',
                'so.user_id',
                'so.order_date',
                'u.first_name',
                'u.last_name',
                'u.phone_number as phone',
                DB::raw('CONCAT(u.first_name, " ", u.last_name) as customer_name'),
                DB::raw('GROUP_CONCAT(s.service_name SEPARATOR ", ") as services'),
                DB::raw('GROUP_CONCAT(s.service_id) as service_ids'),
                DB::raw('COALESCE(SUM(s.price * sod.quantity), 0) as total')
            )
            ->groupBy('so.service_order_id', 'so.user_id', 'so.order_date', 'u.first_name', 'u.last_name', 'u.phone_number')
            ->orderBy('so.order_date')
            ->get()
            ->map(function ($booking) {
                return [
                    'service_order_id' => $booking->service_order_id,
                    'user_id' => $booking->user_id,
                    'customer_name' => $booking->customer_name,
                    'first_name' => $booking->first_name,
                    'last_name' => $booking->last_name,
                    'phone' => $booking->phone,
                    'services' => $booking->services,
                    'service_ids' => $booking->service_ids ? explode(',', $booking->service_ids) : [],
                    'total' => $booking->total,
                    'order_date' => $booking->order_date,
                ];
            });
    }

    public function cancelBooking(int $serviceOrderId): bool
    {
        return DB::table('service_orders')
            ->where('service_order_id', $serviceOrderId)
            ->update(['status' => 'cancelled', 'updated_at' => now()]) > 0;
    }

    public function countCompletedBookingsForUser(int $userId): int
    {
        return ServiceOrder::where('user_id', $userId)
            ->whereHas('payments')
            ->count();
    }

    public function getActiveOrders()
    {
        return ServiceOrder::whereIn('status', ['pending', 'in_progress'])
            ->with([
                'user:user_id,first_name,last_name,email,phone_number',
                'details:service_order_detail_id,service_order_id,service_id,quantity',
                'details.service:service_id,service_name,price',
                'bay:bay_id,bay_number,status',
                'employee:employee_id,first_name,last_name,phone_number,status,assigned_status',
            ])
            ->orderByDesc('order_date')
            ->get()
            ->unique('bay_id')
            ->values();
    }
}
