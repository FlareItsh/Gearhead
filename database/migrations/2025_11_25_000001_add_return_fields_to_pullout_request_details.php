<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pullout_request_details', function (Blueprint $table) {
            $table->boolean('is_returned')->default(false)->after('quantity');
            $table->dateTime('returned_at')->nullable()->after('is_returned');
            $table->string('returned_by')->nullable()->after('returned_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pullout_request_details', function (Blueprint $table) {
            $table->dropColumn(['is_returned', 'returned_at', 'returned_by']);
        });
    }
};
