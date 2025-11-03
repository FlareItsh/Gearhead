<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplyPurchasesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $purchases = [
            ['supply_purchase_id'=>1,'supplier_id'=>1,'purchase_date'=>null],
            ['supply_purchase_id'=>2,'supplier_id'=>2,'purchase_date'=>null],
        ];

        foreach ($purchases as $p) {
            if (! DB::table('supply_purchases')->where('supply_purchase_id', $p['supply_purchase_id'])->exists()) {
                $p['created_at'] = $now;
                $p['updated_at'] = $now;
                DB::table('supply_purchases')->insert($p);
            }
        }
    }
}
