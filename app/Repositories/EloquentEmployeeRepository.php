<?php

namespace App\Repositories;

use App\Repositories\Contracts\EmployeeRepositoryInterface;

use App\Models\Employee;
use Illuminate\Support\Collection;

class EloquentEmployeeRepository implements EmployeeRepositoryInterface
{
    public function all(): Collection
    {
        return Employee::orderBy('first_name')->get();
    }

    public function find(int $id): Employee
    {
        return Employee::findOrFail($id);
    }

    public function create(array $data): Employee
    {
        return Employee::create($data);
    }

    public function update(int $id, array $data): Employee
    {
        $employee = Employee::findOrFail($id);
        $employee->update($data);

        return $employee;
    }

    public function delete(int $id): bool
    {
        $employee = Employee::findOrFail($id);

        return $employee->delete();
    }

    public function countActiveEmployees(): int
    {
        return Employee::where('status', 'active')->count();
    }

    public function findActive(): Collection
    {
        return Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get();
    }

    public function updateAssignedStatus(int $id, string $status): bool
    {
        $employee = Employee::findOrFail($id);
        return $employee->update(['assigned_status' => $status]);
    }
}
