<?php

namespace App\Http\Controllers;

use App\Repositories\PaymentRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    // New method to get payments for current logged-in user
    public function indexForCurrentUser()
    {
        $userId = Auth::id();
        $payments = $this->repo->getPaymentsForUser($userId);

        return response()->json($payments);
    }

    /**
     * Display sum and count of payments within a date range.
     */
    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $summary = $this->repo->getSummaryByDateRange(
            $request->start_date,
            $request->end_date
        );

        return response()->json(array_merge($summary, [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]));
    }
}
