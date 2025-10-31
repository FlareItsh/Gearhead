<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerPaymentController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware(['auth', 'verified']);
    //     $this->middleware('role:customer');
    // }

    public function index(Request $request)
    {
        return Inertia::render('Customer/Payments', []);
    }
}
