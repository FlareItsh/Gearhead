<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PulloutRequestDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $details = [
            ['pullout_request_details_id'=>1,'pullout_service_id'=>1,'supply_id'=>1,'pullout_request_id'=>1,'quantity'=>2],
            ['pullout_request_details_id'=>2,'pullout_service_id'=>1,'supply_id'=>2,'pullout_request_id'=>1,'quantity'=>4],
            ['pullout_request_details_id'=>3,'pullout_service_id'=>2,'supply_id'=>8,'pullout_request_id'=>2,'quantity'=>5],
            ['pullout_request_details_id'=>4,'pullout_service_id'=>3,'supply_id'=>9,'pullout_request_id'=>3,'quantity'=>1],
            ['pullout_request_details_id'=>5,'pullout_service_id'=>3,'supply_id'=>15,'pullout_request_id'=>3,'quantity'=>2],
        ];

        foreach ($details as $d) {
            if (! DB::table('pullout_request_details')->where('pullout_request_details_id', $d['pullout_request_details_id'])->exists()) {
                $d['created_at'] = $now;
                $d['updated_at'] = $now;
                DB::table('pullout_request_details')->insert($d);
            }
        }
    }
}
