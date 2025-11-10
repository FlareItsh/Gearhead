<?php

namespace App\Http\Controllers;

use App\Repositories\PaymentRepositoryInterface;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentRepositoryInterface $repo;

    public function __construct(PaymentRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function index()
    {
        return response()->json($this->repo->all());
    }

    public function show(int $id)
    {
        $item = $this->repo->findById($id);

        return $item ? response()->json($item) : response()->json(['message' => 'Not found'], 404);
    }

    public function store(Request $request)
    {
        $created = $this->repo->create($request->all());

        return response()->json($created, 201);
    }

    public function update(Request $request, int $id)
    {
        $item = $this->repo->findById($id);
        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->repo->update($item, $request->all());

        return response()->json($item);
    }

    public function destroy(int $id)
    {
        $item = $this->repo->findById($id);
        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->repo->delete($item);

        return response()->json(null, 204);
    }

    /**
     * Return the total number of payments for the currently authenticated user.
     */
    public function countForCurrentUser(Request $request)
    {
        $user = $request->user();
        $userId = $user->user_id ?? $user->id ?? null;
        $count = 0;

        if ($userId !== null) {
            $count = $this->repo->countByUserId((int) $userId);
        }

        return response()->json(['payments_count' => $count]);
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        $userId = $user->user_id ?? $user->id ?? null;

        if ($userId === null) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // ✅ Fetch summary with relationship to service_order
        $summary = \App\Models\Payment::with('serviceOrder:id,service_order_id,service_name')
            ->whereHas('serviceOrder', fn ($q) => $q->where('user_id', $userId))
            ->get([
                'payment_id',
                'service_order_id',
                'amount',
                'payment_method',
                'is_point_redeemed',
                'gcash_reference',
                'created_at',
                'updated_at',
            ]);

        return response()->json(['summary' => $summary]);
    }
}
