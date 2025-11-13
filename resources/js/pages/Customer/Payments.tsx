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
import axios from 'axios';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment History',
        href: 'payments.user',
    },
];

export default function Payments() {
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        axios
            .get(route('payments.user'))
            .then((res) => setPayments(res.data))
            .catch((err) => console.error(err));
    }, []);

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
                                <TableHead className="text-base">
                                    Date
                                </TableHead>
                                <TableHead className="text-base">
                                    Services
                                </TableHead>
                                <TableHead className="text-right text-base">
                                    Amount
                                </TableHead>
                                <TableHead className="text-base">
                                    Payment Method
                                </TableHead>
                                <TableHead className="text-right text-base">
                                    GCash Ref
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment, index) => (
                                <TableRow
                                    key={index}
                                    className={`border-t ${index % 2 === 0 ? 'bg-highlight/10' : ''}`}
                                >
                                    <TableCell className="text-base">
                                        {new Date(
                                            payment.date,
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-base">
                                        {payment.services ? (
                                            <ul className="list-inside list-disc space-y-1">
                                                {payment.services
                                                    .split(',')
                                                    .map(
                                                        (
                                                            service: string,
                                                            idx: number,
                                                        ) => (
                                                            <li
                                                                key={idx}
                                                                className="text-base"
                                                            >
                                                                {service.trim()}
                                                            </li>
                                                        ),
                                                    )}
                                            </ul>
                                        ) : (
                                            <span className="text-base">
                                                N/A
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-base font-medium">
                                        ₱{parseFloat(payment.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-base">
                                        {payment.payment_method}
                                    </TableCell>
                                    <TableCell className="text-right text-base">
                                        {payment.gcash_reference || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
