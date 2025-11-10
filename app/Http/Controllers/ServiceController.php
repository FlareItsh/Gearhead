<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\ServiceRepositoryInterface;

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
        $data = $request->all();
        $created = $this->repo->create($data);
        return response()->json($created, 201);
    }

    public function update(Request $request, int $id)
    {
        $item = $this->repo->findById($id);
        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->repo->update($item, $request->all());
        return response()->json($item);
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
     * Return services filtered by category. Excludes the `status` column.
     * Example: GET /api/services?category=Wash
     */
    public function byCategory(Request $request)
    {
        $category = $request->query('category');

        // Build a query using the Service model. We avoid relying on the
        // repository here because we need to select a subset of columns.
        $query = \App\Models\Service::query();
        if ($category) {
            $query->where('category', $category);
        }

        // Explicitly select all columns except `status`.
        $cols = [
            'service_id',
            'service_name',
            'description',
            'size',
            'category',
            'estimated_duration',
            'price',
            'created_at',
            'updated_at',
        ];

        $items = $query->get($cols);

        return response()->json($items);
    }
}
