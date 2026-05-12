<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplyPurchaseDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $details = [];

        // Define date range for purchase_date (April to June 2026)
        $start = strtotime('2026-04-01 00:00:00');
        $end = strtotime('2026-06-30 23:59:59');

        // Loop over 15 purchases
        for ($purchaseId = 1; $purchaseId <= 15; $purchaseId++) {
            $numDetails = rand(3, 15); // Multiple details per purchase

            for ($j = 0; $j < $numDetails; $j++) {
                $detailId = (($purchaseId - 1) * 15) + $j + 1;
                $supplyId = rand(1, 20);

                // Scale down quantity and unit price to reduce expenses
                $quantity = rand(5, 40);       // Previously 5-300
                $unitPrice = rand(5, 40);      // Previously 10-800

                // Random purchase_date in April-June 2026
                $purchase_date = date('Y-m-d H:i:s', rand($start, $end));

                $details[] = [
                    'supply_purchase_details_id' => $detailId,
                    'supply_purchase_id' => $purchaseId,
                    'supply_id' => $supplyId,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'purchase_date' => $purchase_date,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Insert into DB if not already exists
        foreach ($details as $d) {
            if (! DB::table('supply_purchase_details')
                ->where('supply_purchase_details_id', $d['supply_purchase_details_id'])
                ->exists()) {
                DB::table('supply_purchase_details')->insert($d);
            }
        }
    }
}
