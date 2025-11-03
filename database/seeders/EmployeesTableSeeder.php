<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeesTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $employees = [
            ['employee_id' => 1, 'first_name' => 'Malakai', 'middle_name' => null, 'last_name' => 'Azer', 'phone_number' => '9876543210', 'status' => 'active', 'address' => 'Ilya', 'date_hired' => '2025-09-10', 'employment_ended_at' => null],
            ['employee_id' => 2, 'first_name' => 'Kit', 'middle_name' => 'R.', 'last_name' => 'Azer', 'phone_number' => '9102030405', 'status' => 'active', 'address' => 'Ilya', 'date_hired' => '2025-09-15', 'employment_ended_at' => null],
            ['employee_id' => 3, 'first_name' => 'Paedyn', 'middle_name' => null, 'last_name' => 'Gray', 'phone_number' => '9908070605', 'status' => 'active', 'address' => 'Loot Alley', 'date_hired' => '2025-09-20', 'employment_ended_at' => null],
            ['employee_id' => 4, 'first_name' => 'ding', 'middle_name' => null, 'last_name' => 'castro', 'phone_number' => '9987654432', 'status' => 'absent', 'address' => 'Loot Alley', 'date_hired' => '2024-12-05', 'employment_ended_at' => null],
            ['employee_id' => 5, 'first_name' => 'Adena', 'middle_name' => null, 'last_name' => 'Khitan', 'phone_number' => '9987654432', 'status' => 'inactive', 'address' => 'Loot Alley', 'date_hired' => '2024-12-05', 'employment_ended_at' => '2025-10-01'],
        ];

        foreach ($employees as $e) {
            if (! DB::table('employees')->where('employee_id', $e['employee_id'])->exists()) {
                $e['created_at'] = $now;
                $e['updated_at'] = $now;
                DB::table('employees')->insert($e);
            }
        }
    }
}
