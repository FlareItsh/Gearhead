import { FaQuoteRight, FaStar } from 'react-icons/fa';

export default function Review() {
    const reviews = [
        {
            name: 'Maria Santos',
            initials: 'MS',
            comment:
                'Grabe ka satisfied ko sa service sa Gearhead! Murag bag-o na pud akong sakyanan after every visit. Highly recommended jud!',
        },
        {
            name: 'Juan Dela Cruz',
            initials: 'JDC',
            comment:
                'Pinakabest na carwash dinhi sa amo! Kaayo kamaayo ug professional ang staff ug makita nila tanan detalye. Sulit kaayo!',
        },
        {
            name: 'Angela Reyes',
            initials: 'AR',
            comment:
                'Ganahan kaayo ko sa ilang pag-atiman sa akong sakyanan! Ang interior cleaning kay top-notch jud. Mobalik jud ko dinhi!',
        },
        {
            name: 'Marco Villanueva',
            initials: 'MV',
            comment:
                'Dili jud ko madisappoint sa Gearhead! Paspas ang service pero quality gihapon. Every weekend na lang ko nag-pahugas dinhi.',
        },
        {
            name: 'Sofia Fernandez',
            initials: 'SF',
            comment:
                'Amazing kaayo ang service! Ang mga spots nga wala nako mamatikdi, nalimpyo nila tanan. Buotan pa kaayo ang staff!',
        },
    ];

    const reviews2 = [
        {
            name: 'Carlos Mendoza',
            initials: 'CM',
            comment:
                'Grabe ang transformation sa akong hugaw nga sakyanan, murag showroom na! Excellent kaayo ang detailing work nila.',
        },
        {
            name: 'Isabel Garcia',
            initials: 'IG',
            comment:
                'Ang presyo kay barato ra pero premium quality ang service! Ang team kay accommodating ug professional kaayo!',
        },
        {
            name: 'Rafael Torres',
            initials: 'RT',
            comment:
                'Daghan nako natry nga carwash pero Gearhead jud ang pinakanindot! Kabalo jud kaayo sila sa ilang trabaho.',
        },
        {
            name: 'Kristina Lopez',
            initials: 'KL',
            comment:
                'Limpyo kaayo ang facilities ug friendly ang staff! Wala pa jud koy nakit-an nga ing-ani ka nindot akong sakyanan. Salamat Gearhead!',
        },
        {
            name: 'Kristine Hilarious',
            initials: 'KH',
            comment:
                'First time nako dinhi pero sobra kaayo ko satisfied! Paspas, limpyo, ug barato pa. Highly recommended jud ni!',
        },
    ];

    const ReviewCard = ({ review }: { review: any }) => (
        <div className="mx-auto max-w-sm min-w-[320px] flex-shrink-0 rounded-2xl border border-border p-5 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="h-4 w-4 text-yellow-400" />
                    ))}
                </div>
                <FaQuoteRight className="h-6 w-6 text-foreground" />
            </div>

            <p className="mb-5 text-sm leading-relaxed text-foreground">
                {review.comment}
            </p>

            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground dark:bg-highlight/20 dark:text-highlight">
                    {review.initials}
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-foreground">
                        {review.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Verified Customer
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <section id="review" className="overflow-hidden bg-background py-16">
            <div className="mb-12 w-full text-center">
                <h1 className="mb-4 text-5xl font-bold tracking-tight">
                    <span className="text-foreground">What Our </span>
                    <span className="text-yellow-400 dark:text-highlight">
                        Customers Say
                    </span>
                </h1>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                    Don't just take our word for it, hear from satisfied car
                    owners
                </p>
            </div>

            {/* Seamless Infinite Scroll Styles */}
            <style>{`
                .carousel-track {
                    display: flex;
                    gap: 1.25rem;
                    width: fit-content;
                }

                .carousel-track-left {
                    animation: scroll-left 60s linear infinite;
                }

                .carousel-track-right {
                    animation: scroll-right 60s linear infinite;
                }

                @keyframes scroll-left {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }

                @keyframes scroll-right {
                    from {
                        transform: translateX(-50%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                .carousel-container:hover .carousel-track-left,
                .carousel-container:hover .carousel-track-right {
                    animation-play-state: paused;
                }
            `}</style>

            {/* Row 1 - Scrolling Left */}
            <div className="carousel-container">
                <div className="carousel-track carousel-track-left">
                    {[...reviews, ...reviews].map((review, index) => (
                        <ReviewCard key={`left-${index}`} review={review} />
                    ))}
                </div>
            </div>

            {/* Row 2 - Scrolling Right */}
            <div className="carousel-container mt-10">
                <div className="carousel-track carousel-track-right">
                    {[...reviews2, ...reviews2].map((review, index) => (
                        <ReviewCard key={`right-${index}`} review={review} />
                    ))}
                </div>
            </div>
        </section>
    );
}
