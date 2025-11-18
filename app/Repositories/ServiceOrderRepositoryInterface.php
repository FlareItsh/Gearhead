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

    public function upcomingBookings(int $userId);

    public function getOrdersWithStatus(?string $status = null);

    /**
     * Get pending service orders with:
     *  - customer name
     *  - comma separated service names
     *  - order time
     *  - status
     */
    public function getPendingOrders();
}
