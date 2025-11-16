import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import {
    ChartConfig,
    ChartContainer,
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

// Area chart config
const areaChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-1)' },
    expenses: { label: 'Expenses', color: 'var(--chart-3)' },
    profit: { label: 'Profit', color: 'var(--chart-2)' },
} satisfies ChartConfig;

// Bar chart config
const barChartConfig: ChartConfig = {
    bookings: { label: 'Bookings', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

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
    const [areaChartData, setAreaChartData] = useState<
        { date: string; revenue: number; expenses: number; profit: number }[]
    >([]);

    const [startDate, setStartDate] = useState('2025-11-01');
    const [endDate, setEndDate] = useState('2025-11-16');

    // Fetch payments summary
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get('/payments/summary', {
                    params: { start_date: startDate, end_date: endDate },
                })
                .then((res) => setPaymentsSummary(res.data))
                .catch((err) => console.error(err));
        }
    }, [startDate, endDate, role]);

    // Fetch active staff
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get(route('admin.staffs.active-count'))
                .then((res) => setActiveStaffCount(res.data.active_employees))
                .catch((err) => console.error(err));
        }
    }, [role]);

    // Fetch top-selling services
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get(route('admin.services.top-selling'), {
                    params: { start_date: startDate, end_date: endDate },
                })
                .then((res) => {
                    const mappedData = res.data.map(
                        (item: {
                            service_name: string;
                            total_bookings: number;
                        }) => ({
                            service: item.service_name,
                            value: item.total_bookings || 0,
                        }),
                    );
                    setTopServices(mappedData);
                    // Update popular service to match top of array
                    setPopularService(mappedData[0]?.service || 'N/A');
                })
                .catch((err) =>
                    console.error('Error fetching top services:', err),
                );
        }
    }, [role, startDate, endDate]);

    // Fetch financial summary
    useEffect(() => {
        if (role !== 'customer') {
            axios
                .get(route('admin.supply-purchases.financial-summary'), {
                    params: { start_date: startDate, end_date: endDate },
                })
                .then((res) => setAreaChartData(res.data))
                .catch((err) => {
                    console.error(
                        'Error fetching financial data:',
                        err.response ? err.response.data : err.message,
                    );
                    setAreaChartData([]);
                });
        }
    }, [role, startDate, endDate]);

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

                    {/* Cards */}
                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        {/* Revenue Card */}
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

                        {/* Total Bookings */}
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

                        {/* Active Staff */}
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

                        {/* Popular Service */}
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
                                        type="monotone"
                                        stroke={areaChartConfig.revenue.color}
                                        fill="url(#revenue)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        dataKey="expenses"
                                        type="monotone"
                                        stroke={areaChartConfig.expenses.color}
                                        fill="url(#expenses)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        dataKey="profit"
                                        type="monotone"
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

                    {/* Appointments Table */}
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
