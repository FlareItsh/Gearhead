<?php

namespace App\Repositories;

use App\Models\Employee;
use Illuminate\Support\Collection;

interface EmployeeRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?Employee;

    public function create(array $data): Employee;

    public function updateStatus(int $id, string $status): bool;
}
