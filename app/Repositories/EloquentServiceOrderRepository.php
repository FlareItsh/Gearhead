<?php

namespace App\Repositories;

use App\Models\ServiceOrder;
use Illuminate\Database\Eloquent\Collection;

class EloquentServiceOrderRepository implements ServiceOrderRepositoryInterface
{
    public function all(): Collection
    {
        return ServiceOrder::all();
    }

    public function findById(int $id): ?ServiceOrder
    {
        return ServiceOrder::find($id);
    }

    public function create(array $data): ServiceOrder
    {
        return ServiceOrder::create($data);
    }

    public function update(ServiceOrder $order, array $data): bool
    {
        return $order->update($data);
    }

    public function delete(ServiceOrder $order): bool
    {
        return $order->delete();
    }
}
