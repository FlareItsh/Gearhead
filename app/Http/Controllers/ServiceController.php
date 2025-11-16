<?php

namespace App\Http\Controllers;

use App\Repositories\ServiceRepositoryInterface;
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
     * Get top N best-selling services.
     */
    /**
     * Get top 4 services for Bar chart
     */
    public function topServices(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $services = $this->repo->getTopServices(4, $startDate, $endDate);

        return response()->json($services);
    }

    /**
     * Get most popular service for the Popular Service card
     */
    public function popularService(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $service = $this->repo->getMostPopularService($startDate, $endDate);

        return response()->json($service);
    }
}
