<?php

namespace App\Repositories;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentSupplyRepository implements SupplyRepositoryInterface
{
    public function all(): Collection
    {
        return DB::table('supplies')->get();
    }

    public function findById(int $id)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->first();
    }

    public function create(array $data)
    {
        return DB::table('supplies')->insertGetId($data);
    }

    public function update(int $id, array $data)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->update($data) > 0;
    }

    public function incrementStock(int $id, float $quantity)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->increment('quantity_stock', $quantity);
    }

    public function delete(int $id)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->delete() > 0;
    }
}
