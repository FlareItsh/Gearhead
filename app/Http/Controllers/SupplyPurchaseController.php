<?php

namespace App\Http\Controllers;

use App\Repositories\SupplyPurchaseRepositoryInterface;
use Illuminate\Http\Request;

class SupplyPurchaseController extends Controller
{
    protected SupplyPurchaseRepositoryInterface $repo;

    public function __construct(SupplyPurchaseRepositoryInterface $repo)
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
        $created = $this->repo->create($request->all());

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

    public function financialSummary(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $summary = $this->repo->getFinancialSummary($startDate, $endDate);

        return response()->json($summary);
    }
}
