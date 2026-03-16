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
        $adminPermissions = [
            'view_dashboard',
            'view_registry',
            'start_service',
            'add_queue',
            'view_bookings',
            'view_bays',
            'edit_bay',
            'delete_bay',
            'add_bay',
            'view_services',
            'add_service',
            'edit_service',
            'view_inventory',
            'export_inventory_pdf',
            'add_inventory_item',
            'add_inventory_purchase',
            'pullout_inventory_request',
            'add_inventory_supplier',
            'edit_inventory_item',
            'view_pullout_requests',
            'approve_pullout_request',
            'mark_return_pullout',
            'view_users',
            'edit_user',
            'view_employees',
            'add_employee',
            'edit_employee',
            'delete_employee',
            'view_transactions',
            'export_transactions_pdf',
            'view_reports',
        ];

        $users = [
            [
                'user_id' => 1,
                'first_name' => 'Admin',
                'middle_name' => null,
                'last_name' => 'One',
                'email' => 'admin@example.com',
                'phone_number' => '908818444',
                'address' => null,
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'permissions' => json_encode($adminPermissions),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'user_id' => 6,
                'first_name' => 'Customer',
                'middle_name' => 'A.',
                'last_name' => 'One',
                'email' => 'customer@example.com',
                'phone_number' => '9103139161',
                'address' => 'Panabo City',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
                'permissions' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];
        foreach ($users as $u) {
            if (! DB::table('users')->where('user_id', $u['user_id'])->exists()) {
                DB::table('users')->insert($u);
            } else {
                // Update existing user to ensure they have the latest permissions
                DB::table('users')->where('user_id', $u['user_id'])->update([
                    'permissions' => $u['permissions'],
                    'updated_at' => $now,
                ]);
            }
        }
    }
}
