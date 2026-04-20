<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GcashSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_name',
        'account_number',
        'qr_code_path',
    ];

    protected $appends = ['qr_code_url'];

    public function getQrCodeUrlAttribute(): ?string
    {
        return $this->qr_code_path ? asset('storage/'.$this->qr_code_path) : null;
    }
}
