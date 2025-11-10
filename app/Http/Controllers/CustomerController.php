<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Repositories\PaymentRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    private UserRepositoryInterface $users;

    private PaymentRepositoryInterface $payments;

    public function __construct(UserRepositoryInterface $users, PaymentRepositoryInterface $payments)
    {
        $this->users = $users;
        $this->payments = $payments;
    }

    public function services(Request $request)
    {
        $users = $this->users->all();

        // Pull distinct categories from the services table and pass them
        // to the Inertia page so the frontend can render the unique list.
        $categories = Service::query()->distinct()->orderBy('category')->pluck('category');

        // If a category query param is provided, fetch services in that
        // category (selecting all columns except `status`). This uses
        // Eloquent on the server-side so the frontend does not have to
        // call a separate API endpoint.
        $selectedCategory = $request->query('category');
        $services = [];

        if ($selectedCategory) {
            $services = Service::query()
                ->where('category', $selectedCategory)
                ->select([
                    'service_id',
                    'service_name',
                    'description',
                    'size',
                    'category',
                    'estimated_duration',
                    'price',
                    'created_at',
                    'updated_at',
                ])
                ->get();
        }

        return Inertia::render('Customer/Services', [
            'users' => $users,
            'categories' => $categories,
            'services' => $services,
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function bookings(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Customer/Bookings', [
            'users' => $users,
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
}
