<?php

namespace App\Repositories;

use App\Repositories\Contracts\ServiceRepositoryInterface;

use App\Models\Service;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

// Added for debugging

class EloquentServiceRepository implements ServiceRepositoryInterface
{
    public function all(): Collection
    {
        // Return only active services
        return Service::where('status', 'active')->get();
    }

    public function allIncludingInactive(): Collection
    {
        // Return all services including inactive ones (for admin)
        return Service::all();
    }

    public function getAllByCategory(?string $category): Collection
    {
        $query = Service::where('status', 'active');

        if ($category && $category !== 'All') {
            $query->where('category', $category);
        }

        return $query->orderBy('service_name')->get();
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
        $query = DB::table('service_order_details as sod')
            ->join('services as s', 'sod.service_id', '=', 's.service_id')
            ->join('service_orders as so', 'sod.service_order_id', '=', 'so.service_order_id')
            ->join('payments as p', 'so.service_order_id', '=', 'p.service_order_id')
            ->select(
                's.service_id',
                's.service_name',
                DB::raw('COALESCE(SUM(sod.quantity), 0) as total_bookings')
            )
            ->groupBy('s.service_id', 's.service_name')
            ->orderByDesc('total_bookings')
            ->limit($limit);

        if ($startDate && $endDate) {
            $query->whereBetween('p.created_at', [$startDate, $endDate]);
        }

        return $query->get();
    }

    /**
     * Get top services with size information for reports
     */
    public function getTopServicesWithSize(int $limit = 10, ?string $startDate = null, ?string $endDate = null)
    {
        $query = DB::table('service_order_details as sod')
            ->join('services as s', 'sod.service_id', '=', 's.service_id')
            ->join('service_orders as so', 'sod.service_order_id', '=', 'so.service_order_id')
            ->join('payments as p', 'so.service_order_id', '=', 'p.service_order_id')
            ->select(
                's.service_name',
                's.size',
                DB::raw('COALESCE(SUM(sod.quantity), 0) as total_bookings')
            )
            ->groupBy('s.service_id', 's.service_name', 's.size')
            ->orderByDesc('total_bookings')
            ->limit($limit);

        if ($startDate && $endDate) {
            $query->whereBetween('p.created_at', [$startDate, $endDate]);
        }

        return $query->get();
    }

    public function getDistinctCategories(): array
    {
        return Service::distinct()
            ->pluck('category')
            ->toArray();
    }
}
