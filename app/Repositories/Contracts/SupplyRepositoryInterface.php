<?php

namespace App\Repositories\Contracts;

interface SupplyRepositoryInterface
{
    public function all();
    public function paginate(int $perPage);

    public function findById(int $id);

    public function create(array $data);

    public function update(int $id, array $data);

    public function incrementStock(int $id, float $quantity);

    public function delete(int $id);
}
