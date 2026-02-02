<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceOrdersSeeder extends Seeder
{
    public function run(): void
    {
        $monthTimeline = [];
        for ($month = 1; $month <= 12; $month++) {
            for ($day = 1; $day <= 28; $day++) { // Safe for Feb
                $hour = rand(8, 18);
                $min = rand(0, 59);
                $dateStr = sprintf('2025-%02d-%02d %02d:%02d:00', $month, $day, $hour, $min);
                $monthTimeline[] = $dateStr;
            }
        }
        shuffle($monthTimeline); // Randomize for variety

        $userIds = DB::table('users')->where('role', 'customer')->pluck('user_id')->toArray();
        if (empty($userIds)) {
            $userIds = [1]; // Fallback to admin if no customers
        }

        $orders = [];
        for ($i = 1; $i <= 200; $i++) {
            $orderDate = $monthTimeline[$i % count($monthTimeline)];
            $created = date('Y-m-d H:i:s', strtotime($orderDate.' -'.rand(1, 48).' hours'));
            $updated = date('Y-m-d H:i:s', strtotime($created.' +'.rand(1, 24).' hours'));
            $userId = $userIds[array_rand($userIds)];
            $employeeId = rand(1, 10);
            $bayId = rand(1, 6);
            $status = 'Completed';
            $orderType = rand(0, 1) ? 'W' : 'R';
            // Check if any detail has underwash (service_id 6-9), adjust bay to 6
            // But since details seeded after, assume some logic: if rand, set bay 6 for some
            if (rand(1, 10) <= 2) { // 20% chance for underwash order
                $bayId = 6;
            }
            $orders[] = [
                'service_order_id' => $i,
                'user_id' => $userId,
                'employee_id' => $employeeId,
                'bay_id' => $bayId,
                'status' => $status,
                'order_date' => $orderDate,
                'order_type' => $orderType,
                'created_at' => $created,
                'updated_at' => $updated,
            ];
        }
        foreach ($orders as $o) {
            DB::table('service_orders')->updateOrInsert(
                ['service_order_id' => $o['service_order_id']],
                $o
            );
        }
    }
}
