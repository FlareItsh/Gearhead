<?php

namespace App\Repositories;

use App\Models\ServiceOrder;
use Illuminate\Database\Eloquent\Collection;

interface ServiceOrderRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?ServiceOrder;

    public function create(array $data): ServiceOrder;

    public function update(ServiceOrder $order, array $data): bool;

    public function delete(ServiceOrder $order): bool;
}
