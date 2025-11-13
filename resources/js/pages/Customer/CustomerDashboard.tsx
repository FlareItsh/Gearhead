import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CalendarDays, HandCoins, Star, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

// Placeholder for customer dashboard
const CustomerDashboard: React.FC = () => {
    const pageProps = usePage().props as unknown as SharedData & {
        paymentsCount?: number;
        totalSpent?: number;
    };
    const { auth } = pageProps;
    const firstName = auth?.user?.first_name ?? auth?.user?.name ?? 'there';
    const paymentsCount = pageProps.paymentsCount ?? 0;
    const totalSpent = pageProps.totalSpent ?? 0;

    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);

    useEffect(() => {
        // Existing payments fetch
        axios
            .get(route('payments.user'))
            .then((res) => setPayments(res.data))
            .catch((err) => console.error(err));

        // Fetch upcoming bookings
        axios
            .get(route('bookings.upcoming'))
            .then((res) => setUpcomingBookings(res.data))
            .catch((err) => console.error(err));
    }, []);

    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        axios
            .get('/payments/user')
            .then((res) => setPayments(res.data))
            .catch((err) => console.error(err));
    }, []);

    // Sort by date (newest first) and get only the 4 most recent
    const recentPayments = [...payments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Heading
                title={`Welcome back, ${firstName}`}
                description="Manage your carwash bookings and loyalty rewards"
            />
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                {/* Loyalty Points Card */}
                <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-foreground">
                            Loyalty Points
                        </h4>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Star className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="text-center">
                        <span
                            className="mx-auto inline-block w-fit rounded-full bg-yellow-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-yellow-200 dark:bg-yellow-900/20"
                            data-test="payments-count"
                        >
                            {paymentsCount % 9}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Earn more with each booking
                    </p>
                </div>

                {/* Total Bookings Card */}
                <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-foreground">
                            Total Bookings
                        </h4>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
                            <Wrench className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="text-center">
                        <span
                            className="mx-auto inline-block w-fit rounded-full bg-blue-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-blue-200 dark:bg-blue-900/20"
                            data-test="payments-count"
                        >
                            {paymentsCount}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Lifetime Bookings
                    </p>
                </div>

                {/* Total Spent Card */}
                <div className="group relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 shadow-sm transition-all duration-200 hover:border-highlight/50 hover:shadow-md dark:border-sidebar-border dark:hover:border-highlight/50">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-foreground">
                            Total Spent
                        </h4>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400">
                            <HandCoins className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="text-center">
                        <span
                            className="mx-auto inline-block w-fit rounded-full bg-green-100 px-6 py-3 text-4xl font-bold text-foreground group-hover:bg-green-200 dark:bg-green-900/20"
                            data-test="total-spent"
                        >
                            ₱{totalSpent.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Lifetime spent in services
                    </p>
                </div>
            </div>

            <Link href="/services">
                <Button variant="highlight">
                    <CalendarDays /> Book Now
                </Button>
            </Link>

            {/*Upcoming Booking Section*/}
            <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                <HeadingSmall
                    title="Upcoming Bookings"
                    description="Your scheduled appointments"
                />

                <div className="mt-4 space-y-4">
                    {upcomingBookings.length > 0 ? (
                        upcomingBookings.map((booking) => (
                            <div
                                key={booking.service_order_id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div>
                                    <HeadingSmall
                                        title={
                                            booking.service_names ||
                                            'No service'
                                        }
                                        description={new Date(
                                            booking.order_date,
                                        ).toLocaleString()}
                                    />
                                    <span className="text-lg font-semibold">
                                        {booking.order_type === 'R'
                                            ? 'Reservation'
                                            : 'Walk-in'}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-lg font-bold">
                                        Amount: ₱
                                        {Number(
                                            booking.total_amount,
                                        ).toLocaleString()}
                                    </span>
                                    <Badge
                                        variant={
                                            booking.status === 'pending'
                                                ? 'warning'
                                                : booking.status ===
                                                    'in_progress'
                                                  ? 'info'
                                                  : booking.status ===
                                                      'completed'
                                                    ? 'success'
                                                    : 'destructive'
                                        }
                                    >
                                        {booking.status
                                            .replace('_', ' ')
                                            .replace(/^\w/, (c) =>
                                                c.toUpperCase(),
                                            )}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">
                            No upcoming bookings found.
                        </p>
                    )}
                </div>
            </div>

            {/*Recent Bookings Section*/}
            <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Recent Bookings"
                        description="Your completed appointments"
                    />
                    <div>
                        <Link href={'/bookings?status=completed'}>
                            <Button variant="highlight">View All</Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    {recentPayments.length > 0 ? (
                        recentPayments.map((payment) => (
                            <div
                                key={payment.payment_id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div>
                                    <HeadingSmall
                                        title={payment.services || 'No service'}
                                        description={new Date(
                                            payment.date,
                                        ).toLocaleString()}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-lg font-bold">
                                        Amount: ₱{payment.amount}
                                    </span>
                                    <Badge variant="success">Completed</Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">
                            No recent payments found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
