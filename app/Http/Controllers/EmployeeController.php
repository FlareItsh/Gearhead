<?php

namespace App\Http\Controllers;

use App\Repositories\EmployeeRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    protected EmployeeRepositoryInterface $employees;

    public function __construct(EmployeeRepositoryInterface $employees)
    {
        $this->employees = $employees;
    }

    /**
     * List employees (render Inertia view)
     */
    public function index()
    {
        $employees = $this->employees->all()->map(function ($e) {
            return [
                'id' => $e->employee_id,
                'firstName' => $e->first_name,
                'middleName' => $e->middle_name,
                'lastName' => $e->last_name,
                'phone' => $e->phone_number,
                'address' => $e->address,
                'status' => ucfirst($e->status),
                'dateHired' => optional($e->date_hired)->format('Y-m-d'),
                'role' => 'Employee',
            ];
        });

        return Inertia::render('Admin/Staffs', [
            'staffs' => $employees,
        ]);
    }

    /**
     * Add a new employee
     */
    public function store(Request $request)
    {
        $request->validate([
            'firstName' => 'required|string',
            'middleName' => 'nullable|string',
            'lastName' => 'required|string',
            'phone' => 'required|string',
            'address' => 'required|string',
        ]);

        $employee = $this->employees->create([
            'first_name' => $request->firstName,
            'middle_name' => $request->middleName,
            'last_name' => $request->lastName,
            'phone_number' => $request->phone,
            'address' => $request->address,
            'status' => 'active',
            'date_hired' => now(),
        ]);

        return response()->json([
            'message' => 'Employee added successfully',
            'employee' => [
                'id' => $employee->employee_id,
                'firstName' => $employee->first_name,
                'middleName' => $employee->middle_name,
                'lastName' => $employee->last_name,
                'phone' => $employee->phone_number,
                'address' => $employee->address,
                'status' => ucfirst($employee->status),
                'dateHired' => $employee->date_hired->format('Y-m-d'),
                'role' => 'Employee',
            ],
        ]);
    }

    /**
     * Update an existing employee
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'firstName' => 'required|string',
            'middleName' => 'nullable|string',
            'lastName' => 'required|string',
            'phone' => 'required|string',
            'address' => 'required|string',
            'status' => 'required|in:Active,Inactive,Absent',
        ]);

        $employee = $this->employees->update($id, [
            'first_name' => $request->firstName,
            'middle_name' => $request->middleName,
            'last_name' => $request->lastName,
            'phone_number' => $request->phone,
            'address' => $request->address,
            'status' => strtolower($request->status),
        ]);

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => [
                'id' => $employee->employee_id,
                'firstName' => $employee->first_name,
                'middleName' => $employee->middle_name,
                'lastName' => $employee->last_name,
                'phone' => $employee->phone_number,
                'address' => $employee->address,
                'status' => ucfirst($employee->status),
                'dateHired' => $employee->date_hired->format('Y-m-d'),
                'role' => 'Employee',
            ],
        ]);
    }

    /**
     * Delete an employee
     */
    public function destroy(int $id)
    {
        $this->employees->delete($id);

        return response()->json([
            'message' => 'Employee deleted successfully',
        ]);
    }

    /**
     * Get the number of active employees.
     */
    public function activeCount()
    {
        $count = $this->employees->countActiveEmployees();

        return response()->json([
            'active_employees' => $count,
        ]);
    }
}
