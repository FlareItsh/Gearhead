<?php

namespace App\Repositories;

use App\Models\Supply;
use Illuminate\Database\Eloquent\Collection;

class EloquentSupplyRepository implements SupplyRepositoryInterface
{
    public function all(): Collection
    {
        return Supply::all();
    }

    public function findById(int $id): ?Supply
    {
        return Supply::find($id);
    }

    public function create(array $data): Supply
    {
        return Supply::create($data);
    }

    public function update(Supply $supply, array $data): bool
    {
        return $supply->update($data);
    }

    public function delete(Supply $supply): bool
    {
        return $supply->delete();
    }
}
