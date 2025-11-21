import { FaQuoteRight, FaStar } from 'react-icons/fa'; // Import both

export default function Review() {
    return (
        <div>
            {/* Header */}
            <div className="w-full py-10 text-center">
                <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
                    <span className="text-foreground">What Our </span>
                    <span className="text-yellow-400 dark:text-highlight">
                        Costumer Services
                    </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Don't just take our word for it, hear from satisfied car
                    owners
                </p>
            </div>
            {/*first row*/}
            <div className="mt-5 flex gap-5 overflow-x-auto">
                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/566570802_1868417847043126_7186861178944086337_n.jpg"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Medwin Gardose
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/566570802_1868417847043126_7186861178944086337_n.jpg"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Medwin Gardose
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/566570802_1868417847043126_7186861178944086337_n.jpg"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Medwin Gardose
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/566570802_1868417847043126_7186861178944086337_n.jpg"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Medwin Gardose
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/566570802_1868417847043126_7186861178944086337_n.jpg"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Medwin Gardose
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/*second row*/}
            <div className="mt-10 flex gap-5 overflow-x-auto">
                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/Screenshot 2025-11-21 173533.png"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Jan Brian Maturan
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/Screenshot 2025-11-21 173533.png"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Jan Brian Maturan
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/Screenshot 2025-11-21 173533.png"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Jan Brian Maturan
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-md min-w-sm rounded-3xl border border-border p-8 shadow-lg">
                    {/* Stars + Opening Quote */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="h-7 w-7 text-yellow-400"
                                />
                            ))}
                        </div>
                        <FaQuoteRight className="h-10 w-10 text-foreground" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="mb-8 text-lg leading-relaxed text-foreground">
                        Gearhead Carwash consistently provides exceptional car
                        care. Their staff are trained, efficient, and deliver a
                        perfect shine every time.
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/Screenshot 2025-11-21 173533.png"
                            alt="James Thomas"
                            className="h-14 w-14 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Jan Brian Maturan
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Verified Customer
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
