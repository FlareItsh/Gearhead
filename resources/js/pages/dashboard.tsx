import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import CustomerDashboard from '@/pages/Customer/CustomerDashboard';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CalendarDays, PhilippinePeso, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

const areaChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-1)' },
    expenses: { label: 'Expenses', color: 'var(--chart-3)' },
    profit: { label: 'Profit', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const barChartConfig: ChartConfig = {
    bookings: { label: 'Bookings', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

interface PendingOrder {
    service_order_id: number;
    customer_name: string;
    service_name: string;
    time: string;
    status: string;
}

export default function Dashboard() {
    const page = usePage();
    const role = (page.props as { auth?: { user?: { role?: string } } })?.auth
        ?.user?.role;

    // Data states
    const [paymentsSummary, setPaymentsSummary] = useState({
        total_amount: 0,
        total_payments: 0,
    });
    const [popularService, setPopularService] = useState('N/A');
    const [topServices, setTopServices] = useState<
        { service: string; value: number }[]
    >([]);
    const [activeStaffCount, setActiveStaffCount] = useState(0);
    const [areaChartData, setAreaChartData] = useState<any[]>([]);
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

    // Date range (dynamic month-to-date)
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Loading state for cards only
    const [isLoading, setIsLoading] = useState(true);

    // Set dynamic dates (Philippine local time)
    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        const firstDay = new Date(year, month, 1);
        const todayLocal = new Date(year, month, day);

        const formatLocal = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        setStartDate(formatLocal(firstDay)); // e.g., 2025-11-01
        setEndDate(formatLocal(todayLocal)); // e.g., 2025-11-21
    }, []);

    // Fetch data + polling + skeleton control
    useEffect(() => {
        const fetchData = () => {
            if (role !== 'customer' && startDate && endDate) {
                // Turn off skeleton after first batch
                Promise.allSettled([
                    axios.get('/payments/summary', {
                        params: { start_date: startDate, end_date: endDate },
                    }),
                    axios.get(route('admin.staffs.active-count')),
                    axios.get(route('admin.services.top-selling'), {
                        params: { start_date: startDate, end_date: endDate },
                    }),
                ]).finally(() => setIsLoading(false));

                // Individual updates
                axios
                    .get('/payments/summary', {
                        params: { start_date: startDate, end_date: endDate },
                    })
                    .then((res) => setPaymentsSummary(res.data));

                axios
                    .get(route('admin.staffs.active-count'))
                    .then((res) =>
                        setActiveStaffCount(res.data.active_employees),
                    );

                axios
                    .get(route('admin.services.top-selling'), {
                        params: { start_date: startDate, end_date: endDate },
                    })
                    .then((res) => {
                        const mappedData = res.data.map((item: any) => ({
                            service: item.service_name,
                            value: item.total_bookings || 0,
                        }));
                        setTopServices(mappedData);
                        setPopularService(mappedData[0]?.service || 'N/A');
                    });

                axios
                    .get(route('admin.supply-purchases.financial-summary'), {
                        params: { start_date: startDate, end_date: endDate },
                    })
                    .then((res) => setAreaChartData(res.data))
                    .catch(() => setAreaChartData([]));

                axios
                    .get(route('api.service-orders.pending'))
                    .then((res) => setPendingOrders(res.data))
                    .catch((err) =>
                        console.error('Pending orders error:', err),
                    );
            }
        };

        if (startDate && endDate) {
            fetchData();
            const interval = setInterval(fetchData, 10000);
            return () => clearInterval(interval);
        }
    }, [startDate, endDate, role]);

    const barChartData = topServices.map((s, index) => ({
        service: s.service,
        value: s.value,
        fill: `var(--chart-${(index % 5) + 1})`,
    }));

    const AreaLegend = (props: any) => (
        <div className="flex flex-wrap justify-center gap-4 text-sm text-foreground">
            {props.payload?.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.value}</span>
                </div>
            ))}
        </div>
    );

    const renderServiceBullets = (serviceNames: string) => {
        if (!serviceNames)
            return <span className="text-muted-foreground">No service</span>;
        const services = serviceNames.split(', ').filter(Boolean);
        return (
            <ul className="list-inside list-disc space-y-1 text-sm">
                {services.map((s, i) => (
                    <li key={i}>{s}</li>
                ))}
            </ul>
        );
    };

    const formatTime = (time: string) => {
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${m} ${ampm}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {role === 'customer' ? (
                <CustomerDashboard />
            ) : (
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header + Date Picker */}
                    <div className="flex items-center justify-between">
                        <Heading
                            title="Dashboard"
                            description="Welcome Back! Here's your business overview."
                        />
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

                    {/* Metric Cards with Skeleton */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Revenue */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    This Month's Revenue
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
                                        ₱
                                        {Number(
                                            paymentsSummary.total_amount,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Keep it up!
                            </p>
                        </div>

                        {/* Total Bookings */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Total Bookings
                                </h4>
                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {isLoading ? (
                                <div className="flex flex-1 items-center justify-center">
                                    <div className="h-12 w-28 animate-pulse rounded-full bg-muted" />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className="inline-block rounded-full bg-yellow-100 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-yellow-200 dark:bg-yellow-900/20">
                                        {paymentsSummary.total_payments}
                                    </span>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                                This Month
                            </p>
                        </div>

                        {/* Active Staff */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Active Staff
                                </h4>
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {isLoading ? (
                                <div className="flex flex-1 items-center justify-center">
                                    <div className="h-12 w-24 animate-pulse rounded-full bg-muted" />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className="inline-block rounded-full bg-green-200 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/40">
                                        {activeStaffCount}
                                    </span>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                                On duty today
                            </p>
                        </div>

                        {/* Popular Service */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Popular Service
                                </h4>
                                <Zap className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {isLoading ? (
                                <div className="flex flex-1 items-center justify-center px-4">
                                    <div className="h-10 w-48 animate-pulse rounded-full bg-muted" />
                                </div>
                            ) : (
                                <div className="flex flex-1 items-center justify-center px-4">
                                    <span className="inline-block max-w-full rounded-full bg-blue-100 px-6 py-3 text-center text-2xl leading-tight font-bold break-words text-foreground transition-colors group-hover:bg-blue-300 dark:bg-blue-900/20">
                                        {popularService || 'N/A'}
                                    </span>
                                </div>
                            )}
                            <p className="text-center text-sm text-muted-foreground">
                                Customers Favorite
                            </p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Area Chart */}
                        <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <HeadingSmall
                                title="Financial Trend"
                                description="Revenue, expenses, and profit over time"
                            />
                            <ChartContainer
                                config={areaChartConfig}
                                className="h-[300px] w-full"
                            >
                                <AreaChart data={areaChartData}>
                                    <defs>
                                        {['revenue', 'expenses', 'profit'].map(
                                            (key) => (
                                                <linearGradient
                                                    key={key}
                                                    id={key}
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor={
                                                            areaChartConfig[key]
                                                                .color
                                                        }
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor={
                                                            areaChartConfig[key]
                                                                .color
                                                        }
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            ),
                                        )}
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) =>
                                            new Date(value).toLocaleDateString(
                                                'en',
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                },
                                            )
                                        }
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            `₱${(value / 1000).toFixed(0)}k`
                                        }
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Area
                                        dataKey="revenue"
                                        type="natural"
                                        stroke={areaChartConfig.revenue.color}
                                        fill="url(#revenue)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        dataKey="expenses"
                                        type="natural"
                                        stroke={areaChartConfig.expenses.color}
                                        fill="url(#expenses)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        dataKey="profit"
                                        type="natural"
                                        stroke={areaChartConfig.profit.color}
                                        fill="url(#profit)"
                                        strokeWidth={2}
                                    />
                                    <Tooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Legend content={AreaLegend} />
                                </AreaChart>
                            </ChartContainer>
                            {areaChartData.length === 0 && (
                                <p className="mt-4 text-center text-sm text-muted-foreground">
                                    No financial data for this period
                                </p>
                            )}
                        </div>

                        {/* Bar Chart */}
                        <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <HeadingSmall
                                title="Service Distribution"
                                description="Top 4 services by bookings"
                            />
                            <ChartContainer
                                config={barChartConfig}
                                className="h-[300px] w-full"
                            >
                                <BarChart
                                    layout="vertical"
                                    data={barChartData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="service"
                                        type="category"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value) => [
                                            `${value}`,
                                            ' - Total Bookings',
                                        ]}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                        {barChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                            {barChartData.length === 0 && (
                                <p className="mt-4 text-center text-sm text-muted-foreground">
                                    No data for this period
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Appointments Table */}
                    <div className="space-y-4 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <Heading
                            title="Upcoming Appointments"
                            description="Today's scheduled services"
                        />
                        <div className="overflow-hidden rounded-lg border border-border shadow-sm">
                            <div className="max-h-[60vh] overflow-y-auto">
                                <table className="w-full table-fixed border-collapse">
                                    <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                                        <tr className="border-b border-border">
                                            <th className="w-[22%] px-6 py-4 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Customer
                                            </th>
                                            <th className="w-[38%] px-6 py-4 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Services
                                            </th>
                                            <th className="w-[20%] px-6 py-4 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Expected Time
                                            </th>
                                            <th className="w-[20%] px-6 py-4 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 bg-background">
                                        {pendingOrders.length > 0 ? (
                                            pendingOrders.map(
                                                (order, index) => (
                                                    <tr
                                                        key={`${order.service_order_id}-${index}`}
                                                        className="group transition-all duration-150 hover:bg-muted/50"
                                                    >
                                                        <td className="px-6 py-5 font-medium whitespace-nowrap text-foreground">
                                                            {
                                                                order.customer_name
                                                            }
                                                        </td>
                                                        <td className="px-6 py-5 text-sm text-foreground">
                                                            {renderServiceBullets(
                                                                order.service_name,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                                                {formatTime(
                                                                    order.time,
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <Badge
                                                                variant={
                                                                    order.status ===
                                                                    'pending'
                                                                        ? 'warning'
                                                                        : order.status ===
                                                                            'in_progress'
                                                                          ? 'default'
                                                                          : order.status ===
                                                                              'completed'
                                                                            ? 'success'
                                                                            : 'secondary'
                                                                }
                                                                className="font-medium capitalize shadow-sm"
                                                            >
                                                                {order.status.replace(
                                                                    /_/g,
                                                                    ' ',
                                                                )}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-16 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                        <CalendarDays className="mb-3 h-12 w-12 opacity-40" />
                                                        <p className="text-lg font-medium">
                                                            No appointments
                                                            today
                                                        </p>
                                                        <p className="text-sm">
                                                            Enjoy the quiet
                                                            moment!
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
            )}
        </AppLayout>
    );
}
