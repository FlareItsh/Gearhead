<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\SupplyRepositoryInterface;


use Illuminate\Http\Request;

class SupplyController extends Controller
{
    protected SupplyRepositoryInterface $repo;

    public function __construct(SupplyRepositoryInterface $repo)
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

        return $item
            ? response()->json($item)
            : response()->json(['message' => 'Not found'], 404);
    }

    public function store(Request $request)
    {
        $id = $this->repo->create($request->all());
        $item = $this->repo->findById($id);

        return response()->json($item, 201);
    }

    public function update(Request $request, int $id)
    {
        $item = $this->repo->findById($id);

        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->repo->update($id, $request->all());
        $updatedItem = $this->repo->findById($id);

        return response()->json($updatedItem);
    }

    public function incrementStock(Request $request, int $id)
    {
        $item = $this->repo->findById($id);

        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $quantity = (float) $request->input('quantity', 0);
        $this->repo->incrementStock($id, $quantity);
        $updatedItem = $this->repo->findById($id);

        return response()->json($updatedItem);
    }

    public function destroy(int $id)
    {
        $item = $this->repo->findById($id);

        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->repo->delete($id);

        return response()->json(['message' => 'Deleted successfully'], 204);
    }
}
