import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    Coins,
    CreditCard,
    Download,
    Search,
    TrendingUp,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

interface Transaction {
    payment_id: number;
    date: string;
    customer: string;
    services: string;
    amount: number;
    payment_method: string;
    gcash_reference: string | null;
    status: string;
    is_point_redeemed: boolean;
}

interface Stats {
    total_revenue: number;
    total_transactions: number;
    cash_transactions: number;
    gcash_transactions: number;
    points_redeemed_count: number;
}

interface TransactionsProps {
    transactions: Transaction[];
    stats: Stats;
}

const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
}: {
    title: string;
    value: ReactNode;
    icon: React.ElementType;
    trend?: boolean;
    trendValue?: string;
}) => (
    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-card">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-semibold text-muted-foreground">
                    {title}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                    {value}
                </h3>
                {trend && trendValue && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">{trendValue}</span>
                        <span className="text-muted-foreground">
                            vs last month
                        </span>
                    </div>
                )}
            </div>
            <div className="rounded-full bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
            </div>
        </div>
    </div>
);

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
    const statusColors = {
        completed:
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        pending:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        in_progress:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        cancelled:
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const formatDate = (dateString: string) => dateString.split(' ')[0];

    const formatStatus = (status: string) =>
        status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

    return (
        <tr className="border-b border-border transition-colors hover:bg-muted/50">
            <td className="p-4 text-sm text-foreground">
                {formatDate(transaction.date)}
            </td>
            <td className="p-4 text-sm text-foreground">
                {transaction.customer}
            </td>
            <td className="max-w-xs truncate p-4 text-sm text-muted-foreground">
                {transaction.services}
            </td>
            <td className="p-4 text-sm font-bold text-foreground">
                ₱{transaction.amount.toFixed(2)}
            </td>
            <td className="p-4">
                <div className="flex flex-col gap-1">
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {transaction.payment_method}
                    </span>
                    {transaction.gcash_reference && (
                        <span className="text-xs text-muted-foreground">
                            Ref: {transaction.gcash_reference}
                        </span>
                    )}
                </div>
            </td>
            <td className="p-4">
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        statusColors[
                            transaction.status as keyof typeof statusColors
                        ] || statusColors.completed
                    }`}
                >
                    {formatStatus(transaction.status)}
                </span>
            </td>
        </tr>
    );
};

export default function Transactions({
    transactions,
    stats,
}: TransactionsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Only completed transactions
    const completedTransactions = useMemo(
        () => transactions.filter((t) => t.status === 'completed'),
        [transactions],
    );

    // Search + date filter
    const filteredTransactions = useMemo(() => {
        let filtered = completedTransactions;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.customer.toLowerCase().includes(q) ||
                    t.services.toLowerCase().includes(q) ||
                    t.date.includes(q) ||
                    t.payment_method.toLowerCase().includes(q),
            );
        }

        if (dateFilter) {
            filtered = filtered.filter((t) => t.date.startsWith(dateFilter));
        }

        return filtered;
    }, [completedTransactions, searchQuery, dateFilter]);

    // completed only
    const completedStats = useMemo(() => {
        return {
            total_revenue: completedTransactions.reduce(
                (sum, t) => sum + t.amount,
                0,
            ),
            total_transactions: completedTransactions.length,
            cash_transactions: completedTransactions.filter(
                (t) => t.payment_method === 'Cash',
            ).length,
            gcash_transactions: completedTransactions.filter(
                (t) => t.payment_method === 'Gcash',
            ).length,
        };
    }, [completedTransactions]);

    // CSV export
    const handleExport = () => {
        const csv = [
            [
                'Date',
                'Customer',
                'Services',
                'Amount',
                'Payment Method',
                'Status',
            ].join(','),
            ...filteredTransactions.map((t) =>
                [
                    t.date.split(' ')[0],
                    t.customer,
                    `"${t.services}"`,
                    t.amount,
                    t.payment_method,
                    t.status,
                ].join(','),
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${
            new Date().toISOString().split('T')[0]
        }.csv`;
        a.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-background p-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Transactions
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Track financial records and payments
                            </p>
                        </div>
                        <Button
                            onClick={handleExport}
                            variant="highlight"
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={
                            <span className="font-bold">
                                ₱{completedStats.total_revenue.toFixed(2)}
                            </span>
                        }
                        icon={Coins}
                    />
                    <StatCard
                        title="Total Transactions"
                        value={completedStats.total_transactions}
                        icon={CreditCard}
                    />
                    <StatCard
                        title="Cash Payments"
                        value={completedStats.cash_transactions}
                        icon={Coins}
                    />
                    <StatCard
                        title="GCash Payments"
                        value={completedStats.gcash_transactions}
                        icon={CreditCard}
                    />
                </div>

                {/* Transactions Table */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-card">
                    <div className="flex flex-col">
                        {/* Search & Filter */}
                        <div className="border-b border-border bg-secondary/30 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Transaction History
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Total:{' '}
                                        <span className="font-semibold">
                                            {filteredTransactions.length}
                                        </span>{' '}
                                        transactions
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Date */}
                                    <div className="relative">
                                        <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) =>
                                                setDateFilter(e.target.value)
                                            }
                                            className="h-9 pl-9 sm:w-48"
                                        />
                                    </div>
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search transactions..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="h-9 pl-9 sm:w-64"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto bg-white dark:bg-card">
                            <table className="w-full">
                                <thead className="border-b border-border bg-secondary/50 dark:bg-muted/50">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-bold text-foreground">
                                            Date
                                        </th>
                                        <th className="p-4 text-left text-sm font-bold text-foreground">
                                            Customer
                                        </th>
                                        <th className="p-4 text-left text-sm font-bold text-foreground">
                                            Services
                                        </th>
                                        <th className="p-4 text-left text-sm font-bold text-foreground">
                                            Amount
                                        </th>
                                        <th className="p-4 text-left text-sm font-bold text-foreground">
                                            Payment Method
                                        </th>
                                        <th className="p-4 text-left text-sm font-bold text-foreground">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length > 0 ? (
                                        filteredTransactions.map(
                                            (transaction) => (
                                                <TransactionRow
                                                    key={transaction.payment_id}
                                                    transaction={transaction}
                                                />
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-8 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Search className="h-8 w-8 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No transactions found
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
