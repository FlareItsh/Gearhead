import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Check, ChevronDownIcon, Clock, Search, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Bookings', href: '/admin/bookings' },
];

interface Booking {
    service_order_id: number;
    customer_name: string;
    service_names: string;
    order_date: string;
    total_price: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export default function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [filter, setFilter] = useState<
        'All' | 'Customer' | 'Service' | 'Status' | 'Date'
    >('All');
    const [statusFilter, setStatusFilter] = useState<
        'All' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
    >('All');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Set dynamic dates (month-to-date)
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

        setStartDate(formatLocal(firstDay));
        setEndDate(formatLocal(todayLocal));
    }, []);

    // Fetch bookings with date range
    useEffect(() => {
        if (startDate && endDate) {
            const fetchBookings = () => {
                axios
                    .get('/service-orders/bookings', {
                        params: { start_date: startDate, end_date: endDate },
                    })
                    .then((res) => {
                        setBookings(res.data);
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.error('Error fetching bookings:', err);
                        setIsLoading(false);
                    });
            };

            fetchBookings();
            const interval = setInterval(fetchBookings, 10000);
            return () => clearInterval(interval);
        }
    }, [startDate, endDate]);

    const filteredBookings = useMemo(() => {
        const term = searchValue.toLowerCase();

        return bookings.filter((b) => {
            const matchesSearch =
                filter === 'All'
                    ? b.customer_name.toLowerCase().includes(term) ||
                      b.service_names.toLowerCase().includes(term) ||
                      b.status.toLowerCase().includes(term) ||
                      b.order_date.toLowerCase().includes(term)
                    : filter === 'Customer'
                      ? b.customer_name.toLowerCase().includes(term)
                      : filter === 'Service'
                        ? b.service_names.toLowerCase().includes(term)
                        : filter === 'Status'
                          ? b.status.toLowerCase().includes(term)
                          : filter === 'Date'
                            ? b.order_date.toLowerCase().includes(term)
                            : true;

            const matchesStatus =
                statusFilter === 'All' ? true : b.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchValue, filter, statusFilter]);

    const getStatusBadge = (status: Booking['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="warning">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="info">
                        <Check className="mr-1 h-3 w-3" />
                        In Progress
                    </Badge>
                );
            case 'completed':
                return <Badge variant="success">Completed</Badge>;
            case 'cancelled':
                return (
                    <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancelled
                    </Badge>
                );
        }
    };

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const renderServiceBullets = (serviceNames: string) => {
        if (!serviceNames)
            return <span className="text-muted-foreground">No service</span>;
        const services = serviceNames
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        return (
            <ul className="list-inside list-disc space-y-1 text-sm">
                {services.map((s, i) => (
                    <li key={i}>{s}</li>
                ))}
            </ul>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Bookings"
                        description="Manage and track customer bookings"
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

                <Card className="border border-border/50 bg-background text-foreground">
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold">Search</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                    {filter}
                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-40">
                                    {[
                                        'All',
                                        'Customer',
                                        'Service',
                                        'Status',
                                        'Date',
                                    ].map((f) => (
                                        <DropdownMenuItem
                                            key={f}
                                            onClick={() =>
                                                setFilter(f as typeof filter)
                                            }
                                        >
                                            {f}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="relative w-full">
                            <Search className="t absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search bookings..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex w-full rounded-2xl bg-secondary p-1">
                    {(
                        [
                            'All',
                            'pending',
                            'in_progress',
                            'completed',
                            'cancelled',
                        ] as const
                    ).map((s) => {
                        const isActive = statusFilter === s;
                        const displayLabel =
                            s === 'All'
                                ? 'All'
                                : s === 'in_progress'
                                  ? 'In Progress'
                                  : s.charAt(0).toUpperCase() + s.slice(1);

                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${isActive ? 'bg-highlight text-black shadow-sm' : 'text-foreground/70'}`}
                            >
                                {displayLabel}
                            </button>
                        );
                    })}
                </div>

                <Card className="border border-border/50 bg-background text-foreground">
                    <CardContent>
                        <div className="mb-4 flex flex-col gap-1">
                            <h2 className="font-semibold">Booking List</h2>
                            <p className="t text-sm">
                                Total Bookings: {filteredBookings.length}
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-highlight" />
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="py-12 text-center">
                                <p>No bookings found.</p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-border/50">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                                            <TableRow className="border-b border-border/50">
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Services</TableHead>
                                                <TableHead>
                                                    Date & Time
                                                </TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                    </Table>
                                </div>
                                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto">
                                    <Table>
                                        <TableBody>
                                            {filteredBookings.map((b) => (
                                                <TableRow
                                                    key={b.service_order_id}
                                                >
                                                    <TableCell>
                                                        {b.customer_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderServiceBullets(
                                                            b.service_names,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDateTime(
                                                            b.order_date,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        ₱
                                                        {Number(
                                                            b.total_price,
                                                        ).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(
                                                            b.status,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
