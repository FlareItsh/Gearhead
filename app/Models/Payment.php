<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';

    protected $primaryKey = 'payment_id';

    protected $fillable = [
        'service_order_id',
        'amount',
        'payment_method',
        'is_point_redeemed',
        'gcash_reference',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_point_redeemed' => 'boolean',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class, 'service_order_id', 'service_order_id');
    }
}
