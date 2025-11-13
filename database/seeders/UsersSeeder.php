<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $users = [
            ['user_id' => 1, 'first_name' => 'Admin', 'middle_name' => null, 'last_name' => 'One', 'email' => 'admin@example.com', 'phone_number' => '908818444', 'address' => null, 'password' => Hash::make('admin123'), 'role' => 'admin', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 2, 'first_name' => 'Customer', 'middle_name' => null, 'last_name' => 'One', 'email' => 'customer@example.com', 'phone_number' => '908818444', 'address' => null, 'password' => Hash::make('customer123'), 'role' => 'customer', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 3, 'first_name' => 'Flare', 'middle_name' => 'A.', 'last_name' => 'Itoshi', 'email' => 'flare@gmail.com', 'phone_number' => '9123456789', 'address' => 'Davao City', 'password' => Hash::make('pass1234'), 'role' => 'customer', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 4, 'first_name' => 'Mariz', 'middle_name' => 'S.', 'last_name' => 'Adlaw', 'email' => 'mariz.adlaw@example.com', 'phone_number' => '9987654321', 'address' => 'Tagum City', 'password' => Hash::make('qwerty01'), 'role' => 'customer', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 5, 'first_name' => 'Carlo', 'middle_name' => 'L.', 'last_name' => 'Bilbacua', 'email' => 'carlo@example.com', 'phone_number' => '9088184444', 'address' => 'Panabo City', 'password' => Hash::make('abcxyz12'), 'role' => 'customer', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 6, 'first_name' => 'admini', 'middle_name' => 'A.', 'last_name' => 'ster', 'email' => 'administer@example.com', 'phone_number' => '9103139161', 'address' => 'Panabo City', 'password' => Hash::make('watapampa01'), 'role' => 'admin', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($users as $u) {
            if (! DB::table('users')->where('user_id', $u['user_id'])->exists()) {
                DB::table('users')->insert($u);
            }
        }
    }
}
