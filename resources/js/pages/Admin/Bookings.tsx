import React, { useState, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, ChevronDownIcon, Edit2, Check, XCircle, Clock } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Bookings", href: "/admin/bookings" },
];

interface Booking {
    id: number;
    customer: string;
    service: string;
    datetime: string;
    price: number;
    status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

const mockBookings: Booking[] = [
  { id: 1, customer: "Flare A. Itoshi", service: "Enginewash, Hand Wax", datetime: "2025-02-14 10:30 AM", price: 480, status: "Completed" },
  { id: 2, customer: "Mariz S. Adlaw", service: "Basic Wash", datetime: "2025-02-14 11:00 AM", price: 500, status: "Completed" },
  { id: 3, customer: "Carlo L. Bilbacua", service: "Underwash, Armor All", datetime: "2025-02-14 1:00 PM", price: 500, status: "Completed" },
  { id: 4, customer: "Flare A. Itoshi", service: "High Gloss", datetime: "2025-02-14 2:15 PM", price: 350, status: "Completed" },
  { id: 5, customer: "Mariz S. Adlaw", service: "Hand Wax", datetime: "2025-02-15 9:00 AM", price: 200, status: "Pending" },
  { id: 6, customer: "Flare A. Itoshi", service: "Complete Package", datetime: "2025-02-15 10:00 AM", price: 350, status: "Pending" },
  { id: 7, customer: "Carlo L. Bilbacua", service: "Buff Wax", datetime: "2025-02-15 11:00 AM", price: 390, status: "Pending" },
  { id: 8, customer: "Flare A. Itoshi", service: "Waterproof", datetime: "2025-02-15 12:00 PM", price: 300, status: "Pending" },
  { id: 9, customer: "Mariz S. Adlaw", service: "Enginewash", datetime: "2025-02-15 1:00 PM", price: 200, status: "Completed" },
  { id: 10, customer: "Flare A. Itoshi", service: "Hard Shell", datetime: "2025-02-15 2:00 PM", price: 1350, status: "Completed" },
];

export default function AdminBookings() {
    const [bookings] = useState<Booking[]>(mockBookings);
    const [searchValue, setSearchValue] = useState("");
    const [filter, setFilter] = useState<"All" | "Customer" | "Service" | "Status" | "Date">("All");
    const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Confirmed" | "Completed" | "Cancelled">("All");

    const filteredBookings = useMemo(() => {
        const term = searchValue.toLowerCase();

        return bookings.filter((b) => {
            const matchesSearch = filter === "All" ? 
                (b.customer.toLowerCase().includes(term) || b.service.toLowerCase().includes(term) || b.status.toLowerCase().includes(term) || b.datetime.toLowerCase().includes(term)) :
                filter === "Customer" ? b.customer.toLowerCase().includes(term) :
                filter === "Service" ? b.service.toLowerCase().includes(term) :
                filter === "Status" ? b.status.toLowerCase().includes(term) :
                filter === "Date" ? b.datetime.toLowerCase().includes(term) : true;

            const matchesStatus = statusFilter === "All" ? true : b.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchValue, filter, statusFilter]);

    const getStatusBadge = (status: Booking["status"]) => {
        switch (status) {
            case "Pending":
                return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case "Confirmed":
                return <Badge variant="info"><Check className="h-3 w-3 mr-1" />Confirmed</Badge>;
            case "Completed":
                return <Badge variant="success">Completed</Badge>;
            case "Cancelled":
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings" />
            <div className="flex flex-col gap-6 p-6">
                <Heading title="Bookings" description="Manage and track customer bookings" />

                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">Search</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                    {filter}
                                    <ChevronDownIcon className="ml-2 h-4 w-4 text-neutral-500" />
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-40">
                                    {['All', 'Customer', 'Service', 'Status', 'Date'].map((f) => (
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
                                placeholder="Search bookings..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="border-neutral-300 bg-white pl-10 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white w-full"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex w-full rounded-2xl bg-secondary p-1">
                    {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map(
                        (s) => {
                            const isActive = statusFilter === s;

                            return (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all 
                                        ${isActive ? "bg-highlight text-black shadow-sm" : "text-foreground/70"}`}
                                > {s} </button>
                            );
                        }
                    )}
                </div>

                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="p-4">
                        <div className="mb-4 flex flex-col gap-1">
                            <h2 className="font-semibold text-neutral-800 dark:text-white">Booking List</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Bookings: {filteredBookings.length}</p>
                        </div>

                        {filteredBookings.length === 0 ? (
                            <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                                <p>No bookings found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {filteredBookings.map((b) => (
                                            <TableRow key={b.id}>
                                                <TableCell>{b.customer}</TableCell>
                                                <TableCell>{b.service}</TableCell>
                                                <TableCell>{b.datetime}</TableCell>
                                                <TableCell>{b.price}</TableCell>
                                                <TableCell>{getStatusBadge(b.status)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={b.status === "Completed"}
                                                        className={b.status === "Completed" ? "text-neutral-400 cursor-not-allowed" : ""}
                                                        onClick={() => console.log("Edit", b.id)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
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
