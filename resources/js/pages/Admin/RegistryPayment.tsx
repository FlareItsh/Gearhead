import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    Star,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

axios.defaults.withCredentials = true;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Registry', href: '/registry' },
    { title: 'Payment', href: '#' },
];

interface Service {
    service_id: number;
    service_name: string;
    price: number | string;
}

interface ServiceOrderDetail {
    service_order_detail_id: number;
    service_id: number;
    service: Service;
}

interface Customer {
    user_id: number;
    first_name: string;
    last_name: string;
}

interface ServiceOrder {
    service_order_id: number;
    user_id: number;
    bay_id: number;
    status: string;
    user?: Customer;
    details?: ServiceOrderDetail[];
}

interface Props {
    bayId: number;
}

export default function RegistryPayment({ bayId }: Props) {
    const [method, setMethod] = useState<'cash' | 'gcash'>('cash');
    const [reference, setReference] = useState('');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>(
        'success',
    );
    const [modalMessage, setModalMessage] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isLoyaltyEligible, setIsLoyaltyEligible] = useState(false);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
    const [loyaltyInfo, setLoyaltyInfo] = useState<{
        completed_bookings: number;
        points_earned: number;
        points_needed: number;
    } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const orderParam = params.get('order');
        if (orderParam) {
            try {
                const parsedOrder = JSON.parse(decodeURIComponent(orderParam));
                setOrder(parsedOrder);

                // Check loyalty eligibility
                if (parsedOrder.user_id) {
                    checkLoyaltyEligibility(parsedOrder.user_id);
                }
            } catch (err) {
                console.error('Parse error:', err);
            }
        }
        setLoading(false);
    }, []);

    const checkLoyaltyEligibility = async (userId: number) => {
        try {
            const res = await axios.post('/api/payment/check-loyalty', {
                user_id: userId,
            });
            const data = res.data;
            setIsLoyaltyEligible(data.is_eligible);
            setLoyaltyInfo({
                completed_bookings: data.completed_bookings,
                points_earned: data.points_earned,
                points_needed: data.points_needed,
            });
        } catch (err) {
            console.error('Failed to check loyalty:', err);
        }
    };

    if (loading)
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-screen items-center justify-center">
                    <p className="text-lg text-muted-foreground">Loading...</p>
                </div>
            </AppLayout>
        );

    if (!order)
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-screen flex-col items-center justify-center gap-4">
                    <p className="text-2xl font-bold text-destructive">
                        Order Not Found
                    </p>
                    <Link
                        href="/registry"
                        className="text-yellow-400 underline"
                    >
                        ← Back to Registry
                    </Link>
                </div>
            </AppLayout>
        );

    const details = {
        customerName: order.user
            ? `${order.user.first_name} ${order.user.last_name}`
            : 'Walk-in',
        services:
            order.details?.map((d) => ({
                name: d.service.service_name,
                price:
                    typeof d.service.price === 'string'
                        ? parseInt(d.service.price)
                        : d.service.price,
            })) || [],
        total:
            order.details?.reduce(
                (sum, d) =>
                    sum +
                    (typeof d.service.price === 'string'
                        ? parseInt(d.service.price)
                        : d.service.price),
                0,
            ) || 0,
    };

    const change =
        method === 'cash' ? Math.max(0, paidAmount - details.total) : 0;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setScreenshot(e.target.files[0]);
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            setStream(mediaStream);
            setShowCamera(true);

            // Wait for video element to be available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            console.error('Camera access error:', err);
            setModalType('error');
            setModalMessage(
                'Unable to access camera. Please check your camera permissions.',
            );
            setShowModal(true);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const file = new File(
                                [blob],
                                `gcash-proof-${Date.now()}.jpg`,
                                {
                                    type: 'image/jpeg',
                                },
                            );
                            setScreenshot(file);
                            stopCamera();
                        }
                    },
                    'image/jpeg',
                    0.95,
                );
            }
        }
    };

    const handleSubmit = async () => {
        // If using loyalty points, skip all payment validations
        if (useLoyaltyPoints) {
            try {
                const formData = new FormData();
                formData.append(
                    'service_order_id',
                    order.service_order_id.toString(),
                );
                formData.append('bay_id', bayId.toString());
                formData.append('payment_method', 'loyalty');
                formData.append('amount', '0');
                formData.append('use_loyalty_points', 'true');

                const res = await axios.post('/api/payment/process', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (res.status === 201) {
                    setModalType('success');
                    setModalMessage(
                        `🎉 Loyalty points redeemed! Free service for Bay #${bayId}!`,
                    );
                    setShowModal(true);

                    setTimeout(() => {
                        router.visit('/registry?paymentCompleted=true', {
                            preserveState: false,
                            preserveScroll: false,
                        });
                    }, 2000);
                }
            } catch (err) {
                console.error('Payment error:', err);
                setModalType('error');
                setModalMessage(
                    'Failed to redeem loyalty points. Please try again.',
                );
                setShowModal(true);
            }
            return;
        }

        // Regular payment validations
        if (method === 'cash' && paidAmount < details.total) {
            setModalType('warning');
            setModalMessage(
                'Insufficient amount paid. Please enter an amount greater than or equal to the total.',
            );
            setShowModal(true);
            return;
        }

        if (method === 'gcash' && !reference.trim() && !screenshot) {
            setModalType('warning');
            setModalMessage(
                'Please provide either a reference number or upload a screenshot for GCash payment.',
            );
            setShowModal(true);
            return;
        }

        try {
            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append(
                'service_order_id',
                order.service_order_id.toString(),
            );
            formData.append('bay_id', bayId.toString());
            formData.append('payment_method', method);
            // Always save the actual total amount, not the amount received
            formData.append('amount', details.total.toString());

            if (method === 'gcash') {
                if (reference.trim()) {
                    formData.append('gcash_reference', reference);
                }
                if (screenshot) {
                    formData.append('gcash_screenshot', screenshot);
                }
            }

            const res = await axios.post('/api/payment/process', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 201) {
                setModalType('success');
                setModalMessage(
                    `Payment completed successfully for Bay #${bayId}!`,
                );
                setShowModal(true);

                // Redirect after 2 seconds
                setTimeout(() => {
                    router.visit('/registry?paymentCompleted=true', {
                        preserveState: false,
                        preserveScroll: false,
                    });
                }, 2000);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setModalType('error');
            setModalMessage('Payment failed. Please try again.');
            setShowModal(true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pay • Bay #${bayId}`} />

            {/* Full Width, Edge-to-Edge Layout */}
            <div className="min-h-screen bg-background">
                {/* Header Bar */}
                <div className="border-b bg-card">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Bay{' '}
                                <span className="text-yellow-400">
                                    #{bayId} - Payment
                                </span>
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Gearhead Carwash
                            </p>
                        </div>
                        <Link
                            href="/registry"
                            className="text-sm text-yellow-400 hover:underline"
                        >
                            ← Back
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
                    {/* Left: Main Content - Takes 8/12 */}
                    <div className="space-y-5 lg:col-span-8">
                        {/* Customer + Services */}
                        <Card className="bg-background">
                            <CardContent className="pt-5">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-medium text-yellow-400">
                                            Customer
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {details.customerName}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="mb-2 text-xs font-medium text-yellow-400">
                                            Services
                                        </p>
                                        <div className="space-y-1.5 text-sm">
                                            {details.services.map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="flex justify-between"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {s.name}
                                                    </span>
                                                    <span>
                                                        ₱
                                                        {s.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 border-t pt-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total Amount</span>
                                        <span className="text-yellow-400">
                                            ₱{details.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loyalty Points Banner */}
                        {isLoyaltyEligible && (
                            <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                                <CardContent className="pt-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-full bg-yellow-400 p-3">
                                                <Star className="h-8 w-8 fill-white text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                                    🎉 Loyalty Reward Available!
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    This customer has completed{' '}
                                                    {
                                                        loyaltyInfo?.completed_bookings
                                                    }{' '}
                                                    services. This is their free
                                                    9th service!
                                                </p>
                                            </div>
                                        </div>
                                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-yellow-400 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md dark:bg-black">
                                            <input
                                                type="checkbox"
                                                checked={useLoyaltyPoints}
                                                onChange={(e) =>
                                                    setUseLoyaltyPoints(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 accent-yellow-400"
                                            />
                                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                                                Use Loyalty Points
                                            </span>
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Loyalty Progress (not eligible yet) */}
                        {!isLoyaltyEligible && loyaltyInfo && (
                            <Card className="border-border/50 bg-background">
                                <CardContent className="pt-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                                            <div>
                                                <p className="font-medium">
                                                    Loyalty Progress
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {loyaltyInfo.points_earned}{' '}
                                                    / 9 services completed
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-yellow-400">
                                                {loyaltyInfo.points_earned}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {loyaltyInfo.points_needed} more
                                                to free service
                                            </p>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-yellow-400 transition-all duration-500"
                                            style={{
                                                width: `${(loyaltyInfo.points_earned / 9) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Method */}
                        <Card className="bg-background">
                            <CardContent className="pt-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="font-semibold text-yellow-400">
                                        Payment Method
                                    </h3>
                                    <div className="flex gap-8 text-lg">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={method === 'cash'}
                                                onChange={() => {
                                                    setMethod('cash');
                                                    setUseLoyaltyPoints(false);
                                                }}
                                                disabled={useLoyaltyPoints}
                                            />
                                            <span
                                                className={`font-medium ${useLoyaltyPoints ? 'opacity-50' : ''}`}
                                            >
                                                Cash
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={method === 'gcash'}
                                                onChange={() => {
                                                    setMethod('gcash');
                                                    setUseLoyaltyPoints(false);
                                                }}
                                                disabled={useLoyaltyPoints}
                                            />
                                            <span
                                                className={`font-medium ${useLoyaltyPoints ? 'opacity-50' : ''}`}
                                            >
                                                GCash
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {!useLoyaltyPoints && method === 'cash' && (
                                    <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-3">
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium">
                                                Amount Received
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={paidAmount || ''}
                                                onChange={(e) =>
                                                    setPaidAmount(
                                                        Number(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                className="mt-2 h-16 text-3xl font-bold"
                                                autoFocus
                                            />
                                        </div>
                                        {paidAmount > 0 && (
                                            <div className="space-y-3">
                                                <div className="rounded-lg bg-muted p-4 text-center">
                                                    <p className="text-xs text-muted-foreground">
                                                        Change
                                                    </p>
                                                    <p className="text-3xl font-bold text-green-600">
                                                        ₱
                                                        {change.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!useLoyaltyPoints && method === 'gcash' && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Reference Number{' '}
                                                <span className="text-muted-foreground">
                                                    (required if no screenshot)
                                                </span>
                                            </label>
                                            <Input
                                                placeholder="GCR123456789"
                                                value={reference}
                                                onChange={(e) =>
                                                    setReference(e.target.value)
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-border/50" />
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="bg-background px-2 text-muted-foreground">
                                                    OR
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">
                                                Screenshot{' '}
                                                <span className="text-muted-foreground">
                                                    (required if no reference)
                                                </span>
                                            </label>
                                            <div className="mt-2 grid grid-cols-2 gap-3">
                                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center hover:bg-accent/5">
                                                    <Upload className="mb-2 h-6 w-6" />
                                                    <p className="text-xs font-medium">
                                                        Upload File
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleFile}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={startCamera}
                                                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center hover:bg-accent/5"
                                                >
                                                    <Camera className="mb-2 h-6 w-6" />
                                                    <p className="text-xs font-medium">
                                                        Take Photo
                                                    </p>
                                                </button>
                                            </div>
                                            {screenshot && (
                                                <div className="mt-3 rounded-lg border bg-muted/50 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    screenshot.name
                                                                }
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setScreenshot(
                                                                    null,
                                                                );
                                                            }}
                                                            className="rounded p-1 hover:bg-muted"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Sticky Total + Pay Button - Takes 4/12 */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 space-y-5">
                            <Card
                                className={`text-white ${useLoyaltyPoints ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-black'}`}
                            >
                                <CardContent className="pt-8 pb-10 text-center">
                                    <p className="text-lg opacity-90">
                                        Bay #{bayId}
                                    </p>
                                    {useLoyaltyPoints ? (
                                        <>
                                            <p className="mt-4 text-6xl font-black tracking-tight">
                                                FREE
                                            </p>
                                            <p className="mt-3 text-sm opacity-90">
                                                Loyalty Points Redeemed
                                            </p>
                                            <div className="mt-4 flex items-center justify-center gap-2">
                                                <Star className="h-5 w-5 fill-white" />
                                                <span className="text-lg font-bold">
                                                    9th Service Free!
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="mt-4 text-6xl font-black tracking-tight">
                                                ₱
                                                {details.total.toLocaleString()}
                                            </p>
                                            <p className="mt-3 text-sm opacity-70">
                                                Total Amount Due
                                            </p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Button
                                onClick={handleSubmit}
                                size="lg"
                                variant="highlight"
                                className="w-full py-10 text-xl font-bold"
                            >
                                {useLoyaltyPoints
                                    ? 'Complete with Loyalty Points'
                                    : 'Complete Payment'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-md transform rounded-xl border border-border bg-background p-8 shadow-2xl">
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 rounded-full p-2 transition-colors duration-200 hover:bg-muted/50"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            {modalType === 'success' && (
                                <div className="rounded-full bg-green-100 p-4 dark:bg-green-950/30">
                                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                                </div>
                            )}
                            {modalType === 'error' && (
                                <div className="rounded-full bg-red-100 p-4 dark:bg-red-950/30">
                                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                                </div>
                            )}
                            {modalType === 'warning' && (
                                <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-950/30">
                                    <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div className="text-center">
                            <h3 className="mb-2 text-xl font-bold">
                                {modalType === 'success' && 'Success!'}
                                {modalType === 'error' && 'Error'}
                                {modalType === 'warning' && 'Warning'}
                            </h3>
                            <p className="text-muted-foreground">
                                {modalMessage}
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="mt-8">
                            <Button
                                onClick={() => {
                                    setShowModal(false);
                                    if (modalType === 'success') {
                                        router.visit('/registry');
                                    }
                                }}
                                variant={
                                    modalType === 'success'
                                        ? 'highlight'
                                        : 'default'
                                }
                                className="w-full"
                            >
                                {modalType === 'success'
                                    ? 'Go to Registry'
                                    : 'Close'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative h-full w-full max-w-4xl p-4">
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 z-10 rounded-full bg-white p-3 shadow-lg transition-colors duration-200 hover:bg-gray-100"
                            onClick={stopCamera}
                        >
                            <X className="h-6 w-6 text-gray-800" />
                        </button>

                        {/* Camera View */}
                        <div className="flex h-full flex-col items-center justify-center gap-4">
                            <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-2xl">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full"
                                />
                            </div>

                            {/* Capture Button */}
                            <Button
                                onClick={capturePhoto}
                                size="lg"
                                variant="highlight"
                                className="px-12 py-6 text-lg font-bold"
                            >
                                <Camera className="mr-2 h-6 w-6" />
                                Capture Photo
                            </Button>
                        </div>

                        {/* Hidden Canvas */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
