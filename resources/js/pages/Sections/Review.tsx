import { FaQuoteRight, FaStar } from 'react-icons/fa';

export default function Review() {
    const reviews = [
        { name: 'Medwin Gardose', initials: 'MG' },
        { name: 'Medwin Gardose', initials: 'MG' },
        { name: 'Medwin Gardose', initials: 'MG' },
        { name: 'Medwin Gardose', initials: 'MG' },
        { name: 'Medwin Gardose', initials: 'MG' },
    ];

    const reviews2 = [
        { name: 'Jan Brian Maturan', initials: 'JBM' },
        { name: 'Jan Brian Maturan', initials: 'JBM' },
        { name: 'Jan Brian Maturan', initials: 'JBM' },
        { name: 'Jan Brian Maturan', initials: 'JBM' },
    ];

    return (
        <section id="review">
            {/* Header */}
            <div className="w-full py-10 text-center">
                <h1 className="mb-4 text-5xl font-bold tracking-tight">
                    <span className="text-foreground">What Our </span>
                    <span className="text-yellow-400 dark:text-highlight">
                        Costumer Services
                    </span>
                </h1>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                    Don't just take our word for it, hear from satisfied car
                    owners
                </p>
            </div>

            {/*first row*/}
            <div className="mt-5 flex gap-5 overflow-x-auto">
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className="mx-auto max-w-sm min-w-xs rounded-2xl border border-border p-5 shadow-lg"
                    >
                        {/* Stars + Opening Quote */}
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className="h-4 w-4 text-yellow-400"
                                    />
                                ))}
                            </div>
                            <FaQuoteRight className="h-6 w-6 text-foreground" />
                        </div>

                        {/* Testimonial Text */}
                        <p className="mb-5 text-sm leading-relaxed text-foreground">
                            Gearhead Carwash consistently provides exceptional
                            car care. Their staff are trained, efficient, and
                            deliver a perfect shine every time.
                        </p>

                        {/* Author */}
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
                ))}
            </div>

            {/*second row*/}
            <div className="mt-10 flex gap-5 overflow-x-auto">
                {reviews2.map((review, index) => (
                    <div
                        key={index}
                        className="mx-auto max-w-sm min-w-xs rounded-2xl border border-border p-5 shadow-lg"
                    >
                        {/* Stars + Opening Quote */}
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className="h-4 w-4 text-yellow-400"
                                    />
                                ))}
                            </div>
                            <FaQuoteRight className="h-6 w-6 text-foreground" />
                        </div>

                        {/* Testimonial Text */}
                        <p className="mb-5 text-sm leading-relaxed text-foreground">
                            Gearhead Carwash consistently provides exceptional
                            car care. Their staff are trained, efficient, and
                            deliver a perfect shine every time.
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400/20 text-sm font-bold text-foreground dark:bg-highlight/20 dark:text-highlight">
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
                ))}
            </div>
        </section>
    );
}
