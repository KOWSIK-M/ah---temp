import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactSection from '../components/ContactSection';

const ContactPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-brand-cream font-sans flex flex-col">
            <Navbar />
            <div className="flex-grow pt-20"> {/* Add padding for fixed navbar */}
                <ContactSection />
            </div>
            <Footer />
        </div>
    );
};

export default ContactPage;
