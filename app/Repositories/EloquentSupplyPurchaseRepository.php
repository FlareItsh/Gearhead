<?php

namespace App\Repositories;

use App\Models\SupplyPurchase;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EloquentSupplyPurchaseRepository implements SupplyPurchaseRepositoryInterface
{
    public function all(): Collection
    {
        return SupplyPurchase::all();
    }

    public function findById(int $id): ?SupplyPurchase
    {
        return SupplyPurchase::find($id);
    }

    public function create(array $data): SupplyPurchase
    {
        return SupplyPurchase::create($data);
    }

    public function update(SupplyPurchase $purchase, array $data): bool
    {
        return $purchase->update($data);
    }

    public function delete(SupplyPurchase $purchase): bool
    {
        return $purchase->delete();
    }

    public function getFinancialSummary(?string $startDate = null, ?string $endDate = null)
    {
        // Daily revenue: GROUP BY DATE(created_at) from payments
        $revenueQuery = DB::table('payments')
            ->selectRaw('DATE(created_at) as date, COALESCE(SUM(amount), 0) as revenue')
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
            })
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date');

        $revenueData = $revenueQuery->get();

        // Daily expenses: GROUP BY DATE(created_at) from supply_purchases, SUM from supply_purchase_details
        $expensesQuery = DB::table('supply_purchase_details')
            ->join('supply_purchases', 'supply_purchase_details.supply_purchase_id', '=', 'supply_purchases.supply_purchase_id')
            ->selectRaw('DATE(supply_purchases.created_at) as date, COALESCE(SUM(supply_purchase_details.quantity * supply_purchase_details.unit_price), 0) as expenses')
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('supply_purchases.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
            })
            ->groupByRaw('DATE(supply_purchases.created_at)')
            ->orderBy('date');

        $expensesData = $expensesQuery->get();

        // Combine into single array with profit (revenue - expenses per day)
        $financialData = [];
        $allDates = $revenueData->pluck('date')->merge($expensesData->pluck('date'))->unique()->sort()->values();

        foreach ($allDates as $date) {
            $rev = $revenueData->firstWhere('date', $date)->revenue ?? 0;
            $exp = $expensesData->firstWhere('date', $date)->expenses ?? 0;
            $financialData[] = [
                'date' => $date,
                'revenue' => (float) $rev,
                'expenses' => (float) $exp,
                'profit' => (float) ($rev - $exp),
            ];
        }

        // Added: Log for debugging
        Log::info('Financial Summary Data', [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'data_count' => count($financialData),
            'sample_data' => array_slice($financialData, 0, 3), // First 3 days
        ]);

        return $financialData; // Array of daily points for time-series chart
    }
}
