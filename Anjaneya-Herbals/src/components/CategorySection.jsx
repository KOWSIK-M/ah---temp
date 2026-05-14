import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../services/api';

// Import local cover images
import spicesImg from '../assets/category-covers/spices.jpg';
import dryFruitsImg from '../assets/category-covers/dry-fruits.jpg';
import hairCareImg from '../assets/category-covers/hair-care.jpg';
import bodyCareImg from '../assets/category-covers/body-care.jpg';
import faceCareImg from '../assets/category-covers/face-care.jpg';
import healthWellnessImg from '../assets/category-covers/health-wellness.jpg';

const CategorySection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Map slugs to local images
    const coverImages = {
        'spices': spicesImg,
        'dry-fruits': dryFruitsImg,
        'hair-care': hairCareImg,
        'body-care': bodyCareImg,
        'face-care': faceCareImg,
        'health-wellness': healthWellnessImg
    };

    useEffect(() => {   
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await categoriesApi.getAll();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError(err.message);
                // Fallback to default categories if API fails
                setCategories([
                    { id: 1, name: "Spices", slug: "spices" },
                    { id: 2, name: "Dry Fruits", slug: "dry-fruits" },
                    { id: 3, name: "Hair Care", slug: "hair-care" },
                    { id: 4, name: "Body Care", slug: "body-care" },
                    { id: 5, name: "Face Care", slug: "face-care" },
                    { id: 6, name: "Health & Wellness", slug: "health-wellness" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-brand-cream">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">Shop by Category</h2>
                        <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="w-36 h-48 mx-auto bg-gray-200 rounded-t-[4rem] rounded-b-md"></div>
                                <div className="h-4 bg-gray-200 mt-4 mx-auto w-24 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-brand-cream relative overflow-hidden">
            {/* Background Decorations */}
            <img src="/star-anise.png" alt="" className="absolute top-10 left-10 w-16 opacity-10 rotate-45 pointer-events-none" />
            <img src="/clove.png" alt="" className="absolute top-20 right-20 w-12 opacity-10 -rotate-12 pointer-events-none" />
            <img src="/cinnamon.png" alt="" className="absolute bottom-10 left-1/4 w-24 opacity-10 rotate-90 pointer-events-none" />
            <img src="/cardamom.jpg" alt="" className="absolute bottom-20 right-10 w-16 opacity-10 rotate-12 pointer-events-none mix-blend-multiply" />
            <img src="/turmeric.png" alt="" className="absolute top-6 right-48 w-20 opacity-10 -rotate-45 pointer-events-none" />
            <img src="/black-pepper.jpg" alt="" className="absolute top-17 left-80 w-14 opacity-10 rotate-180 pointer-events-none mix-blend-multiply" />

            {/* Repeated Elements for Fuller Background */}
            <img src="/star-anise.png" alt="" className="absolute bottom-1/4 right-1/4 w-14 opacity-10 -rotate-15 pointer-events-none" />
            <img src="/clove.png" alt="" className="absolute top-1/3 left-20 w-10 opacity-10 rotate-45 pointer-events-none" />
            <img src="/cinnamon.png" alt="" className="absolute top-10 right-1/3 w-20 opacity-10 -rotate-45 pointer-events-none" />
            <img src="/cardamom.jpg" alt="" className="absolute top-2/3 left-10 w-14 opacity-10 rotate-90 pointer-events-none mix-blend-multiply" />
            <img src="/turmeric.png" alt="" className="absolute bottom-10 right-1/3 w-18 opacity-10 rotate-12 pointer-events-none" />
            <img src="/star-anise.png" alt="" className="absolute top-20 left-1/2 w-12 opacity-10 rotate-45 pointer-events-none mix-blend-multiply" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">Shop by Category</h2>
                    <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            to={`/category/${cat.slug}`}
                            className="group cursor-pointer"
                        >
                            <div className="relative w-36 h-48 mx-auto overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 rounded-t-[4rem] rounded-b-md border border-brand-sand group-hover:border-brand-yellow">
                                <img
                                    src={coverImages[cat.slug] || cat.imageUrl || `https://images.unsplash.com/photo-1544367563-12123d815079?w=400`}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out grayscale-[20%] group-hover:grayscale-0"
                                    onError={(e) => {
                                        e.target.onerror = null; // prevent loop if Unsplash also fails
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%235C7A59'/%3E%3Ccircle cx='200' cy='180' r='80' fill='%23ffffff20'/%3E%3Ctext x='50%25' y='60%25' font-family='Arial' font-size='22' fill='white' text-anchor='middle' dy='.35em'%3EHerbs%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"/>
                            </div>
                            <h3 className="text-center mt-4 font-serif text-lg font-medium text-brand-black group-hover:text-brand-terracotta transition-colors tracking-wide uppercase text-sm">
                                {cat.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
