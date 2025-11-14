<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supply extends Model
{
    use HasFactory;

    protected $table = 'supplies';

    protected $primaryKey = 'supply_id';

    protected $fillable = [
        'supply_name',
        'unit',
        'reorder_point',
        'supply_type',
        'quantity_stock',
    ];

    protected $casts = [
        'quantity_stock' => 'integer',
        'reorder_point' => 'integer',
    ];

    public function supplyPurchaseDetails()
    {
        return $this->hasMany(SupplyPurchaseDetail::class, 'supply_id', 'supply_id');
    }

    public function pulloutRequestDetails()
    {
        return $this->hasMany(PulloutRequestDetail::class, 'supply_id', 'supply_id');
    }
}
