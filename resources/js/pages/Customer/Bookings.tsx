import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Bookings',
        href: '/bookings',
    },
];

export default function Bookings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto rounded-xl p-4">
                <Heading
                    title="My Bookings"
                    description="View and manage your appointments"
                />

                <div className="flex w-full gap-2 rounded-lg bg-secondary p-1.5">
                    <Link className="flex-1 rounded-md bg-highlight p-2 text-center text-black">
                        All
                    </Link>
                    <Link className="flex-1 rounded-md bg-tertiary p-2 text-center">
                        Upcoming
                    </Link>
                    <Link className="flex-1 rounded-md bg-tertiary p-2 text-center">
                        Completed
                    </Link>
                    <Link className="flex-1 rounded-md bg-tertiary p-2 text-center">
                        Cancelled
                    </Link>
                </div>

                {/*TODO Functionalities */}
                <div className="relative flex flex-col justify-between gap-2 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:h-auto dark:border-sidebar-border">
                    <div className="flex h-[18vh] flex-col justify-between">
                        <div className="flex justify-between text-lg">
                            <div className="flex items-center gap-2 font-medium">
                                <Clock />
                                Basic Wash - L
                            </div>
                            <div className="font-bold">₱520</div>
                        </div>
                        <div>{new Date().toLocaleString()}</div>
                        <div className="flex justify-between">
                            <div className="space-x-2">
                                <Link>
                                    <Button variant="outline">
                                        View Details
                                    </Button>
                                </Link>

                                <Link>
                                    <Button variant="destructive">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                            <div>
                                <Badge variant="warning">Pending</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* To Be Looped/Map */}
                <div className="relative flex flex-col justify-between gap-2 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:h-auto dark:border-sidebar-border">
                    <div className="flex h-[18vh] flex-col justify-between">
                        <div className="flex justify-between text-lg">
                            <div className="flex items-center gap-2 font-medium">
                                <Clock />
                                Basic Wash - L
                            </div>
                            <div className="font-bold">₱520</div>
                        </div>
                        <div>{new Date().toLocaleString()}</div>
                        <div className="flex justify-between">
                            <div className="space-x-2">
                                <Link>
                                    <Button variant="outline">
                                        View Details
                                    </Button>
                                </Link>

                                <Link>
                                    <Button variant="destructive">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                            <div>
                                <Badge variant="destructive">Cancelled</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* To Be Looped/Map */}
                <div className="relative flex flex-col justify-between gap-2 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:h-auto dark:border-sidebar-border">
                    <div className="flex h-[18vh] flex-col justify-between">
                        <div className="flex justify-between text-lg">
                            <div className="flex items-center gap-2 font-medium">
                                <Clock />
                                Basic Wash - L
                            </div>
                            <div className="font-bold">₱520</div>
                        </div>
                        <div>{new Date().toLocaleString()}</div>
                        <div className="flex justify-between">
                            <div className="space-x-2">
                                <Link>
                                    <Button variant="outline">
                                        View Details
                                    </Button>
                                </Link>

                                <Link>
                                    <Button variant="destructive">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                            <div>
                                <Badge variant="success">Completed</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* To Be Looped/Map */}
                <div className="relative flex flex-col justify-between gap-2 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:h-auto dark:border-sidebar-border">
                    <div className="flex h-[18vh] flex-col justify-between">
                        <div className="flex justify-between text-lg">
                            <div className="flex items-center gap-2 font-medium">
                                <Clock />
                                Basic Wash - L
                            </div>
                            <div className="font-bold">₱520</div>
                        </div>
                        <div>{new Date().toLocaleString()}</div>
                        <div className="flex justify-between">
                            <div className="space-x-2">
                                <Link>
                                    <Button variant="outline">
                                        View Details
                                    </Button>
                                </Link>

                                <Link>
                                    <Button variant="destructive">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                            <div>
                                <Badge variant="info">Confirmed</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
