<?php

namespace App\Http\Controllers;

use App\Repositories\ServiceRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use App\Repositories\PaymentRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    private UserRepositoryInterface $users;
    private ServiceRepositoryInterface $services;
    private PaymentRepositoryInterface $payments;

    public function __construct(
        UserRepositoryInterface $users,
        ServiceRepositoryInterface $services,
        PaymentRepositoryInterface $payments
    ) {
        $this->users = $users;
        $this->services = $services;
        $this->payments = $payments;
    }

    public function registry(Request $request)
    {
        return Inertia::render('Admin/Registry', [
            'users' => $this->users->all(),
        ]);
    }

    public function bookings(Request $request)
    {
        return Inertia::render('Admin/Bookings', [
            'users' => $this->users->all(),
        ]);
    }

    public function customers(Request $request)
    {
        return Inertia::render('Admin/Customers', [
            'users' => $this->users->all(),
        ]);
    }

    public function services(Request $request)
    {
        // Get all services including inactive ones (for admin management)
        $services = $this->services->allIncludingInactive();

        // Distinct categories (all services including inactive)
        $categories = $this->services->getDistinctCategories();

        // Selected category from query string
        $selectedCategory = $request->query('category', 'All');

        return Inertia::render('Admin/Services', [
            'services' => $services,
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function staffs(Request $request)
    {
        return Inertia::render('Admin/Staffs', [
            'users' => $this->users->all(),
        ]);
    }

    public function inventory(Request $request)
    {
        return Inertia::render('Admin/Inventory', [
            'users' => $this->users->all(),
        ]);
    }

    public function transactions(Request $request)
    {
        // Get all transactions with joined details
        $transactions = $this->payments->getAllTransactions();

        // Dashboard statistics
        $stats = [
            'total_revenue' => $transactions->sum('amount'),
            'total_transactions' => $transactions->count(),
            'cash_transactions' => $transactions->where('payment_method', 'Cash')->count(),
            'gcash_transactions' => $transactions->where('payment_method', 'Gcash')->count(),
            'points_redeemed_count' => $transactions->where('is_point_redeemed', true)->count(),
        ];

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions,
            'stats' => $stats,
        ]);
    }

    public function reports(Request $request)
    {
        return Inertia::render('Admin/Reports', [
            'users' => $this->users->all(),
        ]);
    }

    public function bays(Request $request)
    {
        return Inertia::render('Admin/Bays', [
            'users' => $this->users->all(),
        ]);
    }
}
