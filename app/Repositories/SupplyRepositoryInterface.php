<?php

namespace App\Repositories;

interface SupplyRepositoryInterface
{
    public function all();

    public function findById(int $id);

    public function create(array $data);

    public function update(int $id, array $data);

    public function incrementStock(int $id, float $quantity);

    public function delete(int $id);
}
