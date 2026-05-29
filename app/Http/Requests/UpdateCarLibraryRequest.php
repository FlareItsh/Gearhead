<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCarLibraryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $carId = $this->route('car')?->id;

        return [
            'make' => ['required', 'string', 'max:255'],
            'model' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($carId) {
                    $make = $this->input('make');
                    $exists = \App\Models\CarLibrary::where('id', '!=', $carId)
                        ->whereRaw('LOWER(make) = ?', [strtolower($make)])
                        ->whereRaw('LOWER(model) = ?', [strtolower($value)])
                        ->exists();
                    if ($exists) {
                        $fail('This car make and model combination already exists in the library.');
                    }
                },
            ],
            'size' => ['required', 'string', 'in:Small,Medium,Large,X-Large,XX-Large'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'make.required' => 'The car make is required.',
            'model.required' => 'The car model is required.',
            'size.required' => 'The vehicle size is required.',
            'size.in' => 'The vehicle size must be one of: Small, Medium, Large, X-Large, XX-Large.',
        ];
    }
}
