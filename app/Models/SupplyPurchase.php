<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplyPurchase extends Model
{
    use HasFactory;

    protected $table = 'supply_purchases';

    protected $primaryKey = 'supply_purchase_id';

    protected $fillable = [
        'supply_id',
    ];

    public function supply()
    {
        return $this->belongsTo(Supply::class, 'supply_id', 'supply_id');
    }

    public function details()
    {
        return $this->hasMany(SupplyPurchaseDetail::class, 'supply_purchase_id', 'supply_purchase_id');
    }
}
