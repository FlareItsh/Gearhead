<?php

namespace App\Repositories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Added for debugging

class EloquentServiceRepository implements ServiceRepositoryInterface
{
    public function all(): Collection
    {
        // Return only active services
        return Service::where('status', 'active')->get();
    }

    public function getAllByCategory(?string $category): Collection
    {
        $query = Service::where('status', 'active');

        if ($category && $category !== 'All') {
            $query->where('category', $category);
        }

        return $query->get();
    }

    public function findById(int $id): ?Service
    {
        return Service::find($id);
    }

    public function create(array $data): Service
    {
        return Service::create($data);
    }

    public function update(Service $service, array $data): bool
    {
        return $service->update($data);
    }

    public function delete(Service $service): bool
    {
        return $service->delete();
    }

    public function getTopServices(int $limit = 4, ?string $startDate = null, ?string $endDate = null)
    {
        $query = DB::table('payments')
            ->join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('services', 'service_order_details.service_id', '=', 'services.service_id')
            ->select('services.service_name', DB::raw('SUM(service_order_details.quantity) as total_bookings'))
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('payments.created_at', [$startDate, $endDate]);
            })
            ->groupBy('services.service_name')
            ->orderByDesc('total_bookings')
            ->limit($limit);

        // Added: Log the query for debugging
        Log::info('Top Services Query Executed', [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
            'result_count' => $query->count(), // Quick count before get()
        ]);

        $result = $query->get();

        // Log the actual results
        Log::info('Top Services Query Result', ['data' => $result->toArray()]);

        return $result;
    }

    public function getMostPopularService(?string $startDate = null, ?string $endDate = null)
    {
        return DB::table('payments')
            ->join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('services', 'service_order_details.service_id', '=', 'services.service_id')
            ->select('services.service_name', DB::raw('SUM(service_order_details.quantity) as total_bookings'))
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('payments.created_at', [$startDate, $endDate]);
            })
            ->groupBy('services.service_name')
            ->orderByDesc('total_bookings')
            ->first();
    }
}
