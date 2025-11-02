<?php

namespace App\Http\Controllers;

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

        return Inertia::render('Customer/Services', [
            'users' => $users,
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

        if ($userId !== null) {
            $count = $this->payments->countByUserId((int) $userId);
        }

        return Inertia::render('Customer/CustomerDashboard', [
            'paymentsCount' => $count,
        ]);
    }
}
