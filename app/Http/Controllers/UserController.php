<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepositoryInterface;

class UserController extends Controller
{
    public function __construct(
        protected UserRepositoryInterface $users
    ) {}

    public function index()
    {
        $allUsers = $this->users->all();

        return response()->json($allUsers);
    }

    public function show($id)
    {
        $user = $this->users->findById($id);

        return response()->json($user);
    }
}
