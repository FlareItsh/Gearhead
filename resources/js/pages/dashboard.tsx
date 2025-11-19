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

    const [startDate, setStartDate] = useState('2025-11-01');
    const [endDate, setEndDate] = useState('2025-11-16');

    // Fetch all data (unchanged from your code)
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get('/payments/summary', {
                    params: { start_date: startDate, end_date: endDate },
                })
                .then((res) => setPaymentsSummary(res.data));

            axios
                .get(route('admin.staffs.active-count'))
                .then((res) => setActiveStaffCount(res.data.active_employees));

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

            // NEW: Fetch real pending orders
            axios
                .get(route('api.service-orders.pending'))
                .then((res) => setPendingOrders(res.data))
                .catch((err) => console.error('Pending orders error:', err));
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

    // Helper: Bullet points for services
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

    // Helper: 14:30:00 → 2:30 PM
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
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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

                    {/* Responsive Cards - Perfect text sizing on ALL screens */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Revenue */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    This Month's Revenue
                                </h4>
                                <PhilippinePeso className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-green-100 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/20">
                                    ₱
                                    {Number(
                                        paymentsSummary.total_amount,
                                    ).toLocaleString()}
                                </span>
                            </div>
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
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-yellow-100 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-yellow-200 dark:bg-yellow-900/20">
                                    {paymentsSummary.total_payments}
                                </span>
                            </div>
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
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-green-200 px-6 py-3 text-3xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/40">
                                    {activeStaffCount}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                On duty today
                            </p>
                        </div>

                        {/* Popular Service - Auto-handles long names + perfect sizing */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Popular Service
                                </h4>
                                <Zap className="h-5 w-5" />
                            </div>
                            <div className="flex flex-1 items-center justify-center px-4">
                                <span className="inline-block max-w-full rounded-full bg-blue-100 px-6 py-3 text-center text-3xl leading-tight font-bold break-words transition-colors group-hover:bg-blue-300 dark:bg-blue-900/20">
                                    {popularService || 'N/A'}
                                </span>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                Customers Favorite
                            </p>
                        </div>
                    </div>

                    {/* Charts - 100% your original */}
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

                    {/* Upcoming Appointments - Pure Divs + Fixed Header + Scrollable Body */}
                    <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <Heading
                            title="Upcoming Appointments"
                            description="Today's scheduled services"
                        />

                        {/* Fixed 60vh Container */}
                        <div className="flex h-[60vh] flex-col overflow-hidden rounded-md border bg-background">
                            {/* === FIXED HEADER === */}
                            <div className="flex border-b bg-muted/50 text-sm font-bold tracking-wider uppercase">
                                <div className="min-w-[140px] flex-1 px-4 py-3">
                                    Customer
                                </div>
                                <div className="min-w-[220px] flex-1 px-4 py-3">
                                    Services
                                </div>
                                <div className="w-32 px-4 py-3 text-center">
                                    Expected Time
                                </div>
                                <div className="w-32 px-4 py-3 text-center">
                                    Status
                                </div>
                            </div>

                            {/* === SCROLLABLE BODY === */}
                            <div className="flex-1 overflow-y-auto">
                                {pendingOrders.length > 0 ? (
                                    pendingOrders.map((order, index) => (
                                        <div
                                            key={`${order.service_order_id}-${index}`}
                                            className="flex border-b transition-colors hover:bg-muted/30"
                                        >
                                            {/* Customer */}
                                            <div className="min-w-[140px] flex-1 px-4 py-4 font-medium">
                                                {order.customer_name}
                                            </div>

                                            {/* Services - Bullet Points */}
                                            <div className="min-w-[220px] flex-1 px-4 py-4 text-sm">
                                                {renderServiceBullets(
                                                    order.service_name,
                                                )}
                                            </div>

                                            {/* Time */}
                                            <div className="w-32 px-4 py-4 text-center whitespace-nowrap">
                                                {formatTime(order.time)}
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex w-32 items-center justify-center px-4 py-4">
                                                <Badge variant="warning">
                                                    {order.status
                                                        .replace('_', ' ')
                                                        .replace(/^\w/, (c) =>
                                                            c.toUpperCase(),
                                                        )}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                                        No pending appointments today
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
