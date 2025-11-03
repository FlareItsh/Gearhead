<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $table = 'service_orders';

    protected $primaryKey = 'service_order_id';

    protected $fillable = [
        'user_id',
        'employee_id',
        'bay_id',
        'order_date',
        'order_type',
    ];

    protected $casts = [
        'order_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function bay()
    {
        return $this->belongsTo(Bay::class, 'bay_id', 'bay_id');
    }

    public function details()
    {
        return $this->hasMany(ServiceOrderDetail::class, 'service_order_id', 'service_order_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'service_order_id', 'service_order_id');
    }
}
