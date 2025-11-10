import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, HandCoins, Star, Wrench } from 'lucide-react';
import React from 'react';

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

                <div className="mt-4 rounded-lg border p-4">
                    <div>
                        <HeadingSmall
                            title="Body Wash"
                            description={new Date().toLocaleString()}
                        />
                    </div>
                </div>
                <div className="mt-4 rounded-lg border p-4">
                    <div>
                        <HeadingSmall
                            title="Body Wash"
                            description={new Date().toLocaleString()}
                        />
                    </div>
                </div>
            </div>

            {/*Recent Bookings Section*/}
            <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                <HeadingSmall
                    title="Recent Bookings"
                    description="Your completed appointments"
                />

                <div className="mt-4 rounded-lg border p-4">
                    <div>
                        <HeadingSmall
                            title="Body Wash"
                            description={new Date().toLocaleString()}
                        />
                    </div>
                </div>

                <div className="mt-4 rounded-lg border p-4">
                    <div>
                        <HeadingSmall
                            title="Body Wash"
                            description={new Date().toLocaleString()}
                        />
                    </div>
                </div>
            </div>
            <div>{/*TODO: List of comlpeted bookings*/}</div>
        </div>
    );
};

export default CustomerDashboard;
