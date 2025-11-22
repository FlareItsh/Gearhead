import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ChevronDown, Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const breadcrumbs = [{ title: 'Services', href: '/services' }];

interface Service {
    service_id?: number;
    service_name: string;
    description: string;
    estimated_duration: number;
    price: number | string;
    size: string;
    category?: string;
}

export default function Services() {
    const pageProps = usePage().props as unknown as {
        services?: Service[];
        categories?: string[];
        selectedCategory?: string;
    };

    const services = pageProps.services ?? [];
    const categories = pageProps.categories ?? [];
    const selectedCategory = pageProps.selectedCategory ?? 'All';

    // State
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [isBooking, setIsBooking] = useState(false);
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(
        'bottom',
    );
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load/save cart
    useEffect(() => {
        const saved = localStorage.getItem('selectedServices');
        if (saved) {
            try {
                setSelectedServices(JSON.parse(saved));
            } catch {
                localStorage.removeItem('selectedServices');
            }
        }
    }, []);

    // Handle dropdown position
    useEffect(() => {
        if (isTimeDropdownOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // If less than 300px space below and more space above, position to top
            if (spaceBelow < 300 && spaceAbove > 300) {
                setDropdownPosition('top');
            } else {
                setDropdownPosition('bottom');
            }
        }
    }, [isTimeDropdownOpen]);

    useEffect(() => {
        if (selectedServices.length > 0) {
            localStorage.setItem(
                'selectedServices',
                JSON.stringify(selectedServices),
            );
        } else {
            localStorage.removeItem('selectedServices');
        }
    }, [selectedServices]);

    const toggleService = (service: Service) => {
        setSelectedServices((prev) => {
            const exists = prev.some(
                (s) =>
                    s.service_id === service.service_id &&
                    s.service_name === service.service_name &&
                    s.size === service.size,
            );
            if (exists) {
                return prev.filter(
                    (s) =>
                        !(
                            s.service_id === service.service_id &&
                            s.service_name === service.service_name &&
                            s.size === service.size
                        ),
                );
            }
            return [...prev, service];
        });
    };

    const removeService = (service: Service) => {
        setSelectedServices((prev) =>
            prev.filter(
                (s) =>
                    !(
                        s.service_id === service.service_id &&
                        s.service_name === service.service_name &&
                        s.size === service.size
                    ),
            ),
        );
    };

    const totalPrice = selectedServices.reduce(
        (sum, s) => sum + Number(s.price),
        0,
    );

    const isSelected = (service: Service) =>
        selectedServices.some(
            (s) =>
                s.service_id === service.service_id &&
                s.service_name === service.service_name &&
                s.size === service.size,
        );

    // Sort services by category and size
    const sortedServices = useMemo(() => {
        return [...services].sort((a, b) => {
            // Size order mapping: Small < Medium < Large < X-Large < XX-Large
            const sizeOrder: Record<string, number> = {
                Small: 1,
                Medium: 2,
                Large: 3,
                'X-Large': 4,
                'XX-Large': 5,
            };

            // First sort by category alphabetically
            const categoryCompare = (a.category || '').localeCompare(
                b.category || '',
            );
            if (categoryCompare !== 0) {
                return categoryCompare;
            }

            // Then sort by size order
            const sizeA = sizeOrder[a.size] || 999;
            const sizeB = sizeOrder[b.size] || 999;
            return sizeA - sizeB;
        });
    }, [services]);

    // ─────────────────────────────────────────────────────────────
    // SMART TIME SLOT GENERATOR (Current time + 1 hour)
    // ─────────────────────────────────────────────
    const availableTimeSlots = useMemo(() => {
        const now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();

        // Start at 6:30 AM earliest
        const startHour = 6;
        const startMinute = 30;

        // If current time is before 6:30 AM, start at 6:30 AM
        if (hour < startHour || (hour === startHour && minute < startMinute)) {
            hour = startHour;
            minute = startMinute;
        } else {
            // Round up to next 30-min slot
            if (minute > 0) {
                minute = minute < 30 ? 30 : 60;
            }
            if (minute === 60) {
                hour += 1;
                minute = 0;
            }

            // Add 1-hour buffer
            hour += 1;
        }

        const slots: string[] = [];

        // Generate slots from start time until 10:00 PM
        while (hour < 22 || (hour === 22 && minute === 0)) {
            const isPM = hour >= 12;
            const displayHour = hour % 12 === 0 ? 12 : hour % 12;
            const period = isPM ? 'PM' : 'AM';
            const timeStr = `${displayHour}:${minute === 0 ? '00' : '30'} ${period}`;

            slots.push(timeStr);

            // Next 30-min
            minute += 30;
            if (minute >= 60) {
                minute = 0;
                hour += 1;
            }

            // Stop at 10:00 PM
            if (hour > 22) break;
        }

        return slots;
    }, []);

    const handleBook = async () => {
        if (!selectedTime || selectedServices.length === 0) {
            alert('Please select a time and at least one service');
            return;
        }

        setIsBooking(true);
        try {
            // Get service_ids from selectedServices
            // Try to use service_id if available, otherwise find it from the services array
            const serviceIds = selectedServices
                .map((selected) => {
                    // If service_id is already in the selected service object, use it
                    if ('service_id' in selected && selected.service_id) {
                        return selected.service_id;
                    }
                    // Otherwise find it from the services array
                    const foundService = services.find(
                        (s) =>
                            s.service_name === selected.service_name &&
                            s.size === selected.size,
                    );
                    return foundService?.service_id ?? null;
                })
                .filter((id): id is number => id !== null);

            console.log('Selected services count:', selectedServices.length);
            console.log('Service IDs to send:', serviceIds);

            if (serviceIds.length === 0) {
                alert('Could not find service IDs. Please try again.');
                setIsBooking(false);
                return;
            }

            if (serviceIds.length !== selectedServices.length) {
                console.warn(
                    `Only ${serviceIds.length} out of ${selectedServices.length} services were found`,
                );
            }

            // Convert time string to date format
            // selectedTime is like "3:00 PM", we need "2025-11-20 15:00"
            const today = new Date();
            const [timeStr, period] = selectedTime.split(' ');
            const [hourStr, minuteStr] = timeStr.split(':');
            let hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);

            if (period === 'PM' && hour !== 12) {
                hour += 12;
            } else if (period === 'AM' && hour === 12) {
                hour = 0;
            }

            today.setHours(hour, minute, 0, 0);

            // Format as YYYY-MM-DD HH:MM using local time, not UTC
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const date = String(today.getDate()).padStart(2, '0');
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');
            const orderDate = `${year}-${month}-${date} ${hours}:${minutes}`;

            console.log('Sending booking with order_date:', orderDate);
            console.log('Sending booking with service_ids:', serviceIds);

            const response = await axios.post('/bookings/book', {
                order_date: orderDate,
                service_ids: serviceIds,
            });

            // Success - clear selections and close modal
            setSelectedServices([]);
            localStorage.removeItem('selectedServices');
            setIsModalOpen(false);
            setSelectedTime('');

            alert('Booking confirmed! Your reservation has been created.');
            console.log('Booking response:', response.data);
        } catch (error) {
            console.error('Booking error:', error);
            if (axios.isAxiosError(error) && error.response) {
                alert(
                    `Booking failed: ${error.response.data?.message || 'Unknown error'}`,
                );
            } else {
                alert('Booking failed. Please try again.');
            }
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />

            {/* Main Content (unchanged) */}
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Services & Pricing"
                    description="Explore our Gearhead Carwash services"
                />

                {/* Category Buttons */}
                <div className="custom-scrollbar flex w-full gap-4 overflow-x-auto">
                    <Link href="/services">
                        <Button
                            variant={
                                selectedCategory === 'All'
                                    ? 'highlight'
                                    : 'default'
                            }
                            className="text-lg"
                        >
                            All
                        </Button>
                    </Link>
                    {categories.map((cat) => {
                        const isActive = cat === selectedCategory;
                        const href = `/services?category=${encodeURIComponent(cat)}`;
                        return (
                            <Link key={cat} href={href}>
                                <Button
                                    variant={isActive ? 'highlight' : 'default'}
                                    className="text-lg"
                                >
                                    {cat}
                                </Button>
                            </Link>
                        );
                    })}
                </div>

                {/* Services Grid */}
                <div className="p-2">
                    <h4 className="mb-2 text-2xl font-bold">
                        Services - {selectedCategory}
                    </h4>
                    <div className="custom-scrollbar h-[60vh] overflow-y-auto">
                        {services.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-4">
                                {sortedServices.map((s, i) => {
                                    const active = isSelected(s);
                                    return (
                                        <div
                                            key={i}
                                            className="flex w-sm flex-col justify-between gap-5 rounded-sm border p-4"
                                        >
                                            <HeadingSmall
                                                title={`${s.service_name}`}
                                                description={s.description
                                                    .replace(/,\s*/g, ', ')
                                                    .split(', ')
                                                    .map(
                                                        (w) =>
                                                            w
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            w
                                                                .slice(1)
                                                                .toLowerCase(),
                                                    )
                                                    .join(', ')}
                                            />
                                            <div className="flex justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                                                        {s.estimated_duration}{' '}
                                                        mins
                                                    </span>
                                                </div>
                                                <p className="font-bold">
                                                    ₱
                                                    {Number(
                                                        s.price,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                            <hr className="border-gray-400/50" />
                                            <span>
                                                Car Size:{' '}
                                                <strong>{s.size}</strong>
                                            </span>

                                            <Button
                                                variant={
                                                    active
                                                        ? 'outline'
                                                        : 'highlight'
                                                }
                                                className="mt-4 w-full"
                                                onClick={() => toggleService(s)}
                                            >
                                                {active ? 'Selected' : 'Select'}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No services available.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Footer */}
            {selectedServices.length > 0 && (
                <div className="absolute right-0 bottom-1 left-0 mx-auto my-4 flex w-md max-w-lg items-center justify-between rounded-lg border border-border/20 bg-highlight p-3 shadow-2xl">
                    <div className="flex items-center gap-5">
                        <div className="relative h-7 w-7 rounded-full bg-primary">
                            <span className="absolute inset-0 flex items-center justify-center text-lg font-medium text-white">
                                {selectedServices.length}
                            </span>
                        </div>
                        <div>
                            <span className="text-primary/70">
                                Total amount:
                            </span>{' '}
                            <strong className="text-primary">
                                ₱{totalPrice.toLocaleString()}
                            </strong>
                        </div>
                    </div>
                    <Button
                        variant="default"
                        onClick={() => setIsModalOpen(true)}
                    >
                        View Selected Services
                    </Button>
                </div>
            )}

            {/* MODAL WITH SMART TIME PICKER */}
            {isModalOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-end justify-center p-4 pb-8 sm:items-center">
                        <div
                            className="pointer-events-auto w-full max-w-lg rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl duration-300 animate-in fade-in slide-in-from-bottom-12 zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
                                <h2 className="text-xl font-bold">
                                    Selected Services{' '}
                                    <span className="text-yellow-600">
                                        ({selectedServices.length})
                                    </span>
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg p-1.5 transition hover:bg-muted/70"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Services List */}
                            <div className="custom-scrollbar max-h-[40vh] space-y-3 overflow-y-auto px-5 py-4">
                                {selectedServices.map((s) => (
                                    <div
                                        key={`${s.service_name}-${s.size}`}
                                        className="flex items-center justify-between rounded-xl border border-border/40 p-4 shadow-sm"
                                    >
                                        <div className="flex-1 pr-3">
                                            <p className="font-semibold text-foreground">
                                                {s.service_name}{' '}
                                                <span className="text-sm text-muted-foreground">
                                                    ({s.size})
                                                </span>
                                            </p>
                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                {s.estimated_duration} mins
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold">
                                                ₱
                                                {Number(
                                                    s.price,
                                                ).toLocaleString()}
                                            </span>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeService(s)}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Smart Time Picker + Total */}
                            <div className="space-y-5 border-t border-border/30 bg-muted/20 px-5 py-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Preferred Time{' '}
                                        <span className="text-muted-foreground">
                                            (Next Available)
                                        </span>
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsTimeDropdownOpen(
                                                    !isTimeDropdownOpen,
                                                )
                                            }
                                            className={`w-full rounded-lg border bg-background px-4 py-4 pr-12 text-base font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none ${
                                                selectedTime
                                                    ? 'border-primary/70 bg-primary/5'
                                                    : 'border-border hover:border-primary/40'
                                            }`}
                                        >
                                            {selectedTime
                                                ? selectedTime
                                                : 'Choose available time...'}
                                        </button>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                            <ChevronDown
                                                className={`h-5 w-5 text-muted-foreground transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </div>

                                        {isTimeDropdownOpen && (
                                            <div
                                                className={`custom-scrollbar absolute right-0 left-0 z-50 max-h-64 overflow-y-auto rounded-lg border border-border bg-background shadow-lg ${
                                                    dropdownPosition === 'top'
                                                        ? 'bottom-full mb-2'
                                                        : 'top-full mt-2'
                                                }`}
                                            >
                                                {availableTimeSlots.length >
                                                0 ? (
                                                    availableTimeSlots.map(
                                                        (time) => (
                                                            <button
                                                                key={time}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTime(
                                                                        time,
                                                                    );
                                                                    setIsTimeDropdownOpen(
                                                                        false,
                                                                    );
                                                                }}
                                                                className={`block w-full px-4 py-3 text-left transition-colors hover:bg-primary/10 ${
                                                                    selectedTime ===
                                                                    time
                                                                        ? 'bg-primary/20 font-semibold text-primary'
                                                                        : 'text-foreground'
                                                                }`}
                                                            >
                                                                {time}{' '}
                                                                {time ===
                                                                    availableTimeSlots[0] &&
                                                                    '(Earliest available)'}
                                                            </button>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                                                        No available times
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {selectedTime && (
                                        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Booking scheduled for{' '}
                                            <strong>{selectedTime}</strong>
                                        </p>
                                    )}
                                    {availableTimeSlots.length === 0 && (
                                        <p className="mt-3 text-sm font-medium text-orange-600">
                                            Gearhead is closed. Please come back
                                            tomorrow!
                                        </p>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-muted-foreground">
                                        Total
                                    </span>
                                    <span className="text-2xl font-bold text-primary">
                                        ₱{totalPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 border-t border-border/30 bg-background/80 px-5 py-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1"
                                >
                                    Continue Selecting
                                </Button>
                                <Button
                                    size="lg"
                                    variant="highlight"
                                    className="flex-1 font-bold"
                                    disabled={
                                        selectedServices.length === 0 ||
                                        !selectedTime ||
                                        isBooking
                                    }
                                    onClick={handleBook}
                                >
                                    {isBooking
                                        ? 'Booking...'
                                        : selectedTime
                                          ? `Book at ${selectedTime}`
                                          : 'Proceed to Booking'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
