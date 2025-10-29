<?php

namespace App\Repositories;

use App\Models\Supply;
use Illuminate\Database\Eloquent\Collection;

interface SupplyRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?Supply;

    public function create(array $data): Supply;

    public function update(Supply $supply, array $data): bool;

    public function delete(Supply $supply): bool;
}
