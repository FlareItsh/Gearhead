<?php

namespace App\Repositories;

use App\Models\PulloutRequest;
use Illuminate\Database\Eloquent\Collection;

interface PulloutRequestRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?PulloutRequest;

    public function create(array $data): PulloutRequest;

    public function update(PulloutRequest $request, array $data): bool;

    public function delete(PulloutRequest $request): bool;
}
