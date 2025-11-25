<?php

namespace App\Http\Controllers;

use App\Repositories\ServiceOrderRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        // Mark employee as assigned if provided
        if (! empty($data['employee_id'])) {
            $employee = \App\Models\Employee::findOrFail($data['employee_id']);
            $employee->update(['assigned_status' => 'assigned']);
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
        if (array_key_exists('service_ids', $data)) {
            $serviceIds = $data['service_ids'];

            // Delete existing service order details
            DB::table('service_order_details')
                ->where('service_order_id', $id)
                ->delete();

            // Insert new service order details
            foreach ($serviceIds as $serviceId) {
                DB::table('service_order_details')->insert([
                    'service_order_id' => $id,
                    'service_id' => $serviceId,
                    'quantity' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Remove service_ids from data array as it's not a column in service_orders table
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
                    $oldBay = \App\Models\Bay::find($oldBayId);
                    if ($oldBay) {
                        $oldBay->update(['status' => 'available']);
                    }
                }

                // Mark new bay as occupied
                if ($newBayId) {
                    $newBay = \App\Models\Bay::find($newBayId);
                    if ($newBay) {
                        $newBay->update(['status' => 'occupied']);
                    }
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
                    $oldEmployee = \App\Models\Employee::find($oldEmployeeId);
                    if ($oldEmployee) {
                        $oldEmployee->update(['assigned_status' => 'available']);
                    }
                }

                // Mark new employee as assigned if there is one
                if ($newEmployeeId) {
                    $newEmployee = \App\Models\Employee::find($newEmployeeId);
                    if ($newEmployee) {
                        $newEmployee->update(['assigned_status' => 'assigned']);
                    }
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
        // Use raw SQL like Bookings page to avoid Eloquent timezone conversion
        $orders = DB::table('service_orders')
            ->join('users', 'service_orders.user_id', '=', 'users.user_id')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('services', 'service_order_details.service_id', '=', 'services.service_id')
            ->where('service_orders.status', 'pending')
            ->select(
                'service_orders.service_order_id',
                'service_orders.order_date',
                'service_orders.status',
                DB::raw('CONCAT(users.first_name, " ", users.last_name) as customer_name'),
                DB::raw('GROUP_CONCAT(services.service_name SEPARATOR ", ") as service_name')
            )
            ->groupBy(
                'service_orders.service_order_id',
                'service_orders.order_date',
                'service_orders.status',
                'users.first_name',
                'users.last_name'
            )
            ->orderByDesc('service_orders.order_date')
            ->get()
            ->map(function ($order) {
                return [
                    'service_order_id' => $order->service_order_id,
                    'customer_name' => $order->customer_name,
                    'service_name' => $order->service_name,
                    'time' => $order->order_date, // Raw datetime string from DB
                    'status' => $order->status,
                ];
            });

        return response()->json($orders);
    }

    public function active()
    {
        // Get all active orders (pending or in_progress) with full relationships
        // This is for Registry page - shows all active bays
        $orders = \App\Models\ServiceOrder::query()
            ->whereIn('status', ['pending', 'in_progress'])
            ->with([
                'user:user_id,first_name,last_name,email,phone_number',
                'details:service_order_detail_id,service_order_id,service_id,quantity',
                'details.service:service_id,service_name,price',
                'bay:bay_id,bay_number,status',
                'employee:employee_id,first_name,last_name,phone_number,status,assigned_status',
            ])
            ->orderBy('order_date', 'desc')
            ->get()
            ->unique('bay_id')  // Keep only the first (latest) order per bay_id
            ->values();

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
        $today = now()->format('Y-m-d');

        // Use raw SQL to avoid timezone conversion and get accurate data
        $bookings = DB::table('service_orders')
            ->join('users', 'service_orders.user_id', '=', 'users.user_id')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('services', 'service_order_details.service_id', '=', 'services.service_id')
            ->where('service_orders.status', 'pending')
            ->where('service_orders.order_type', 'R') // 'R' for Reservation
            ->whereDate('service_orders.order_date', $today)
            ->select(
                'service_orders.service_order_id',
                'service_orders.user_id',
                'service_orders.order_date',
                'users.first_name',
                'users.last_name',
                'users.phone_number as phone',
                DB::raw('CONCAT(users.first_name, " ", users.last_name) as customer_name'),
                DB::raw('GROUP_CONCAT(services.service_name SEPARATOR ", ") as services'),
                DB::raw('GROUP_CONCAT(services.service_id) as service_ids'),
                DB::raw('SUM(services.price * service_order_details.quantity) as total')
            )
            ->groupBy(
                'service_orders.service_order_id',
                'service_orders.user_id',
                'service_orders.order_date',
                'users.first_name',
                'users.last_name',
                'users.phone_number'
            )
            ->orderBy('service_orders.order_date', 'asc')
            ->get()
            ->map(function ($booking) {
                return [
                    'service_order_id' => $booking->service_order_id,
                    'user_id' => $booking->user_id,
                    'customer_name' => $booking->customer_name,
                    'first_name' => $booking->first_name,
                    'last_name' => $booking->last_name,
                    'phone' => $booking->phone,
                    'services' => $booking->services,
                    'service_ids' => $booking->service_ids ? explode(',', $booking->service_ids) : [],
                    'total' => $booking->total,
                    'order_date' => $booking->order_date,
                ];
            });

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
            'employee_id' => 'nullable|integer|exists:employees,employee_id',
        ]);

        try {
            $orderData = [
                'user_id' => $validated['customer_id'],
                'employee_id' => $validated['employee_id'] ?? null,
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

            // Mark employee as assigned if provided
            if (! empty($orderData['employee_id'])) {
                $employee = \App\Models\Employee::findOrFail($orderData['employee_id']);
                $employee->update(['assigned_status' => 'assigned']);
            }

            // Update bay status to occupied
            $bay = \App\Models\Bay::findOrFail($validated['bay_id']);
            $bay->update(['status' => 'occupied']);

            return response()->json([
                'message' => 'Service order created successfully',
                'order' => $order->load('details.service', 'user', 'bay', 'employee'),
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
                $previousEmployee = \App\Models\Employee::findOrFail($order->employee_id);
                $previousEmployee->update(['assigned_status' => 'available']);
            }

            // Update the service order with new employee
            $this->repo->update($order, ['employee_id' => $validated['employee_id']]);

            // Mark the new employee as assigned
            $newEmployee = \App\Models\Employee::findOrFail($validated['employee_id']);
            $newEmployee->update(['assigned_status' => 'assigned']);

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
