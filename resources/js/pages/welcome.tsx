import { dashboard, home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '../components/ui/button';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <header className="mb-6 w-full py-2 text-sm not-has-[nav]:hidden">
                <nav className="flex items-center justify-around bg-background">
                    <Link href={home()}>
                        <img
                            src="/Gearhead-Logo-DarkMode.png"
                            alt="Gearhead Logo"
                            className="h-15"
                        />
                    </Link>

                    <ul className="flex items-center gap-5 rounded-md bg-secondary px-1 py-1 font-medium text-secondary-foreground">
                        {/* Example className design for higlighted
                            Highlighted will be shown depends on whats on the screen
                        */}
                        <a
                            href="#"
                            className="rounded-sm bg-tertiary px-3 py-2 font-bold text-highlight"
                        >
                            <li>Home</li>
                        </a>
                        <a href="#" className="px-3 py-2">
                            <li>Services</li>
                        </a>
                        <a href="#" className="px-3 py-2">
                            <li>Booking</li>
                        </a>
                        <a href="#" className="px-3 py-2">
                            <li>Contact</li>
                        </a>
                    </ul>

                    <div>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex gap-5 text-base">
                                <Link href={login()}>
                                    <Button className="">Log in</Button>
                                </Link>
                                <Link href={register()}>
                                    <Button variant="highlight">
                                        Register
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
}
