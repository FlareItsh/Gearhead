<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Apply middleware so only authenticated admins can reach these actions.
     */
    public function __construct()
    {
        // Ensure the user is authenticated and verified (if your app requires it)
        $this->middleware(['auth', 'verified']);

        // Use the existing role middleware (alias 'role') to allow only admins.
        // This assumes you have a route middleware alias `role` registered which accepts a role argument.
        $this->middleware('role:admin');
    }

    /**
     * Example index action for admin-only page.
     */
    public function index(Request $request)
    {
        return Inertia::render('Admin/OnlyAdmin', [
            'message' => 'Only admins can see this page.',
        ]);
    }
}
