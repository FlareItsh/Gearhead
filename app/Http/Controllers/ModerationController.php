<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Discount;
use App\Models\GcashSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ModerationController extends Controller
{
    public function index(): Response
    {
        $loyaltyThreshold = AppSetting::where('key', 'loyalty_free_wash_threshold')->first();

        $gcashSettings = GcashSetting::first() ?? new GcashSetting([
            'account_name' => '',
            'account_number' => '',
            'qr_code_path' => null,
        ]);

        return Inertia::render('Admin/Moderation', [
            'loyaltyThreshold' => $loyaltyThreshold ? (int) $loyaltyThreshold->value : 9,
            'gcashSettings' => $gcashSettings,
            'discounts' => Discount::orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function updateLoyalty(Request $request)
    {
        $request->validate([
            'threshold' => 'required|integer|min:1|max:100',
        ]);

        AppSetting::updateOrCreate(
            ['key' => 'loyalty_free_wash_threshold'],
            ['value' => (string) $request->threshold, 'group' => 'loyalty']
        );

        return back()->with('status', 'loyalty-threshold-updated');
    }

    public function updateGcash(Request $request)
    {
        $request->validate([
            'account_name' => ['required', 'string', 'max:255'],
            'account_number' => ['required', 'string', 'max:255'],
            'qr_code' => ['nullable', 'image', 'max:2048'],
        ]);

        $settings = GcashSetting::first() ?? new GcashSetting;

        $data = [
            'account_name' => $request->account_name,
            'account_number' => $request->account_number,
        ];

        if ($request->hasFile('qr_code')) {
            // Delete old QR code if exists
            if ($settings->qr_code_path) {
                Storage::disk('public')->delete($settings->qr_code_path);
            }

            $path = $request->file('qr_code')->store('gcash', 'public');
            $data['qr_code_path'] = $path;
        }

        $settings->fill($data)->save();

        return back()->with('status', 'gcash-settings-updated');
    }

    public function storeDiscount(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'is_active' => 'required|boolean',
        ]);

        Discount::create($validated);

        return back()->with('status', 'discount-created');
    }

    public function updateDiscount(Request $request, int $id)
    {
        $discount = Discount::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'is_active' => 'required|boolean',
        ]);

        $discount->update($validated);

        return back()->with('status', 'discount-updated');
    }

    public function destroyDiscount(int $id)
    {
        $discount = Discount::findOrFail($id);
        $discount->delete();

        return back()->with('status', 'discount-deleted');
    }
}
