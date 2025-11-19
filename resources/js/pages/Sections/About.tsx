import { Gem, Clock8, ShieldCheck} from 'lucide-react';

export default function About() {
    return (
        <section id="about" className="w-full bg-black py-20">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-10">
                    Why choose <span className="text-yellow-500">Gearhead?</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="rounded-xl overflow-hidden">
                        <img
                            src="/aboutCar.png"
                            className="w-full h-[300px] object-cover"
                            alt="Garage"
                        />
                    </div>
                    <div className="flex">
                        <div className="hidden md:block w-1 bg-yellow-500 mx-6"></div>
                        <div className="space-y-6 text-gray-300 flex flex-col justify-center w-full">
                            <div className="flex items-center space-x-3">
                                <Gem/>
                                <div>
                                    <h3 className="font-semibold text-lg text-white">Premium Service</h3>
                                    <p>Top-tier car wash services with attention to every detail.</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock8/>
                                <div>
                                    <h3 className="font-semibold text-lg text-white">Fast & Efficient</h3>
                                    <p>Quick turnaround time without compromising quality.</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <ShieldCheck/>
                                <div>
                                    <h3 className="font-semibold text-lg text-white">Safe Products</h3>
                                    <p>Eco-friendly and safe cleaning solutions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
