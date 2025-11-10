<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceOrderDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $details = [
            ['service_order_detail_id' => 1, 'service_order_id' => 1, 'service_id' => 11],
            ['service_order_detail_id' => 2, 'service_order_id' => 1, 'service_id' => 2],
            ['service_order_detail_id' => 3, 'service_order_id' => 2, 'service_id' => 9],
            ['service_order_detail_id' => 4, 'service_order_id' => 3, 'service_id' => 4],
            ['service_order_detail_id' => 5, 'service_order_id' => 3, 'service_id' => 3],
            ['service_order_detail_id' => 6, 'service_order_id' => 4, 'service_id' => 12],
            ['service_order_detail_id' => 7, 'service_order_id' => 5, 'service_id' => 8],
            ['service_order_detail_id' => 8, 'service_order_id' => 6, 'service_id' => 4],
            ['service_order_detail_id' => 9, 'service_order_id' => 7, 'service_id' => 16],
            ['service_order_detail_id' => 10, 'service_order_id' => 8, 'service_id' => 50],
            ['service_order_detail_id' => 11, 'service_order_id' => 9, 'service_id' => 41],
            ['service_order_detail_id' => 12, 'service_order_id' => 10, 'service_id' => 12],
            ['service_order_detail_id' => 13, 'service_order_id' => 11, 'service_id' => 8],
            ['service_order_detail_id' => 14, 'service_order_id' => 12, 'service_id' => 4],
            ['service_order_detail_id' => 15, 'service_order_id' => 13, 'service_id' => 19],
            ['service_order_detail_id' => 16, 'service_order_id' => 14, 'service_id' => 22],
        ];

        foreach ($details as $d) {
            if (! DB::table('service_order_details')->where('service_order_detail_id', $d['service_order_detail_id'])->exists()) {
                $d['created_at'] = $now;
                $d['updated_at'] = $now;
                DB::table('service_order_details')->insert($d);
            }
        }
    }
}
