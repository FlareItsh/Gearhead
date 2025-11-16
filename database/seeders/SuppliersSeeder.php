<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SuppliersSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $suppliers = [
            ['supplier_id' => 1, 'first_name' => 'Maria', 'middle_name' => null, 'last_name' => 'Salem', 'phone_number' => '0912345678', 'email' => 'maria@example.com'],
            ['supplier_id' => 2, 'first_name' => 'Tor', 'middle_name' => null, 'last_name' => 'Bagtik', 'phone_number' => '0912345679', 'email' => 'Tor@example.com'],
        ];
        // Add more, say up to 10
        for ($i = 3; $i <= 10; $i++) {
            $first = 'Supplier'.$i;
            $last = 'Last'.$i;
            $phone = '09'.rand(10000000, 99999999);
            $email = 'supplier'.$i.'@example.com';
            $suppliers[] = [
                'supplier_id' => $i,
                'first_name' => $first,
                'middle_name' => null,
                'last_name' => $last,
                'phone_number' => $phone,
                'email' => $email,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        foreach ($suppliers as $s) {
            if (! DB::table('suppliers')->where('supplier_id', $s['supplier_id'])->exists()) {
                DB::table('suppliers')->insert($s);
            }
        }
    }
}
