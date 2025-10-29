<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ServiceOrderDetail;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';

    protected $primaryKey = 'service_id';

    protected $fillable = [
        'service_name',
        'description',
        'size',
        'category',
        'estimated_duration',
        'price',
        'status',
    ];

    protected $casts = [
        'estimated_duration' => 'integer',
        'price' => 'decimal:2',
    ];

    public function serviceOrderDetails()
    {
        return $this->hasMany(ServiceOrderDetail::class, 'service_id', 'service_id');
    }
}
