import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import ServiceCardList from '@/components/ui/service-card-list';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Services',
        href: '/services',
    },
];

export default function Services() {
    const pageProps = usePage().props as unknown as {
        categories?: string[];
        services?: Array<Record<string, unknown>>;
        selectedCategory?: string;
    };

    const categories = pageProps.categories ?? [];
    const selectedCategory = pageProps.selectedCategory ?? 'Choose a category';
    const services = pageProps.services ?? [];

    // Map unknown records to typed Service array
    const mappedServices = services.map((s) => ({
        service_name: String(s.service_name ?? ''),
        description: String(s.description ?? ''),
        estimated_duration: Number(s.estimated_duration ?? 0),
        price: Number(s.price ?? 0),
        size: String(s.size ?? ''),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Services & Pricing"
                    description="Explore our Gearhead Carwash services"
                />

                {/* Category Buttons */}
                <div className="flex w-full gap-4 overflow-x-auto">
                    {categories.length > 0 ? (
                        categories.map((cat) => {
                            const isActive = cat === selectedCategory;
                            const href = `/services?category=${encodeURIComponent(cat)}`;

                            return (
                                <div key={cat}>
                                    <Link href={href}>
                                        <Button
                                            className="text-lg"
                                            variant={
                                                isActive
                                                    ? 'highlight'
                                                    : 'default'
                                            }
                                            aria-current={
                                                isActive ? 'true' : undefined
                                            }
                                        >
                                            {cat}
                                        </Button>
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-muted-foreground">
                            No service categories available.
                        </p>
                    )}
                </div>

                {/* Services List */}
                <div className="p-2">
                    <h4 className="mb-2 text-2xl font-bold">
                        Services - {selectedCategory}
                    </h4>

                    {mappedServices.length > 0 ? (
                        <ServiceCardList services={mappedServices} />
                    ) : (
                        <p className="text-muted-foreground">
                            No services available.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
