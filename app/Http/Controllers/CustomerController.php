<?php

namespace App\Http\Controllers;

use App\Repositories\BookingRepository;
use App\Repositories\PaymentRepositoryInterface;
use App\Repositories\ServiceRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    private UserRepositoryInterface $users;

    private PaymentRepositoryInterface $payments;

    private ServiceRepositoryInterface $services;

    public function __construct(UserRepositoryInterface $users, PaymentRepositoryInterface $payments, ServiceRepositoryInterface $services)
    {
        $this->users = $users;
        $this->payments = $payments;
        $this->services = $services;
    }

    public function bookings(Request $request, BookingRepository $bookings)
    {
        $user = $request->user();
        $status = $request->query('status', 'all'); // optional filter

        $allBookings = $bookings->getBookingsByUser((int) $user->user_id, $status);

        return Inertia::render('Customer/Bookings', [
            'bookings' => $allBookings,
            'selectedStatus' => $status,
        ]);
    }

    public function payments(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Customer/Payments', [
            'users' => $users,
        ]);
    }

    /**
     * Show the customer dashboard page with data scoped to the authenticated user.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $userId = $user->user_id ?? $user->id ?? null;
        $count = 0;
        $total = 0;

        if ($userId !== null) {
            $count = $this->payments->countByUserId((int) $userId);
            $total = $this->payments->totalSpent((int) $userId);
        }

        return Inertia::render('dashboard', [
            'paymentsCount' => $count,
            'totalSpent' => $total,
        ]);
    }

    /**
     * Show all services or filtered by category.
     */
    public function services(Request $request)
    {
        $selectedCategory = $request->query('category', 'All');

        // Get services filtered by category
        $services = $this->services->getAllByCategory($selectedCategory);

        // Get all unique categories (for category buttons)
        $categories = $this->services->all()->pluck('category')->unique()->values();

        return Inertia::render('Customer/Services', [
            'services' => $services,
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function cancelBooking(int $id)
    {
        $user = auth()->user();

        // Find the booking
        $booking = DB::table('service_orders')
            ->where('service_order_id', $id)
            ->where('user_id', $user->user_id) // ensure user owns this booking
            ->first();

        if (! $booking) {
            return back()->with('error', 'Booking not found.');
        }

        // Check if it can be cancelled
        if (in_array($booking->status, ['completed', 'confirmed'])) {
            return back()->with('error', 'This booking cannot be cancelled.');
        }

        // Update status to cancelled
        DB::table('service_orders')
            ->where('service_order_id', $id)
            ->update(['status' => 'cancelled', 'updated_at' => now()]);

        return back()->with('success', 'Booking cancelled successfully.');
    }

    public function getCustomers()
    {
        $customers = $this->users->getCustomersWithBookings();

        return response()->json($customers);
    }
}
