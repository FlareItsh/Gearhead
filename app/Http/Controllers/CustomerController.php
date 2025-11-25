<?php

namespace App\Http\Controllers;

use App\Repositories\BookingRepository;
use App\Repositories\PaymentRepositoryInterface;
use App\Repositories\ServiceRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use App\Repositories\ServiceOrderRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CustomerController extends Controller
{
    private UserRepositoryInterface $users;

    private PaymentRepositoryInterface $payments;

    private ServiceRepositoryInterface $services;

    private ServiceOrderRepositoryInterface $serviceOrders;

    public function __construct(
        UserRepositoryInterface $users,
        PaymentRepositoryInterface $payments,
        ServiceRepositoryInterface $services,
        ServiceOrderRepositoryInterface $serviceOrders
    ) {
        $this->users = $users;
        $this->payments = $payments;
        $this->services = $services;
        $this->serviceOrders = $serviceOrders;
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

        // Find the booking using repository
        $booking = $this->serviceOrders->findById($id);

        if (! $booking || $booking->user_id != $user->user_id) {
            return back()->with('error', 'Booking not found.');
        }

        // Check if it can be cancelled
        if (in_array($booking->status, ['completed', 'confirmed'])) {
            return back()->with('error', 'This booking cannot be cancelled.');
        }

        // Update status to cancelled using repository
        $this->serviceOrders->cancelBooking($id);

        return back()->with('success', 'Booking cancelled successfully.');
    }

    public function getCustomers()
    {
        $customers = $this->users->getCustomersWithBookings();

        return response()->json($customers);
    }

    /**
     * Get all customers for the registry API
     */
    public function index()
    {
        $customers = $this->users->all()->map(function ($customer) {
            return [
                'user_id' => $customer->user_id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'phone_number' => $customer->phone_number,
            ];
        });

        return response()->json($customers);
    }

    /**
     * Store a new customer for the registry
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'password' => 'required|string|min:8',
        ]);

        $customer = $this->users->create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'address' => $validated['address'],
            'password' => $validated['password'],
            'role' => 'customer',
        ]);

        return response()->json([
            'user_id' => $customer->user_id,
            'first_name' => $customer->first_name,
            'last_name' => $customer->last_name,
            'email' => $customer->email,
            'phone_number' => $customer->phone_number,
        ], 201);
    }
}
