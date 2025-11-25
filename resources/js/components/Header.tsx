import { dashboard, home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

type NavLink = {
    href: string;
    label: string;
    section?: string;
};

const defaultNavLinks: NavLink[] = [
    { href: '#home', label: 'Home', section: 'home' },
    { href: '#about', label: 'About', section: 'about' },
    { href: '#services', label: 'Services', section: 'services' },
    { href: '#review', label: 'Review', section: 'review' },
    { href: '#contact', label: 'Contact', section: 'contact' },
];

interface HeaderProps {
    navLinks?: NavLink[];
}

export default function Header({ navLinks }: HeaderProps) {
    const { auth } = usePage().props as unknown as SharedData;
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '/';

    const linksToUse = navLinks ?? defaultNavLinks;

    // Track active section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const sections = linksToUse
                .filter((link) => link.section)
                .map((link) => link.section as string);

            // Get current scroll position
            const scrollPosition = window.scrollY + 100; // Offset for header height

            // Find which section is currently in view
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i]);
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i]);
                    break;
                }
            }
        };

        // Add scroll listener
        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [linksToUse]);

    const isActiveLink = (link: NavLink) => {
        // If link has a section, check if it's the active section
        if (link.section) {
            return link.section === activeSection;
        }

        if (link.href === '/') {
            return currentPath === '/' && !hash;
        }
        return (
            link.href === currentPath ||
            (link.href.startsWith('#') && link.href === hash)
        );
    };

    const linkClasses = (isActive: boolean) => {
        return isActive
            ? 'rounded-sm bg-tertiary px-3 py-2 font-bold text-highlight transition-colors hover:bg-tertiary/80'
            : 'px-3 py-2 hover:text-highlight';
    };

    const mobileLinkClasses = (isActive: boolean) => {
        return isActive
            ? 'w-11/12 rounded-sm bg-tertiary px-3 py-2 text-center font-bold text-highlight'
            : 'w-11/12 px-3 py-2 text-center hover:text-highlight';
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-background py-3 shadow-sm">
            <nav className="mx-auto flex max-w-[95rem] items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href={home()} className="flex-shrink-0">
                    <img
                        src="/Gearhead-Logo-DarkMode.png"
                        alt="Gearhead Logo"
                        className="h-10 w-auto"
                    />
                </Link>

                {/* Desktop Nav */}
                <ul className="hidden items-center gap-5 rounded-md bg-secondary px-1 py-1 font-medium text-secondary-foreground md:flex">
                    {linksToUse.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className={linkClasses(isActiveLink(link))}
                        >
                            <li>{link.label}</li>
                        </a>
                    ))}
                </ul>

                {/* Desktop Buttons */}
                <div className="hidden gap-5 text-base md:flex">
                    {auth.user ? (
                        // Authenticated users: admin -> dashboard, customer -> customer-dashboard
                        <Link href={dashboard()}>
                            <Button className="w-full" variant="highlight">
                                {auth.user.role === 'customer'
                                    ? 'Book Now'
                                    : 'Dashboard'}
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={login()}>
                                <Button variant="outline">Log in</Button>
                            </Link>
                            <Link href={register()}>
                                <Button variant="highlight">Register</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-all hover:bg-secondary hover:text-highlight md:hidden"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </nav>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="mt-3 flex flex-col items-center gap-3 bg-secondary py-4 text-secondary-foreground shadow-md md:hidden">
                    {linksToUse.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={mobileLinkClasses(isActiveLink(link))}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Mobile View Button */}
                    <div className="mt-4 flex w-10/12 flex-col gap-3">
                        {auth.user ? (
                            // Authenticated users: admin -> dashboard, customer -> customer-dashboard
                            <Link href={dashboard()}>
                                <Button className="w-full" variant="highlight">
                                    {auth.user.role === 'customer'
                                        ? 'Book Now'
                                        : 'Dashboard'}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={login()}>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Log in
                                    </Button>
                                </Link>
                                <Link href={register()}>
                                    <Button
                                        variant="highlight"
                                        className="w-full"
                                    >
                                        Register
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
