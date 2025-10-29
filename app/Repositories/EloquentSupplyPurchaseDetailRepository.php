<?php

namespace App\Repositories;

use App\Models\SupplyPurchaseDetail;
use Illuminate\Database\Eloquent\Collection;

class EloquentSupplyPurchaseDetailRepository implements SupplyPurchaseDetailRepositoryInterface
{
    public function all(): Collection
    {
        return SupplyPurchaseDetail::all();
    }

    public function findById(int $id): ?SupplyPurchaseDetail
    {
        return SupplyPurchaseDetail::find($id);
    }

    public function create(array $data): SupplyPurchaseDetail
    {
        return SupplyPurchaseDetail::create($data);
    }

    public function update(SupplyPurchaseDetail $detail, array $data): bool
    {
        return $detail->update($data);
    }

    public function delete(SupplyPurchaseDetail $detail): bool
    {
        return $detail->delete();
    }
}
