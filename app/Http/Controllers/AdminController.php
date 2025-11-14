<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bay;

class AdminController extends Controller
{
    private UserRepositoryInterface $users;

    public function __construct(UserRepositoryInterface $users)
    {
        $this->users = $users;
    }

    public function registry(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Admin/Registry', [
            'users' => $users,
        ]);
    }

    public function bookings(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Admin/Bookings', [
            'users' => $users,
        ]);
    }

    public function customers(Request $request)
    {
        $users = \App\Models\User::where('role', 'customer')->get();

        return Inertia::render('Admin/Customers', [
            'users' => $users,
        ]);
    }

    public function services(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Admin/Services', [
            'users' => $users,
        ]);
    }

    public function staffs(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Admin/Staffs', [
            'users' => $users,
        ]);
    }

    public function inventory(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Admin/Inventory', [
            'users' => $users,
        ]);
    }

    public function transactions(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Admin/Transactions', [
            'users' => $users,
        ]);
    }

    public function reports(Request $request)
    {
        $users = $this->users->all();

        return Inertia::render('Admin/Reports', [
            'users' => $users,
        ]);
    }

    public function bays(Request $request)
{
    $bays = Bay::all();

    return Inertia::render('Admin/Bays', [
        'bays' => $bays,
    ]);
}
}
