<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SupplyLedgerDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Use Microfiber towel (ID 15) for demo
        $supplyId = 15;
        
        // Clear existing ledger entries for this supply to have a clean demo
        DB::table('supply_purchases')->whereIn('purchase_reference', ['PUR-HIST-001', 'PUR-REC-002'])->delete();
        DB::table('pullout_request_details')->where('supply_id', $supplyId)->delete();

        // 1. Historical data (3 months ago) - to create forwarded balance
        $threeMonthsAgo = Carbon::now()->subMonths(3);
        
        // Purchase 100 units
        $purchaseId1 = DB::table('supply_purchases')->insertGetId([
            'supplier_id' => 1,
            'purchase_reference' => 'PUR-HIST-001',
            'purchase_date' => $threeMonthsAgo,
            'created_at' => $threeMonthsAgo,
            'updated_at' => $threeMonthsAgo,
        ], 'supply_purchase_id');

        DB::table('supply_purchase_details')->insert([
            'supply_purchase_id' => $purchaseId1,
            'supply_id' => $supplyId,
            'quantity' => 100,
            'unit_price' => 50,
            'purchase_date' => $threeMonthsAgo,
            'created_at' => $threeMonthsAgo,
            'updated_at' => $threeMonthsAgo,
        ]);

        // Pullout 20 units (Historical)
        $pulloutId1 = DB::table('pullout_requests')->insertGetId([
            'employee_id' => 1,
            'date_time' => $threeMonthsAgo->copy()->addDays(5),
            'is_approve' => true,
            'approve_by' => 'Admin',
            'approve_date' => $threeMonthsAgo->copy()->addDays(5),
            'created_at' => $threeMonthsAgo->copy()->addDays(5),
            'updated_at' => $threeMonthsAgo->copy()->addDays(5),
        ], 'pullout_request_id');

        $pulloutServiceId1 = DB::table('pullout_services')->insertGetId([
            'service_order_detail_id' => 1,
            'bay_number' => 'Bay 1',
            'created_at' => $threeMonthsAgo->copy()->addDays(5),
            'updated_at' => $threeMonthsAgo->copy()->addDays(5),
        ], 'pullout_service_id');

        DB::table('pullout_request_details')->insert([
            'pullout_request_id' => $pulloutId1,
            'pullout_service_id' => $pulloutServiceId1,
            'supply_id' => $supplyId,
            'quantity' => 20,
            'is_returned' => false,
            'created_at' => $threeMonthsAgo->copy()->addDays(5),
            'updated_at' => $threeMonthsAgo->copy()->addDays(5),
        ]);

        // 2. Recent data (within last 30 days)
        $recentDate = Carbon::now()->subDays(10);
        
        // Purchase 50 units
        $purchaseId2 = DB::table('supply_purchases')->insertGetId([
            'supplier_id' => 1,
            'purchase_reference' => 'PUR-REC-002',
            'purchase_date' => $recentDate,
            'created_at' => $recentDate,
            'updated_at' => $recentDate,
        ], 'supply_purchase_id');

        DB::table('supply_purchase_details')->insert([
            'supply_purchase_id' => $purchaseId2,
            'supply_id' => $supplyId,
            'quantity' => 50,
            'unit_price' => 55,
            'purchase_date' => $recentDate,
            'created_at' => $recentDate,
            'updated_at' => $recentDate,
        ]);

        // Pullout 15 units (Recent)
        $pulloutId2 = DB::table('pullout_requests')->insertGetId([
            'employee_id' => 1,
            'date_time' => Carbon::now()->subDays(5),
            'is_approve' => true,
            'approve_by' => 'Admin',
            'approve_date' => Carbon::now()->subDays(5),
            'created_at' => Carbon::now()->subDays(5),
            'updated_at' => Carbon::now()->subDays(5),
        ], 'pullout_request_id');

        $pulloutServiceId2 = DB::table('pullout_services')->insertGetId([
            'service_order_detail_id' => 1,
            'bay_number' => 'Bay 1',
            'created_at' => Carbon::now()->subDays(5),
            'updated_at' => Carbon::now()->subDays(5),
        ], 'pullout_service_id');

        DB::table('pullout_request_details')->insert([
            'pullout_request_id' => $pulloutId2,
            'pullout_service_id' => $pulloutServiceId2,
            'supply_id' => $supplyId,
            'quantity' => 15,
            'is_returned' => true,
            'returned_at' => Carbon::now()->subDays(2),
            'returned_by' => 'Staff',
            'created_at' => Carbon::now()->subDays(5),
            'updated_at' => Carbon::now()->subDays(2),
        ]);

        // Update current stock to match seeder results: 
        // Historical: 100 (in) - 20 (out) = 80
        // Recent: 50 (in) - 15 (out) + 15 (return) = 130
        // Total: 130
        DB::table('supplies')->where('supply_id', $supplyId)->update(['quantity_stock' => 130]);
    }
}
