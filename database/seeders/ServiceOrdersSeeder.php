<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceOrdersSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $orders = [
            ['service_order_id' => 1, 'user_id' => 2, 'employee_id' => 1, 'bay_id' => 6, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 2, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 3, 'user_id' => 4, 'employee_id' => 3, 'bay_id' => 2, 'order_date' => null, 'order_type' => 'r'],
            ['service_order_id' => 4, 'user_id' => 4, 'employee_id' => 1, 'bay_id' => 3, 'order_date' => null, 'order_type' => 'r'],
            ['service_order_id' => 5, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 6, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 7, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 8, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 9, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 10, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 11, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 12, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 13, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
            ['service_order_id' => 14, 'user_id' => 3, 'employee_id' => 2, 'bay_id' => 1, 'order_date' => null, 'order_type' => 'w'],
        ];

        foreach ($orders as $o) {
            if (! DB::table('service_orders')->where('service_order_id', $o['service_order_id'])->exists()) {
                $o['created_at'] = $now;
                $o['updated_at'] = $now;
                DB::table('service_orders')->insert($o);
            }
        }
    }
}
