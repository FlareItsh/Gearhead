<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin Account
        if (! User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'first_name' => 'Admin',
                'middle_name' => null,
                'last_name' => 'One',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
        }

        // Create Customer Account
        if (! User::where('email', 'customer@example.com')->exists()) {
            User::create([
                'first_name' => 'Customer',
                'middle_name' => null,
                'last_name' => 'One',
                'email' => 'customer@example.com',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ]);
        }
    }
}
