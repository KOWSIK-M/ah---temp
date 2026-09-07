import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsApi, categoriesApi } from '../services/api';

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
                setProducts([]);
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
