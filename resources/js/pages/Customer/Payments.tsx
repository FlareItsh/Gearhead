import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
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
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
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

    const downloadXLSX = () => {
        const headers = [
            'Date',
            'Services',
            'Amount',
            'Payment Method',
            'GCash Ref',
        ];
        const data = payments.map((payment) => {
            const services = payment.services
                ? payment.services
                      .split(',')
                      .map((s: string) => s.trim())
                      .join('\n')
                : 'N/A';
            return {
                Date: payment.created_at,
                Services: services,
                Amount: parseFloat(payment.amount),
                'Payment Method': payment.payment_method,
                'GCash Ref': payment.gcash_reference || 'N/A',
            };
        });

        const ws = XLSX.utils.json_to_sheet(data, { header: headers });

        // Bold headers with highlight background
        const headerStyle = {
            font: { bold: true },
            fill: {
                patternType: 'solid',
                fgColor: { rgb: 'FFF4FBF5' },
            },
        };
        const range = XLSX.utils.decode_range(ws['!ref']!);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = headerStyle;
        }

        // Format Amount column as currency (PHP)
        const amountStyle = {
            numFmt: '₱#,##0.00',
            alignment: { horizontal: 'right' },
        };
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: 2 }); // Column C (Amount)
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = amountStyle;
        }

        // Right-align GCash Ref column
        const gcashStyle = { alignment: { horizontal: 'right' } };
        for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: 4 }); // Column E (GCash Ref)
            if (!ws[cellAddress]) continue;
            if (R === 0) {
                // Header
                ws[cellAddress].s = { ...headerStyle, ...gcashStyle };
            } else {
                ws[cellAddress].s = { ...ws[cellAddress].s, ...gcashStyle };
            }
        }

        // Auto-fit columns (approximate widths)
        const colWidths = [
            { wch: 18 }, // Date
            { wch: 40 }, // Services (wider for multi-line)
            { wch: 12 }, // Amount
            { wch: 15 }, // Payment Method
            { wch: 20 }, // GCash Ref
        ];
        ws['!cols'] = colWidths;

        // Add thin borders to all cells
        const borderStyle = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    ...ws[cellAddress].s,
                    border: borderStyle,
                };
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payments');

        const filename = `payment-history-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment History" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Payment History"
                    description="View all your transactions"
                />

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <div className="flex items-center justify-between">
                        <HeadingSmall
                            title="Transaction Summary"
                            description="Recent payment records"
                        />
                        <Button onClick={downloadXLSX} variant="highlight">
                            <Download className="mr-2 h-4 w-4" />
                            Download XLSX
                        </Button>
                    </div>

                    <div className="custom-scrollbar flex-1 overflow-y-auto">
                        <Table className="min-w-full">
                            <TableCaption>
                                A list of your recent payments.
                            </TableCaption>
                            <TableHeader className="sticky top-0 z-10 border-b">
                                <TableRow>
                                    <TableHead className="text-base font-bold">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-base font-bold">
                                        Services
                                    </TableHead>
                                    <TableHead className="text-right text-base font-bold">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-base font-bold">
                                        Payment Method
                                    </TableHead>
                                    <TableHead className="text-right text-base font-bold">
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
                                            {payment.created_at}
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
                                            ₱
                                            {parseFloat(payment.amount).toFixed(
                                                2,
                                            )}
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
            </div>
        </AppLayout>
    );
}
