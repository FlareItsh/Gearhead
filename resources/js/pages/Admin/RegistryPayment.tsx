import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useState } from 'react';

// mock data
const bayDetails: Record<number, any> = {
    1: {
        customer: { name: 'Kristine Hilarious', phone: '09987654321' },
        services: [
            { name: 'Watermarks Removal/Glass Detailing - S', price: 900 },
            { name: 'Armor All/All Purpose Dressing - S', price: 60 },
        ],
        totalAmount: 960,
    },
    2: {
        customer: { name: 'Kristine Hilarious', phone: '09987654321' },
        services: [{ name: 'Buff Wax ~ BOTNY ~ M', price: 520 }],
        totalAmount: 520,
    },
    4: {
        customer: { name: 'Carlo Bilbacua', phone: '09123456789' },
        services: [{ name: 'Underwash ~ S', price: 390 }],
        totalAmount: 390,
    },
};

interface Props {
    bayId: number;
}

export default function RegistryPayment({ bayId }: Props) {
    const [method, setMethod] = useState<'cash' | 'gcash'>('cash');
    const [reference, setReference] = useState('');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [screenshot, setScreenshot] = useState<File | null>(null);

    const details = bayDetails[bayId] || {
        customer: { name: 'Unknown', phone: 'N/A' },
        services: [],
        totalAmount: 0,
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const change = method === 'cash' ? paidAmount - details.totalAmount : 0;

    const handleSubmit = () => {
        if (method === 'cash' && paidAmount < details.totalAmount) {
            alert('Amount paid is insufficient.');
            return;
        }

        alert(`Payment completed for Bay #${bayId}!`);
        router.visit('/registry', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={`Payment - Bay #${bayId}`} />
            <div className="p-6">
                <div className="w-full">
                    <Link
                        href="/registry"
                        className="mb-4 inline-block text-sm text-[var(--muted-foreground)]"
                    >
                        ← Back to Registry
                    </Link>
                    <h1 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
                        Payment - Bay #{bayId}
                    </h1>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                        Gearhead Carwash
                    </p>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* LEFT SIDE */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* CUSTOMER INFO */}
                            <Card className="border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">
                                        Customer Info
                                    </h2>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>
                                        <span className="font-bold">Name:</span>{' '}
                                        {details.customer.name}
                                    </p>
                                    <p>
                                        <span className="font-bold">
                                            Phone:
                                        </span>{' '}
                                        {details.customer.phone}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* PAYMENT METHOD */}
                            <Card className="border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">
                                        Payment Method
                                    </h2>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={method === 'cash'}
                                                onChange={() =>
                                                    setMethod('cash')
                                                }
                                            />
                                            Cash
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={method === 'gcash'}
                                                onChange={() =>
                                                    setMethod('gcash')
                                                }
                                            />
                                            GCash
                                        </label>
                                    </div>

                                    {/* CASH */}
                                    {method === 'cash' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <div>
                                                <p className="mb-1 font-semibold">
                                                    Amount Paid
                                                </p>
                                                <Input
                                                    type="number"
                                                    value={paidAmount || ''}
                                                    onChange={(e) =>
                                                        setPaidAmount(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* GCASH */}
                                    {method === 'gcash' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <div>
                                                <p className="mb-1 font-semibold">
                                                    GCash Reference Number
                                                    (Optional)
                                                </p>
                                                <Input
                                                    placeholder="e.g. GCR123456789"
                                                    value={reference}
                                                    onChange={(e) =>
                                                        setReference(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <p className="mb-2 font-semibold">
                                                    Or Upload Payment Screenshot
                                                </p>
                                                <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <Upload className="mb-2 h-6 w-6 text-gray-500 dark:text-gray-300" />
                                                    <span className="text-sm text-gray-500 dark:text-gray-300">
                                                        Click to Upload
                                                        Screenshot
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-300">
                                                        PNG, JPG up to 5MB
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleFile}
                                                    />
                                                </label>
                                                {screenshot && (
                                                    <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                                                        Uploaded:{' '}
                                                        {screenshot.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card className="border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">
                                        Order Summary
                                    </h2>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {details.services.map(
                                        (s: any, i: number) => (
                                            <div
                                                key={i}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-[var(--muted-foreground)]">
                                                    {s.name}
                                                </span>
                                                <span className="font-bold">
                                                    ₱{s.price}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </CardContent>
                            </Card>

                            {/* Total Amount */}
                            <Card className="border border-gray-300 bg-gray-100 p-6 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                <p className="text-sm">Total Amount</p>
                                <p className="mt-1 text-3xl font-bold">
                                    ₱{details.totalAmount}
                                </p>
                            </Card>

                            {/* Amount Paid & Change */}
                            {method === 'cash' && paidAmount > 0 && (
                                <>
                                    <Card className="border border-yellow-200 bg-yellow-50 p-6 text-gray-900 dark:border-yellow-700 dark:bg-yellow-900 dark:text-white">
                                        <p className="text-sm">Amount Paid</p>
                                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                            ₱{paidAmount}
                                        </p>
                                    </Card>
                                    <Card className="border border-green-200 bg-green-50 p-6 text-gray-900 dark:border-green-700 dark:bg-green-900 dark:text-white">
                                        <p className="text-sm">Change</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            ₱{change < 0 ? 0 : change}
                                        </p>
                                    </Card>
                                </>
                            )}

                            {/* Complete Payment Button */}
                            <Button
                                onClick={handleSubmit}
                                className="h-12 w-full rounded-lg bg-black font-semibold text-[var(--highlight)] hover:bg-black/90"
                            >
                                Complete Payment
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
