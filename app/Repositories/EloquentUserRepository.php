<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function all(): Collection
    {
        return User::all();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    }

    public function update(User $user, array $data): bool
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return $user->update($data);
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function getCustomersWithBookings()
    {
        $customers = User::where('role', 'customer')
            ->with('serviceOrders.payments')
            ->get()
            ->map(function ($user) {
                $bookings = $user->serviceOrders
                    ->filter(function ($order) {
                        return $order->payments->count() > 0;
                    })
                    ->count();
                $loyaltyPoints = $bookings % 9;

                return [
                    'user_id' => $user->user_id,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'address' => $user->address,
                    'role' => $user->role,
                    'bookings' => $bookings,
                    'loyaltyPoints' => $loyaltyPoints,
                ];
            });

        return $customers;
    }
}
