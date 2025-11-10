import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment History',
        href: '/payments',
    },
];

export default function Payments() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment History" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Payment History"
                    description="View all your transactions"
                />

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <HeadingSmall
                        title="Transaction Summary"
                        description="Recent payment records"
                    />

                    <Table>
                        <TableCaption>
                            A list of your recent payments.
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>GCash Ref</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    {new Date().toLocaleString()}
                                </TableCell>
                                <TableCell>Body Wash</TableCell>
                                <TableCell>₱500.00</TableCell>
                                <TableCell>Cash</TableCell>
                                <TableCell>Null</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
