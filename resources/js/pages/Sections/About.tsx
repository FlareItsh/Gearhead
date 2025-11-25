import { Clock8, Gem, ShieldCheck } from 'lucide-react';

export default function About() {
    return (
        <section id="about" className="w-full py-20">
            <div className="mx-auto max-w-6xl px-6">
                <h2 className="mb-10 text-3xl font-bold text-foreground">
                    Why choose{' '}
                    <span className="text-yellow-500">Gearhead?</span>
                </h2>
                <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
                    <div className="overflow-hidden rounded-xl">
                        <img
                            src="/img/aboutCar.png"
                            className="h-[300px] w-full object-cover"
                            alt="Garage"
                        />
                    </div>
                    <div className="flex">
                        <div className="mx-6 hidden w-1 bg-yellow-500 md:block"></div>
                        <div className="flex w-full flex-col justify-center space-y-6">
                            <div className="flex items-center space-x-3">
                                <Gem />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Premium Service
                                    </h3>
                                    <p>
                                        Top-tier car wash services with
                                        attention to every detail.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock8 />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Fast & Efficient
                                    </h3>
                                    <p>
                                        Quick turnaround time without
                                        compromising quality.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <ShieldCheck />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Safe Products
                                    </h3>
                                    <p>
                                        Eco-friendly and safe cleaning
                                        solutions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
