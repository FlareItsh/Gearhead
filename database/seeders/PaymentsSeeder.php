<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentsSeeder extends Seeder
{
    public function run(): void
    {
        $orderIds = DB::table('service_orders')->pluck('service_order_id')->toArray();
        $payments = [];
        $monthTimeline = [];
        for ($month = 1; $month <= 12; $month++) {
            for ($day = 1; $day <= 28; $day++) {
                $hour = rand(8, 18);
                $min = rand(0, 59);
                $monthTimeline[] = sprintf('2025-%02d-%02d %02d:%02d:00', $month, $day, $hour, $min);
            }
        }
        shuffle($monthTimeline);

        foreach ($orderIds as $index => $orderId) {
            $details = DB::table('service_order_details as sod')
                ->join('service_variants as sv', 'sod.service_variant', '=', 'sv.service_variant')
                ->where('sod.service_order_id', $orderId)
                ->select(DB::raw('SUM(sv.price * sod.quantity) as total'))
                ->first();

            $amount = $details->total ?? rand(300, 2000);
            $payment_method = rand(0, 1) ? 'cash' : 'gcash';
            $is_point_redeemed = (bool) rand(0, 1);
            $gcash_reference = $payment_method === 'gcash' ? (string) rand(1000000000000, 9999999999999) : null;

            $created = $monthTimeline[$index % count($monthTimeline)];
            $updated = date('Y-m-d H:i:s', strtotime($created.' +2 hours'));

            DB::table('payments')->updateOrInsert(
                ['payment_id' => $index + 1],
                [
                    'service_order_id' => $orderId,
                    'amount' => $amount,
                    'payment_method' => $payment_method,
                    'is_point_redeemed' => $is_point_redeemed,
                    'gcash_reference' => $gcash_reference,
                    'created_at' => $created,
                    'updated_at' => $updated,
                ]
            );
        }
    }
}
