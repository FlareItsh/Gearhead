import Heading from '@/components/heading';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Star } from 'lucide-react';
import React from 'react';

// Placeholder for customer dashboard
const CustomerDashboard: React.FC = () => {
    const pageProps = usePage().props as unknown as SharedData & {
        paymentsCount?: number;
    };
    const { auth } = pageProps;
    const firstName = auth?.user?.first_name ?? auth?.user?.name ?? 'there';
    const paymentsCount = (pageProps.paymentsCount ?? 0) % 9;

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
                            {paymentsCount}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Earn more with each booking
                    </p>
                </div>

                <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>

                <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
            <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
            </div>
        </div>
    );
};

export default CustomerDashboard;
