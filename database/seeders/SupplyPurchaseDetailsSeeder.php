<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplyPurchaseDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $details = [
            ['supply_purchase_details_id' => 1, 'supply_id' => 1, 'supply_purchase_id' => 1, 'quantity' => 55, 'unit_price' => 50],
            ['supply_purchase_details_id' => 2, 'supply_id' => 2, 'supply_purchase_id' => 1, 'quantity' => 120, 'unit_price' => 65],
            ['supply_purchase_details_id' => 3, 'supply_id' => 3, 'supply_purchase_id' => 1, 'quantity' => 245, 'unit_price' => 100],
            ['supply_purchase_details_id' => 4, 'supply_id' => 4, 'supply_purchase_id' => 1, 'quantity' => 221, 'unit_price' => 150],
            ['supply_purchase_details_id' => 5, 'supply_id' => 5, 'supply_purchase_id' => 1, 'quantity' => 285, 'unit_price' => 48],
            ['supply_purchase_details_id' => 6, 'supply_id' => 6, 'supply_purchase_id' => 1, 'quantity' => 121, 'unit_price' => 32],
            ['supply_purchase_details_id' => 7, 'supply_id' => 7, 'supply_purchase_id' => 1, 'quantity' => 212, 'unit_price' => 12],
            ['supply_purchase_details_id' => 8, 'supply_id' => 8, 'supply_purchase_id' => 1, 'quantity' => 222, 'unit_price' => 98],
            ['supply_purchase_details_id' => 9, 'supply_id' => 9, 'supply_purchase_id' => 1, 'quantity' => 111, 'unit_price' => 20],
            ['supply_purchase_details_id' => 10, 'supply_id' => 10, 'supply_purchase_id' => 2, 'quantity' => 6, 'unit_price' => 77],
            ['supply_purchase_details_id' => 11, 'supply_id' => 11, 'supply_purchase_id' => 2, 'quantity' => 8, 'unit_price' => 63],
            ['supply_purchase_details_id' => 12, 'supply_id' => 12, 'supply_purchase_id' => 2, 'quantity' => 5, 'unit_price' => 59],
            ['supply_purchase_details_id' => 13, 'supply_id' => 13, 'supply_purchase_id' => 2, 'quantity' => 5, 'unit_price' => 203],
            ['supply_purchase_details_id' => 14, 'supply_id' => 14, 'supply_purchase_id' => 2, 'quantity' => 4, 'unit_price' => 652],
            ['supply_purchase_details_id' => 15, 'supply_id' => 15, 'supply_purchase_id' => 2, 'quantity' => 6, 'unit_price' => 15],
            ['supply_purchase_details_id' => 16, 'supply_id' => 16, 'supply_purchase_id' => 2, 'quantity' => 8, 'unit_price' => 425],
            ['supply_purchase_details_id' => 17, 'supply_id' => 17, 'supply_purchase_id' => 2, 'quantity' => 10, 'unit_price' => 152],
            ['supply_purchase_details_id' => 18, 'supply_id' => 18, 'supply_purchase_id' => 2, 'quantity' => 15, 'unit_price' => 652],
            ['supply_purchase_details_id' => 19, 'supply_id' => 19, 'supply_purchase_id' => 2, 'quantity' => 20, 'unit_price' => 753],
            ['supply_purchase_details_id' => 20, 'supply_id' => 20, 'supply_purchase_id' => 2, 'quantity' => 10, 'unit_price' => 222],
        ];

        foreach ($details as $d) {
            if (! DB::table('supply_purchase_details')->where('supply_purchase_details_id', $d['supply_purchase_details_id'])->exists()) {
                $d['created_at'] = $now;
                $d['updated_at'] = $now;
                DB::table('supply_purchase_details')->insert($d);
            }
        }
    }
}
