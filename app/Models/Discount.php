<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $primaryKey = 'discount_id';

    protected $fillable = [
        'name',
        'type',
        'value',
        'valid_from',
        'valid_to',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'valid_from' => 'datetime',
        'valid_to' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active and valid discounts.
     */
    public function scopeActive(Builder $query): Builder
    {
        $now = Carbon::now();

        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $now);
            });
    }

    /**
     * Get the best active discount (highest reduction).
     */
    public static function getBestActiveDiscount(float $totalAmount = 0): ?self
    {
        $discounts = self::active()->get();

        if ($discounts->isEmpty()) {
            return null;
        }

        // Map discounts to their actual reduction value for the given total
        return $discounts->sortByDesc(function ($discount) use ($totalAmount) {
            if ($discount->type === 'percentage') {
                return ($totalAmount * $discount->value) / 100;
            }

            return $discount->value;
        })->first();
    }

    /**
     * Calculate the discount amount for a given total.
     */
    public function calculateReduction(float $totalAmount): float
    {
        if ($this->type === 'percentage') {
            return ($totalAmount * $this->value) / 100;
        }

        return (float) $this->value;
    }
}
