<?php

namespace App\Repositories;

use App\Repositories\Contracts\SupplyPurchaseRepositoryInterface;

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

    public function getDetailedPurchases(?string $startDate = null, ?string $endDate = null)
    {
        $query = DB::table('supply_purchases as sp')
            ->leftJoin('suppliers as s', 'sp.supplier_id', '=', 's.supplier_id')
            ->leftJoin('supply_purchase_details as spd', 'sp.supply_purchase_id', '=', 'spd.supply_purchase_id')
            ->leftJoin('supplies as sup', 'spd.supply_id', '=', 'sup.supply_id')
            ->selectRaw(
                'sp.supply_purchase_id,
                sp.purchase_date,
                COALESCE(sp.purchase_reference, "") as purchase_reference,
                CONCAT(COALESCE(s.first_name, ""), " ", COALESCE(s.last_name, "")) as supplier_name,
                GROUP_CONCAT(sup.supply_name SEPARATOR ", ") as supplies,
                SUM(spd.quantity * spd.unit_price) as total_amount'
            )
            ->groupBy('sp.supply_purchase_id', 'sp.purchase_date', 'sp.supplier_id', 'sp.purchase_reference', 's.first_name', 's.last_name')
            ->orderBy('sp.purchase_date', 'desc');

        if ($startDate && $endDate) {
            $query->whereBetween('sp.purchase_date', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
        }

        return $query->get()->map(function ($item) {
            return [
                'supply_purchase_id' => $item->supply_purchase_id,
                'purchase_date' => $item->purchase_date,
                'purchase_reference' => $item->purchase_reference ?: 'N/A',
                'supplier_name' => trim($item->supplier_name) ?: 'Unknown Supplier',
                'supplies' => $item->supplies ?: 'No Supplies',
                'total_amount' => (float) ($item->total_amount ?? 0),
                'status' => 'completed',
            ];
        })->toArray();
    }
}
