<?php

namespace App\Repositories;

use App\Models\PulloutRequest;
use Illuminate\Database\Eloquent\Collection;

class EloquentPulloutRequestRepository implements PulloutRequestRepositoryInterface
{
    public function all(): Collection
    {
        return PulloutRequest::all();
    }

    public function findById(int $id): ?PulloutRequest
    {
        return PulloutRequest::find($id);
    }

    public function create(array $data): PulloutRequest
    {
        return PulloutRequest::create($data);
    }

    public function update(PulloutRequest $request, array $data): bool
    {
        return $request->update($data);
    }

    public function delete(PulloutRequest $request): bool
    {
        return $request->delete();
    }
}
