import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../services/api';

// Import local cover images
import spicesImg from '../assets/category-covers/spices.webp';
import dryFruitsImg from '../assets/category-covers/dry-fruits.webp';
import hairCareImg from '../assets/category-covers/hair-care.webp';
import bodyCareImg from '../assets/category-covers/body-care.webp';
import faceCareImg from '../assets/category-covers/face-care.webp';
import healthWellnessImg from '../assets/category-covers/health-wellness.webp';

const DEFAULT_CATEGORIES = [
    { id: 1, name: "Spices", slug: "spices" },
    { id: 2, name: "Dry Fruits", slug: "dry-fruits" },
    { id: 3, name: "Hair Care", slug: "hair-care" },
    { id: 4, name: "Body Care", slug: "body-care" },
    { id: 5, name: "Face Care", slug: "face-care" },
    { id: 6, name: "Health & Wellness", slug: "health-wellness" }
];

const COVER_IMAGES = {
    'spices': spicesImg,
    'dry-fruits': dryFruitsImg,
    'hair-care': hairCareImg,
    'body-care': bodyCareImg,
    'face-care': faceCareImg,
    'health-wellness': healthWellnessImg
};

const CategorySection = () => {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

    useEffect(() => {   
        let active = true;
        const fetchCategories = async () => {
            try {
                const data = await categoriesApi.getAll();
                if (active && Array.isArray(data) && data.length > 0) setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
        return () => { active = false; };
    }, []);

    return (
        <section className="py-16 bg-brand-cream relative overflow-hidden">
            {/* Original spice composition, retained as part of the brand design. */}
            <img src="/star-anise.webp" alt="" loading="lazy" decoding="async" className="absolute top-10 left-10 w-16 opacity-10 rotate-45 pointer-events-none" />
            <img src="/clove.webp" alt="" loading="lazy" decoding="async" className="absolute top-20 right-20 w-12 opacity-10 -rotate-12 pointer-events-none" />
            <img src="/cinnamon.webp" alt="" loading="lazy" decoding="async" className="absolute bottom-10 left-1/4 w-24 opacity-10 rotate-90 pointer-events-none" />
            <img src="/cardamom.webp" alt="" loading="lazy" decoding="async" className="absolute bottom-20 right-10 w-16 opacity-10 rotate-12 pointer-events-none mix-blend-multiply" />
            <img src="/turmeric.webp" alt="" loading="lazy" decoding="async" className="absolute top-6 right-48 w-20 opacity-10 -rotate-45 pointer-events-none" />
            <img src="/black-pepper.webp" alt="" loading="lazy" decoding="async" className="absolute top-17 left-80 w-14 opacity-10 rotate-180 pointer-events-none mix-blend-multiply" />

            <img src="/star-anise.webp" alt="" loading="lazy" decoding="async" className="absolute bottom-1/4 right-1/4 w-14 opacity-10 -rotate-15 pointer-events-none" />
            <img src="/clove.webp" alt="" loading="lazy" decoding="async" className="absolute top-1/3 left-20 w-10 opacity-10 rotate-45 pointer-events-none" />
            <img src="/cinnamon.webp" alt="" loading="lazy" decoding="async" className="absolute top-10 right-1/3 w-20 opacity-10 -rotate-45 pointer-events-none" />
            <img src="/cardamom.webp" alt="" loading="lazy" decoding="async" className="absolute top-2/3 left-10 w-14 opacity-10 rotate-90 pointer-events-none mix-blend-multiply" />
            <img src="/turmeric.webp" alt="" loading="lazy" decoding="async" className="absolute bottom-10 right-1/3 w-18 opacity-10 rotate-12 pointer-events-none" />
            <img src="/star-anise.webp" alt="" loading="lazy" decoding="async" className="absolute top-20 left-1/2 w-12 opacity-10 rotate-45 pointer-events-none mix-blend-multiply" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">Shop by Category</h2>
                    <div className="w-20 h-1 bg-brand-yellow mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
                    {categories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            to={`/category/${cat.slug}`}
                            className="group cursor-pointer"
                        >
                            <div className="relative w-full max-w-36 aspect-[3/4] mx-auto overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 rounded-t-[4rem] rounded-b-md border border-brand-sand group-hover:border-brand-yellow">
                                <img
                                    src={COVER_IMAGES[cat.slug] || cat.imageUrl || `https://images.unsplash.com/photo-1544367563-12123d815079?w=400`}
                                    alt={cat.name}
                                    width="400"
                                    height="534"
                                    loading="eager"
                                    decoding="async"
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
