<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplyPurchasesSeeder extends Seeder
{
    public function run(): void
    {
        $monthTimeline = [];
        for ($month = 1; $month <= 12; $month++) {
            for ($day = 1; $day <= 28; $day++) {
                $hour = rand(8, 18);
                $min = rand(0, 59);
                $dateStr = sprintf('2025-%02d-%02d %02d:%02d:00', $month, $day, $hour, $min);
                $monthTimeline[] = $dateStr;
            }
        }
        shuffle($monthTimeline);
        $supplierIds = DB::table('suppliers')->pluck('supplier_id')->toArray();
        if (empty($supplierIds)) {
            return;
        }

        $purchases = [];
        for ($i = 1; $i <= 100; $i++) { // Tons, say 100
            $purchaseDate = $monthTimeline[$i % count($monthTimeline)];
            $created = date('Y-m-d H:i:s', strtotime($purchaseDate.' -'.rand(1, 24).' hours'));
            $updated = date('Y-m-d H:i:s', strtotime($created.' +'.rand(1, 12).' hours'));
            $supplierId = $supplierIds[array_rand($supplierIds)];
            $purchases[] = [
                'supply_purchase_id' => $i,
                'supplier_id' => $supplierId,
                'purchase_date' => $purchaseDate,
                'created_at' => $created,
                'updated_at' => $updated,
            ];
        }
        foreach ($purchases as $p) {
            DB::table('supply_purchases')->updateOrInsert(
                ['supply_purchase_id' => $p['supply_purchase_id']],
                $p
            );
        }
    }
}
