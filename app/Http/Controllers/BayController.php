<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bay;

class BayController extends Controller
{
    public function index()
    {
        return response()->json(Bay::all());
    }

    public function show(int $id)
    {
        $bay = Bay::find($id);
        return $bay ? response()->json($bay) : response()->json(['message' => 'Not found'], 404);
    }

    public function store(Request $request)
    {
        $bay = Bay::create($request->all());
        return response()->json($bay, 201);
    }

    public function update(Request $request, int $id)
    {
        $bay = Bay::find($id);
        if (! $bay) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $bay->update($request->all());
        return response()->json($bay);
    }

    public function destroy(int $id)
    {
        $bay = Bay::find($id);
        if (! $bay) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $bay->delete();
        return response()->json(null, 204);
    }
}
