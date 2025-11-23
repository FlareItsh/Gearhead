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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBays();
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

    const handleStartService = (bay: Bay) => {
        router.visit(`/registry/${bay.bay_id}/select-services`);
    };

    const handleFinish = (bayId: number) => {
        router.visit(`/registry/${bayId}/payment`, {
            preserveState: true,
            preserveScroll: true,
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
