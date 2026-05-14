import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (adding) return;
        
        setAdding(true);
        try {
            // Pass product data for guest cart to store product details
            await addToCart(product.id, 1, {
                name: product.name,
                price: product.price,
                imageUrl: product.image || product.imageUrl
            });
            setAdded(true);
            toast.success('Added to cart!');
            setTimeout(() => setAdded(false), 2000);
        } catch (error) {
            toast.error('Failed to add to cart');
            console.error('Add to cart error:', error);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-out">
            {/* Image Container */}
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={(e) => {
                        // data: URI never fails → onError won't fire again, loop stops
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='160' r='50' fill='%23d1d5db'/%3E%3Crect x='120' y='230' width='160' height='100' rx='8' fill='%23d1d5db'/%3E%3C/svg%3E";
                    }}
                />

                {/* Badges */}
                {product.sale && (
                    <span className="absolute top-3 left-3 bg-brand-terracotta text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-sm shadow-md">
                        Sale
                    </span>
                )}
            </Link>

            {/* Overlay Actions - Desktop Hover */}
            <div className="hidden lg:flex absolute inset-x-0 bottom-[140px] p-4 translate-y-20 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 justify-center space-x-2 pointer-events-none group-hover:pointer-events-auto">
                <button 
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`p-2 rounded-full transition-colors shadow-lg ${
                        added 
                            ? 'bg-green-500 text-white' 
                            : 'bg-brand-black text-white hover:bg-brand-orange'
                    }`}
                    title="Add to Cart"
                >
                    {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                </button>
                <Link 
                    to={`/product/${product.id}`}
                    className="p-2 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors shadow-lg" 
                    title="Quick View"
                >
                    <Eye size={18} />
                </Link>
            </div>

            {/* Mobile Action Button (Visible always on mobile) */}
            <button 
                onClick={handleAddToCart}
                disabled={adding}
                className={`lg:hidden absolute bottom-28 right-2 p-2 rounded-full shadow-md z-10 ${
                    added ? 'bg-green-500' : 'bg-brand-terracotta'
                } text-white`}
            >
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
            </button>

            {/* Content */}
            <div className="p-4 text-center">
                {/* Title */}
                <Link to={`/product/${product.id}`}>
                    <h3 className="text-xs md:text-sm font-sans tracking-wide text-brand-black hover:text-brand-terracotta transition-colors mb-2 line-clamp-2 min-h-[40px] uppercase">
                        {product.name}
                    </h3>
                </Link>

                {/* Reviews */}
                <div className="flex justify-center items-center mb-3 space-x-1 opacity-60 hover:opacity-100 transition-opacity">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={10}
                            className={i < Math.round(product.rating || 0) ? "fill-brand-yellow text-brand-yellow" : "text-gray-300"}
                        />
                    ))}
                    <span className="text-[10px] text-gray-500 ml-1">({product.reviews || 0})</span>
                </div>

                {/* Price */}
                <div className="flex justify-center items-baseline space-x-2">
                    <span className="text-brand-green font-serif font-medium text-lg md:text-xl">₹{product.price}</span>
                    {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-gray-400 text-xs font-serif line-through decoration-brand-terracotta/50">₹{product.oldPrice}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
