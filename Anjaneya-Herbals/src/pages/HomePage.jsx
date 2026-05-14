import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import ProductGrid from '../components/ProductGrid';
import StoreLocator from '../components/StoreLocator';
import TrustIndicators from '../components/TrustIndicators';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';

function HomePage() {
    const location = useLocation();
    const { categoryId } = useParams();

    useEffect(() => {
        // Handle scrolling to hash element if present
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location, categoryId]);

    const getTitle = () => {
        if (!categoryId) return "Best Sellers";
        return categoryId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-brand-cream font-sans pb-20 lg:pb-0">
            {!categoryId && <Hero />}
            <div id="products">
                {!categoryId && <CategorySection />}
            </div>

            {/* Featured Products */}
            <ProductGrid
                title={getTitle()}
                categoryId={categoryId}
            />

            {/* Content only for home page, not category pages */}
            {!categoryId && (
                <>
                    {/* Second Product Section */}
                    <div className="py-8 bg-gradient-to-b from-brand-cream to-brand-sand">
                        <ProductGrid title="New Arrivals" />
                    </div>

                    <CTABanner />

                    <StoreLocator />
                    <Footer/>
                </>
            )}
        </div>
    );
}

export default HomePage;
