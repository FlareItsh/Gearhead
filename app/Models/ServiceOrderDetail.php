<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrderDetail extends Model
{
    use HasFactory;

    protected $table = 'service_order_details';

    protected $primaryKey = 'service_order_detail_id';

    protected $fillable = [
        'service_order_id',
        'service_id',
        'quantity',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class, 'service_order_id', 'service_order_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }

    public function pulloutServices()
    {
        return $this->hasMany(PulloutService::class, 'service_order_detail_id', 'service_order_detail_id');
    }
}
