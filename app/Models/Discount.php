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
     * Scope for current and upcoming discounts for promotional display.
     */
    public function scopeAdvertisable(Builder $query): Builder
    {
        $now = Carbon::now();

        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $now);
            })
            ->orderBy('valid_from', 'asc');
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
            $reduction = $discount->type === 'percentage'
                ? ($totalAmount * min(100, $discount->value)) / 100
                : $discount->value;

            return min($reduction, $totalAmount);
        })->first();
    }

    /**
     * Calculate the discount amount for a given total.
     */
    public function calculateReduction(float $totalAmount): float
    {
        $reduction = $this->type === 'percentage'
            ? ($totalAmount * min(100, $this->value)) / 100
            : (float) $this->value;

        return min($reduction, $totalAmount);
    }
}
