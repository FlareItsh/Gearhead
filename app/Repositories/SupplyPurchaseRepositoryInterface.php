<?php

namespace App\Repositories;

use App\Models\SupplyPurchase;
use Illuminate\Database\Eloquent\Collection;

interface SupplyPurchaseRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?SupplyPurchase;

    public function create(array $data): SupplyPurchase;

    public function update(SupplyPurchase $purchase, array $data): bool;

    public function delete(SupplyPurchase $purchase): bool;
}
