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
import { cn } from '@/lib/utils';
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

                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
                                Search Customers
                            </h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                    {filter}
                                    <ChevronDownIcon className="ml-2 h-4 w-4 text-neutral-500" />
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
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <Input
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full border-neutral-300 bg-white pl-10 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="p-4">
                        <div className="mb-4 flex flex-col gap-1">
                            <h2 className="font-semibold text-neutral-800 dark:text-white">
                                Customer List
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Total Customers: {filteredCustomers.length}
                            </p>
                        </div>

                        {filteredCustomers.length === 0 ? (
                            <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                                <p>
                                    {loading
                                        ? 'Loading customers...'
                                        : 'No customers matched your search or filter.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Bookings</TableHead>
                                            <TableHead>
                                                Loyalty Points
                                            </TableHead>
                                            <TableHead>Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomers.map((c, index) => (
                                            <TableRow
                                                key={c.user_id}
                                                className={cn(
                                                    index % 2 === 0
                                                        ? 'bg-white dark:bg-neutral-900'
                                                        : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                                                    'text-neutral-900 dark:text-white',
                                                )}
                                            >
                                                <TableCell>{`${c.first_name} ${c.middle_name ? c.middle_name + ' ' : ''}${c.last_name}`}</TableCell>
                                                <TableCell>
                                                    {c.phone_number}
                                                </TableCell>
                                                <TableCell>
                                                    {c.bookings}
                                                </TableCell>
                                                <TableCell className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-400" />
                                                    {c.loyaltyPoints % 9}
                                                </TableCell>
                                                <TableCell>{c.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
