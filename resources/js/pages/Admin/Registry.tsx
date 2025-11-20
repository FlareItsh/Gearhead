import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Clock } from 'lucide-react';

const breadcrumbs = [{ title: 'Registry', href: '/registry' }];

// mock data
const bays = [
    {
        id: 1,
        status: 'in-use' as const,
        name: 'Kristine Hilarious',
        service: 'Armor All/All Purpose Dressing ~ S, W...',
        washer: 'Carl Salem',
        time: '35 min',
        price: 960,
    },
    {
        id: 2,
        status: 'in-use' as const,
        name: 'Kristine Hilarious',
        service: 'Buff Wax ~ BOTNY ~ M',
        washer: 'Carl Salem',
        time: '65 min',
        price: 520,
    },
    { id: 3, status: 'available' as const },
    {
        id: 4,
        status: 'in-use' as const,
        name: 'Carlo Bilbacua',
        service: 'Underwash ~ S',
        washer: 'Elena Del Rey',
        time: '40 min',
        price: 390,
    },
    { id: 5, status: 'available' as const },
    { id: 6, status: 'available' as const },
];

export default function Registry() {
    const handleFinish = (bayId: number) => {
        router.visit(`/registry/${bayId}/payment`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registry" />
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Registry
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and Add Bays for new Carwash slots
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {bays.map((bay) => (
                        <Card
                            key={bay.id}
                            className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white text-foreground shadow-sm transition-shadow hover:shadow-md dark:border-sidebar-border dark:bg-card dark:text-card-foreground"
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">
                                        Bay #{bay.id}
                                    </h3>
                                    <Badge
                                        className={`rounded-full border-0 px-3 py-1 font-semibold text-white ${
                                            bay.status === 'in-use'
                                                ? 'bg-red-500'
                                                : 'bg-emerald-500'
                                        }`}
                                    >
                                        {bay.status === 'in-use'
                                            ? 'In Use'
                                            : 'Available'}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {bay.status === 'available' ? (
                                    <div className="flex h-48 flex-col justify-between">
                                        <div />
                                        <div className="flex flex-1 items-center justify-center">
                                            <p className="text-sm text-muted-foreground">
                                                Ready for next service
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4 space-y-2 text-sm">
                                            <p>
                                                <span className="font-bold">
                                                    Name:
                                                </span>{' '}
                                                {bay.name}
                                            </p>
                                            <p>
                                                <span className="font-bold">
                                                    Service:
                                                </span>{' '}
                                                {bay.service}
                                            </p>
                                            <p>
                                                <span className="font-bold">
                                                    Washer:
                                                </span>{' '}
                                                {bay.washer}
                                            </p>
                                        </div>

                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-semibold">
                                                    {bay.time}
                                                </span>
                                            </div>
                                            <span className="text-xl font-bold">
                                                ₱{bay.price}
                                            </span>
                                        </div>

                                        <Button
                                            onClick={() => handleFinish(bay.id)}
                                            className="h-12 w-full rounded-lg bg-black font-medium text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/80"
                                        >
                                            Finish
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
