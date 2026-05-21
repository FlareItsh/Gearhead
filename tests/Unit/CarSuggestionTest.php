<?php

use App\Http\Controllers\CarController;
use App\Models\Car;
use App\Repositories\Contracts\CarRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

uses(Tests\TestCase::class);

function carSuggestionController(): CarController
{
    return new CarController(new class implements CarRepositoryInterface
    {
        public function all(): Collection
        {
            return collect();
        }

        public function find(int $id): Car
        {
            return new Car;
        }

        public function create(array $data): Car
        {
            return new Car($data);
        }

        public function update(int $id, array $data): Car
        {
            return new Car($data);
        }

        public function delete(int $id): bool
        {
            return true;
        }

        public function getByUserId(int $userId): Collection
        {
            return collect();
        }
    });
}

test('model suggestions prefer the selected make and typed model prefix', function () {
    config([
        'cache.default' => 'array',
        'services.api_ninjas.key' => 'test-key',
    ]);

    Http::fake([
        'https://api.api-ninjas.com/*' => Http::response([
            [
                'make' => 'Suzuki',
                'model' => 'Swift',
                'year' => 1994,
                'class' => 'subcompact car',
            ],
            [
                'make' => 'Toyota',
                'model' => 'Wigo',
                'year' => 2023,
                'class' => 'subcompact car',
            ],
        ], 200),
    ]);

    $response = carSuggestionController()->suggest(Request::create('/api/cars/suggest', 'GET', [
        'make' => 'Toyota',
        'query' => 'wi',
    ]));

    $suggestions = $response->getData(true);

    expect($suggestions[0])
        ->make->toBe('Toyota')
        ->model->toBe('Wigo');
});
