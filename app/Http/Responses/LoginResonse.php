<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Support\Facades\Session;

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
            case 'user':
                return redirect()->intended('/homepage');
            default:
                return redirect()->intended('/home');
        }
    }
}
