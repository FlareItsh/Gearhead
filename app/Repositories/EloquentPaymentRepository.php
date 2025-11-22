<?php

namespace App\Repositories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    public function all(): Collection
    {
        return Payment::all();
    }

    public function findById(int $id): ?Payment
    {
        return Payment::find($id);
    }

    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    public function update(Payment $payment, array $data): bool
    {
        return $payment->update($data);
    }

    public function delete(Payment $payment): bool
    {
        return $payment->delete();
    }

    public function countByUserId(int $userId): int
    {
        return Payment::join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->where('service_orders.user_id', $userId)
            ->count('payments.payment_id');
    }

    public function totalSpent(int $userId): int
    {
        return (int) Payment::join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->where('service_orders.user_id', $userId)
            ->sum('payments.amount');
    }

    /**
     * Get all payments for a specific user, including services.
     */
    public function getPaymentsForUser(int $userId)
    {
        return DB::table('payments')
            ->join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->join('service_order_details', 'service_orders.service_order_id', '=', 'service_order_details.service_order_id')
            ->join('services', 'service_order_details.service_id', '=', 'services.service_id')
            ->where('service_orders.user_id', $userId)
            ->select(
                'payments.payment_id',
                'service_orders.order_date as date',
                DB::raw('GROUP_CONCAT(services.service_name SEPARATOR ", ") as services'),
                'payments.amount',
                'payments.payment_method',
                'payments.gcash_reference',
                'payments.created_at',
                'payments.updated_at'
            )
            ->groupBy(
                'payments.payment_id',
                'service_orders.order_date',
                'payments.amount',
                'payments.payment_method',
                'payments.gcash_reference',
                'payments.created_at',
                'payments.updated_at'
            )
            ->orderBy('payments.created_at', 'desc') // optional: newest first
            ->get();
    }

    /**
     * Dashboard Stats with optional date range
     */
    public function getSummaryByDateRange(string $startDate, string $endDate): array
    {
        $summary = Payment::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('SUM(amount) as total_amount, COUNT(payment_id) as total_payments')
            ->first();

        return [
            'total_amount' => $summary->total_amount ?? 0,
            'total_payments' => $summary->total_payments ?? 0,
        ];
    }

    /**
     * Get monthly revenue for a specific year
     */
    public function getMonthlyRevenueByYear(int $year): array
    {
        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        $data = Payment::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(amount) as revenue')
        )
        ->whereYear('created_at', $year)
        ->groupBy(DB::raw('MONTH(created_at)'))
        ->orderBy(DB::raw('MONTH(created_at)'))
        ->get()
        ->keyBy('month')
        ->toArray();

        $result = [];
        for ($i = 1; $i <= 12; $i++) {
            $result[] = [
                'month' => $months[$i - 1],
                'revenue' => $data[$i]['revenue'] ?? 0,
            ];
        }

        return $result;
    }

    /**
     * Get financial summary (revenue, expenses, profit) by date range
     */
    public function getFinancialSummaryByDateRange(string $startDate, string $endDate): array
    {
        // Generate a continuous date range
        $period = new \DatePeriod(
            new \DateTime($startDate),
            new \DateInterval('P1D'),
            (new \DateTime($endDate))->modify('+1 day')
        );

        $dates = [];
        foreach ($period as $date) {
            $dates[] = $date->format('Y-m-d');
        }

        // Get revenue per day from payments
        $revenueData = DB::table('payments')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue')
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupByRaw('DATE(created_at)')
            ->pluck('revenue', 'date');

        // Get expenses per day from supply purchases
        $expensesData = DB::table('supply_purchase_details')
            ->selectRaw('DATE(purchase_date) as date, SUM(quantity * unit_price) as expenses')
            ->whereBetween('purchase_date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupByRaw('DATE(purchase_date)')
            ->pluck('expenses', 'date');

        // Merge into final dataset
        $financialData = [];
        foreach ($dates as $date) {
            $rev = $revenueData[$date] ?? 0;
            $exp = $expensesData[$date] ?? 0;
            $financialData[] = [
                'date' => $date,
                'revenue' => (float) $rev,
                'expenses' => (float) $exp,
                'profit' => (float) ($rev - $exp),
            ];
        }

        return $financialData;
    }

    /**
     * Get average booking value by date range
     */
    public function getAverageBookingValueByDateRange(string $startDate, string $endDate): float
    {
        $result = DB::table('payments')
            ->selectRaw('COUNT(*) as total_bookings, SUM(amount) as total_revenue')
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->first();

        if (!$result || $result->total_bookings == 0) {
            return 0;
        }

        return (float) ($result->total_revenue / $result->total_bookings);
    }

    /**
     * Get customer retention rate by date range
     * Retention rate = (customers with repeat bookings) / (total unique customers) * 100
     */
    public function getCustomerRetentionRateByDateRange(string $startDate, string $endDate): float
    {
        // Get all unique customers in the period by joining payments with service_orders
        $totalCustomers = DB::table('payments')
            ->join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->whereBetween('payments.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->distinct('service_orders.user_id')
            ->count('service_orders.user_id');

        if ($totalCustomers == 0) {
            return 0;
        }

        // Get customers with repeat bookings (more than 1 booking in the period)
        $repeatCustomers = DB::table('payments')
            ->join('service_orders', 'payments.service_order_id', '=', 'service_orders.service_order_id')
            ->selectRaw('service_orders.user_id, COUNT(payments.payment_id) as booking_count')
            ->whereBetween('payments.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupBy('service_orders.user_id')
            ->havingRaw('COUNT(payments.payment_id) > 1')
            ->count();

        $retentionRate = ($repeatCustomers / $totalCustomers) * 100;

        return (float) $retentionRate;
    }
}
