import { Card, CardContent } from '@/components/ui/card';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/* ============================
   COUNT UP ANIMATION
============================ */
function CountUp({ end, duration = 1500 }: { end: string; duration?: number }) {
    const [count, setCount] = useState('0');
    const ref = useRef<HTMLSpanElement | null>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;

                    let start = 0;
                    const total = parseFloat(end.replace(/[^0-9.]/g, '')) || 0;
                    const suffix = end.replace(/[0-9.]/g, '');
                    const increment = total / (duration / 16);

                    const animate = () => {
                        start += increment;
                        if (start < total) {
                            setCount(Math.floor(start) + suffix);
                            requestAnimationFrame(animate);
                        } else {
                            setCount(end);
                        }
                    };

                    animate();
                }
            },
            { threshold: 0.4 },
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={ref}>{count}</span>;
}

/* ============================
   MOCK STATS
============================ */
const stats = [
    { value: '3+', label: 'Years', desc: 'Trusted car care and innovation.' },
    {
        value: '1k+',
        label: 'Happy Customers',
        highlight: true,
        desc: 'Who trust our quality service.',
    },
    {
        value: '1.2k+',
        label: 'Vehicles',
        desc: 'Washed monthly through automated booking.',
    },
];

export default function HeroSection() {
    const { auth } = usePage().props;
    const brands = [
        'Toyota',
        'Ford',
        'Honda',
        'Mitsubishi',
        'Kia',
        'BYD',
        'Tesla',
        'Porsche',
    ];

    // smooth scroll to LP services
    const scrollToServices = () => {
        const el = document.getElementById('lp_services');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else {
            // go to /#lp_services
            window.location.hash = '#lp_services';
        }
    };

    const handleBookNow = () => {
        if (!auth?.user) {
            router.visit('/login?redirect=services-customer');
        } else {
            router.visit('/customer/services');
        }
    };

    // handle deep link if page opened with hash
    useEffect(() => {
        if (window.location.hash === '#lp_services') {
            const el = document.getElementById('lp_services');
            if (el)
                setTimeout(
                    () => el.scrollIntoView({ behavior: 'smooth' }),
                    200,
                );
        }
    }, []);

    return (
        <section className="relative w-full overflow-hidden bg-background text-foreground">
            {/* CAR IMAGE (TOP • RIGHT • FULL SCREEN) */}
            <div className="pointer-events-none absolute top-0 right-0 z-0 flex h-screen w-auto items-start justify-end">
                <img
                    src="/hero-car.png" /* change path if needed */
                    alt="Hero Car"
                    className="h-screen w-auto object-contain object-right-top"
                />
            </div>

            {/* HERO CONTENT */}
            <div className="relative z-20 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-2 lg:py-32">
                {/* LEFT TEXT */}
                <div className="flex flex-col justify-center space-y-6">
                    <h1 className="text-5xl leading-tight font-medium lg:text-6xl">
                        Bringing Your Car's <br />
                        <span className="text-highlight dark:text-[#FFD600]">
                            Shine
                        </span>{' '}
                        Back to Life
                    </h1>

                    <p className="max-w-md leading-relaxed text-muted-foreground">
                        Experience the ultimate car care with Gearhead Carwash.
                        Professional service, cutting-edge technology, and
                        unmatched attention to detail.
                    </p>

                    <div className="flex items-center gap-6 pt-2">
                        <button
                            onClick={handleBookNow}
                            className="rounded-lg bg-highlight px-6 py-4 text-base font-bold text-highlight-foreground hover:opacity-90 dark:bg-[#FFD600] dark:text-black"
                        >
                            Book Now
                        </button>

                        <button
                            onClick={scrollToServices}
                            className="text-base font-bold underline-offset-4 hover:underline"
                        >
                            View Services
                        </button>
                    </div>

                    {/* STATS */}
                    <div className="mt-10 grid grid-cols-3 gap-8">
                        {stats.map((item, index) => (
                            <Card
                                key={index}
                                className="border-0 bg-transparent shadow-none"
                            >
                                <CardContent className="p-0">
                                    <p className="text-3xl font-bold text-foreground">
                                        {item.highlight ? (
                                            <span className="text-highlight dark:text-[#FFD600]">
                                                <CountUp end={item.value} />
                                            </span>
                                        ) : (
                                            <CountUp end={item.value} />
                                        )}
                                    </p>

                                    <p className="text-sm font-semibold text-foreground">
                                        {item.label === 'Happy Customers' ? (
                                            <>
                                                <span className="text-highlight dark:text-[#FFD600]">
                                                    Happy
                                                </span>{' '}
                                                Customers
                                            </>
                                        ) : (
                                            item.label
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {item.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* BRANDS MARQUEE */}
            <div className="relative z-20 w-full overflow-hidden border-t border-border bg-muted py-6 dark:border-[#222] dark:bg-[#111]">
                <div
                    className="flex gap-16 whitespace-nowrap"
                    style={{ animation: 'scroll 30s linear infinite' }}
                >
                    {brands.map((brand, i) => (
                        <img
                            key={i}
                            src={`/${brand}.png`}
                            className="h-6 dark:invert"
                            alt={`${brand} logo`}
                        />
                    ))}
                    {brands.map((brand, i) => (
                        <img
                            key={i + 100}
                            src={`/${brand}.png`}
                            className="h-6 dark:invert"
                            alt={`${brand} logo`}
                        />
                    ))}
                </div>

                <style>{`
                    @keyframes scroll {
                        0% { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                `}</style>
            </div>
        </section>
    );
}
