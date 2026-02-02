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
        Schema::create('service_variants', function (Blueprint $table) {
            $table->id('service_variant');
            $table->foreignId('service_id')
                ->constrained('services', 'service_id')
                ->onDelete('cascade');
            $table->string('size');
            $table->decimal('price', 10, 2);
            $table->integer('estimated_duration')->comment('Duration in minutes');
            $table->timestamps();

            $table->index(['service_id', 'size']);
        });

        // Backfill: create a variant row for each existing service row.
        // Note: In legacy data, `services` currently includes size/price/duration columns.
        if (Schema::hasColumns('services', ['size', 'price', 'estimated_duration'])) {
            DB::statement(<<<'SQL'
                INSERT INTO service_variants (service_id, size, price, estimated_duration, created_at, updated_at)
                SELECT service_id, size, price, estimated_duration, created_at, updated_at
                FROM services
            SQL);
        }

        // Add new FK column to service_order_details and backfill from service_id.
        Schema::table('service_order_details', function (Blueprint $table) {
            $table->unsignedBigInteger('service_variant')->nullable()->after('service_order_id');
        });

        // Map each order detail's service_id to the corresponding variant (1:1 for legacy data).
        if (Schema::hasColumn('service_order_details', 'service_id')) {
            DB::statement(<<<'SQL'
                UPDATE service_order_details sod
                INNER JOIN service_variants sv ON sv.service_id = sod.service_id
                SET sod.service_variant = sv.service_variant
                WHERE sod.service_variant IS NULL
            SQL);
        }

        // Enforce FK + not-null, then drop old FK column.
        Schema::table('service_order_details', function (Blueprint $table) {
            $table->unsignedBigInteger('service_variant')->nullable(false)->change();
            $table->foreign('service_variant')
                ->references('service_variant')
                ->on('service_variants')
                ->onDelete('cascade');
        });

        Schema::table('service_order_details', function (Blueprint $table) {
            if (Schema::hasColumn('service_order_details', 'service_id')) {
                $table->dropForeign(['service_id']);
                $table->dropColumn('service_id');
            }
        });

        // Drop moved columns from services table.
        Schema::table('services', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach (['price', 'size', 'estimated_duration'] as $column) {
                if (Schema::hasColumn('services', $column)) {
                    $columnsToDrop[] = $column;
                }
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add moved columns on services (best-effort; original values will be restored from variants when possible).
        Schema::table('services', function (Blueprint $table) {
            if (! Schema::hasColumn('services', 'size')) {
                $table->string('size')->after('description');
            }
            if (! Schema::hasColumn('services', 'estimated_duration')) {
                $table->integer('estimated_duration')->comment('Duration in minutes')->after('category');
            }
            if (! Schema::hasColumn('services', 'price')) {
                $table->decimal('price', 10, 2)->after('estimated_duration');
            }
        });

        // Restore values from the first variant per service (legacy-safe).
        DB::statement(<<<'SQL'
            UPDATE services s
            INNER JOIN (
                SELECT sv.service_id, sv.size, sv.price, sv.estimated_duration,
                       MIN(sv.service_variant) AS min_service_variant
                FROM service_variants sv
                GROUP BY sv.service_id, sv.size, sv.price, sv.estimated_duration
            ) v ON v.service_id = s.service_id
            SET s.size = v.size,
                s.price = v.price,
                s.estimated_duration = v.estimated_duration
        SQL);

        // Re-add service_id to service_order_details and backfill from variant.
        Schema::table('service_order_details', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('service_order_id');
        });

        DB::statement(<<<'SQL'
            UPDATE service_order_details sod
            INNER JOIN service_variants sv ON sv.service_variant = sod.service_variant
            SET sod.service_id = sv.service_id
            WHERE sod.service_id IS NULL
        SQL);

        Schema::table('service_order_details', function (Blueprint $table) {
            $table->foreign('service_id')
                ->references('service_id')
                ->on('services')
                ->onDelete('cascade');
            $table->unsignedBigInteger('service_id')->nullable(false)->change();

            $table->dropForeign(['service_variant']);
            $table->dropColumn('service_variant');
        });

        Schema::dropIfExists('service_variants');
    }
};

