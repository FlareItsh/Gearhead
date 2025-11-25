<?php

namespace App\Http\Controllers;

use App\Repositories\PaymentRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected PaymentRepositoryInterface $repo;

    public function __construct(PaymentRepositoryInterface $repo)
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

    /**
     * Return the total number of payments for the currently authenticated user.
     */
    public function countForCurrentUser(Request $request)
    {
        $user = $request->user();
        $userId = $user->user_id ?? $user->id ?? null;
        $count = 0;

        if ($userId !== null) {
            $count = $this->repo->countByUserId((int) $userId);
        }

        return response()->json(['payments_count' => $count]);
    }

    // New method to get payments for current logged-in user
    public function indexForCurrentUser()
    {
        $userId = Auth::id();
        $payments = $this->repo->getPaymentsForUser($userId);

        return response()->json($payments);
    }

    /**
     * Display sum and count of payments within a date range.
     */
    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $summary = $this->repo->getSummaryByDateRange(
            $request->start_date,
            $request->end_date
        );

        return response()->json(array_merge($summary, [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]));
    }

    /**
     * Get monthly revenue for a specific year.
     */
    public function monthlyRevenueByYear(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:'.date('Y'),
        ]);

        $data = $this->repo->getMonthlyRevenueByYear($request->year);

        return response()->json($data);
    }

    /**
     * Get financial summary (revenue, expenses, profit) by date range.
     */
    public function financialSummaryByDateRange(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $data = $this->repo->getFinancialSummaryByDateRange(
            $request->start_date,
            $request->end_date
        );

        return response()->json($data);
    }

    /**
     * Get average booking value by date range.
     */
    public function averageBookingValueByDateRange(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $value = $this->repo->getAverageBookingValueByDateRange(
            $request->start_date,
            $request->end_date
        );

        return response()->json(['average_booking_value' => $value]);
    }

    /**
     * Get customer retention rate by date range.
     */
    public function customerRetentionRateByDateRange(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $rate = $this->repo->getCustomerRetentionRateByDateRange(
            $request->start_date,
            $request->end_date
        );

        return response()->json(['retention_rate' => $rate]);
    }

    /**
     * Check if customer is eligible for loyalty point redemption
     */
    private function checkLoyaltyEligibility(int $userId): bool
    {
        // Count completed service orders with payments for this user
        $completedBookings = \App\Models\ServiceOrder::where('user_id', $userId)
            ->whereHas('payments')
            ->count();

        // Check if next booking would be the 9th (0, 9, 18, 27, etc.)
        return ($completedBookings + 1) % 9 === 0;
    }

    /**
     * Check loyalty eligibility for a specific user (public endpoint)
     */
    public function checkLoyalty(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,user_id',
        ]);

        $userId = $validated['user_id'];
        $completedBookings = \App\Models\ServiceOrder::where('user_id', $userId)
            ->whereHas('payments')
            ->count();

        $isEligible = ($completedBookings + 1) % 9 === 0;
        $pointsEarned = $completedBookings % 9;

        return response()->json([
            'is_eligible' => $isEligible,
            'completed_bookings' => $completedBookings,
            'points_earned' => $pointsEarned,
            'points_needed' => 9 - $pointsEarned,
        ]);
    }

    /**
     * Process a payment and update service order and bay status
     */
    public function process(Request $request)
    {
        try {
            // Check if loyalty points are being used (can be string 'true' from FormData)
            $useLoyalty = $request->input('use_loyalty_points');
            $isLoyaltyRedemption = $useLoyalty === 'true' || $useLoyalty === true || $useLoyalty === 1;

            $validated = $request->validate([
                'service_order_id' => 'required|integer|exists:service_orders,service_order_id',
                'bay_id' => 'required|integer|exists:bays,bay_id',
                'payment_method' => $isLoyaltyRedemption ? 'nullable|in:cash,gcash,loyalty' : 'required|in:cash,gcash,loyalty',
                'amount' => $isLoyaltyRedemption ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
                'gcash_reference' => 'nullable|string',
                'gcash_screenshot' => 'nullable|image|max:5120', // 5MB max
                'use_loyalty_points' => 'nullable',
            ]);

            // Get service order to check user
            $serviceOrder = \App\Models\ServiceOrder::findOrFail($validated['service_order_id']);
            
            // If loyalty redemption, verify eligibility
            if ($isLoyaltyRedemption) {
                if (!$this->checkLoyaltyEligibility($serviceOrder->user_id)) {
                    return response()->json([
                        'message' => 'Customer is not eligible for loyalty point redemption',
                    ], 422);
                }
            }

            // Handle file upload
            $screenshotPath = null;
            if ($request->hasFile('gcash_screenshot')) {
                $file = $request->file('gcash_screenshot');
                $filename = 'receipt_'.time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
                $file->move(public_path('receipts'), $filename);
                $screenshotPath = 'receipts/'.$filename;
            }

            // Create payment record
            $payment = \App\Models\Payment::create([
                'service_order_id' => $validated['service_order_id'],
                'payment_method' => $isLoyaltyRedemption ? 'loyalty' : ($validated['payment_method'] ?? 'cash'),
                'amount' => $isLoyaltyRedemption ? 0.00 : ($validated['amount'] ?? 0),
                'gcash_reference' => $validated['gcash_reference'] ?? null,
                'gcash_screenshot' => $screenshotPath,
                'is_point_redeemed' => $isLoyaltyRedemption,
            ]);

            // Update service order status to completed
            $serviceOrder = \App\Models\ServiceOrder::findOrFail($validated['service_order_id']);
            $serviceOrder->update(['status' => 'completed']);

            // Mark the employee as available if one was assigned
            if ($serviceOrder->employee_id) {
                $employee = \App\Models\Employee::findOrFail($serviceOrder->employee_id);
                $employee->update(['assigned_status' => 'available']);
            }

            // Update bay status back to available
            $bay = \App\Models\Bay::findOrFail($validated['bay_id']);
            $bay->update(['status' => 'available']);

            return response()->json([
                'message' => 'Payment processed successfully',
                'payment' => $payment,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment processing failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to process payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
