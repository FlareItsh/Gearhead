<?php
 
namespace Database\Seeders;
 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
 
class SupplyLedgerDemoSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $threeMonthsAgo = $now->copy()->subMonths(3);
        $oneMonthAgo = $now->copy()->subDays(30);

        // Clear existing transactions to start fresh for ALL supplies
        DB::table('supply_purchases')->where('purchase_reference', 'like', 'DEMO-%')->delete();
        
        $supplies = DB::table('supplies')->pluck('supply_id')->toArray();

        foreach ($supplies as $supplyId) {
            $totalIn = 0;
            $totalOut = 0;

            // 1. Establish Historical Balance (3 months ago)
            $histPurchaseId = DB::table('supply_purchases')->insertGetId([
                'supplier_id' => rand(1, 2),
                'purchase_reference' => 'DEMO-HIST-' . $supplyId,
                'purchase_date' => $threeMonthsAgo,
                'created_at' => $threeMonthsAgo,
                'updated_at' => $threeMonthsAgo,
            ], 'supply_purchase_id');

            $histQtyIn = rand(50, 100);
            DB::table('supply_purchase_details')->insert([
                'supply_purchase_id' => $histPurchaseId,
                'supply_id' => $supplyId,
                'quantity' => $histQtyIn,
                'unit_price' => rand(10, 50),
                'purchase_date' => $threeMonthsAgo,
                'created_at' => $threeMonthsAgo,
                'updated_at' => $threeMonthsAgo,
            ]);
            $totalIn += $histQtyIn;

            // Historical Pullout
            $histPulloutQty = rand(10, 30);
            $histPulloutId = DB::table('pullout_requests')->insertGetId([
                'employee_id' => rand(1, 5),
                'date_time' => $threeMonthsAgo->copy()->addDays(5),
                'is_approve' => true,
                'approve_by' => 'Admin',
                'approve_date' => $threeMonthsAgo->copy()->addDays(5),
                'created_at' => $threeMonthsAgo->copy()->addDays(5),
                'updated_at' => $threeMonthsAgo->copy()->addDays(5),
            ], 'pullout_request_id');

            $histPulloutServiceId = DB::table('pullout_services')->insertGetId([
                'service_order_detail_id' => rand(1, 5),
                'bay_number' => 'Bay ' . rand(1, 6),
                'created_at' => $threeMonthsAgo->copy()->addDays(5),
                'updated_at' => $threeMonthsAgo->copy()->addDays(5),
            ], 'pullout_service_id');

            DB::table('pullout_request_details')->insert([
                'pullout_request_id' => $histPulloutId,
                'pullout_service_id' => $histPulloutServiceId,
                'supply_id' => $supplyId,
                'quantity' => $histPulloutQty,
                'is_returned' => false,
                'created_at' => $threeMonthsAgo->copy()->addDays(5),
                'updated_at' => $threeMonthsAgo->copy()->addDays(5),
            ]);
            $totalOut += $histPulloutQty;

            // 2. Visible Recent Transactions (Last 30 days)
            
            // Recent Purchase
            $recentPurchaseId = DB::table('supply_purchases')->insertGetId([
                'supplier_id' => rand(1, 2),
                'purchase_reference' => 'DEMO-REC-' . $supplyId,
                'purchase_date' => $now->copy()->subDays(15),
                'created_at' => $now->copy()->subDays(15),
                'updated_at' => $now->copy()->subDays(15),
            ], 'supply_purchase_id');

            $recentQtyIn = rand(20, 50);
            DB::table('supply_purchase_details')->insert([
                'supply_purchase_id' => $recentPurchaseId,
                'supply_id' => $supplyId,
                'quantity' => $recentQtyIn,
                'unit_price' => rand(10, 50),
                'purchase_date' => $now->copy()->subDays(15),
                'created_at' => $now->copy()->subDays(15),
                'updated_at' => $now->copy()->subDays(15),
            ]);
            $totalIn += $recentQtyIn;

            // Recent Pullout
            $recentPulloutQty = rand(5, 15);
            $recentPulloutId = DB::table('pullout_requests')->insertGetId([
                'employee_id' => rand(1, 5),
                'date_time' => $now->copy()->subDays(10),
                'is_approve' => true,
                'approve_by' => 'Admin',
                'approve_date' => $now->copy()->subDays(10),
                'created_at' => $now->copy()->subDays(10),
                'updated_at' => $now->copy()->subDays(10),
            ], 'pullout_request_id');

            $recentPulloutServiceId = DB::table('pullout_services')->insertGetId([
                'service_order_detail_id' => rand(1, 5),
                'bay_number' => 'Bay ' . rand(1, 6),
                'created_at' => $now->copy()->subDays(10),
                'updated_at' => $now->copy()->subDays(10),
            ], 'pullout_service_id');

            DB::table('pullout_request_details')->insert([
                'pullout_request_id' => $recentPulloutId,
                'pullout_service_id' => $recentPulloutServiceId,
                'supply_id' => $supplyId,
                'quantity' => $recentPulloutQty,
                'is_returned' => false,
                'created_at' => $now->copy()->subDays(10),
                'updated_at' => $now->copy()->subDays(10),
            ]);
            $totalOut += $recentPulloutQty;

            // Final Stock Update
            $finalStock = $totalIn - $totalOut;
            DB::table('supplies')->where('supply_id', $supplyId)->update(['quantity_stock' => $finalStock]);
        }
    }
}
