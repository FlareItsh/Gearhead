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
                <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex justify-between">
                        <h4>Loyalty Points</h4>
                        <Star />
                    </div>

                    <div className="text-center">
                        <span
                            className="text-5xl font-semibold"
                            data-test="payments-count"
                        >
                            {paymentsCount % 9}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Earn more with each booking
                    </p>
                </div>

                <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex justify-between">
                        <h4>Total Bookings</h4>
                        <Wrench />
                    </div>

                    <div className="text-center">
                        <span
                            className="text-5xl font-semibold"
                            data-test="payments-count"
                        >
                            {paymentsCount}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Lifetime Bookings
                    </p>
                </div>

                <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex justify-between">
                        <h4>Total Spent</h4>
                        <HandCoins />
                    </div>

                    <div className="text-center">
                        <span
                            className="text-5xl font-semibold"
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
            <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
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
                                            .toUpperCase()}
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
            <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Recent Bookings"
                        description="Your completed appointments"
                    />
                    <div>
                        <Link href={route('customer.payments')}>
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
                                    <Badge variant="success">COMPLETED</Badge>
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
