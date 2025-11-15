import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
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
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

// Sample Area Chart data
const areaChartData = [
    { date: '2025-08-01', revenue: 12000, profit: 8000 },
    { date: '2025-08-13', revenue: 15000, profit: 9500 },
    { date: '2025-08-25', revenue: 18000, profit: 11000 },
    { date: '2025-09-06', revenue: 14000, profit: 8500 },
    { date: '2025-09-18', revenue: 22000, profit: 14000 },
    { date: '2025-09-30', revenue: 19000, profit: 12000 },
    { date: '2025-10-12', revenue: 16000, profit: 10000 },
    { date: '2025-10-24', revenue: 25000, profit: 16000 },
];

// Area chart config
const areaChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-1)' },
    profit: { label: 'Profit', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export default function Dashboard() {
    const page = usePage();
    const role = (page.props as { auth?: { user?: { role?: string } } })?.auth
        ?.user?.role;

    // Payments summary
    const [paymentsSummary, setPaymentsSummary] = useState({
        total_amount: 0,
        total_payments: 0,
    });

    // Popular service
    const [popularService, setPopularService] = useState('N/A');

    // Top-selling services for donut chart
    const [topServices, setTopServices] = useState<
        { service: string; value: number }[]
    >([]);

    // Active staff count
    const [activeStaffCount, setActiveStaffCount] = useState(0);

    // Global date ranges (Single set for all dashboard data)
    const [startDate, setStartDate] = useState('2025-11-01'); // Recent default
    const [endDate, setEndDate] = useState('2025-11-16'); // Today

    // Fetch payments summary (Uses global dates)
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get('/payments/summary', {
                    params: {
                        start_date: startDate,
                        end_date: endDate,
                    },
                })
                .then((res) => setPaymentsSummary(res.data))
                .catch((err) => console.error(err));
        }
    }, [startDate, endDate, role]);

    // Fetch active staff (No dates needed)
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get(route('admin.staffs.active-count'))
                .then((res) => setActiveStaffCount(res.data.active_employees))
                .catch((err) => console.error(err));
        }
    }, [role]);

    // Fetch popular service (Updated: Uses global dates)
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get(route('admin.services.popular'), {
                    params: {
                        start_date: startDate,
                        end_date: endDate,
                    },
                })
                .then((res) =>
                    setPopularService(res.data.service_name || 'N/A'),
                )
                .catch((err) => console.error(err));
        }
    }, [role, startDate, endDate]);

    // Fetch top-selling services (Uses global dates)
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get(route('admin.services.top-selling'), {
                    params: {
                        start_date: startDate,
                        end_date: endDate,
                    },
                })
                .then((res) => {
                    console.log('API Response for Top Services:', res.data); // Debug
                    // Map backend response to expected shape
                    const mappedData = res.data.map(
                        (item: {
                            service_name: string;
                            total_bookings: number;
                        }) => ({
                            service: item.service_name,
                            value: item.total_bookings || 0, // Guard against null/undefined
                        }),
                    );
                    console.log('Mapped Data for Chart:', mappedData); // Debug
                    setTopServices(mappedData);
                })
                .catch((err) => {
                    console.error('Error fetching top services:', err); // Better error logging
                });
        }
    }, [role, startDate, endDate]);

    // Filtered area data (Uses global dates)
    const filteredAreaData = areaChartData.filter(
        (d) =>
            new Date(d.date) >= new Date(startDate) &&
            new Date(d.date) <= new Date(endDate),
    );

    // Donut chart data
    const totalServices = topServices.length || 1; // Guard against /0 in color calc
    const filteredDonutData = topServices.map((s, index) => ({
        service: s.service,
        value: s.value, // Raw count (bookings) - Recharts handles proportions
        fill: `hsl(${(index * 360) / totalServices}deg, 70%, 50%)`, // Consistent colors
    }));

    const CustomLegend = (props: any) => (
        <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-foreground">
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
                        {/* Global Date Range Inputs */}
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

                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        {/* Month Revenue Card */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    This Month's Revenue
                                </h4>
                                <PhilippinePeso />
                            </div>
                            <div className="text-center">
                                <span className="mx-auto inline-block w-fit rounded-full bg-green-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/20">
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

                        {/* Total Bookings Card */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Total Bookings
                                </h4>
                                <CalendarDays />
                            </div>
                            <div className="text-center">
                                <span className="mx-auto inline-block w-fit rounded-full bg-yellow-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-yellow-200 dark:bg-yellow-900/20">
                                    {paymentsSummary.total_payments}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This Month
                            </p>
                        </div>

                        {/* Active Staff Card */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Active Staff
                                </h4>
                                <Users />
                            </div>
                            <div className="text-center">
                                <span className="mx-auto inline-block w-fit rounded-full bg-green-200 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/40">
                                    {activeStaffCount}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                On duty today
                            </p>
                        </div>

                        {/* Popular Service Card */}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Popular Service
                                </h4>
                                <Zap />
                            </div>
                            <div className="text-center">
                                <span className="mx-auto inline-block w-fit rounded-full bg-blue-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-blue-300 dark:bg-blue-900/20">
                                    {popularService}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Customers Favorite
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Revenue Area Chart (No local dates; uses global) */}
                        <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <HeadingSmall
                                title="Revenue Trend"
                                description="Business performance tracking"
                            />
                            <ChartContainer
                                config={areaChartConfig}
                                className="h-[300px] w-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={filteredAreaData}>
                                        <defs>
                                            <linearGradient
                                                id="revenue"
                                                x1="0"
                                                x2="0"
                                                y1="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={
                                                        areaChartConfig.revenue
                                                            .color
                                                    }
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={
                                                        areaChartConfig.revenue
                                                            .color
                                                    }
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="profit"
                                                x1="0"
                                                x2="0"
                                                y1="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={
                                                        areaChartConfig.profit
                                                            .color
                                                    }
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={
                                                        areaChartConfig.profit
                                                            .color
                                                    }
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) =>
                                                new Date(
                                                    value,
                                                ).toLocaleDateString('en', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
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
                                            type="monotone"
                                            stroke={
                                                areaChartConfig.revenue.color
                                            }
                                            fill="url(#revenue)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            dataKey="profit"
                                            type="monotone"
                                            stroke={
                                                areaChartConfig.profit.color
                                            }
                                            fill="url(#profit)"
                                            strokeWidth={2}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                            formatter={(value) => [
                                                `₱${value.toLocaleString()}`,
                                                '',
                                            ]}
                                        />
                                        <Legend content={CustomLegend} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>

                        {/* Top-Selling Donut Chart (No local dates; uses global) */}
                        <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <HeadingSmall
                                title="Service Distribution"
                                description="Popular services breakdown"
                            />
                            <ChartContainer
                                config={{}} // optional, not strictly required
                                className="h-[300px] w-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={filteredDonutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            dataKey="value" // Uses raw count for proportions
                                            nameKey="service"
                                            label={false}
                                        >
                                            {filteredDonutData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.fill}
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        {/* Fallback text if no data */}
                                        {filteredDonutData.length === 0 && (
                                            <text
                                                x="50%"
                                                y="50%"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-muted-foreground text-sm"
                                                style={{ fontSize: 14 }}
                                            >
                                                No data for this period
                                            </text>
                                        )}
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                            formatter={(value) => [
                                                `${value} bookings`, // Shows raw count on hover
                                                'Total Bookings',
                                            ]}
                                        />
                                        <Legend content={CustomLegend} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </div>

                    {/* Upcoming Appointments Table */}
                    <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <Heading
                            title="Upcoming Appointments"
                            description="Today's scheduled services"
                        />
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            John Doe
                                        </TableCell>
                                        <TableCell>Basic Wash</TableCell>
                                        <TableCell>2:30 PM</TableCell>
                                        <TableCell>
                                            <Badge variant="success">
                                                Completed
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Jane Smith
                                        </TableCell>
                                        <TableCell>Premium Wash</TableCell>
                                        <TableCell>3:15 PM</TableCell>
                                        <TableCell>
                                            <Badge variant="warning">
                                                Pending
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Mike Johnson
                                        </TableCell>
                                        <TableCell>Waxing</TableCell>
                                        <TableCell>4:00 PM</TableCell>
                                        <TableCell>
                                            <Badge variant="info">
                                                Scheduled
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Sarah Lee
                                        </TableCell>
                                        <TableCell>Detailing</TableCell>
                                        <TableCell>5:45 PM</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">
                                                Cancelled
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
