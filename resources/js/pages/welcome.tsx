import Header from '@/components/Header';
import { Head } from '@inertiajs/react';
import About from './Sections/About';
import Footer from './Sections/Footer';
import Hero from './Sections/Hero';
import LP_Services from './Sections/LP_Services';
import Review from './Sections/Review';

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
            <section>
                <Hero></Hero>
            </section>
            <section>
                <About></About>
            </section>
            <section>
                <LP_Services></LP_Services>
            </section>
            <section>
                <Review></Review>
            </section>
            <section>
                <Footer></Footer>
            </section>
        </>
    );
}
