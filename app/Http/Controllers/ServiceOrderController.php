<?php

namespace App\Http\Controllers;

use App\Repositories\ServiceOrderRepositoryInterface;
use Illuminate\Http\Request;

class ServiceOrderController extends Controller
{
    protected ServiceOrderRepositoryInterface $repo;

    public function __construct(ServiceOrderRepositoryInterface $repo)
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
        $data = $request->only(['user_id', 'employee_id', 'bay_id', 'status', 'order_date', 'order_type']);

        // Ensure user_id is the authenticated user when available
        if ($request->user()) {
            $data['user_id'] = $request->user()->user_id;
        }

        // Default order_date if not provided
        if (empty($data['order_date'])) {
            $data['order_date'] = now();
        }

        $details = $request->input('details');

        if (is_array($details) && count($details) > 0) {
            $created = $this->repo->createWithDetails($data, $details);
        } else {
            $created = $this->repo->create($data);
        }

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

    public function upcoming(Request $request)
    {
        $userId = $request->user()->user_id;

        $bookings = $this->repo->upcomingBookings($userId);

        return response()->json($bookings);

    }

    public function pending()
    {
        $data = $this->repo->getPendingOrders();

        return response()->json($data);
    }
}
