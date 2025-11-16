<?php

namespace App\Repositories;

use App\Models\SupplyPurchase;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

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
        // Default to last 30 days
        $startDate = $startDate ?? now()->subDays(30)->format('Y-m-d');
        $endDate = $endDate ?? now()->format('Y-m-d');

        // Generate a continuous date range in PHP
        $period = new \DatePeriod(
            new \DateTime($startDate),
            new \DateInterval('P1D'),
            (new \DateTime($endDate))->modify('+1 day')
        );

        $dates = [];
        foreach ($period as $date) {
            $dates[] = $date->format('Y-m-d');
        }

        // Get revenue per day
        $revenueData = DB::table('payments')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue')
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupByRaw('DATE(created_at)')
            ->pluck('revenue', 'date'); // ['2025-11-01' => 1000, ...]

        // Get expenses per day
        $expensesData = DB::table('supply_purchase_details')
            ->selectRaw('DATE(purchase_date) as date, SUM(quantity * unit_price) as expenses')
            ->whereBetween('purchase_date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupByRaw('DATE(purchase_date)')
            ->pluck('expenses', 'date');

        // Merge into final dataset
        $financialData = [];
        foreach ($dates as $date) {
            $rev = $revenueData[$date] ?? 0;
            $exp = $expensesData[$date] ?? 0;
            $financialData[] = [
                'date' => $date,
                'revenue' => (float) $rev,
                'expenses' => (float) $exp,
                'profit' => (float) ($rev - $exp),
            ];
        }

        return $financialData;
    }
}
