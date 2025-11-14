<?php

namespace App\Repositories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Collection;

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
}
