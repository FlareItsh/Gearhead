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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
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

    // =============== PDF EXPORT FUNCTION ===============
    const downloadPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Gearhead - Payment History Report', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Generated on: ${new Date().toLocaleDateString('en-PH')}`,
            14,
            28,
        );

        // Simple & safe amount formatting
        const formatAmount = (amount: string | number) => {
            const num = parseFloat(amount.toString());
            if (isNaN(num)) return '0.00';
            return `${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        };

        const tableData = payments.map((payment) => [
            new Date(payment.created_at).toLocaleDateString('en-PH'),
            payment.services
                ? payment.services
                      .split(',')
                      .map((s: string) => s.trim())
                      .join('\n')
                : 'N/A',
            formatAmount(payment.amount), // ← Clean peso string
            payment.payment_method || 'N/A',
            payment.gcash_reference || 'N/A',
        ]);

        autoTable(doc, {
            head: [
                ['Date', 'Services', 'Amount', 'Payment Method', 'GCash Ref'],
            ],
            body: tableData,
            startY: 35,
            theme: 'striped',
            headStyles: {
                fillColor: [255, 226, 38],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
            },
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 28, halign: 'center' },
                1: { cellWidth: 65, valign: 'top' },
                2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
                3: { cellWidth: 35, halign: 'center' },
                4: { cellWidth: 32, halign: 'right' },
            },
            margin: { top: 35, left: 14, right: 14 },
        });

        doc.save(
            `payment-history-${new Date().toISOString().split('T')[0]}.pdf`,
        );
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
                    <div className="mb-4 flex items-center justify-between">
                        <HeadingSmall
                            title="Transaction Summary"
                            description="Recent payment records"
                        />
                        <Button onClick={downloadPDF} variant="highlight">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>

                    <div className="custom-scrollbar flex-1 overflow-y-auto">
                        <Table className="min-w-full">
                            <TableCaption>
                                A list of your recent payments.
                            </TableCaption>
                            <TableHeader className="sticky top-0 z-10 border-b bg-background">
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
                                {payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No payments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment, index) => (
                                        <TableRow
                                            key={index}
                                            className={`border-t ${index % 2 === 0 ? 'bg-highlight/5' : ''}`}
                                        >
                                            <TableCell className="text-base">
                                                {new Date(
                                                    payment.created_at,
                                                ).toLocaleDateString('en-PH')}
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
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        {service.trim()}
                                                                    </li>
                                                                ),
                                                            )}
                                                    </ul>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        N/A
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-base font-medium">
                                                ₱
                                                {parseFloat(
                                                    payment.amount,
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-base">
                                                {payment.payment_method ||
                                                    'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right text-base">
                                                {payment.gcash_reference ||
                                                    'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
