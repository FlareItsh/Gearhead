<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PulloutRequestDetail extends Model
{
    use HasFactory;

    protected $table = 'pullout_request_details';

    protected $primaryKey = 'pullout_request_details_id';

    protected $fillable = [
        'pullout_service_id',
        'supply_id',
        'pullout_request_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    public function pulloutService()
    {
        return $this->belongsTo(PulloutService::class, 'pullout_service_id', 'pullout_service_id');
    }

    public function supply()
    {
        return $this->belongsTo(Supply::class, 'supply_id', 'supply_id');
    }

    public function pulloutRequest()
    {
        return $this->belongsTo(PulloutRequest::class, 'pullout_request_id', 'pullout_request_id');
    }
}
