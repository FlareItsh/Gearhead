<?php

namespace App\Repositories;

use App\Models\Bay;
use Illuminate\Support\Collection;

class EloquentBayRepository implements BayRepositoryInterface
{
    public function all(): Collection
    {
        return Bay::orderBy('bay_number')->get();
    }

    public function find(int $id): Bay
    {
        return Bay::findOrFail($id);
    }

    public function create(array $data): Bay
    {
        return Bay::create($data);
    }

    public function update(int $id, array $data): Bay
    {
        $bay = Bay::findOrFail($id);
        $bay->update($data);

        return $bay;
    }

    public function delete(int $id): bool
    {
        $bay = Bay::findOrFail($id);

        return $bay->delete();
    }

    public function getAvailable(): Collection
    {
        return Bay::where('status', 'available')->orderBy('bay_number')->get();
    }
}
