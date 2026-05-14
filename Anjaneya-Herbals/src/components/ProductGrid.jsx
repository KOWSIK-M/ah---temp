import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsApi, categoriesApi } from '../services/api';

// Fallback mock data for when API is not available
const FALLBACK_PRODUCTS = [
    {
        id: 1,
        name: "Kumkumadi Tailam Miraculous Beauty Fluid",
        price: 899,
        oldPrice: 1299,
        imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcb8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 5,
        reviewCount: 124,
        onSale: true,
        categoryId: 4
    },
    {
        id: 2,
        name: "Vitamin C Brightening Face Serum",
        price: 599,
        oldPrice: 799,
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4,
        reviewCount: 89,
        onSale: true,
        categoryId: 4
    },
    {
        id: 3,
        name: "Organic Aloe Vera Gel for Skin & Hair",
        price: 299,
        oldPrice: 399,
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 5,
        reviewCount: 450,
        onSale: false,
        categoryId: 5
    },
    {
        id: 4,
        name: "Rose Water Facial Mist Spray",
        price: 349,
        oldPrice: 499,
        imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4,
        reviewCount: 67,
        onSale: true,
        categoryId: 4
    }
];

const ProductGrid = ({ title = "Best Sellers", categoryId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryName, setCategoryName] = useState(title);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                
                // If categoryId is a slug, get category first
                let categoryIdParam = null;
                if (categoryId) {
                    try {
                        const category = await categoriesApi.getBySlug(categoryId);
                        categoryIdParam = category.id;
                        setCategoryName(category.name);
                    } catch {
                        // Category not found, use slug as-is
                        setCategoryName(categoryId.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' '));
                    }
                }
                
                let productList = [];
                
                if (title === "New Arrivals") {
                    productList = await productsApi.getNewArrivals();
                } else if (title === "Best Sellers" && !categoryId) {
                    productList = await productsApi.getBestSellers();
                } else {
                    // Default behavior for category pages or search
                    const response = await productsApi.getAll({ 
                        categoryId: categoryIdParam,
                        size: 8 
                    });
                    productList = response.content || response;
                }
                
                setProducts(productList);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
                // Use fallback products
                const filtered = categoryId 
                    ? FALLBACK_PRODUCTS.filter(p => p.categoryId === parseInt(categoryId))
                    : FALLBACK_PRODUCTS;
                setProducts(filtered.length > 0 ? filtered : FALLBACK_PRODUCTS);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, title]);

    if (loading) {
        return (
            <section className="py-12 bg-brand-cream">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">{categoryId ? categoryName : title}</h2>
                        <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-64 rounded-lg"></div>
                                <div className="h-4 bg-gray-200 mt-4 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 mt-2 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="py-12 bg-brand-cream">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">{categoryId ? categoryName : title}</h2>
                    <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-600">No products found in this category.</p>
                </div>
            </section>
        );
    }

    // Map API response to ProductCard expected format
    const mappedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.imageUrl,
        rating: p.rating,
        reviews: p.reviewCount,
        sale: p.onSale,
        category: p.categoryName
    }));

    return (
        <section className="py-12 bg-brand-cream">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">{categoryId ? categoryName : title}</h2>
                    <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full"></div>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Explore our top-rated natural products curated just for your wellness journey.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                    {mappedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <button className="btn-secondary">
                        View All Products
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
