<?php

namespace App\Repositories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Collection;

interface ServiceRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?Service;

    public function create(array $data): Service;

    public function update(Service $service, array $data): bool;

    public function delete(Service $service): bool;
}
