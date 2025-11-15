import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'; // For chart components
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
import { CalendarDays, PhilippinePeso, Users, Zap } from 'lucide-react';
import { useState } from 'react';
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
} from 'recharts'; // Recharts for rendering

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Sample daily data for Area Chart: Revenue and Profit for Aug-Oct 2025
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

// Sample services revenue data (aggregated for simplicity, but filterable by date range)
const servicesRevenueData = {
    'Basic Wash': 28500,
    'Undercarriage Wash': 12000,
    'Complete Package': 8000,
    'Engine Wash': 15000,
};

// Config for Area Chart colors and labels (using direct CSS vars for OKLCH compatibility)
const areaChartConfig: ChartConfig = {
    revenue: {
        label: 'Revenue',
        color: 'var(--chart-1)',
    },
    profit: {
        label: 'Profit',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

// Config for Donut Chart colors (using direct CSS vars for OKLCH compatibility)
const donutChartConfig = {
    'Basic Wash': { label: 'Basic Wash', color: 'var(--chart-1)' },
    'Undercarriage Wash': {
        label: 'Undercarriage Wash',
        color: 'var(--chart-2)',
    },
    'Complete Package': { label: 'Complete Package', color: 'var(--chart-3)' },
    'Engine Wash': { label: 'Engine Wash', color: 'var(--chart-4)' },
} satisfies ChartConfig;

// Custom Legend component for consistent text-foreground styling
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

export default function Dashboard() {
    const page = usePage();
    const role = (page.props as { auth?: { user?: { role?: string } } })?.auth
        ?.user?.role;

    // State for Area Chart date range
    const [startAreaDate, setStartAreaDate] = useState('2025-08-01');
    const [endAreaDate, setEndAreaDate] = useState('2025-10-24');
    const filteredAreaData = areaChartData.filter(
        (d) =>
            new Date(d.date) >= new Date(startAreaDate) &&
            new Date(d.date) <= new Date(endAreaDate),
    );

    // State for Donut Chart date range (simplified aggregation for demo)
    const [startDonutDate, setStartDonutDate] = useState('2025-08-01');
    const [endDonutDate, setEndDonutDate] = useState('2025-10-24');
    const totalRevenue = Object.values(servicesRevenueData).reduce(
        (a, b) => a + b,
        0,
    );
    const filteredDonutData = Object.entries(servicesRevenueData).map(
        ([service, value]) => ({
            service,
            value: (value / totalRevenue) * 100,
            fill: donutChartConfig[service as keyof typeof donutChartConfig]
                .color,
        }),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {role === 'customer' ? (
                <CustomerDashboard />
            ) : (
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <Heading
                        title="Dashboard"
                        description="Welcome Back! Here's your business overview."
                    />
                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        {/** Month Revenue Card*/}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    This Months Revenue
                                </h4>
                                <PhilippinePeso />
                            </div>
                            <div className="text-center">
                                <span
                                    className="mx-auto inline-block w-fit rounded-full bg-green-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/20"
                                    data-test="payments-count"
                                >
                                    ₱15,000
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Keep it up!
                            </p>
                        </div>

                        {/** Total Bookings Card*/}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Total Bookings
                                </h4>
                                <CalendarDays />
                            </div>
                            <div className="text-center">
                                <span
                                    className="mx-auto inline-block w-fit rounded-full bg-yellow-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-yellow-200 dark:bg-yellow-900/20"
                                    data-test="payments-count"
                                >
                                    24
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This Month
                            </p>
                        </div>

                        {/** Active Staff Card*/}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Active Staff
                                </h4>
                                <Users />
                            </div>
                            <div className="text-center">
                                <span
                                    className="mx-auto inline-block w-fit rounded-full bg-green-200 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-green-300 dark:bg-green-900/40"
                                    data-test="payments-count"
                                >
                                    8
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                On duty today
                            </p>
                        </div>

                        {/** Popular Service Card*/}
                        <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-foreground">
                                    Popular Service
                                </h4>
                                <Zap />
                            </div>
                            <div className="text-center">
                                <span
                                    className="mx-auto inline-block w-fit rounded-full bg-blue-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-blue-300 dark:bg-blue-900/20"
                                    data-test="payments-count"
                                >
                                    Basic Wash
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Customers Favorite
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <div className="flex items-center justify-between">
                                <HeadingSmall
                                    title="Revenue Trend"
                                    description="Business performance tracking"
                                />
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={startAreaDate}
                                        onChange={(e) =>
                                            setStartAreaDate(e.target.value)
                                        }
                                        className="w-[140px]"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        to
                                    </span>
                                    <Input
                                        type="date"
                                        value={endAreaDate}
                                        onChange={(e) =>
                                            setEndAreaDate(e.target.value)
                                        }
                                        className="w-[140px]"
                                    />
                                </div>
                            </div>
                            <a href="/reports">
                                <ChartContainer
                                    config={areaChartConfig}
                                    className="h-[300px] w-full"
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart
                                            data={filteredAreaData}
                                            margin={{
                                                top: 10,
                                                right: 30,
                                                left: 0,
                                                bottom: 0,
                                            }}
                                        >
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
                                                            areaChartConfig
                                                                .revenue.color
                                                        }
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor={
                                                            areaChartConfig
                                                                .revenue.color
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
                                                            areaChartConfig
                                                                .profit.color
                                                        }
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor={
                                                            areaChartConfig
                                                                .profit.color
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
                                                    areaChartConfig.revenue
                                                        .color
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
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                                formatter={(value) => [
                                                    `₱${value.toLocaleString()}`,
                                                    '',
                                                ]}
                                            />
                                            <Legend content={CustomLegend} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </a>
                        </div>

                        <div className="space-y-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <div className="flex items-center justify-between">
                                <HeadingSmall
                                    title="Service Distribution"
                                    description="Popular services breakdown"
                                />
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={startDonutDate}
                                        onChange={(e) =>
                                            setStartDonutDate(e.target.value)
                                        }
                                        className="w-[140px]"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        to
                                    </span>
                                    <Input
                                        type="date"
                                        value={endDonutDate}
                                        onChange={(e) =>
                                            setEndDonutDate(e.target.value)
                                        }
                                        className="w-[140px]"
                                    />
                                </div>
                            </div>
                            <a href="/reports">
                                <ChartContainer
                                    config={donutChartConfig}
                                    className="h-[300px] w-full"
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={filteredDonutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                dataKey="value"
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
                                            <text
                                                x="50%"
                                                y="50%"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                style={{
                                                    fill: 'var(--foreground)',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.125rem',
                                                }}
                                            >
                                                ₱{totalRevenue.toLocaleString()}
                                            </text>
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                                formatter={(value) => [
                                                    `${value.toFixed(0)}%`,
                                                    '',
                                                ]}
                                            />
                                            <Legend content={CustomLegend} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </a>
                        </div>
                    </div>
                    {/* New Table Section */}
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
