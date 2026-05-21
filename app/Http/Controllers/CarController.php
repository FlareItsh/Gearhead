<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\StoreCarRequest;
use App\Repositories\Contracts\CarRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CarController extends Controller
{
    public function __construct(protected CarRepositoryInterface $cars) {}

    /**
     * Store a newly created car in storage.
     */
    public function store(StoreCarRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->user_id;

        $this->cars->create($validated);

        return back()->with('status', 'car-added');
    }

    /**
     * Remove the specified car from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $car = $this->cars->find($id);

        if ($car->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $this->cars->delete($id);

        return back()->with('status', 'car-deleted');
    }

    /**
     * Suggest car models using API Ninjas Cars API with local caching.
     */
    public function suggest(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('query', ''));
        if (empty($query) || strlen($query) < 2) {
            return response()->json([]);
        }

        $make = trim((string) $request->query('make', ''));
        $field = $request->query('field') === 'make' ? 'make' : 'model';

        $apiKey = config('services.api_ninjas.key');

        if (empty($apiKey)) {
            return response()->json([]);
        }

        $cacheKey = 'car_suggestions_'.md5(strtolower($field.'|'.$make.'|'.$query));
        $suggestions = Cache::remember($cacheKey, now()->addDay(), function () use ($apiKey, $field, $make, $query) {
            try {
                $parameters = [
                    $field => $query,
                ];

                if ($field === 'model' && strlen($make) >= 2) {
                    $parameters['make'] = $make;
                }

                $response = Http::timeout(5)->retry(2)->withHeaders([
                    'X-Api-Key' => $apiKey,
                ])->get('https://api.api-ninjas.com/v1/cars', $parameters);

                if ($response->successful()) {
                    return $response->json();
                }
            } catch (\Exception $e) {
                // Return empty to allow retries later
            }

            return [];
        });

        $normalizedQuery = str($query)->lower()->toString();
        $normalizedMake = str($make)->lower()->toString();

        $formatted = collect($suggestions)->map(function ($car) {
            $transmission = null;
            if (isset($car['transmission'])) {
                $transmission = strtolower($car['transmission']) === 'a' ? 'Automatic' : (strtolower($car['transmission']) === 'm' ? 'Manual' : ucwords($car['transmission']));
            }

            return [
                'make' => ucwords($car['make'] ?? ''),
                'model' => ucwords($car['model'] ?? ''),
                'year' => $car['year'] ?? null,
                'class' => $car['class'] ?? null,
                'fuel_type' => isset($car['fuel_type']) ? ucwords($car['fuel_type']) : null,
                'transmission' => $transmission,
            ];
        })->filter(function ($item) {
            return filled($item['make']) && filled($item['model']);
        })->sortBy(function ($item) use ($field, $normalizedMake, $normalizedQuery) {
            $make = str($item['make'])->lower()->toString();
            $model = str($item['model'])->lower()->toString();

            if ($field === 'make') {
                return [
                    str_starts_with($make, $normalizedQuery) ? 0 : 1,
                    str_contains($make, $normalizedQuery) ? 0 : 1,
                    levenshtein($normalizedQuery, substr($make, 0, strlen($normalizedQuery))),
                    $make,
                    $model,
                ];
            }

            return [
                filled($normalizedMake) && $make === $normalizedMake ? 0 : 1,
                str_starts_with($model, $normalizedQuery) ? 0 : 1,
                str_contains($model, $normalizedQuery) ? 0 : 1,
                levenshtein($normalizedQuery, substr($model, 0, strlen($normalizedQuery))),
                $make,
                $model,
            ];
        })->unique(function ($item) use ($field) {
            return $field === 'make' ? $item['make'] : $item['make'].'-'.$item['model'];
        })->values();

        return response()->json($formatted);
    }
}
