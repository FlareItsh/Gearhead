<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PulloutServicesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Create pullout services that reference existing service_order_detail_ids
        $services = [
            ['pullout_service_id' => 1, 'service_order_detail_id' => 1, 'bay_number' => '6'],
            ['pullout_service_id' => 2, 'service_order_detail_id' => 2, 'bay_number' => '1'],
            ['pullout_service_id' => 3, 'service_order_detail_id' => 3, 'bay_number' => '2'],
            ['pullout_service_id' => 4, 'service_order_detail_id' => 4, 'bay_number' => '3'],
        ];

        foreach ($services as $s) {
            if (! DB::table('pullout_services')->where('pullout_service_id', $s['pullout_service_id'])->exists()) {
                $s['created_at'] = $now;
                $s['updated_at'] = $now;
                DB::table('pullout_services')->insert($s);
            }
        }
    }
}
