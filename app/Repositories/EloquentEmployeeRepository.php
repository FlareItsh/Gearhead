<?php

namespace App\Repositories;

use App\Models\Employee;
use Illuminate\Support\Collection;

class EloquentEmployeeRepository implements EmployeeRepositoryInterface
{
    public function all(): Collection
    {
        return Employee::all();
    }

    public function findById(int $id): ?Employee
    {
        return Employee::find($id);
    }

    public function create(array $data): Employee
    {
        return Employee::create($data);
    }

    public function updateStatus(int $id, string $status): bool
    {
        return Employee::where('employee_id', $id)->update(['status' => $status]);
    }
}
