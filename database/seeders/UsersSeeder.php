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
            ['user_id' => 6, 'first_name' => 'Customer', 'middle_name' => 'A.', 'last_name' => 'One', 'email' => 'customer@example.com', 'phone_number' => '9103139161', 'address' => 'Panabo City', 'password' => Hash::make('customer123'), 'role' => 'customer', 'created_at' => $now, 'updated_at' => $now],
        ];
        foreach ($users as $u) {
            if (! DB::table('users')->where('user_id', $u['user_id'])->exists()) {
                DB::table('users')->insert($u);
            }
        }
    }
}
