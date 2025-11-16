<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Repositories\ServiceRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
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
        $users = $this->users->all();

        return Inertia::render('Admin/Customers', [
            'users' => $users,
        ]);
    }

    public function services(Request $request)
    {
        // Get all active services using repository
        $services = $this->services->all();

        // Get distinct categories from services
        $categories = Service::distinct()
            ->where('status', 'active')
            ->pluck('category')
            ->toArray();

        // Get selected category from query parameter
        $selectedCategory = $request->query('category', 'All');

        return Inertia::render('Admin/Services', [
            'services' => $services,
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
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
        $users = $this->users->all();

        return Inertia::render('Admin/Bays', [
            'users' => $users,
        ]);
    }
}