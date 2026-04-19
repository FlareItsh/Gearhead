<?php

use App\Models\Employee;
use App\Models\ServiceOrder;
use App\Models\ServiceOrderDetail;
use App\Models\ServiceVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
});

it('can store an employee with commission percentage', function () {
    $data = [
        'firstName' => 'John',
        'lastName' => 'Doe',
        'middleName' => 'M',
        'phone' => '09123456789',
        'address' => '123 Street',
        'commissionPercentage' => 15.5,
    ];

    $response = $this->actingAs($this->admin)
        ->postJson('/api/staffs', $data);

    $response->assertSuccessful();
    
    $this->assertDatabaseHas('employees', [
        'first_name' => 'John',
        'commission_percentage' => 15.5,
    ]);
});

it('can update an employee commission percentage', function () {
    $employee = Employee::factory()->create([
        'commission_percentage' => 10.0,
    ]);

    $data = [
        'firstName' => $employee->first_name,
        'lastName' => $employee->last_name,
        'phone' => $employee->phone_number,
        'address' => $employee->address,
        'status' => 'Active',
        'commissionPercentage' => 20.0,
    ];

    $response = $this->actingAs($this->admin)
        ->putJson("/staffs/{$employee->employee_id}", $data);

    $response->assertSuccessful();

    $this->assertDatabaseHas('employees', [
        'employee_id' => $employee->employee_id,
        'commission_percentage' => 20.0,
    ]);
});

it('calculates commissions correctly for completed orders', function () {
    $employee = Employee::factory()->create([
        'commission_percentage' => 10.0,
    ]);

    // Create a customer
    $customer = User::factory()->create(['role' => 'customer']);

    // Create a service variant with price 1000
    $variant = ServiceVariant::factory()->create(['price' => 1000]);

    // Create a completed service order for this employee
    $order = ServiceOrder::factory()->create([
        'employee_id' => $employee->employee_id,
        'user_id' => $customer->user_id,
        'status' => 'completed',
    ]);

    // Add detail: 2 units of variant (Total = 2000)
    ServiceOrderDetail::create([
        'service_order_id' => $order->service_order_id,
        'service_variant' => $variant->service_variant,
        'quantity' => 2,
    ]);

    // Fetch commissions
    $response = $this->actingAs($this->admin)
        ->getJson("/api/staffs/{$employee->employee_id}/commissions");

    $response->assertSuccessful();
    
    // Total = 2000, 10% = 200
    $response->assertJsonPath('total_commission', 200);
    $response->assertJsonFragment([
        'total_amount' => 2000,
        'commission_amount' => 200,
    ]);
});
