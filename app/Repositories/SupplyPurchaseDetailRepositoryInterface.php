<?php

namespace App\Repositories;

use App\Models\SupplyPurchaseDetail;
use Illuminate\Database\Eloquent\Collection;

interface SupplyPurchaseDetailRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?SupplyPurchaseDetail;

    public function create(array $data): SupplyPurchaseDetail;

    public function update(SupplyPurchaseDetail $detail, array $data): bool;

    public function delete(SupplyPurchaseDetail $detail): bool;
}
