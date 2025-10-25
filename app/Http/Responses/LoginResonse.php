<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Session;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        // Store role_name in session

        $role = $request->user()->role;

        // Store role in session if needed
        $request->session()->put('role', $role);

        // Redirect based on role
        switch ($role) {
            case 'admin':
                return redirect()->intended('/dashboard');
            case 'customer':
                return redirect()->intended('/homepage');
            default:
                return redirect()->intended('/home');
        }
    }
}
