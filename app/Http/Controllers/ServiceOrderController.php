<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\ServiceOrderRepositoryInterface;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\BayRepositoryInterface;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ServiceOrderController extends Controller
{
    protected ServiceOrderRepositoryInterface $repo;
    protected EmployeeRepositoryInterface $employees;
    protected BayRepositoryInterface $bays;

    public function __construct(
        ServiceOrderRepositoryInterface $repo,
        EmployeeRepositoryInterface $employees,
        BayRepositoryInterface $bays
    ) {
        $this->repo = $repo;
        $this->employees = $employees;
        $this->bays = $bays;
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

        // Mark employee as assigned if provided
        if (! empty($data['employee_id'])) {
            $this->employees->updateAssignedStatus($data['employee_id'], 'assigned');
        }

        return response()->json($created, 201);
    }

    public function update(Request $request, int $id)
    {
        $item = $this->repo->findById($id);
        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $data = $request->all();

        // Handle service_ids update - replace all service details
        if (array_key_exists('variant_ids', $data)) {
            $variantIds = $data['variant_ids'];

            // Use repository to replace service order details using variants
            $this->repo->replaceServiceOrderDetailsWithVariants($id, $variantIds);

            // Remove variant_ids from data array
            unset($data['variant_ids']);
            if (isset($data['service_ids'])) {
                unset($data['service_ids']);
            }
        } elseif (array_key_exists('service_ids', $data)) {
            $serviceIds = $data['service_ids'];
            $this->repo->replaceServiceOrderDetails($id, $serviceIds);
            unset($data['service_ids']);
        }

        // Handle bay_id change - update bay status to occupied
        if (array_key_exists('bay_id', $data)) {
            $newBayId = $data['bay_id'];
            $oldBayId = $item->bay_id;

            // If bay is being assigned or changed
            if ($oldBayId != $newBayId) {
                // Mark old bay as available if there was one
                if ($oldBayId) {
                    $this->bays->updateStatus($oldBayId, 'available');
                }

                // Mark new bay as occupied
                if ($newBayId) {
                    $this->bays->updateStatus($newBayId, 'occupied');
                }
            }
        }

        // Handle employee_id change - update assigned status if needed
        if (array_key_exists('employee_id', $data)) {
            $newEmployeeId = $data['employee_id'];
            $oldEmployeeId = $item->employee_id;

            // If employee is being changed
            if ($oldEmployeeId != $newEmployeeId) {
                // Mark old employee as available if there was one
                if ($oldEmployeeId) {
                    $this->employees->updateAssignedStatus($oldEmployeeId, 'available');
                }

                // Mark new employee as assigned if there is one
                if ($newEmployeeId) {
                    $this->employees->updateAssignedStatus($newEmployeeId, 'assigned');
                }
            }
        }

        $this->repo->update($item, $data);

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
        $orders = $this->repo->getPendingOrders();

        return response()->json($orders->map(function ($order) {
            return [
                'service_order_id' => $order->service_order_id,
                'customer_name' => $order->customer_name,
                'service_name' => $order->service_name,
                'time' => $order->order_date,
                'status' => $order->status,
            ];
        }));
    }

    public function active()
    {
        // Get all active orders (pending or in_progress) with full relationships
        // This is for Registry page - shows all active bays
        $orders = $this->repo->getActiveOrders();

        Log::info('Active service orders:', [
            'count' => $orders->count(),
            'statuses' => $orders->pluck('status')->unique()->values(),
            'orders' => $orders->toArray(),
        ]);

        return response()->json($orders);
    }

    /**
     * Get today's pending bookings (reservations) with customer and service details
     */
    public function todayBookings()
    {
        $bookings = $this->repo->getTodayBookings();

        return response()->json($bookings);
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
            'order_date' => [
                'required',
                'date_format:Y-m-d H:i',
                'after_or_equal:now',
                function ($attribute, $value, $fail) {
                    $date = \Carbon\Carbon::parse($value);
                    $time = $date->format('H:i');
                    // Opening: 06:30, Closing: 22:00
                    if ($time < '06:30' || $time > '22:00') {
                        $fail('The selected time must be between 6:30 AM and 10:00 PM.');
                    }
                },
            ],
            'variant_ids' => 'required|array|min:1',
            'variant_ids.*' => 'required|integer|exists:service_variants,service_variant',
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

        // Retrieve variants to get their service_id
        $variants = \App\Models\ServiceVariant::whereIn('service_variant', $validated['variant_ids'])->get()->keyBy('service_variant');

        // Map variant_ids to details format expected by createWithDetails
        $details = [];
        foreach ($validated['variant_ids'] as $variant_id) {
            if ($variant = $variants->get($variant_id)) {
                $details[] = [
                    'service_variant' => $variant_id,
                    'quantity' => 1,
                ];
            }
        }

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
            'variant_ids' => 'required|array|min:1',
            'variant_ids.*' => 'required|integer|exists:service_variants,service_variant',
            'employee_id' => 'nullable|integer|exists:employees,employee_id',
            'idempotency_key' => 'nullable|string',
        ]);

        try {
            // Idempotency check
            if ($request->has('idempotency_key')) {
                $existingOrder = \App\Models\ServiceOrder::where('idempotency_key', $request->input('idempotency_key'))->first();
                if ($existingOrder) {
                    return response()->json([
                        'message' => 'Service order already created',
                        'order' => $existingOrder->load('details.serviceVariant.service', 'user', 'bay', 'employee'),
                    ], 200);
                }
            }

            $orderData = [
                'user_id' => $validated['customer_id'],
                'employee_id' => $validated['employee_id'] ?? null,
                'bay_id' => $validated['bay_id'],
                'status' => 'in_progress',
                'order_date' => now(),
                'order_type' => 'W', // Walk-in
                'idempotency_key' => $request->input('idempotency_key'),
            ];

            // Retrieve variants to get their service_id
            $variants = \App\Models\ServiceVariant::whereIn('service_variant', $validated['variant_ids'])->get()->keyBy('service_variant');

            // Map variant_ids to details format
            $details = [];
            foreach ($validated['variant_ids'] as $variant_id) {
                if ($variant = $variants->get($variant_id)) {
                    $details[] = [
                        'service_variant' => $variant_id,
                        'quantity' => 1,
                    ];
                }
            }

            // Create the service order with details
            $order = $this->repo->createWithDetails($orderData, $details);

            // Mark employee as assigned if provided
            if (! empty($orderData['employee_id'])) {
                $this->employees->updateAssignedStatus($orderData['employee_id'], 'assigned');
            }

            // Update bay status to occupied
            $this->bays->updateStatus($validated['bay_id'], 'occupied');

            return response()->json([
                'message' => 'Service order created successfully',
                'order' => $order->load('details.serviceVariant.service', 'user', 'bay', 'employee'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create service order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign an employee to a service order
     */
    public function assignEmployee(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'employee_id' => 'required|integer|exists:employees,employee_id',
            ]);

            $order = $this->repo->findById($id);
            if (! $order) {
                return response()->json(['message' => 'Service order not found'], 404);
            }

            // If there was a previous employee assigned, mark them as available
            if ($order->employee_id) {
                $this->employees->updateAssignedStatus($order->employee_id, 'available');
            }

            // Update the service order with new employee
            $this->repo->update($order, ['employee_id' => $validated['employee_id']]);

            // Mark the new employee as assigned
            $this->employees->updateAssignedStatus($validated['employee_id'], 'assigned');

            return response()->json([
                'message' => 'Employee assigned successfully',
                'order' => $order->load('details.service', 'user', 'bay'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to assign employee',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
