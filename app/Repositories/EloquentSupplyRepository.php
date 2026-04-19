<?php

namespace App\Repositories;

use App\Repositories\Contracts\SupplyRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentSupplyRepository implements SupplyRepositoryInterface
{
    public function all(): Collection
    {
        return DB::table('supplies')->get();
    }

    public function paginate(int $perPage, ?string $search = null, ?string $type = null)
    {
        $query = DB::table('supplies');

        if ($search) {
            $query->where('supply_name', 'like', "%{$search}%");
        }

        if ($type) {
            $query->where('supply_type', $type);
        }

        return $query->paginate($perPage);
    }

    public function findById(int $id)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->first();
    }

    public function create(array $data)
    {
        return DB::table('supplies')->insertGetId($data);
    }

    public function update(int $id, array $data)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->update($data) > 0;
    }

    public function incrementStock(int $id, float $quantity)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->increment('quantity_stock', $quantity);
    }

    public function delete(int $id)
    {
        return DB::table('supplies')
            ->where('supply_id', $id)
            ->delete() > 0;
    }

    public function getLedger(int $supplyId, ?string $start_date = null, ?string $end_date = null)
    {
        $purchases = DB::table('supply_purchase_details')
            ->join('supply_purchases', 'supply_purchase_details.supply_purchase_id', '=', 'supply_purchases.supply_purchase_id')
            ->join('suppliers', 'supply_purchases.supplier_id', '=', 'suppliers.supplier_id')
            ->where('supply_purchase_details.supply_id', $supplyId)
            ->when($start_date, function ($query, $start_date) {
                return $query->whereDate('supply_purchases.created_at', '>=', $start_date);
            })
            ->when($end_date, function ($query, $end_date) {
                return $query->whereDate('supply_purchases.created_at', '<=', $end_date);
            })
            ->select([
                'supply_purchases.created_at as date',
                DB::raw("'Purchase' as type"),
                DB::raw("CONCAT(suppliers.first_name, ' ', suppliers.last_name) as supplier_name"),
                DB::raw('NULL as employee_name'),
                'supply_purchase_details.quantity as qty_in',
                DB::raw('0 as qty_out'),
                'supply_purchases.purchase_reference as reference_no',
            ]);

        $pullouts = DB::table('pullout_request_details')
            ->join('pullout_requests', 'pullout_request_details.pullout_request_id', '=', 'pullout_requests.pullout_request_id')
            ->join('employees', 'pullout_requests.employee_id', '=', 'employees.employee_id')
            ->where('pullout_request_details.supply_id', $supplyId)
            ->where('pullout_requests.is_approve', true)
            ->when($start_date, function ($query, $start_date) {
                return $query->whereDate('pullout_requests.created_at', '>=', $start_date);
            })
            ->when($end_date, function ($query, $end_date) {
                return $query->whereDate('pullout_requests.created_at', '<=', $end_date);
            })
            ->select([
                'pullout_requests.created_at as date',
                DB::raw("'Pullout' as type"),
                DB::raw('NULL as supplier_name'),
                DB::raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
                DB::raw('0 as qty_in'),
                'pullout_request_details.quantity as qty_out',
                'pullout_requests.pullout_request_id as reference_no',
            ]);

        return $purchases->unionAll($pullouts)
            ->orderBy('date', 'desc')
            ->get();
    }
}
