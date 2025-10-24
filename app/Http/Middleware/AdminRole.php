<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles // Accept multiple roles as variadic arguments
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // 1. Check if the user is authenticated. This is crucial before trying to access Auth::user().
        if (!Auth::check()) {
            // Redirect to login or a public page if not authenticated
            // You might have a 'login' route, or default to 'homepage' as per your original code
            return redirect()->route('login')->with('error', 'Please log in to access this page.');
        }

        $user = Auth::user();

        // 2. Check if the authenticated user has any of the required roles
        if (!$user->hasAnyRole($roles)) {
            // If the user does not have any of the specified roles
            return redirect('homepage')->with('error', 'You do not have permission to access this page.');

            // Or if you prefer a 403 Forbidden page:
            // abort(403, 'You do not have the required role to access this page.');
        }

        // If authenticated and has the required role(s), proceed with the request
        return $next($request);
    }
}
