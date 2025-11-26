import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

axios.defaults.withCredentials = true;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Registry', href: '/registry' },
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
    employee_id?: number;
    user?: Customer;
    employee?: Employee;
    details?: ServiceOrderDetail[];
}

interface Bay {
    bay_id: number;
    bay_number: number;
    status: 'available' | 'occupied' | 'maintenance';
    bay_type: 'Normal' | 'Underwash';
    created_at?: string;
    updated_at?: string;
}

interface Employee {
    employee_id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
    status?: string;
    assigned_status?: string;
}

export default function Registry() {
    const [bays, setBays] = useState<Bay[]>([]);
    const [serviceOrders, setServiceOrders] = useState<
        Map<number, ServiceOrder>
    >(new Map());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [availableEmployees, setAvailableEmployees] = useState<Employee[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [selectedBayForService, setSelectedBayForService] =
        useState<Bay | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [selectedBayForReassignment, setSelectedBayForReassignment] =
        useState<number | null>(null);
    const [selectedReassignEmployeeId, setSelectedReassignEmployeeId] =
        useState<string>('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [todayBookings, setTodayBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        loadBays();
        loadServiceOrders();
        loadEmployees();

        // Refresh service orders every 3 seconds
        const interval = setInterval(() => {
            loadServiceOrders();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Filter employees to exclude those already assigned to active service orders
    useEffect(() => {
        const assignedEmployeeIds = new Set<number>();

        // Collect all employee IDs that are already assigned to active service orders
        serviceOrders.forEach((order) => {
            if (order.employee_id) {
                assignedEmployeeIds.add(order.employee_id);
            }
        });

        // Filter employees to only show those not assigned to any active service
        const filtered = employees.filter(
            (employee) => !assignedEmployeeIds.has(employee.employee_id),
        );

        setAvailableEmployees(filtered);
    }, [employees, serviceOrders]);

    const loadBays = async () => {
        try {
            const res = await axios.get('/api/bays/list');
            setBays(res.data);
        } catch (err) {
            console.error('Failed to fetch bays:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadServiceOrders = async () => {
        try {
            const res = await axios.get('/api/service-orders/active');
            console.log('Fetched service orders:', res.data);
            const ordersMap = new Map();

            // Create a map of bay_id to service order for quick lookup
            res.data.forEach((order: ServiceOrder) => {
                if (order.bay_id) {
                    ordersMap.set(order.bay_id, order);
                    console.log(
                        `Mapped order ${order.service_order_id} to bay ${order.bay_id}`,
                        'Order data:',
                        order,
                    );
                }
            });

            console.log('Service orders map:', ordersMap);
            setServiceOrders(ordersMap);
        } catch (err) {
            console.error('Failed to fetch service orders:', err);
        }
    };

    const loadEmployees = async () => {
        try {
            const res = await axios.get('/api/employees/active-available');
            setEmployees(res.data);
            setAvailableEmployees(res.data);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        }
    };

    const getOrderTotal = (order: ServiceOrder | undefined) => {
        if (!order?.details) return 0;
        return order.details.reduce((sum, detail) => {
            const price =
                typeof detail.service.price === 'string'
                    ? parseInt(detail.service.price)
                    : (detail.service.price as number);
            return sum + price;
        }, 0);
    };
    const handleStartService = async (bay: Bay) => {
        setSelectedBayForService(bay);
        setSelectedEmployeeId('');

        // Fetch today's pending bookings
        try {
            const res = await axios.get('/api/service-orders/today-bookings');
            console.log("Today's bookings response:", res.data);
            setTodayBookings(res.data || []);
            // Always show the modal, even if no bookings
            setShowBookingModal(true);
        } catch (err) {
            console.error("Failed to fetch today's bookings:", err);
            // Still show modal even on error, just with empty bookings
            setTodayBookings([]);
            setShowBookingModal(true);
        }
    };

    const handleSelectBooking = (booking: any) => {
        setSelectedBooking(booking);
        setShowBookingModal(false);
    };

    const handleProceedWithoutBooking = () => {
        setShowBookingModal(false);
        setSelectedBooking(null);
    };

    const handleProceedWithEmployee = async () => {
        if (!selectedBayForService || !selectedEmployeeId) {
            return;
        }

        const employee = employees.find(
            (e) => e.employee_id === parseInt(selectedEmployeeId),
        );

        if (employee) {
            // If a booking was selected, update it directly and assign to bay
            if (selectedBooking) {
                setIsAssigning(true);
                try {
                    // Convert service_ids string to array of numbers
                    let serviceIds: number[] = [];
                    if (typeof selectedBooking.service_ids === 'string') {
                        serviceIds = selectedBooking.service_ids
                            .split(',')
                            .map(Number);
                    } else if (Array.isArray(selectedBooking.service_ids)) {
                        serviceIds = selectedBooking.service_ids.map(Number);
                    }

                    console.log('Assigning reservation:', {
                        service_order_id: selectedBooking.service_order_id,
                        bay_id: selectedBayForService.bay_id,
                        employee_id: employee.employee_id,
                        service_ids: serviceIds,
                    });

                    // Update the service order with bay and employee assignment
                    const response = await axios.put(
                        `/service-orders/${selectedBooking.service_order_id}`,
                        {
                            bay_id: selectedBayForService.bay_id,
                            employee_id: employee.employee_id,
                            status: 'in_progress',
                            service_ids: serviceIds,
                        },
                    );

                    console.log(
                        'Reservation assigned successfully:',
                        response.data,
                    );

                    // Reset state immediately - BEFORE refreshing data
                    setSelectedBayForService(null);
                    setSelectedEmployeeId('');
                    setSelectedBooking(null);
                    setShowBookingModal(false);
                    setTodayBookings([]);

                    // Then refresh the registry data
                    await loadBays();
                    await loadServiceOrders();

                    setIsAssigning(false);
                } catch (error: unknown) {
                    setIsAssigning(false);
                    console.error('Failed to assign reservation:', error);
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : (
                                  error as {
                                      response?: {
                                          data?: { message?: string };
                                      };
                                  }
                              )?.response?.data?.message || 'Unknown error';
                    console.error(
                        'Error response:',
                        (error as { response?: { data?: unknown } })?.response
                            ?.data,
                    );
                    alert(`Failed to assign reservation: ${errorMessage}`);
                }
            } else {
                // No booking selected - proceed to service selection for walk-in
                const employeeData = JSON.stringify({
                    employee_id: employee.employee_id,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                });

                const url = `/registry/${selectedBayForService.bay_id}/select-services?employee=${encodeURIComponent(employeeData)}`;

                router.visit(url);
                setSelectedBayForService(null);
                setSelectedEmployeeId('');
                setSelectedBooking(null);
            }
        }
    };

    const handleEditService = (bayId: number) => {
        const order = serviceOrders.get(bayId);
        if (order) {
            const orderData = JSON.stringify({
                service_order_id: order.service_order_id,
                user_id: order.user_id,
                bay_id: order.bay_id,
                status: order.status,
                employee_id: order.employee_id,
                user: order.user,
                employee: order.employee,
                details: order.details,
            });

            router.visit(
                `/registry/${bayId}/select-services?order=${encodeURIComponent(orderData)}&editing=true`,
            );
        }
    };

    const handleFinish = (bayId: number) => {
        const order = serviceOrders.get(bayId);
        if (order) {
            // Serialize the order data to pass through route
            const orderData = JSON.stringify({
                service_order_id: order.service_order_id,
                user_id: order.user_id,
                bay_id: order.bay_id,
                status: order.status,
                user: order.user,
                details: order.details,
            });

            router.visit(
                `/registry/${bayId}/payment?order=${encodeURIComponent(orderData)}`,
            );
        }
    };

    const handleAssignEmployee = async (bayId: number) => {
        if (!selectedReassignEmployeeId) {
            return;
        }

        try {
            const order = serviceOrders.get(bayId);
            if (!order) return;

            await axios.put(
                `/service-orders/${order.service_order_id}/assign-employee`,
                { employee_id: parseInt(selectedReassignEmployeeId) },
            );

            // Reset state and reload
            setSelectedBayForReassignment(null);
            setSelectedReassignEmployeeId('');
            await loadServiceOrders();
            await loadEmployees();
        } catch (err) {
            console.error('Failed to assign employee:', err);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'available':
                return 'success';
            case 'occupied':
                return 'warning';
            case 'maintenance':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available':
                return 'Available';
            case 'occupied':
                return 'Occupied';
            case 'maintenance':
                return 'Under Maintenance';
            default:
                return status;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registry" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Registry
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and monitor bays for carwash services
                    </p>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Loading bays...
                    </div>
                ) : bays.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No bays found.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bays.map((bay) => {
                            const isAvailable = bay.status === 'available';
                            const isOccupied = bay.status === 'occupied';
                            const isMaintenance = bay.status === 'maintenance';

                            return (
                                <Card
                                    key={bay.bay_id}
                                    className={cn(
                                        'group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl',
                                        isAvailable &&
                                            'cursor-pointer border-green-200/50 bg-green-50/30 hover:border-green-300/70 dark:border-green-900/50 dark:bg-green-950/20 dark:hover:border-green-800/70',
                                        isOccupied &&
                                            'border-orange-200/50 bg-orange-50/40 dark:border-orange-900/50 dark:bg-orange-950/30',
                                        isMaintenance &&
                                            'border-red-200/50 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/30',
                                    )}
                                    onClick={() =>
                                        isAvailable && handleStartService(bay)
                                    }
                                >
                                    {/* Status accent border */}
                                    <div
                                        className={cn(
                                            'absolute inset-x-0 top-0 h-1 transition-all duration-500',
                                            isAvailable &&
                                                'bg-gradient-to-r from-green-400 to-emerald-500',
                                            isOccupied &&
                                                'bg-gradient-to-r from-orange-400 to-amber-500',
                                            isMaintenance &&
                                                'bg-gradient-to-r from-red-500 to-rose-600',
                                        )}
                                    />

                                    <CardContent className="px-10 py-5">
                                        <div className="mb-5 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                                    Bay #{bay.bay_number}
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {bay.bay_type ===
                                                    'Underwash'
                                                        ? 'Underwash Bay'
                                                        : 'Standard Bay'}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <Badge
                                                variant={getStatusVariant(
                                                    bay.status,
                                                )}
                                            >
                                                {getStatusLabel(bay.status)}
                                            </Badge>
                                        </div>

                                        {/* Service Order Details - Shown when occupied */}
                                        {bay.status === 'occupied' &&
                                            (() => {
                                                const order = serviceOrders.get(
                                                    bay.bay_id,
                                                );
                                                console.log(
                                                    `Bay ${bay.bay_id} order:`,
                                                    order,
                                                );
                                                if (!order) {
                                                    console.log(
                                                        `No order found for bay ${bay.bay_id}`,
                                                    );
                                                    return null;
                                                }
                                                const total =
                                                    getOrderTotal(order);

                                                return (
                                                    <div className="mt-4 space-y-3 text-sm">
                                                        {/* Customer Name */}
                                                        <div>
                                                            <p className="text-xs font-semibold text-muted-foreground">
                                                                Customer:
                                                            </p>
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    order.user
                                                                        ?.first_name
                                                                }{' '}
                                                                {
                                                                    order.user
                                                                        ?.last_name
                                                                }
                                                            </p>
                                                        </div>

                                                        {/* Services List */}
                                                        {order.details &&
                                                            order.details
                                                                .length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                                        Services:
                                                                    </p>
                                                                    <ul className="ml-4 space-y-1">
                                                                        {order.details.map(
                                                                            (
                                                                                detail,
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        detail.service_order_detail_id
                                                                                    }
                                                                                    className="list-disc text-foreground"
                                                                                >
                                                                                    {
                                                                                        detail
                                                                                            .service
                                                                                            .service_name
                                                                                    }
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                        {/* Total Amount */}
                                                        <div className="border-t border-border pt-2">
                                                            <p className="text-xs font-semibold text-muted-foreground">
                                                                Total Amount:
                                                            </p>
                                                            <p className="text-lg font-bold text-foreground">
                                                                ₱
                                                                {total.toLocaleString()}
                                                            </p>
                                                        </div>

                                                        {/* Assigned Employee */}
                                                        <div className="border-t border-border pt-2">
                                                            {selectedBayForReassignment ===
                                                            bay.bay_id ? (
                                                                <div className="space-y-2">
                                                                    <Label
                                                                        htmlFor={`reassign-employee-${bay.bay_id}`}
                                                                        className="text-xs font-semibold text-muted-foreground"
                                                                    >
                                                                        Reassign
                                                                        Employee:
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            selectedReassignEmployeeId
                                                                        }
                                                                        onValueChange={
                                                                            setSelectedReassignEmployeeId
                                                                        }
                                                                    >
                                                                        <SelectTrigger
                                                                            id={`reassign-employee-${bay.bay_id}`}
                                                                            className="h-9 text-sm"
                                                                        >
                                                                            <SelectValue placeholder="Choose an employee..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableEmployees.map(
                                                                                (
                                                                                    employee,
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            employee.employee_id
                                                                                        }
                                                                                        value={employee.employee_id.toString()}
                                                                                    >
                                                                                        {
                                                                                            employee.first_name
                                                                                        }{' '}
                                                                                        {
                                                                                            employee.last_name
                                                                                        }
                                                                                    </SelectItem>
                                                                                ),
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleAssignEmployee(
                                                                                    bay.bay_id,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                !selectedReassignEmployeeId
                                                                            }
                                                                            size="sm"
                                                                            className="flex-1"
                                                                        >
                                                                            Assign
                                                                        </Button>
                                                                        <Button
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.preventDefault();
                                                                                setSelectedBayForReassignment(
                                                                                    null,
                                                                                );
                                                                                setSelectedReassignEmployeeId(
                                                                                    '',
                                                                                );
                                                                            }}
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="flex-1"
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                                        Assigned
                                                                        Employee:
                                                                    </p>
                                                                    <div className="mt-1 flex items-center justify-between">
                                                                        <p className="font-medium text-foreground">
                                                                            {order.employee
                                                                                ? `${order.employee.first_name} ${order.employee.last_name}`
                                                                                : 'Not assigned'}
                                                                        </p>
                                                                        <Button
                                                                            onClick={() =>
                                                                                setSelectedBayForReassignment(
                                                                                    bay.bay_id,
                                                                                )
                                                                            }
                                                                            size="sm"
                                                                            variant="ghost"
                                                                        >
                                                                            Change
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                        {/* Action Buttons */}
                                        {isAvailable && (
                                            <>
                                                {selectedBayForService?.bay_id ===
                                                bay.bay_id ? (
                                                    <div className="mt-6 space-y-3">
                                                        <div>
                                                            <Label
                                                                htmlFor={`employee-${bay.bay_id}`}
                                                                className="mb-2 block text-sm font-medium text-foreground"
                                                            >
                                                                Select Employee
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    selectedEmployeeId
                                                                }
                                                                onValueChange={
                                                                    setSelectedEmployeeId
                                                                }
                                                            >
                                                                <SelectTrigger
                                                                    id={`employee-${bay.bay_id}`}
                                                                    className="h-11 text-foreground"
                                                                >
                                                                    <SelectValue placeholder="Choose an employee..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {availableEmployees.map(
                                                                        (
                                                                            employee,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    employee.employee_id
                                                                                }
                                                                                value={employee.employee_id.toString()}
                                                                            >
                                                                                {
                                                                                    employee.first_name
                                                                                }{' '}
                                                                                {
                                                                                    employee.last_name
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleProceedWithEmployee();
                                                                }}
                                                                disabled={
                                                                    !selectedEmployeeId ||
                                                                    isAssigning
                                                                }
                                                                variant="highlight"
                                                                className="flex-1 font-medium"
                                                            >
                                                                {isAssigning
                                                                    ? 'Assigning...'
                                                                    : 'Continue'}
                                                            </Button>
                                                            <Button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    setSelectedBayForService(
                                                                        null,
                                                                    );
                                                                    setSelectedEmployeeId(
                                                                        '',
                                                                    );
                                                                }}
                                                                type="button"
                                                                variant="outline"
                                                                className="flex-1 font-medium"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-6">
                                                        <Button
                                                            onClick={() =>
                                                                handleStartService(
                                                                    bay,
                                                                )
                                                            }
                                                            variant="highlight"
                                                            className="h-11 w-full font-medium"
                                                        >
                                                            Start Service
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {isOccupied && (
                                            <div className="mt-6 space-y-2">
                                                <Button
                                                    onClick={() =>
                                                        handleEditService(
                                                            bay.bay_id,
                                                        )
                                                    }
                                                    variant="outline"
                                                    className="h-11 w-full font-medium"
                                                >
                                                    Edit Service
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleFinish(bay.bay_id)
                                                    }
                                                    variant="highlight"
                                                    className="h-11 w-full font-medium"
                                                >
                                                    Finish Service
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Booking Selection Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-2xl transform rounded-xl border border-border bg-background p-6 shadow-2xl">
                        <h2 className="mb-4 text-2xl font-bold">
                            Today's Reservations
                        </h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Select a reservation to start, or proceed without
                            selecting to create a walk-in service.
                        </p>

                        <div className="custom-scrollbar mb-6 max-h-96 space-y-3 overflow-y-auto">
                            {todayBookings.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground">
                                        No reservations for today
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Click "Walk-in Service" to create a new
                                        order
                                    </p>
                                </div>
                            ) : (
                                todayBookings.map((booking) => (
                                    <button
                                        key={booking.service_order_id}
                                        onClick={() =>
                                            handleSelectBooking(booking)
                                        }
                                        className="w-full rounded-lg border border-border p-4 text-left transition-all hover:border-highlight hover:bg-accent/5"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">
                                                    {booking.customer_name}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {booking.services}
                                                </p>
                                                {booking.phone && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {booking.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-highlight">
                                                    ₱
                                                    {parseFloat(
                                                        booking.total,
                                                    ).toLocaleString()}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {new Date(
                                                        booking.order_date,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleProceedWithoutBooking}
                                variant="outline"
                                className="flex-1"
                            >
                                Walk-in Service
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setSelectedBayForService(null);
                                }}
                                variant="ghost"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
