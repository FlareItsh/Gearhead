<?php

namespace App\Repositories;

use App\Models\SupplyPurchase;
use Illuminate\Database\Eloquent\Collection;

class EloquentSupplyPurchaseRepository implements SupplyPurchaseRepositoryInterface
{
    public function all(): Collection
    {
        return SupplyPurchase::all();
    }

    public function findById(int $id): ?SupplyPurchase
    {
        return SupplyPurchase::find($id);
    }

    public function create(array $data): SupplyPurchase
    {
        return SupplyPurchase::create($data);
    }

    public function update(SupplyPurchase $purchase, array $data): bool
    {
        return $purchase->update($data);
    }

    public function delete(SupplyPurchase $purchase): bool
    {
        return $purchase->delete();
    }
}
