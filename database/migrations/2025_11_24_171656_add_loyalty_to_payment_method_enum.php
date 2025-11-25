<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the payment_method enum to include 'loyalty'
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash', 'gcash', 'loyalty') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash', 'gcash') NOT NULL");
    }
};
