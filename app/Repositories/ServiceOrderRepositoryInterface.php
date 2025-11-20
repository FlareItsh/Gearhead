<?php

namespace App\Repositories;

use App\Models\ServiceOrder;
use Illuminate\Database\Eloquent\Collection;

interface ServiceOrderRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?ServiceOrder;

    public function create(array $data): ServiceOrder;

    /**
     * Create a service order together with its details in a transaction.
     *
     * @param  array  $details  Array of arrays with keys: service_id, quantity
     */
    public function createWithDetails(array $orderData, array $details): ServiceOrder;

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

    /**
     * Get all bookings with date range filter.
     * Returns orders with customer name, service names, total price, and status.
     * Sorts pending orders first, then by date descending.
     *
     * @param  string|null  $startDate  Y-m-d format
     * @param  string|null  $endDate  Y-m-d format
     * @return \Illuminate\Support\Collection
     */
    public function getAllBookings(?string $startDate = null, ?string $endDate = null);
}
