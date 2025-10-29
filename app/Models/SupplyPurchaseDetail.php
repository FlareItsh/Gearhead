<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplyPurchaseDetail extends Model
{
    use HasFactory;

    protected $table = 'supply_purchase_details';

    protected $primaryKey = 'supply_purchase_details_id';

    protected $fillable = [
        'supplier_id',
        'supply_purchase_id',
        'quantity',
        'unit_price',
        'purchase_date',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'purchase_date' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'supplier_id');
    }

    public function supplyPurchase()
    {
        return $this->belongsTo(SupplyPurchase::class, 'supply_purchase_id', 'supply_purchase_id');
    }
}
