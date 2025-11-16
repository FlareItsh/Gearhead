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
        for ($orderId = 1; $orderId <= 200; $orderId++) {
            $numDetails = rand(1, 5); // Multiple services per order
            for ($j = 0; $j < $numDetails; $j++) {
                $detailId = (($orderId - 1) * 5) + $j + 1;
                $serviceId = rand(1, 50);
                $details[] = [
                    'service_order_detail_id' => $detailId,
                    'service_order_id' => $orderId,
                    'service_id' => $serviceId,
                    'quantity' => rand(1, 3),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        foreach ($details as $d) {
            if (! DB::table('service_order_details')->where('service_order_detail_id', $d['service_order_detail_id'])->exists()) {
                DB::table('service_order_details')->insert($d);
            }
        }
    }
}
