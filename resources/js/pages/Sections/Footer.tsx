import {
    ArrowRight,
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Twitter,
} from 'lucide-react';

const socialLinks = [
    { href: 'https://www.facebook.com/GearheadCarwash', icon: Facebook },
    { href: 'https://instagram.com', icon: Instagram },
    { href: 'https://twitter.com', icon: Twitter },
];

const links = {
    'Useful Links': ['Home', 'About', 'Services', 'Testimonials'],
    Help: ['Customer Support', 'Terms & Conditions', 'Privacy Policy'],
};

export default function Footer() {
    return (
        <footer id="contact" className="w-full bg-black text-white">
            {/* Get started diri */}
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg pt-5">
                <img
                    src="/footer-Img.png"
                    alt="Footer Banner"
                    className="h-96 w-full object-cover"
                />

                <div className="absolute top-1/2 left-8 max-w-md -translate-y-1/2 transform text-left">
                    <h2 className="text-4xl font-bold text-white md:text-5xl">
                        Ready to Get Started?
                    </h2>
                    <p className="mt-4 text-lg text-gray-200 md:text-xl">
                        Join hundreds of satisfied customers and experience the
                        Gearhead difference.
                    </p>
                    <a
                        href="/services"
                        className="mt-6 inline-flex font-semibold text-yellow-400 hover:underline"
                    >
                        Book your first wash{' '}
                        <ArrowRight className="ml-2 h-5 w-5 -rotate-45 transform" />
                    </a>
                </div>
            </div>

            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 sm:gap-12 md:grid-cols-4">
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold">About Us</h3>
                    <p className="text-sm text-gray-300">
                        Premium car wash services with cutting-edge technology
                        and expert care.
                    </p>

                    <div className="mt-2 flex space-x-4">
                        {socialLinks.map(({ href, icon: Icon }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-500 transition-transform duration-300 hover:scale-110 hover:bg-yellow-500"
                            >
                                <Icon
                                    className="text-yellow-500 group-hover:text-black"
                                    size={16}
                                />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links */}
                {Object.entries(links).map(([title, items]) => (
                    <div key={title} className="space-y-3">
                        <h3 className="text-xl font-semibold text-yellow-500">
                            {title}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            {items.map((item) => (
                                <li
                                    key={item}
                                    className="cursor-pointer transition-colors duration-300 hover:text-yellow-500"
                                >
                                    <a
                                        href={
                                            item === 'Home'
                                                ? '#hero'
                                                : item === 'About'
                                                  ? '#about'
                                                  : item === 'Services'
                                                    ? '#services'
                                                    : item === 'Review'
                                                      ? '#review'
                                                      : '#'
                                        }
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Contact */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-yellow-500">
                        Connect With Us
                    </h3>
                    <div className="flex items-start space-x-3 sm:items-center">
                        <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-yellow-500 sm:mt-0" />
                        <p className="text-sm break-words text-gray-300">
                            Belen Road Vicente Hizon, Davao City, Philippines
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-yellow-500" />
                        <p className="text-sm text-gray-300">
                            +63 945 705 8829
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-yellow-500" />
                        <p className="text-sm text-gray-300">
                            mssjambongana@gmail.com
                        </p>
                    </div>
                </div>
            </div>

            {/* Rights Reserved */}
            <div className="mx-auto flex max-w-6xl justify-center border-t border-gray-700 px-6 py-4 text-sm text-gray-400">
                © 2025 All Rights Reserved.
            </div>
        </footer>
    );
}
