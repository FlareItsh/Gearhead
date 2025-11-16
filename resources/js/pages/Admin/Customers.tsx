import React, { useState, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Search, ChevronDownIcon, Star } from "lucide-react"; 

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Customers", href: "/customers" },
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

const users = [
    { user_id: 1, first_name: "Admin", middle_name: null, last_name: "One", email: "admin@example.com", phone_number: "908818444", address: null, password: "admin123", role: "admin" },
    { user_id: 2, first_name: "Customer", middle_name: null, last_name: "One", email: "customer@example.com", phone_number: "908818444", address: null, password: "customer123", role: "customer" },
    { user_id: 3, first_name: "Flare", middle_name: "A.", last_name: "Itoshi", email: "flare@gmail.com", phone_number: "9123456789", address: "Davao City", password: "pass1234", role: "customer" },
    { user_id: 4, first_name: "Mariz", middle_name: "S.", last_name: "Adlaw", email: "mariz.adlaw@example.com", phone_number: "9987654321", address: "Tagum City", password: "qwerty01", role: "customer" },
    { user_id: 5, first_name: "Carlo", middle_name: "L.", last_name: "Bilbacua", email: "carlo@example.com", phone_number: "9088184444", address: "Panabo City", password: "abcxyz12", role: "customer" },
    { user_id: 6, first_name: "admini", middle_name: "A.", last_name: "ster", email: "administer@example.com", phone_number: "9103139161", address: "Panabo City", password: "watapampa01", role: "admin" },
];

const payments = [
    { payment_id: 1, service_order_id: 1, user_id: null, amount: 480, payment_method: "cash", is_point_redeemed: false, gcash_reference: null },
    { payment_id: 2, service_order_id: 2, user_id: 2, amount: 500, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 3, service_order_id: 3, user_id: 3, amount: 500, payment_method: "gcash", is_point_redeemed: false, gcash_reference: "3658946164618" },
    { payment_id: 4, service_order_id: 4, user_id: 3, amount: 350, payment_method: "cash", is_point_redeemed: false, gcash_reference: null },
    { payment_id: 5, service_order_id: 5, user_id: null, amount: 200, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 6, service_order_id: 6, user_id: 2, amount: 350, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 7, service_order_id: 7, user_id: null, amount: 390, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 8, service_order_id: 8, user_id: 2, amount: 300, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 9, service_order_id: 9, user_id: null, amount: 200, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 10, service_order_id: 10, user_id: 3, amount: 1350, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 11, service_order_id: 11, user_id: null, amount: 930, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 12, service_order_id: 12, user_id: 4, amount: 350, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 13, service_order_id: 13, user_id: null, amount: 390, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 14, service_order_id: 14, user_id: null, amount: 300, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 15, service_order_id: 15, user_id: null, amount: 60, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
    { payment_id: 16, service_order_id: 16, user_id: null, amount: 90, payment_method: "cash", is_point_redeemed: true, gcash_reference: null },
];

const mockCustomers: User[] = users.map((user) => {
    const userPayments = payments.filter((p) => p.user_id === user.user_id);
    const bookings = userPayments.length;
    const loyaltyPoints = bookings % 9;

    return {
        ...user,
        bookings,
        loyaltyPoints,
    };
});

export default function Customers() {
    const [customers] = useState<User[]>(mockCustomers);
    const [searchValue, setSearchValue] = useState("");
    const [filter, setFilter] = useState<"All" | "Name" | "Email" | "Phone">("All");

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            const name = `${c.first_name} ${c.middle_name ? c.middle_name + " " : ""}${c.last_name}`.toLowerCase();
            const email = c.email.toLowerCase();
            const phone = c.phone_number.toLowerCase();
            const term = searchValue.toLowerCase();

            if (filter === "All") return name.includes(term) || email.includes(term) || phone.includes(term);
            if (filter === "Name") return name.includes(term);
            if (filter === "Email") return email.includes(term);
            if (filter === "Phone") return phone.includes(term);

            return true;
        });
    }, [customers, searchValue, filter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-col gap-6 p-6">
                <Heading title="Customers" description="Manage customer records, bookings and loyalty points"/>
                
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
                                    {["All", "Name", "Email", "Phone"].map((f) => (
                                        <DropdownMenuItem key={f} onClick={() => setFilter(f as typeof filter)}>
                                        {f}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                            <h2 className="font-semibold text-neutral-800 dark:text-white">
                                Customer List
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Total Customers: {filteredCustomers.length}
                            </p>
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
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Bookings</TableHead>
                                            <TableHead>Loyalty Points</TableHead>
                                            <TableHead>Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomers.map((c, index) => (
                                            <TableRow
                                                key={c.user_id}
                                                className={cn(
                                                    index % 2 === 0
                                                        ? "bg-white dark:bg-neutral-900"
                                                        : "bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                                                    "text-neutral-900 dark:text-white"
                                                )}
                                            >
                                                <TableCell>{`${c.first_name} ${c.middle_name ? c.middle_name + " " : ""}${c.last_name}`}</TableCell>
                                                <TableCell>{c.phone_number}</TableCell>
                                                <TableCell>{c.bookings}</TableCell>
                                                <TableCell className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-400" />
                                                    {c.loyaltyPoints}
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
