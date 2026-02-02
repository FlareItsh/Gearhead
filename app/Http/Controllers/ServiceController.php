<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\ServiceRepositoryInterface;


use Illuminate\Http\Request;

class ServiceController extends Controller
{
    protected ServiceRepositoryInterface $repo;

    public function __construct(ServiceRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function index()
    {
        return response()->json($this->repo->all());
    }

    public function show(int $id)
    {
        $item = $this->repo->findById($id);

        return $item ? response()->json($item) : response()->json(['message' => 'Not found'], 404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'status' => 'required|in:active,inactive',
            'variants' => 'required|array|min:1',
            'variants.*.size' => 'required|string',
            'variants.*.enabled' => 'required|boolean',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.estimated_duration' => 'nullable|integer|min:0',
        ]);

        // Filter to only enabled variants for creation
        $validated['variants'] = array_filter($validated['variants'], fn($v) => $v['enabled']);

        $created = $this->repo->create($validated);

        return response()->json($created, 201);
    }

    public function update(Request $request, int $id)
    {
        $service = $this->repo->findById($id);
        if (! $service) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'service_name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:active,inactive',
            'variants' => 'sometimes|required|array|min:1',
            'variants.*.size' => 'required|string',
            'variants.*.enabled' => 'required|boolean',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.estimated_duration' => 'nullable|integer|min:0',
        ]);

        \Log::info('Service Update Request', [
            'service_id' => $id,
            'validated_data' => $validated,
        ]);

        $this->repo->update($service, $validated);

        // Reload the service with fresh variants
        $updated = $this->repo->findById($id);

        \Log::info('Service After Update', [
            'service_id' => $id,
            'variants_count' => $updated->variants->count(),
            'variants' => $updated->variants->toArray(),
        ]);

        return response()->json($updated);
    }

    public function destroy(int $id)
    {
        $item = $this->repo->findById($id);
        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->repo->delete($item);

        return response()->json(null, 204);
    }

    /**
     * Get top N best-selling services.
     */
    /**
     * Get top 10 services for Bar chart
     */
    public function topServices(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $services = $this->repo->getTopServices(4, $startDate, $endDate);

        return response()->json($services);
    }

    /**
     * Get top 10 services with size for Reports page
     */
    public function topServicesWithSize(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $services = $this->repo->getTopServicesWithSize(10, $startDate, $endDate);

        return response()->json($services);
    }

    /**
     * Get most popular service for the Popular Service card
     */
}
