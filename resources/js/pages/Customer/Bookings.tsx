import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Clock as ClockIcon,
    CreditCard,
    Tag,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Bookings', href: '/bookings' },
];

type Booking = {
    service_order_id: number;
    order_status: string;
    order_date: string;
    order_type: string;
    services: string;
    total_amount: number;
    payment_method?: string;
};

const statuses = ['all', 'pending', 'in_progress', 'completed', 'cancelled'];

export default function Bookings() {
    const pageProps = usePage().props as unknown as {
        bookings?: Booking[];
        selectedStatus?: string;
        user?: { first_name?: string };
    };

    const bookings = pageProps.bookings ?? [];
    const selectedStatus = pageProps.selectedStatus ?? 'all';
    const userFirstName = pageProps.user?.first_name ?? 'there';

    // View Details modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );

    // Cancel modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [isCancelClosing, setIsCancelClosing] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(
        null,
    );

    const openModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setModalOpen(true);
        setIsClosing(false);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedBooking(null);
            setModalOpen(false);
            setIsClosing(false);
        }, 500);
    };

    const openCancelModal = (booking: Booking) => {
        setBookingToCancel(booking);
        setCancelModalOpen(true);
        setIsCancelClosing(false);
    };

    const closeCancelModal = () => {
        setIsCancelClosing(true);
        setTimeout(() => {
            setBookingToCancel(null);
            setCancelModalOpen(false);
            setIsCancelClosing(false);
        }, 500);
    };

    const confirmCancel = () => {
        if (!bookingToCancel) return;

        Inertia.post(
            `/bookings/cancel/${bookingToCancel.service_order_id}`,
            {},
            {
                onSuccess: () => {
                    closeCancelModal();
                    // optionally close details modal if it was open for the same booking
                    if (
                        selectedBooking &&
                        selectedBooking.service_order_id ===
                            bookingToCancel.service_order_id
                    ) {
                        closeModal();
                    }
                },
            },
        );
    };

    // Status icon and variant mapping
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { icon: AlertCircle, variant: 'warning' as const };
            case 'in_progress':
                return { icon: ClockIcon, variant: 'info' as const };
            case 'completed':
                return { icon: CheckCircle, variant: 'success' as const };
            case 'cancelled':
                return { icon: X, variant: 'destructive' as const };
            default:
                return { icon: ClockIcon, variant: 'secondary' as const };
        }
    };

    // helper to decide if cancel is allowed
    const canCancel = (status: string) =>
        !['in_progress', 'completed', 'cancelled'].includes(status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title="My Bookings"
                    description="View and manage your appointments"
                />

                {/* Status Filter Buttons - Perfectly Responsive */}
                <div className="w-full">
                    <div className="inline-flex w-full flex-wrap gap-2 rounded-lg bg-secondary p-1.5 sm:flex-nowrap">
                        {statuses.map((status) => {
                            const href =
                                status === 'all'
                                    ? '/bookings'
                                    : `/bookings?status=${status}`;
                            const isActive = status === selectedStatus;

                            const label = status
                                .replace('_', ' ')
                                .replace(/^\w/, (c) => c.toUpperCase());

                            return (
                                <Link
                                    key={status}
                                    href={href}
                                    className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                        isActive
                                            ? 'bg-highlight text-black shadow-sm'
                                            : 'bg-tertiary text-foreground hover:bg-tertiary/80'
                                    } `}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Scrollable Bookings */}
                <div className="custom-scrollbar h-[65vh] overflow-y-auto">
                    {bookings.length > 0 ? (
                        bookings.map((b) => (
                            <div
                                key={b.service_order_id}
                                className="relative mb-4 flex flex-col justify-between gap-2 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                            >
                                <div className="flex justify-between text-lg">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Clock />
                                        {b.services}
                                    </div>
                                    <div className="font-bold">
                                        ₱{b.total_amount.toLocaleString()}
                                    </div>
                                </div>

                                <div>
                                    {new Date(b.order_date).toLocaleString()}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-x-2">
                                        {/* View Details - opens modal */}
                                        <Button
                                            variant="outline"
                                            onClick={() => openModal(b)}
                                        >
                                            View Details
                                        </Button>

                                        {/* Cancel - opens cancel modal if allowed */}
                                        {canCancel(b.order_status) ? (
                                            <Button
                                                variant="destructive"
                                                onClick={() =>
                                                    openCancelModal(b)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        ) : null}
                                    </div>

                                    <div>
                                        <Badge
                                            variant={
                                                b.order_status === 'pending'
                                                    ? 'warning'
                                                    : b.order_status ===
                                                        'in_progress'
                                                      ? 'info'
                                                      : b.order_status ===
                                                          'completed'
                                                        ? 'success'
                                                        : 'destructive'
                                            }
                                        >
                                            {b.order_status
                                                .replace('_', ' ')
                                                .replace(/^\w/, (c) =>
                                                    c.toUpperCase(),
                                                )}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">
                            No bookings available.
                        </p>
                    )}
                </div>

                {/* View Details Modal */}
                {modalOpen && selectedBooking && (
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${isClosing ? 'animate-out fade-out' : 'bg-highlight/2 backdrop-blur-sm'}`}
                    >
                        <div
                            className={`relative mx-4 w-full max-w-md transform rounded-xl border border-border bg-background p-6 shadow-2xl duration-500 ease-out ${isClosing ? 'animate-out fade-out zoom-out' : 'animate-in fade-in zoom-in'}`}
                        >
                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-4 rounded-full p-2 transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-muted"
                                onClick={closeModal}
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>

                            {/* Header */}
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-highlight/20">
                                    {(() => {
                                        const { icon: Icon } = getStatusConfig(
                                            selectedBooking.order_status,
                                        );
                                        return (
                                            <Icon className="h-6 w-6 text-highlight" />
                                        );
                                    })()}
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    Booking Details
                                </h3>
                            </div>

                            {/* Divider */}
                            <div className="mb-6 border-t border-border/50" />

                            {/* Details Grid */}
                            <div className="space-y-4">
                                {/* Services */}
                                <div className="flex items-start gap-3">
                                    <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Services
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {selectedBooking.services}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Date */}
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Order Date
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(
                                                selectedBooking.order_date,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Type */}
                                <div className="flex items-start gap-3">
                                    <ClockIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Order Type
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedBooking.order_type === 'W'
                                                ? 'Walk-in'
                                                : 'Reservation'}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                {selectedBooking.payment_method && (
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">
                                                Payment Method
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedBooking.payment_method}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Total Amount */}
                                <div className="flex items-start gap-3 pt-2">
                                    <div className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Total Amount
                                        </p>
                                        <p className="text-xl font-bold">
                                            ₱
                                            {selectedBooking.total_amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="h-4 w-4 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Status
                                        </p>
                                        <Badge
                                            variant={
                                                getStatusConfig(
                                                    selectedBooking.order_status,
                                                ).variant
                                            }
                                            className="capitalize"
                                        >
                                            {selectedBooking.order_status
                                                .replace('_', ' ')
                                                .replace(/^\w/, (c) =>
                                                    c.toUpperCase(),
                                                )}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-8 flex justify-end gap-3 border-t border-border/50 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={closeModal}
                                    className="px-4"
                                >
                                    Close
                                </Button>

                                {/* Cancel inside view details: open cancel modal (not direct link) */}
                                {canCancel(selectedBooking.order_status) && (
                                    <Button
                                        variant="destructive"
                                        className="px-4"
                                        onClick={() => {
                                            openCancelModal(selectedBooking);
                                        }}
                                    >
                                        Cancel Booking
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {cancelModalOpen && bookingToCancel && (
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${isCancelClosing ? 'animate-out fade-out' : 'bg-highlight/2 backdrop-blur-sm'}`}
                    >
                        <div
                            className={`relative mx-4 w-full max-w-md transform rounded-xl border border-border bg-background p-6 shadow-2xl duration-500 ease-out ${isCancelClosing ? 'animate-out fade-out zoom-out' : 'animate-in fade-in zoom-in'}`}
                        >
                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-4 rounded-full p-2 transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-muted"
                                onClick={closeCancelModal}
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>

                            {/* Header */}
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    Confirm Cancellation
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    This action cannot be undone.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="mb-6 border-t border-border/50" />

                            {/* Details Grid */}
                            <div className="space-y-4">
                                {/* Services */}
                                <div className="flex items-start gap-3">
                                    <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Services
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {bookingToCancel.services}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Date */}
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Scheduled
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(
                                                bookingToCancel.order_date,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Total Amount */}
                                <div className="flex items-start gap-3 pt-2">
                                    <div className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            Total Amount
                                        </p>
                                        <p className="text-lg font-bold text-destructive">
                                            ₱
                                            {bookingToCancel.total_amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 flex justify-end gap-3 border-t border-border/50 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={closeCancelModal}
                                    className="px-4"
                                >
                                    No, Keep Booking
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmCancel}
                                    className="px-4"
                                >
                                    Yes, Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
