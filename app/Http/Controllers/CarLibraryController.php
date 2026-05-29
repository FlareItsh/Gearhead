<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarLibraryRequest;
use App\Http\Requests\UpdateCarLibraryRequest;
use App\Models\CarLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CarLibraryController extends Controller
{
    /**
     * Display a listing of the car libraries.
     */
    public function index(Request $request): InertiaResponse
    {
        $search = $request->input('search');
        $sizeFilter = $request->input('size');

        $query = CarLibrary::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('make', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        if ($sizeFilter && $sizeFilter !== 'All') {
            $query->where('size', $sizeFilter);
        }

        $cars = $query->orderBy('make')
            ->orderBy('model')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Cars', [
            'cars' => $cars,
            'filters' => [
                'search' => $search ?? '',
                'size' => $sizeFilter ?? 'All',
            ],
        ]);
    }

    /**
     * Store a newly created car library in storage.
     */
    public function store(StoreCarLibraryRequest $request): RedirectResponse
    {
        CarLibrary::create([
            'make' => trim($request->make),
            'model' => trim($request->model),
            'size' => $request->size,
        ]);

        return redirect()->back()->with('success', 'Car added to library successfully.');
    }

    /**
     * Update the specified car library in storage.
     */
    public function update(UpdateCarLibraryRequest $request, CarLibrary $car): RedirectResponse
    {
        $car->update([
            'make' => trim($request->make),
            'model' => trim($request->model),
            'size' => $request->size,
        ]);

        return redirect()->back()->with('success', 'Car updated successfully.');
    }

    /**
     * Remove the specified car library from storage.
     */
    public function destroy(CarLibrary $car): RedirectResponse
    {
        $car->delete();

        return redirect()->back()->with('success', 'Car deleted from library successfully.');
    }
}
