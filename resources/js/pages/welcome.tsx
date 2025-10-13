import { dashboard, home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <header className="w-full bg-background py-3 shadow-sm">
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
                        <a
                            href="#"
                            className="rounded-sm bg-tertiary px-3 py-2 font-bold text-highlight transition-colors hover:bg-tertiary/80"
                        >
                            <li>Home</li>
                        </a>
                        <a href="#" className="px-3 py-2 hover:text-highlight">
                            <li>Services</li>
                        </a>
                        <a href="#" className="px-3 py-2 hover:text-highlight">
                            <li>Booking</li>
                        </a>
                        <a href="#" className="px-3 py-2 hover:text-highlight">
                            <li>Contact</li>
                        </a>
                    </ul>

                    {/* Desktop Buttons */}
                    <div className="hidden gap-5 text-base md:flex">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-border px-5 py-1.5 text-sm leading-normal text-foreground transition-all duration-200 hover:border-muted-foreground"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={login()}>
                                    <Button variant="outline">Log in</Button>
                                </Link>
                                <Link href={register()}>
                                    <Button variant="highlight">
                                        Register
                                    </Button>
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
                        <a
                            href="#"
                            className="w-11/12 rounded-sm bg-tertiary px-3 py-2 text-center font-bold text-highlight"
                        >
                            Home
                        </a>
                        <a
                            href="#"
                            className="w-11/12 px-3 py-2 text-center hover:text-highlight"
                        >
                            Services
                        </a>
                        <a
                            href="#"
                            className="w-11/12 px-3 py-2 text-center hover:text-highlight"
                        >
                            Booking
                        </a>
                        <a
                            href="#"
                            className="w-11/12 px-3 py-2 text-center hover:text-highlight"
                        >
                            Contact
                        </a>

                        <div className="mt-4 flex w-10/12 flex-col gap-3">
                            {auth.user ? (
                                <Link href={dashboard()}>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                    >
                                        Dashboard
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
        </>
    );
}
