<?php

namespace App\Models;

use App\Traits\HasFullName;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use HasFactory, HasFullName, Notifiable, TwoFactorAuthenticatable;

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
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
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Automatically hash password when set.
     */

    /**
     * Role check helpers.
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdministrator(): bool
    {
        return $this->hasRole('admin');
    }
}
