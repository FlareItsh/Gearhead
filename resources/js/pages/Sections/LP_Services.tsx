import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { Car, Check, Droplets, Sparkles, Zap } from 'lucide-react';

export default function LP_Services() {
    const { auth } = usePage().props;

    const handleBookNow = () => {
        if (!auth?.user) {
            router.visit('/login?redirect=services-customer');
        } else {
            router.visit('/customer/services');
        }
    };

    return (
        <>
            {/* Header */}
            <div className="w-full py-10 text-center">
                <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
                    <span className="text-foreground">Our </span>
                    <span className="text-yellow-400 dark:text-highlight">
                        Services
                    </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Professional car wash packages tailored to your vehicle's
                    needs
                </p>
            </div>

            <div className="w-full text-center">
                <h3 className="mb-4 text-3xl font-semibold tracking-tight">
                    <span className="text-yellow-500 dark:text-highlight">
                        Essential{' '}
                    </span>
                    Services
                </h3>
            </div>

            {/* Cards */}
            <div className="w-full">
                <div className="flex flex-wrap justify-center gap-6 px-4 md:gap-8">
                    {[
                        {
                            title: 'Basic',
                            subtitle: 'Essential wash package',
                            icon: Droplets,
                            prices: [
                                { size: 'S', price: '₱130' },
                                { size: 'M', price: '₱150' },
                                { size: 'L', price: '₱200' },
                                { size: 'XL', price: '₱200' },
                                { size: 'XXL', price: '₱350' },
                            ],
                            features: [
                                'Body Wash',
                                'Vacuum',
                                'Tire Black',
                                'Blow Dry',
                            ],
                            popular: true,
                        },
                        {
                            title: 'Underwash',
                            subtitle: 'Complete undercarriage cleaning',
                            icon: Car,
                            prices: [
                                { size: 'S', price: '₱310' },
                                { size: 'M', price: '₱340' },
                                { size: 'L', price: '₱390' },
                                { size: 'XL', price: '₱500' },
                            ],
                            features: [
                                'Body Wash',
                                'Vacuum',
                                'Tire Black',
                                'Shiny Dry',
                                'Under Wash',
                            ],
                            popular: false,
                        },
                        {
                            title: 'Engine Wash',
                            subtitle: 'Engine Degreaser + Protection',
                            icon: Zap,
                            prices: [
                                { size: 'S', price: '₱280' },
                                { size: 'M', price: '₱330' },
                                { size: 'L', price: '₱350' },
                                { size: 'XL', price: '₱480' },
                                { size: 'XXL', price: '₱520' },
                            ],
                            features: [
                                'Body Wash',
                                'Vacuum',
                                'Tire Black',
                                'Blow Dry',
                                'Engine Wash',
                            ],
                            popular: false,
                        },
                        {
                            title: 'Hand Wax',
                            subtitle: 'Premium protection & shine',
                            icon: Sparkles,
                            prices: [
                                { size: 'S', price: '₱170' },
                                { size: 'M', price: '₱200' },
                                { size: 'L', price: '₱260' },
                                { size: 'XL', price: '₱350' },
                            ],
                            features: [
                                'Body Wash',
                                'Vacuum',
                                'Tire Black',
                                'Shiny Dry',
                                'Hand Wax',
                            ],
                            popular: false,
                        },
                    ].map((card, index) => {
                        const Icon = card.icon || Check;

                        return (
                            <div key={index} className="w-full max-w-xs">
                                <div className="hover:shadow-3xl flex h-full flex-col overflow-hidden rounded-3xl border border-transparent shadow-2xl backdrop-blur-xl transition-all hover:-translate-y-3 dark:border-highlight/30">
                                    {/* Most Popular Badge */}
                                    {card.popular && (
                                        <div className="bg-yellow-400 p-3 text-center text-sm font-bold text-black dark:bg-highlight dark:text-black">
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="px-6 pt-9 pb-7">
                                        <div className="flex flex-col items-start gap-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 shadow-lg ring-8 ring-background/50 dark:bg-highlight/10">
                                                <Icon
                                                    className="h-9 w-9 text-yellow-400 dark:text-highlight"
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-foreground">
                                                    {card.title}
                                                </h3>
                                                <p className="mt-1.5 text-sm text-muted-foreground">
                                                    {card.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="px-6 pb-7">
                                        <div className="flex flex-wrap justify-center gap-4">
                                            {card.prices.map((item) => (
                                                <div
                                                    key={item.size}
                                                    className="flex min-w-[92px] flex-col items-center justify-center rounded-2xl border border-border/40 bg-muted/5 px-5 py-5 shadow-lg backdrop-blur-sm transition-all hover:border-yellow-400/50 hover:bg-yellow-400/5 dark:hover:border-highlight/50 dark:hover:bg-highlight/5"
                                                >
                                                    <span className="text-lg font-medium text-muted-foreground">
                                                        {item.size}
                                                    </span>
                                                    <p className="mt-2 text-2xl font-bold text-yellow-400 dark:text-highlight">
                                                        {item.price}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 px-6 py-6">
                                        <div className="space-y-4">
                                            {card.features.map((feature) => (
                                                <div
                                                    key={feature}
                                                    className="flex items-center gap-4"
                                                >
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-yellow-400 bg-yellow-400/10 shadow-sm dark:border-highlight dark:bg-highlight/10">
                                                        <Check
                                                            className="h-4 w-4 text-yellow-400 dark:text-highlight"
                                                            strokeWidth={3}
                                                        />
                                                    </div>
                                                    <span className="text-foreground">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* BOOK NOW */}
                                    <div className="px-6 pt-4 pb-8">
                                        <Button
                                            onClick={handleBookNow}
                                            variant={
                                                card.popular
                                                    ? 'highlight'
                                                    : 'outline'
                                            }
                                            className={
                                                card.popular
                                                    ? 'w-full rounded-2xl bg-yellow-400 py-6 font-bold shadow-lg hover:bg-yellow-500 dark:bg-highlight dark:hover:bg-highlight/90'
                                                    : 'w-full rounded-2xl border-yellow-400 py-6 font-bold text-yellow-400 shadow-lg hover:bg-yellow-400/10 dark:border-highlight dark:text-highlight dark:hover:bg-highlight/10'
                                            }
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* VIEW ALL SERVICES */}
            <div className="flex w-full justify-center py-12">
                <Button
                    onClick={() => router.visit('/services')}
                    variant="highlight"
                    className="w-full max-w-xs rounded-2xl bg-yellow-400 py-6 text-base font-bold shadow-lg hover:bg-yellow-500 dark:bg-highlight dark:hover:bg-highlight/90"
                >
                    View All Services
                </Button>
            </div>
        </>
    );
}
