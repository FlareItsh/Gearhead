<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarLibrary extends Model
{
    protected $fillable = [
        'make',
        'model',
        'size',
    ];
}
