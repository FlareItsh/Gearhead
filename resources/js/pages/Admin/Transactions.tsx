import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CreditCard, Download, PhilippinePeso, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    gcash_screenshot: string | null;
    status: string;
    is_point_redeemed: boolean;
    type: 'income';
}

interface SupplyPurchase {
    supply_purchase_id: number;
    purchase_date: string;
    purchase_reference: string;
    supplier_name: string;
    supplies: string;
    total_amount: number;
    status: string;
    type: 'expense';
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

// Professional PHP currency formatter (₱2,000.00)
const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const TransactionRow = ({ item }: { item: Transaction | SupplyPurchase }) => {
    const isTransaction = 'payment_id' in item;
    const isIncome = isTransaction;
    const amount = isTransaction ? item.amount : (item.total_amount ?? 0);

    const statusVariants: Record<
        string,
        'success' | 'warning' | 'info' | 'destructive' | 'default'
    > = {
        completed: 'success',
        pending: 'warning',
        in_progress: 'info',
        cancelled: 'destructive',
    };

    const formatDate = (dateString: string) => dateString.split(' ')[0];

    const formatStatus = (status: string) =>
        status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

    const renderSuppliesAsBullets = (suppliesString: string) => {
        const supplies = suppliesString
            .split(', ')
            .map((s) => s.trim())
            .filter((s) => s && s !== 'N/A');

        if (supplies.length === 0) {
            return (
                <span className="text-xs text-muted-foreground">
                    No supplies
                </span>
            );
        }

        return (
            <ul className="list-inside list-disc space-y-1 text-sm">
                {supplies.map((supply, index) => (
                    <li key={index} className="text-muted-foreground">
                        {supply}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <tr className="border-b border-border transition-colors hover:bg-muted/50">
            <td className="p-4 text-sm text-foreground">
                {formatDate(isTransaction ? item.date : item.purchase_date)}
            </td>
            <td className="p-4 text-sm text-foreground">
                {isTransaction ? item.customer : item.supplier_name}
            </td>
            <td className="max-w-xs p-4 text-sm">
                {isTransaction
                    ? item.services
                    : renderSuppliesAsBullets(item.supplies)}
            </td>
            <td
                className={`p-4 text-sm font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}
            >
                {isIncome ? '+' : '-'}
                {formatMoney(amount)}
            </td>
            <td className="p-4">
                {isTransaction ? (
                    <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                            {item.payment_method}
                        </span>
                        {item.gcash_reference && (
                            <span className="text-xs text-muted-foreground">
                                Ref: {item.gcash_reference}
                            </span>
                        )}
                        {item.gcash_screenshot && (
                            <button
                                onClick={() =>
                                    window.open(
                                        `/${item.gcash_screenshot}`,
                                        '_blank',
                                    )
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                📷 {item.gcash_screenshot.split('/').pop()}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {item.purchase_reference &&
                        item.purchase_reference !== 'N/A' ? (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                {item.purchase_reference}
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </div>
                )}
            </td>
            <td className="p-4">
                <Badge variant={statusVariants[item.status] || 'default'}>
                    {formatStatus(item.status)}
                </Badge>
            </td>
        </tr>
    );
};

export default function Transactions({ transactions }: TransactionsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [financialData, setFinancialData] = useState({
        total_revenue: 0,
        total_expenses: 0,
        profit: 0,
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [supplyPurchases, setSupplyPurchases] = useState<SupplyPurchase[]>(
        [],
    );
    const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>(
        'payments',
    );

    // Format date range helper function
    const formatDateRange = (start: string, end: string): string => {
        if (!start || !end) return '';
        const startObj = new Date(start);
        const endObj = new Date(end);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        };

        const startFormatted = formatDate(startObj);
        const endFormatted = formatDate(endObj);

        return `${startFormatted} - ${endFormatted}`;
    };

    // Set default date range: current month to date (Philippine time)
    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const today = new Date(year, month, now.getDate());

        const format = (date: Date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        setStartDate(format(firstDay));
        setEndDate(format(today));
    }, []);

    // Fetch financial summary and supply purchases
    useEffect(() => {
        if (!startDate || !endDate) return;

        setIsLoading(true);

        Promise.all([
            axios.get('/payments/summary', {
                params: { start_date: startDate, end_date: endDate },
            }),
            axios.get('/supply-purchases/detailed', {
                params: { start_date: startDate, end_date: endDate },
            }),
        ])
            .then(([summaryRes, purchasesRes]) => {
                setFinancialData({
                    total_revenue: summaryRes.data.total_amount || 0,
                    total_expenses: summaryRes.data.total_expenses || 0,
                    profit: summaryRes.data.profit || 0,
                });

                const purchases: SupplyPurchase[] = purchasesRes.data.map(
                    (p: {
                        supply_purchase_id: number;
                        purchase_date: string;
                        purchase_reference: string;
                        supplier_name: string;
                        supplies: string;
                        total_amount: number;
                        status: string;
                    }) => ({
                        supply_purchase_id: p.supply_purchase_id,
                        purchase_date: p.purchase_date,
                        purchase_reference: p.purchase_reference,
                        supplier_name: p.supplier_name,
                        supplies: p.supplies,
                        total_amount: p.total_amount,
                        status: p.status,
                        type: 'expense',
                    }),
                );
                setSupplyPurchases(purchases);
            })
            .catch((err) => {
                console.error('Failed to load data:', err);
            })
            .finally(() => setIsLoading(false));
    }, [startDate, endDate]);

    const completedTransactions = useMemo(
        () => transactions.filter((t) => t.status === 'completed'),
        [transactions],
    );

    const allItems = useMemo(() => {
        return [...completedTransactions, ...supplyPurchases].sort((a, b) => {
            const idA = 'payment_id' in a ? a.payment_id : a.supply_purchase_id;
            const idB = 'payment_id' in b ? b.payment_id : b.supply_purchase_id;
            return idB - idA;
        });
    }, [completedTransactions, supplyPurchases]);

    const filteredTransactions = useMemo(() => {
        if (!searchQuery) return allItems;

        const q = searchQuery.toLowerCase();
        return allItems.filter((item) => {
            const isTx = 'payment_id' in item;
            if (isTx) {
                return (
                    item.customer.toLowerCase().includes(q) ||
                    item.services.toLowerCase().includes(q) ||
                    item.date.includes(q) ||
                    item.payment_method.toLowerCase().includes(q)
                );
            }
            return (
                item.supplier_name.toLowerCase().includes(q) ||
                item.supplies.toLowerCase().includes(q) ||
                item.purchase_date.includes(q)
            );
        });
    }, [allItems, searchQuery]);

    // PDF Export with formatted money
    const handleExport = () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        const dataToExport =
            activeTab === 'payments'
                ? filteredTransactions.filter(
                      (i): i is Transaction => 'payment_id' in i,
                  )
                : filteredTransactions.filter(
                      (i): i is SupplyPurchase => 'supply_purchase_id' in i,
                  );

        const totalAmount = dataToExport.reduce(
            (sum, item) =>
                sum + ('amount' in item ? item.amount : item.total_amount),
            0,
        );

        const title =
            activeTab === 'payments'
                ? 'Payment History Report'
                : 'Supply Purchases Report';

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`Gearhead - ${title}`, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Generated on: ${new Date().toLocaleDateString('en-PH')}`,
            14,
            28,
        );
        doc.text(`Period: ${startDate} to ${endDate}`, 14, 34);

        const tableData = dataToExport.map((item) => {
            const isTx = 'payment_id' in item;
            const amount = isTx ? item.amount : item.total_amount;
            return [
                isTx
                    ? item.date.split(' ')[0]
                    : item.purchase_date.split(' ')[0],
                isTx ? item.customer : item.supplier_name,
                isTx ? item.services : item.supplies,
                amount.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
                isTx ? item.payment_method : item.purchase_reference || 'N/A',
                item.status.charAt(0).toUpperCase() +
                    item.status.slice(1).replace('_', ' '),
            ];
        });

        tableData.push([
            '',
            '',
            'TOTAL',
            totalAmount.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
            '',
            `${dataToExport.length} record${dataToExport.length !== 1 ? 's' : ''}`,
        ]);

        autoTable(doc, {
            head: [
                [
                    'Date',
                    activeTab === 'payments' ? 'Customer' : 'Supplier',
                    activeTab === 'payments' ? 'Services' : 'Supplies',
                    'Amount',
                    activeTab === 'payments' ? 'Payment Method' : 'Reference',
                    'Status',
                ],
            ],
            body: tableData,
            startY: 40,
            theme: 'striped',
            headStyles: {
                fillColor: [255, 226, 38],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
            },
            bodyStyles: { fontSize: 10 },
            footStyles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 35 },
                2: { cellWidth: 45 },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 30, halign: 'center' },
                5: { cellWidth: 30, halign: 'center' },
            },
            margin: { top: 40, left: 14, right: 14 },
            didDrawPage: (data) => {
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(
                    `Page ${data.pageNumber}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    {
                        align: 'center',
                    },
                );
            },
        });

        doc.save(
            `${activeTab === 'payments' ? 'payments' : 'expenses'}-report-${
                new Date().toISOString().split('T')[0]
            }.pdf`,
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-background p-4">
                {/* Header + Date Picker */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Transactions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track financial records and payments
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-[140px]"
                        />
                        <span className="text-sm text-muted-foreground">
                            to
                        </span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-[140px]"
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Revenue / Expenses - Dynamic based on active tab */}
                    <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-foreground">
                                {activeTab === 'payments'
                                    ? 'Total Revenue'
                                    : 'Total Expenses'}
                            </h4>
                            <PhilippinePeso className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {isLoading ? (
                            <div className="flex flex-1 items-center justify-center">
                                <div className="h-12 w-40 animate-pulse rounded-full bg-muted" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-green-100 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/20">
                                    {formatMoney(
                                        activeTab === 'payments'
                                            ? financialData.total_revenue
                                            : supplyPurchases.reduce(
                                                  (sum, purchase) =>
                                                      sum +
                                                      purchase.total_amount,
                                                  0,
                                              ),
                                    )}
                                </span>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            {formatDateRange(startDate, endDate)}
                        </p>
                    </div>

                    {/* Total Transactions - Dynamic based on active tab and date range */}
                    <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-foreground">
                                Total Transactions
                            </h4>
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {isLoading ? (
                            <div className="flex flex-1 items-center justify-center">
                                <div className="h-12 w-28 animate-pulse rounded-full bg-muted" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-yellow-100 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-yellow-200 dark:bg-yellow-900/20">
                                    {activeTab === 'payments'
                                        ? completedTransactions.length
                                        : supplyPurchases.length}
                                </span>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            {formatDateRange(startDate, endDate)}
                        </p>
                    </div>

                    {/* Cash Payments */}
                    <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-foreground">
                                Cash Payments
                            </h4>
                            <PhilippinePeso className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {isLoading ? (
                            <div className="flex flex-1 items-center justify-center">
                                <div className="h-12 w-28 animate-pulse rounded-full bg-muted" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-blue-100 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-blue-200 dark:bg-blue-900/20">
                                    {
                                        completedTransactions.filter(
                                            (t) => t.payment_method === 'Cash',
                                        ).length
                                    }
                                </span>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            {formatDateRange(startDate, endDate)}
                        </p>
                    </div>

                    {/* GCash Payments */}
                    <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-foreground">
                                GCash Payments
                            </h4>
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {isLoading ? (
                            <div className="flex flex-1 items-center justify-center">
                                <div className="h-12 w-28 animate-pulse rounded-full bg-muted" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-purple-100 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-purple-300 dark:bg-purple-900/20">
                                    {
                                        completedTransactions.filter(
                                            (t) => t.payment_method === 'Gcash',
                                        ).length
                                    }
                                </span>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            {formatDateRange(startDate, endDate)}
                        </p>
                    </div>
                </div>

                {/* Transactions Table */}
                <Card className="border border-sidebar-border/70 bg-background text-foreground">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b border-border/50 p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-lg font-semibold text-foreground">
                                            {activeTab === 'payments'
                                                ? 'Payment History'
                                                : 'Supply Purchases'}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Total:{' '}
                                            <span className="font-semibold">
                                                {
                                                    filteredTransactions.filter(
                                                        (item) =>
                                                            activeTab ===
                                                            'payments'
                                                                ? 'payment_id' in
                                                                  item
                                                                : 'supply_purchase_id' in
                                                                  item,
                                                    ).length
                                                }
                                            </span>{' '}
                                            {activeTab === 'payments'
                                                ? 'payments'
                                                : 'purchases'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={
                                                activeTab === 'payments'
                                                    ? 'highlight'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                setActiveTab('payments')
                                            }
                                            className="gap-2"
                                        >
                                            Payments
                                        </Button>
                                        <Button
                                            variant={
                                                activeTab === 'expenses'
                                                    ? 'highlight'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                setActiveTab('expenses')
                                            }
                                            className="gap-2"
                                        >
                                            Expenses
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="h-9 pl-9 sm:w-40"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleExport}
                                        variant="highlight"
                                        className="gap-2 whitespace-nowrap"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export PDF
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop: Scrollable Table */}
                        <div className="hidden lg:block">
                            <div className="custom-scrollbar max-h-[65vh] overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                        <TableRow className="border-b border-border/50">
                                            <TableHead className="font-semibold">
                                                Date
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                {activeTab === 'payments'
                                                    ? 'Customer'
                                                    : 'Supplier'}
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                {activeTab === 'payments'
                                                    ? 'Services'
                                                    : 'Supplies'}
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Amount
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                {activeTab === 'payments'
                                                    ? 'Payment Method'
                                                    : 'Reference'}
                                            </TableHead>
                                            <TableHead className="text-center font-semibold">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions
                                            .filter((item) =>
                                                activeTab === 'payments'
                                                    ? 'payment_id' in item
                                                    : 'supply_purchase_id' in
                                                      item,
                                            )
                                            .sort((a, b) => {
                                                const idA =
                                                    'payment_id' in a
                                                        ? a.payment_id
                                                        : a.supply_purchase_id;
                                                const idB =
                                                    'payment_id' in b
                                                        ? b.payment_id
                                                        : b.supply_purchase_id;
                                                return idB - idA;
                                            })
                                            .map((item) => (
                                                <TransactionRow
                                                    key={
                                                        'payment_id' in item
                                                            ? item.payment_id
                                                            : item.supply_purchase_id
                                                    }
                                                    item={item}
                                                />
                                            ))}

                                        {filteredTransactions.filter((item) =>
                                            activeTab === 'payments'
                                                ? 'payment_id' in item
                                                : 'supply_purchase_id' in item,
                                        ).length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="py-32 text-center"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="h-8 w-8 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">
                                                            No{' '}
                                                            {activeTab ===
                                                            'payments'
                                                                ? 'payment'
                                                                : 'expense'}{' '}
                                                            records found
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Mobile: Responsive Cards */}
                        <div className="block space-y-4 p-4 lg:hidden">
                            {filteredTransactions
                                .filter((item) =>
                                    activeTab === 'payments'
                                        ? 'payment_id' in item
                                        : 'supply_purchase_id' in item,
                                )
                                .sort((a, b) => {
                                    const idA =
                                        'payment_id' in a
                                            ? a.payment_id
                                            : a.supply_purchase_id;
                                    const idB =
                                        'payment_id' in b
                                            ? b.payment_id
                                            : b.supply_purchase_id;
                                    return idB - idA;
                                })
                                .map((item) => {
                                    const isTransaction = 'payment_id' in item;
                                    const isIncome = isTransaction;
                                    const amount = isTransaction
                                        ? item.amount
                                        : item.total_amount;
                                    const dateStr = isTransaction
                                        ? item.date.split(' ')[0]
                                        : item.purchase_date.split(' ')[0];

                                    return (
                                        <div
                                            key={
                                                isTransaction
                                                    ? item.payment_id
                                                    : item.supply_purchase_id
                                            }
                                            className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {isTransaction
                                                            ? item.customer
                                                            : item.supplier_name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {dateStr}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p
                                                        className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}
                                                    >
                                                        {isIncome ? '+' : '-'}
                                                        {formatMoney(amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border-t border-border/40 pt-4 text-sm">
                                                <p className="mb-2 text-muted-foreground">
                                                    {isTransaction
                                                        ? 'Services'
                                                        : 'Supplies'}
                                                </p>
                                                <p className="mb-3 text-foreground">
                                                    {isTransaction
                                                        ? item.services
                                                        : item.supplies}
                                                </p>
                                            </div>

                                            <div className="border-t border-border/40 pt-4 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-muted-foreground">
                                                            {isTransaction
                                                                ? 'Payment Method'
                                                                : 'Reference'}
                                                        </p>
                                                        <p className="font-medium text-foreground">
                                                            {isTransaction
                                                                ? item.payment_method
                                                                : item.purchase_reference ||
                                                                  'N/A'}
                                                        </p>
                                                        {isTransaction &&
                                                            item.gcash_reference && (
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Ref:{' '}
                                                                    {
                                                                        item.gcash_reference
                                                                    }
                                                                </p>
                                                            )}
                                                        {isTransaction &&
                                                            item.gcash_screenshot && (
                                                                <button
                                                                    onClick={() =>
                                                                        window.open(
                                                                            `/${item.gcash_screenshot}`,
                                                                            '_blank',
                                                                        )
                                                                    }
                                                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    📷{' '}
                                                                    {item.gcash_screenshot
                                                                        .split(
                                                                            '/',
                                                                        )
                                                                        .pop()}
                                                                </button>
                                                            )}
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            item.status ===
                                                            'completed'
                                                                ? 'success'
                                                                : item.status ===
                                                                    'pending'
                                                                  ? 'warning'
                                                                  : item.status ===
                                                                      'in_progress'
                                                                    ? 'info'
                                                                    : 'destructive'
                                                        }
                                                    >
                                                        {item.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            item.status
                                                                .slice(1)
                                                                .replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            {filteredTransactions.filter((item) =>
                                activeTab === 'payments'
                                    ? 'payment_id' in item
                                    : 'supply_purchase_id' in item,
                            ).length === 0 && (
                                <div className="py-16 text-center text-muted-foreground">
                                    No{' '}
                                    {activeTab === 'payments'
                                        ? 'payment'
                                        : 'expense'}{' '}
                                    records found
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
