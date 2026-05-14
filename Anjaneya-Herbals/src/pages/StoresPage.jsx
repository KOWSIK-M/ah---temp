import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StoreLocator from '../components/StoreLocator';

const StoresPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-brand-cream font-sans flex flex-col">
            <Navbar />
            <div className="flex-grow pt-20">
                <StoreLocator />
            </div>
            <Footer />
        </div>
    );
};

export default StoresPage;
