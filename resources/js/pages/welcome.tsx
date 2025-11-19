import Header from '@/components/Header';
import { Head } from '@inertiajs/react';
import Hero from './Sections/Hero';
import About from './Sections/About';
import Services from './Sections/LP_Services';
import Reviews from './Sections/Review';
import Footer from './Sections/Footer';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <Header />

            <Hero />
            <About />
            <Services />
            <Reviews />
            <Footer />
        </>
    );
}
