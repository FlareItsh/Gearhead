<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceOrderDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $details = [];

        // Define date range for purchase_date (April to June 2026)
        $start = strtotime('2026-04-01 00:00:00');
        $end = strtotime('2026-06-30 23:59:59');

        $orderIds = DB::table('service_orders')->pluck('service_order_id')->toArray();

        foreach ($orderIds as $orderId) {
            $numDetails = rand(1, 3); // Multiple details per order

            for ($j = 0; $j < $numDetails; $j++) {
                $serviceVariant = rand(1, 20); // Assume variants 1-20 exist

                // Random purchase_date in April-June 2026
                $orderDate = date('Y-m-d H:i:s', rand($start, $end));

                $details[] = [
                    'service_order_id' => $orderId,
                    'service_variant' => $serviceVariant,
                    'quantity' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('service_order_details')->insert($details);
    }
}
