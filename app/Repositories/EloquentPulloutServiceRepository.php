<?php

namespace App\Repositories;

use App\Models\PulloutService;
use Illuminate\Database\Eloquent\Collection;

class EloquentPulloutServiceRepository implements PulloutServiceRepositoryInterface
{
    public function all(): Collection
    {
        return PulloutService::all();
    }

    public function findById(int $id): ?PulloutService
    {
        return PulloutService::find($id);
    }

    public function create(array $data): PulloutService
    {
        return PulloutService::create($data);
    }

    public function update(PulloutService $service, array $data): bool
    {
        return $service->update($data);
    }

    public function delete(PulloutService $service): bool
    {
        return $service->delete();
    }
}
