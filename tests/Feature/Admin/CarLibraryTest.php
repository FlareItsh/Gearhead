<?php

use App\Models\CarLibrary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('admin.cars'));
    $response->assertRedirect(route('login'));
});

test('non-admin users are unauthorized to view car library', function () {
    $user = User::factory()->create(['role' => 'customer']);
    $response = $this->actingAs($user)->get(route('admin.cars'));
    $response->assertRedirect(route('dashboard'));
});

test('admin users can visit the car library page', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $response = $this->actingAs($admin)->get(route('admin.cars'));
    $response->assertOk();
});

test('admin can store a new car reference', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('admin.cars.store'), [
        'make' => 'Toyota',
        'model' => 'Raize',
        'size' => 'Medium',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('car_libraries', [
        'make' => 'Toyota',
        'model' => 'Raize',
        'size' => 'Medium',
    ]);
});

test('storing duplicate make and model is blocked case-insensitively', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    CarLibrary::create([
        'make' => 'Toyota',
        'model' => 'Raize',
        'size' => 'Medium',
    ]);

    $response = $this->actingAs($admin)
        ->from(route('admin.cars'))
        ->post(route('admin.cars.store'), [
            'make' => 'toyota',
            'model' => 'RAIZE',
            'size' => 'Large',
        ]);

    $response->assertRedirect(route('admin.cars'));
    $response->assertSessionHasErrors(['model']);

    // Size should not have been updated since creation was blocked
    $this->assertEquals(1, CarLibrary::where('make', 'Toyota')->count());
});

test('admin can update a car reference', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $car = CarLibrary::create([
        'make' => 'Toyota',
        'model' => 'Raize',
        'size' => 'Medium',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.cars.update', $car), [
        'make' => 'Toyota',
        'model' => 'Raize',
        'size' => 'Large',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('car_libraries', [
        'id' => $car->id,
        'size' => 'Large',
    ]);
});

test('updating duplicate make and model is blocked case-insensitively', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $car1 = CarLibrary::create([
        'make' => 'Toyota',
        'model' => 'Raize',
        'size' => 'Medium',
    ]);

    $car2 = CarLibrary::create([
        'make' => 'Honda',
        'model' => 'Civic',
        'size' => 'Medium',
    ]);

    $response = $this->actingAs($admin)
        ->from(route('admin.cars'))
        ->put(route('admin.cars.update', $car2), [
            'make' => 'toyota',
            'model' => 'RAIZE',
            'size' => 'Medium',
        ]);

    $response->assertRedirect(route('admin.cars'));
    $response->assertSessionHasErrors(['model']);
});

test('admin can delete a car reference', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $car = CarLibrary::create([
        'make' => 'Toyota',
        'model' => 'Raize',
        'size' => 'Medium',
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.cars.destroy', $car));

    $response->assertRedirect();
    $this->assertDatabaseMissing('car_libraries', [
        'id' => $car->id,
    ]);
});
