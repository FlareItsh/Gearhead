import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils'; //Kani sya sa table row

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/customers' },
];

interface Customer {
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    phone_number: string;
    address: string | null;
}

const mockCustomers: Customer[] = [
    { first_name: 'Customer', middle_name: null, last_name: 'One', email: 'customer@example.com', phone_number: '0908818444', address: null },
    { first_name: 'Flare', middle_name: 'A.', last_name: 'Itoshi', email: 'flare@gmail.com', phone_number: '09123456789', address: 'Davao City' },
    { first_name: 'Mariz', middle_name: 'S.', last_name: 'Adlaw', email: 'mariz.adlaw@example.com', phone_number: '09987654321', address: 'Tagum City' },
    { first_name: 'Carlo', middle_name: 'L.', last_name: 'Bilbacua', email: 'carlo@example.com', phone_number: '09088184444', address: 'Panabo City' },
];

export default function Customers() {
    const [customers] = useState<Customer[]>(mockCustomers);
    const [searchValue, setSearchValue] = useState('');
    const [filter, setFilter] = useState<'All' | 'Name' | 'Email' | 'Phone' | 'Address'>('All');

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            const fullName = `${c.first_name} ${c.middle_name ?? ''} ${c.last_name}`.toLowerCase();
            const email = c.email.toLowerCase();
            const phone = c.phone_number.toLowerCase();
            const address = (c.address ?? '').toLowerCase();
            const term = searchValue.toLowerCase();

            if (filter === 'All') return fullName.includes(term) || email.includes(term) || phone.includes(term) || address.includes(term);
            if (filter === 'Name') return fullName.includes(term);
            if (filter === 'Email') return email.includes(term);
            if (filter === 'Phone') return phone.includes(term);
            if (filter === 'Address') return address.includes(term);

            return true;
        });
    }, [customers, searchValue, filter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-col gap-6 p-6">
                <Heading title="Customers" description="Manage customer records and loyalty points" />
                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">Search Customers</h2>
                            <select
                                className="rounded-md border border-neutral-300 bg-white p-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as typeof filter)}
                            >
                                <option value="All">All</option>
                                <option value="Name">Name</option>
                                <option value="Email">Email</option>
                                <option value="Phone">Phone</option>
                                <option value="Address">Address</option>
                            </select>
                        </div>

                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <Input
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="border-neutral-300 bg-white pl-10 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white w-full"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="p-4">
                        <div className="mb-4 flex flex-col gap-1">
                            <h2 className="font-semibold text-neutral-800 dark:text-white">Customer List</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Customers: {filteredCustomers.length}</p>
                        </div>

                        {filteredCustomers.length === 0 ? (
                            <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                                <p>No customers matched your search or filter.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Address</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomers.map((customer, index) => (
                                            <TableRow key={index} className={cn(
                                                    index % 2 === 0
                                                        ? 'bg-white dark:bg-neutral-900'
                                                        : 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                                                        'text-neutral-900 dark:text-white' // para visible
                                                )}
                                            >
                                                <TableCell>{`${customer.first_name} ${customer.middle_name ?? ''} ${customer.last_name}`}</TableCell>
                                                <TableCell>{customer.email}</TableCell>
                                                <TableCell>{customer.phone_number}</TableCell>
                                                <TableCell>{customer.address ?? '-'}</TableCell>
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
