<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CarLibrarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = base_path('resources/data/philippine-vehicle-sizes.json');

        if (! file_exists($jsonPath)) {
            return;
        }

        $cars = json_decode(file_get_contents($jsonPath), true);

        if (! is_array($cars)) {
            return;
        }

        foreach ($cars as $car) {
            \App\Models\CarLibrary::firstOrCreate(
                [
                    'make' => trim($car['make']),
                    'model' => trim($car['model']),
                ],
                [
                    'size' => trim($car['size']),
                ]
            );
        }
    }
}
