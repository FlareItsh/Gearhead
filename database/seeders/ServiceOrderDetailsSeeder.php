<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceOrderDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $variantIds = DB::table('service_variants')->pluck('service_variant')->toArray();

        // If no variants, skip
        if (empty($variantIds)) {
            return;
        }

        $details = [];
        for ($orderId = 1; $orderId <= 200; $orderId++) {
            $numDetails = rand(1, min(3, count($variantIds))); // Reduced for realistic data, capped by total variants
            $selectedVariants = [];
            // Pick unique random keys
            $randomKeys = array_rand($variantIds, $numDetails);
            if (!is_array($randomKeys)) {
                $randomKeys = [$randomKeys];
            }
            
            for ($j = 0; $j < $numDetails; $j++) {
                $detailId = (($orderId - 1) * 3) + $j + 1;
                $serviceVariant = $variantIds[$randomKeys[$j]];
                $details[] = [
                    'service_order_detail_id' => $detailId,
                    'service_order_id' => $orderId,
                    'service_variant' => $serviceVariant,
                    'quantity' => rand(1, 1), // Most services are quantity 1
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
