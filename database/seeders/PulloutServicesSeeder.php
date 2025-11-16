<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PulloutServicesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Fetch existing service_order_detail_ids
        $serviceOrderDetailIds = DB::table('service_order_details')
            ->pluck('service_order_detail_id')
            ->toArray();

        // Stop if there are no service order details
        if (empty($serviceOrderDetailIds)) {
            $this->command->info('No service order details found. Skipping PulloutServicesSeeder.');

            return;
        }

        $services = [];

        // Seed pullout services for the first N service order details (or all if you like)
        foreach ($serviceOrderDetailIds as $index => $detailId) {
            $services[] = [
                'pullout_service_id' => $index + 1, // auto-increment
                'service_order_detail_id' => $detailId,
                'bay_number' => rand(1, 6), // Random bay number
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Insert only if the pullout_service_id does not already exist
        foreach ($services as $s) {
            if (! DB::table('pullout_services')->where('pullout_service_id', $s['pullout_service_id'])->exists()) {
                DB::table('pullout_services')->insert($s);
            }
        }

        $this->command->info(count($services).' pullout services seeded.');
    }
}
