<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Collection;

interface UserRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?User;

    public function findByEmail(string $email): ?User;

    public function create(array $data): User;
}
