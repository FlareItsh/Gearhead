import Heading from '@/components/heading';
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
import { ChevronDownIcon, Search, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/customers' },
];

interface User {
    user_id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    phone_number: string;
    address?: string | null;
    role: string;
    bookings: number;
    loyaltyPoints: number;
}

export default function Customers() {
    const [customers, setCustomers] = useState<User[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [filter, setFilter] = useState<'All' | 'Name' | 'Email' | 'Phone'>(
        'All',
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const res = await axios.get(route('admin.customers.index'));
            setCustomers(res.data);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            const name =
                `${c.first_name} ${c.middle_name ? c.middle_name + ' ' : ''}${c.last_name}`.toLowerCase();
            const email = c.email.toLowerCase();
            const phone = c.phone_number.toLowerCase();
            const term = searchValue.toLowerCase();

            if (filter === 'All')
                return (
                    name.includes(term) ||
                    email.includes(term) ||
                    phone.includes(term)
                );
            if (filter === 'Name') return name.includes(term);
            if (filter === 'Email') return email.includes(term);
            if (filter === 'Phone') return phone.includes(term);

            return true;
        });
    }, [customers, searchValue, filter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-col gap-6 p-6">
                <Heading
                    title="Customers"
                    description="Manage customer records, bookings and loyalty points"
                />

                <Card className="border border-border/50 bg-background text-foreground">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold">
                                Search Customers
                            </h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                                    {filter}
                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40">
                                    {['All', 'Name', 'Email', 'Phone'].map(
                                        (f) => (
                                            <DropdownMenuItem
                                                key={f}
                                                onClick={() =>
                                                    setFilter(
                                                        f as typeof filter,
                                                    )
                                                }
                                            >
                                                {f}
                                            </DropdownMenuItem>
                                        ),
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="relative w-full">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full border-border bg-background pl-10 text-foreground"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 bg-background text-foreground">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b border-border/50 p-6">
                            <h2 className="text-lg font-semibold">
                                Customer List
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Total: {filteredCustomers.length} customers
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-highlight" />
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="py-32 text-center text-muted-foreground">
                                No customers found
                            </div>
                        ) : (
                            <>
                                {/* Desktop: Scrollable Table with Sticky Header */}
                                <div className="hidden lg:block">
                                    <div className="custom-scrollbar max-h-[65vh] overflow-y-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                                <TableRow className="border-b border-border/50">
                                                    <TableHead className="font-semibold">
                                                        Name
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Phone
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold">
                                                        Bookings
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold">
                                                        Loyalty Points
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Email
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredCustomers.map((c) => (
                                                    <TableRow
                                                        key={c.user_id}
                                                        className="border-b border-border/30 transition-colors hover:bg-muted/40"
                                                    >
                                                        <TableCell className="font-medium">
                                                            {c.first_name}{' '}
                                                            {c.middle_name &&
                                                                `${c.middle_name} `}
                                                            {c.last_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {c.phone_number}
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium">
                                                            {c.bookings}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-medium">
                                                                    {
                                                                        c.loyaltyPoints
                                                                    }
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {c.email}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Mobile: Scrollable Cards */}
                                <div className="block space-y-3 p-4 lg:hidden">
                                    {filteredCustomers.map((c) => (
                                        <div
                                            key={c.user_id}
                                            className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {c.first_name}{' '}
                                                        {c.middle_name &&
                                                            `${c.middle_name} `}
                                                        {c.last_name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {c.email}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 dark:bg-yellow-900/30">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-bold">
                                                        {c.loyaltyPoints}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Phone
                                                    </p>
                                                    <p className="font-medium">
                                                        {c.phone_number}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Bookings
                                                    </p>
                                                    <p className="text-center font-medium">
                                                        {c.bookings}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
