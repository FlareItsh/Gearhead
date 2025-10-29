<?php

namespace App\Repositories;

use App\Models\PulloutService;
use Illuminate\Database\Eloquent\Collection;

interface PulloutServiceRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?PulloutService;

    public function create(array $data): PulloutService;

    public function update(PulloutService $service, array $data): bool;

    public function delete(PulloutService $service): bool;
}
