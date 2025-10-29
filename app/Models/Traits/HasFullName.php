<?php

namespace App\Traits;

trait HasFullName
{
    /**
     * Get the full name of the model (First + Middle + Last).
     */
    public function getFullName(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    /**
     * Get the name excluding the middle name (First + Last).
     */
    public function getName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
