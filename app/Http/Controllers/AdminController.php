<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Repositories\ServiceRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    private UserRepositoryInterface $users;
    private ServiceRepositoryInterface $services;

    public function __construct(
        UserRepositoryInterface $users,
        ServiceRepositoryInterface $services
    ) {
        $this->users = $users;
        $this->services = $services;
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
        $categories = Service::distinct()
            ->pluck('category')
            ->toArray();

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
        $transactions = DB::table('payments as p')
            ->join('service_orders as so', 'p.service_order_id', '=', 'so.service_order_id')
            ->join('users as u', 'so.user_id', '=', 'u.user_id')
            ->leftJoin('service_order_details as sod', 'so.service_order_id', '=', 'sod.service_order_id')
            ->leftJoin('services as s', 'sod.service_id', '=', 's.service_id')
            ->select(
                'p.payment_id',
                'p.amount',
                'p.payment_method',
                'p.gcash_reference',
                'p.is_point_redeemed',
                'p.created_at as payment_date',
                'so.order_date',
                'so.status',
                'u.first_name',
                'u.last_name',
                DB::raw('GROUP_CONCAT(s.service_name SEPARATOR ", ") as services')
            )
            ->groupBy(
                'p.payment_id',
                'p.amount',
                'p.payment_method',
                'p.gcash_reference',
                'p.is_point_redeemed',
                'p.created_at',
                'so.order_date',
                'so.status',
                'u.first_name',
                'u.last_name'
            )
            ->orderBy('p.created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'payment_id' => $transaction->payment_id,
                    'date' => $transaction->order_date ?? date('Y-m-d', strtotime($transaction->payment_date)),
                    'customer' => $transaction->first_name . ' ' . $transaction->last_name,
                    'services' => $transaction->services ?? 'N/A',
                    'amount' => (float) $transaction->amount,
                    'payment_method' => ucfirst($transaction->payment_method),
                    'gcash_reference' => $transaction->gcash_reference,
                    'status' => $transaction->status,
                    'is_point_redeemed' => (bool) $transaction->is_point_redeemed,
                ];
            });

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
