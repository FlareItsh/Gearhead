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
        'quantity_stock',
    ];

    protected $casts = [
        'quantity_stock' => 'decimal:2',
    ];

    public function supplyPurchases()
    {
        return $this->hasMany(SupplyPurchase::class, 'supply_id', 'supply_id');
    }

    public function pulloutRequestDetails()
    {
        return $this->hasMany(PulloutRequestDetail::class, 'supply_id', 'supply_id');
    }
}
