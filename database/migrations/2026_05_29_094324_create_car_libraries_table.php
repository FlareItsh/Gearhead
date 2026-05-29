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
        Schema::create('car_libraries', function (Blueprint $table) {
            $table->id();
            $table->string('make');
            $table->string('model');
            $table->string('size');
            $table->timestamps();

            $table->unique(['make', 'model']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_libraries');
    }
};
