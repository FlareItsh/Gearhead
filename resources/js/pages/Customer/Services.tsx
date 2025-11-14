import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Clock } from 'lucide-react';

const breadcrumbs = [{ title: 'Services', href: '/services' }];

interface Service {
    service_name: string;
    description: string;
    estimated_duration: number;
    price: number;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Services & Pricing"
                    description="Explore our Gearhead Carwash services"
                />

                {/* Category Buttons */}
                <div className="custom-scrollbar flex w-full gap-4 overflow-x-auto">
                    <Link href="/services">
                        <Button
                            className="text-lg"
                            variant={
                                selectedCategory === 'All'
                                    ? 'highlight'
                                    : 'default'
                            }
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
                                    className="text-lg"
                                    variant={isActive ? 'highlight' : 'default'}
                                >
                                    {cat}
                                </Button>
                            </Link>
                        );
                    })}
                </div>

                {/* Services List */}
                <div className="p-2">
                    <h4 className="mb-2 text-2xl font-bold">
                        Services - {selectedCategory}
                    </h4>

                    <div className="custom-scrollbar h-[60vh] overflow-y-auto">
                        {services.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-4">
                                {services.map((s, i) => (
                                    <div
                                        key={i}
                                        className="flex w-sm flex-col justify-between gap-5 rounded-sm border p-4"
                                    >
                                        <HeadingSmall
                                            title={`${s.service_name} - ${s.size.charAt(0).toUpperCase()}`}
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
                                                    {s.estimated_duration} mins
                                                </span>
                                            </div>
                                            <p className="font-bold">
                                                ₱{s.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <hr className="border-gray-400/50" />
                                        <div className="flex flex-col">
                                            <span>Car Size: {s.size}</span>
                                        </div>
                                        <Link className="flex w-full">
                                            <Button
                                                variant="highlight"
                                                className="w-full"
                                            >
                                                Select
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No services available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
