<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    private UserRepositoryInterface $users;

    public function __construct(UserRepositoryInterface $users)
    {
        $this->users = $users;
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
}
