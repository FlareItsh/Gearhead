<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $payments = [
            ['payment_id' => 1, 'service_order_id' => 1, 'amount' => 480, 'payment_method' => 'cash', 'is_point_redeemed' => false, 'gcash_reference' => null],
            ['payment_id' => 2, 'service_order_id' => 2, 'amount' => 500, 'payment_method' => 'cash', 'is_point_redeemed' => true, 'gcash_reference' => null],
            ['payment_id' => 3, 'service_order_id' => 3, 'amount' => 500, 'payment_method' => 'gcash', 'is_point_redeemed' => false, 'gcash_reference' => '3658946164618'],
            ['payment_id' => 4, 'service_order_id' => 4, 'amount' => 350, 'payment_method' => 'cash', 'is_point_redeemed' => false, 'gcash_reference' => null],
        ];

        foreach ($payments as $p) {
            if (! DB::table('payments')->where('payment_id', $p['payment_id'])->exists()) {
                $p['created_at'] = $now;
                $p['updated_at'] = $now;
                DB::table('payments')->insert($p);
            }
        }
    }
}
