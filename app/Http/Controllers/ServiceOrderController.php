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
        // Get all orders that are pending or in_progress
        $orders = \App\Models\ServiceOrder::query()
            ->whereIn('status', ['pending', 'in_progress'])
            ->with(['user', 'details.service', 'bay'])
            ->orderBy('order_date', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get all bookings with optional date range filtering.
     */
    public function getBookings(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $bookings = $this->repo->getAllBookings($startDate, $endDate);

        return response()->json($bookings);
    }

    /**
     * Book services for the authenticated user.
     * Creates a service order with multiple service details.
     */
    public function book(Request $request)
    {
        $validated = $request->validate([
            'order_date' => 'required|date_format:Y-m-d H:i',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'required|integer|exists:services,service_id',
        ]);

        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $orderData = [
            'user_id' => $user->user_id,
            'employee_id' => null,
            'bay_id' => null,
            'status' => 'pending',
            'order_date' => $validated['order_date'],
            'order_type' => 'R', // Reservation
        ];

        // Map service_ids to details format expected by createWithDetails
        $details = array_map(function ($service_id) {
            return [
                'service_id' => $service_id,
                'quantity' => 1,
            ];
        }, $validated['service_ids']);

        try {
            $order = $this->repo->createWithDetails($orderData, $details);

            return response()->json($order, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create booking', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a service order from the registry with customer and services.
     * Automatically assigns to a bay and marks it as occupied.
     */
    public function createFromRegistry(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|integer|exists:users,user_id',
            'bay_id' => 'required|integer|exists:bays,bay_id',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'required|integer|exists:services,service_id',
        ]);

        try {
            $orderData = [
                'user_id' => $validated['customer_id'],
                'employee_id' => null,
                'bay_id' => $validated['bay_id'],
                'status' => 'in_progress',
                'order_date' => now(),
                'order_type' => 'W', // Walk-in
            ];

            // Map service_ids to details format
            $details = array_map(function ($service_id) {
                return [
                    'service_id' => $service_id,
                    'quantity' => 1,
                ];
            }, $validated['service_ids']);

            // Create the service order with details
            $order = $this->repo->createWithDetails($orderData, $details);

            // Update bay status to occupied
            $bay = \App\Models\Bay::findOrFail($validated['bay_id']);
            $bay->update(['status' => 'occupied']);

            return response()->json([
                'message' => 'Service order created successfully',
                'order' => $order->load('details.service', 'user', 'bay'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create service order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
