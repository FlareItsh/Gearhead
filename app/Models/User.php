<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'phone_number',
        'address',
        'password',
        'role',
    ];

    /**
     * The primary key for the model (migration uses `user_id`).
     *
     * @var string
     */
    protected $primaryKey = 'user_id';

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Automatically hash passwords when set.
     * (Ensures consistency even if set manually.)
     */
    public function setPasswordAttribute($value): void
    {
        if (! empty($value)) {
            $this->attributes['password'] = bcrypt($value);
        }
    }

    /**
     * Provide a `name` attribute combining first and last name.
     */
    public function getNameAttribute(): string
    {
        $parts = array_filter([$this->first_name ?? '', $this->last_name ?? '']);

        return implode(' ', $parts);
    }

    /**
     * Provide a `full_name` accessor including middle name if available.
     */
    public function getFullNameAttribute(): string
    {
        $middle = $this->middle_name ? ' '.$this->middle_name : '';

        return "{$this->first_name}{$middle} {$this->last_name}";
    }

    public function sessions()
    {
        return $this->hasMany(Session::class, 'user_id', 'user_id');
    }

    /**
     * Check if the user has any of the given roles.
     *
     * @param  array  $roles  (e.g., ['admin', 'customer'])
     */
    public function hasAnyRole(array $roles): bool
    {
        // This method checks if the user's 'role' column matches any of the roles in the provided array.
        return in_array($this->role, $roles);
    }

    /**
     * Check if the user has a specific role.
     * (Optional, but often useful for single checks)
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if the user is an administrator.
     * (Optional, specific helper)
     */
    public function isAdministrator(): bool
    {
        return $this->hasRole('admin');
    }
}
