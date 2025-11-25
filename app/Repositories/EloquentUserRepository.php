<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

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
        return DB::table('users as u')
            ->leftJoin('service_orders as so', 'u.user_id', '=', 'so.user_id')
            ->leftJoin('payments as p', 'so.service_order_id', '=', 'p.service_order_id')
            ->where('u.role', 'customer')
            ->select(
                'u.user_id',
                'u.first_name',
                'u.middle_name',
                'u.last_name',
                'u.email',
                'u.phone_number',
                'u.address',
                'u.role',
                DB::raw('COUNT(DISTINCT CASE WHEN p.payment_id IS NOT NULL THEN so.service_order_id END) as bookings'),
                DB::raw('(COUNT(DISTINCT CASE WHEN p.payment_id IS NOT NULL THEN so.service_order_id END) % 9) as loyaltyPoints')
            )
            ->groupBy('u.user_id', 'u.first_name', 'u.middle_name', 'u.last_name', 'u.email', 'u.phone_number', 'u.address', 'u.role')
            ->get();
    }
}
