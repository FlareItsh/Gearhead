import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    user?: Customer;
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

export default function Registry() {
    const [bays, setBays] = useState<Bay[]>([]);
    const [serviceOrders, setServiceOrders] = useState<
        Map<number, ServiceOrder>
    >(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBays();
        loadServiceOrders();
    }, []);

    const loadBays = async () => {
        try {
            const res = await axios.get('/bays/list');
            setBays(res.data);
        } catch (err) {
            console.error('Failed to fetch bays:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadServiceOrders = async () => {
        try {
            const res = await axios.get('/service-orders/pending');
            const ordersMap = new Map();

            // Create a map of bay_id to service order for quick lookup
            res.data.forEach((order: ServiceOrder) => {
                if (order.bay_id) {
                    ordersMap.set(order.bay_id, order);
                }
            });

            setServiceOrders(ordersMap);
        } catch (err) {
            console.error('Failed to fetch service orders:', err);
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
    const handleStartService = (bay: Bay) => {
        router.visit(`/registry/${bay.bay_id}/select-services`);
    };

    const handleFinish = (bayId: number) => {
        router.visit(`/registry/${bayId}/payment`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reload bays and service orders after navigation
                loadBays();
                loadServiceOrders();
            },
        });
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
                                                if (!order) return null;
                                                const total =
                                                    getOrderTotal(order);

                                                return (
                                                    <div className="mt-4 space-y-2 text-sm">
                                                        {/* Customer Name */}
                                                        <div>
                                                            <p className="text-xs font-semibold text-muted-foreground">
                                                                Name:
                                                            </p>
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    order
                                                                        .user
                                                                        ?.first_name
                                                                }{' '}
                                                                {
                                                                    order
                                                                        .user
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
                                                                        Service:
                                                                    </p>
                                                                    <div className="ml-4 space-y-1">
                                                                        {order.details.map(
                                                                            (
                                                                                detail,
                                                                            ) => (
                                                                                <p
                                                                                    key={
                                                                                        detail.service_order_detail_id
                                                                                    }
                                                                                    className="text-foreground"
                                                                                >
                                                                                    -
                                                                                    {
                                                                                        detail
                                                                                            .service
                                                                                            .service_name
                                                                                    }
                                                                                </p>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* Total Amount */}
                                                        <div className="border-t border-border pt-2">
                                                            <p className="text-xs font-semibold text-muted-foreground">
                                                                Total Amount:
                                                            </p>
                                                            <p className="font-bold text-foreground">
                                                                ₱
                                                                {total.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                        {/* Action Buttons */}
                                        {isAvailable && (
                                            <div className="mt-6">
                                                <Button
                                                    onClick={() =>
                                                        handleStartService(bay)
                                                    }
                                                    variant="highlight"
                                                    className="h-11 w-full font-medium"
                                                >
                                                    Start Service
                                                </Button>
                                            </div>
                                        )}
                                        {!isAvailable && (
                                            <div className="mt-6">
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
        </AppLayout>
    );
}
