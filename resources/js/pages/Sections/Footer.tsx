import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const socialLinks = [
  { href: 'https://www.facebook.com/GearheadCarwash', icon: Facebook },
  { href: 'https://instagram.com', icon: Instagram },
  { href: 'https://twitter.com', icon: Twitter },
];

const links = {
  'Useful Links': ['Home', 'About', 'Services', 'Review'],
  Help: ['Customer Support', 'Terms & Conditions', 'Privacy Policy'],
};

export default function Footer() {
    return (
        <footer id="footer" className="w-full bg-black text-white">
            <div className="mx-auto max-w-6xl px-6 py-12 md:py-16 grid gap-10 sm:gap-12 md:grid-cols-4">
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold">About Us</h3>
                    <p className="text-sm text-gray-300">
                        Premium car wash services with cutting-edge technology and expert care.
                    </p>

                    <div className="flex space-x-4 mt-2">
                        {socialLinks.map(({ href, icon: Icon }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-500 transition-transform duration-300 hover:scale-110 hover:bg-yellow-500"
                            >
                                <Icon className="text-yellow-500 group-hover:text-black" size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links */}
                {Object.entries(links).map(([title, items]) => (
                    <div key={title} className="space-y-3">
                        <h3 className="text-xl font-semibold text-yellow-500">{title}</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            {items.map((item) => (
                                <li key={item} className="cursor-pointer transition-colors duration-300 hover:text-yellow-500">
                                <a
                                    href={
                                    item === 'Home' ? '#hero' :
                                    item === 'About' ? '#about' :
                                    item === 'Services' ? '#services' :
                                    item === 'Review' ? '#review' :
                                    '#'
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
                    <h3 className="text-xl font-semibold text-yellow-500">Connect With Us</h3>
                    <div className="flex items-start sm:items-center space-x-3">
                        <MapPin className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1 sm:mt-0" />
                        <p className="text-sm text-gray-300 break-words">
                            Belen Road Vicente Hizon, Davao City, Philippines
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-gray-300">+63 945 705 8829</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-gray-300">mssjambongana@gmail.com</p>
                    </div>
                </div>
            </div>

            {/* Rights Reserved */}
            <div className="mx-auto max-w-6xl px-6 py-4 flex justify-center text-sm text-gray-400 border-t border-gray-700">
                © 2025 All Rights Reserved.
            </div>
        </footer>
    );
}
