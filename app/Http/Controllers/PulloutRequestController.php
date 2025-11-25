<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\PulloutRequestRepositoryInterface;
use App\Repositories\PulloutServiceRepositoryInterface;
use App\Repositories\SupplyRepositoryInterface;

class PulloutRequestController extends Controller
{
    protected PulloutRequestRepositoryInterface $pulloutRequestRepository;
    protected PulloutServiceRepositoryInterface $pulloutServiceRepository;
    protected SupplyRepositoryInterface $supplyRepository;

    public function __construct(
        PulloutRequestRepositoryInterface $pulloutRequestRepository,
        PulloutServiceRepositoryInterface $pulloutServiceRepository,
        SupplyRepositoryInterface $supplyRepository
    ) {
        $this->pulloutRequestRepository = $pulloutRequestRepository;
        $this->pulloutServiceRepository = $pulloutServiceRepository;
        $this->supplyRepository = $supplyRepository;
    }

    public function index()
    {
        $pulloutRequests = $this->pulloutRequestRepository->getAllWithDetails();
        $activeServiceOrders = $this->pulloutServiceRepository->getActiveServiceOrdersForPullout();
        $supplies = $this->supplyRepository->all();

        return response()->json([
            'pulloutRequests' => $pulloutRequests,
            'activeServiceOrders' => $activeServiceOrders,
            'supplies' => $supplies
        ]);
    }

    public function show(int $id)
    {
        $item = $this->pulloutRequestRepository->findById($id);
        return $item ? response()->json($item) : response()->json(['message' => 'Not found'], 404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'service_order_detail_id' => 'required|exists:service_order_details,service_order_detail_id',
            'supplies' => 'required|array|min:1',
            'supplies.*.supply_id' => 'required|exists:supplies,supply_id',
            'supplies.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            $requestData = [
                'employee_id' => $validated['employee_id'],
                'service_order_detail_id' => $validated['service_order_detail_id'],
                'date_time' => now(),
                'is_approve' => false,
            ];

            $pulloutRequest = $this->pulloutRequestRepository->createWithDetails(
                $requestData,
                $validated['supplies']
            );

            return response()->json([
                'message' => 'Pullout request created successfully',
                'pulloutRequest' => $pulloutRequest
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create pullout request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        $validated = $request->validate([
            'approved_by' => 'required|string',
        ]);

        try {
            $result = $this->pulloutRequestRepository->approve($id, $validated['approved_by']);

            if ($result) {
                return response()->json([
                    'message' => 'Pullout request approved successfully'
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to approve pullout request'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error approving pullout request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $pulloutRequest = $this->pulloutRequestRepository->findById($id);
        
        if (!$pulloutRequest) {
            return response()->json([
                'message' => 'Pullout request not found'
            ], 404);
        }

        $updated = $this->pulloutRequestRepository->update($pulloutRequest, [
            'is_approve' => false,
            'approve_by' => 'Rejected',
            'approve_date' => now(),
        ]);

        if ($updated) {
            return response()->json([
                'message' => 'Pullout request rejected successfully'
            ]);
        } else {
            return response()->json([
                'message' => 'Failed to reject pullout request'
            ], 400);
        }
    }

    public function update(Request $request, int $id)
    {
        $item = $this->pulloutRequestRepository->findById($id);
        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->pulloutRequestRepository->update($item, $request->all());
        return response()->json($item);
    }

    public function destroy(int $id)
    {
        $item = $this->pulloutRequestRepository->findById($id);
        if (! $item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->pulloutRequestRepository->delete($item);
        return response()->json(null, 204);
    }

    public function getReturnableSupplies()
    {
        $returnableSupplies = $this->pulloutRequestRepository->getReturnablePullouts();
        return response()->json($returnableSupplies);
    }

    public function returnSupply(Request $request, $detailId)
    {
        $validated = $request->validate([
            'returned_by' => 'required|string',
        ]);

        try {
            $result = $this->pulloutRequestRepository->returnSupplies(
                $detailId,
                $validated['returned_by']
            );

            if ($result) {
                return response()->json([
                    'message' => 'Supply returned successfully'
                ]);
            } else {
                return response()->json([
                    'message' => 'Supply cannot be returned (already returned or consumable)'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error returning supply',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
