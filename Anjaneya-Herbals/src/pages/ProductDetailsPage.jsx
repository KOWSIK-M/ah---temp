import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, ChevronLeft, ChevronRight, Heart, Share2, Truck,
    Shield, Check, Clock, Package, MapPin, ChevronDown,
    ChevronUp, ShoppingBag, Info, Leaf, Tag, Zap,
    TrendingUp, Award, Sparkles, Minus, Plus, ArrowLeft,
    Truck as TruckIcon, ShieldCheck, Clock as ClockIcon,
    Package as PackageIcon, IndianRupee, CheckCircle, X,
    AlertCircle
} from 'lucide-react';
import { productsApi } from '../services/api';
import { useCart } from '../contexts/CartContext';
import Toast from '../components/Toast';
import ProductReviews from '../components/ProductReviews';

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart: addToCartContext } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [expandedSection, setExpandedSection] = useState('description');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [pincode, setPincode] = useState('');
    const [deliveryEstimate, setDeliveryEstimate] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showImageZoom, setShowImageZoom] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await productsApi.getById(productId);
            const mappedProduct = {
                ...data,
                images: data.imageUrl ? [data.imageUrl, data.imageUrl, data.imageUrl] : Array(3).fill('https://via.placeholder.com/400x400?text=Anjaneya+Herbals'),
                discountedPrice: data.price,
                originalPrice: data.oldPrice || data.price,
                rating: data.rating || 4.5,
                ratingCount: data.reviewCount || 125,
                reviewCount: data.reviewCount || 125,
                brand: 'Anjaneya Herbals',
                category: data.categoryName || 'Ayurvedic Products',
                variants: data.variants || [],
                offers: data.offers || [
                    "Get 10% cashback on orders above ₹2000",
                    "Free shipping on orders above ₹999",
                    "Buy 2 get 10% extra discount"
                ],
                specifications: {
                    'Net Weight': '500g',
                    'Shelf Life': '24 Months',
                    'Ingredients': '100% Natural Herbs',
                    'Certification': 'Ayurvedic Certified',
                    'Usage': '1-2 teaspoons daily',
                    'Diet Type': 'Vegetarian',
                    ...data.specifications
                },
                features: data.features || [
                    '100% Natural & Organic',
                    'No Artificial Preservatives',
                    'Traditional Ayurvedic Formulation',
                    'Lab Tested for Purity',
                    'GMP Certified Manufacturing'
                ],
                seller: { name: 'Anjaneya Herbals', rating: '4.8/5' },
                stock: data.stock || 50
            };
            setProduct(mappedProduct);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (value) => {
        const newQuantity = Math.max(1, Math.min(value, product?.stock || 50));
        setQuantity(newQuantity);
    };

    const addToCart = async () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);

        try {
            await addToCartContext(product.id, quantity, {
                name: product.name,
                price: product.discountedPrice || product.price,
                imageUrl: product.images?.[0] || product.imageUrl,
                maxStock: product.stock
            });
            showToastMessage('🎉 Added to cart successfully!');
        } catch (error) {
            showToastMessage('❌ Failed to add to cart');
            console.error('Add to cart error:', error);
        }
    };

    const buyNow = async () => {
        await addToCart();
        navigate('/checkout');
    };

    const toggleWishlist = () => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

        if (isInWishlist) {
            const newWishlist = wishlist.filter(item => item.id !== product.id);
            localStorage.setItem('wishlist', JSON.stringify(newWishlist));
            setIsInWishlist(false);
            showToastMessage('💔 Removed from wishlist');
        } else {
            wishlist.push({
                id: product.id,
                name: product.name,
                image: product.images[0],
                price: product.discountedPrice,
                originalPrice: product.originalPrice,
                rating: product.rating,
                reviews: product.reviewCount
            });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            setIsInWishlist(true);
            showToastMessage('❤️ Added to wishlist');
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const checkDelivery = () => {
        if (pincode.length === 6) {
            const estimates = ['Tomorrow', '2-3 days', '3-5 days', '1 week'];
            const randomEstimate = estimates[Math.floor(Math.random() * estimates.length)];
            setDeliveryEstimate(`Delivery by ${randomEstimate}`);
        }
    };

    const shareProduct = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Check out ${product.name} from Anjaneya Herbals`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToastMessage('📋 Link copied to clipboard!');
        }
    };

    const discountPercentage = product ? Math.round(
        ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
    ) : 0;

    const ImageZoomModal = () => (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-[90vh]">
                <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain rounded-lg"
                />
                <button
                    onClick={() => setShowImageZoom(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                    <X size={24} className="text-white" />
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Skeleton for Breadcrumb */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Image Skeleton */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                            <div className="grid grid-cols-4 gap-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Info Skeleton */}
                        <div className="space-y-6">
                            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                            <div className="h-10 w-1/4 bg-gray-200 rounded"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle size={48} className="text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">The product you're looking for might have been moved or is no longer available.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 lg:pt-20">
                {/* Back Button - Mobile */}
                <button
                    onClick={() => navigate(-1)}
                    className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center"
                >
                    <ArrowLeft size={20} className="text-gray-700" />
                </button>

                {/* Breadcrumb - Desktop */}
                <div className="hidden lg:block bg-white/80 backdrop-blur-sm border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <nav className="flex items-center text-sm text-gray-600">
                            <button
                                onClick={() => navigate('/')}
                                className="hover:text-green-600 transition-colors"
                            >
                                Home
                            </button>
                            <ChevronRight size={14} className="mx-2" />
                            <button
                                onClick={() => navigate('/category/' + product.category)}
                                className="hover:text-green-600 transition-colors"
                            >
                                {product.category}
                            </button>
                            <ChevronRight size={14} className="mx-2" />
                            <span className="text-gray-900 font-medium truncate max-w-xs">
                                {product.name}
                            </span>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Column - Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div 
                                onClick={() => setShowImageZoom(true)}
                                className="relative aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg cursor-zoom-in"
                            >
                                <img
                                    src={product.images[selectedImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-300"
                                />
                                {discountPercentage > 0 && (
                                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
                                        {discountPercentage}% OFF
                                    </div>
                                )}
                                {product.featured && (
                                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                                        <Star size={12} className="inline mr-1" />
                                        Featured
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Images */}
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-square bg-white rounded-xl border-2 overflow-hidden ${
                                            selectedImageIndex === index
                                                ? 'border-green-500 ring-2 ring-green-200'
                                                : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Leaf size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">100% Natural</p>
                                            <p className="text-xs text-gray-500">Ayurvedic Formulation</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-yellow-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <Award size={20} className="text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">GMP Certified</p>
                                            <p className="text-xs text-gray-500">Quality Assured</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Product Info */}
                        <div className="space-y-6">
                            {/* Product Header */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                        {product.brand}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={toggleWishlist}
                                            className={`p-2 rounded-lg ${isInWishlist ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}
                                        >
                                            <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
                                        </button>
                                        <button
                                            onClick={shareProduct}
                                            className="p-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                                        >
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                    {product.name}
                                </h1>

                                {/* Rating */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={16}
                                                className={`${
                                                    star <= Math.floor(product.rating)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {product.rating.toFixed(1)} • {product.ratingCount.toLocaleString()} ratings
                                    </span>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                                <div className="flex items-end gap-4 mb-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                                            <IndianRupee size={28} className="inline -mt-1" />
                                            {product.discountedPrice.toLocaleString()}
                                        </span>
                                        {product.originalPrice > product.discountedPrice && (
                                            <>
                                                <span className="text-xl text-gray-500 line-through">
                                                    <IndianRupee size={20} className="inline -mt-1" />
                                                    {product.originalPrice.toLocaleString()}
                                                </span>
                                                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold">
                                                    Save {discountPercentage}%
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">Inclusive of all taxes • Free shipping above ₹999</p>
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    {product.stock > 10 ? (
                                        <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                        <AlertCircle size={20} className="text-yellow-500" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {product.stock > 10 ? 'In Stock' : 'Low Stock'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {product.stock > 10 ? 'Ready to ship' : `Only ${product.stock} units left`}
                                        </p>
                                    </div>
                                </div>
                                {product.stock <= 10 && (
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{ width: `${(product.stock / 10) * 100}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            className="px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="px-6 py-3 text-lg font-bold text-gray-900 min-w-[60px] text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            className="px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                                            disabled={quantity >= product.stock}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div className="font-medium">{product.stock} units available</div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Check */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <TruckIcon size={20} />
                                    Delivery Options
                                </h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Enter pincode"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                    />
                                    <button
                                        onClick={checkDelivery}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg"
                                    >
                                        Check
                                    </button>
                                </div>
                                {deliveryEstimate && (
                                    <p className="mt-3 text-green-600 font-medium flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        {deliveryEstimate}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={addToCart}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={20} />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={buyNow}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <ShieldCheck size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                                        <p className="text-xs text-gray-500">SSL Encrypted</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <PackageIcon size={16} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                                        <p className="text-xs text-gray-500">30 Day Policy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Fixed CTA */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-2xl p-4 z-40">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-gray-900">
                                        <IndianRupee size={18} className="inline -mt-1" />
                                        {product.discountedPrice}
                                    </span>
                                    {product.originalPrice > product.discountedPrice && (
                                        <span className="text-sm text-gray-500 line-through">
                                            <IndianRupee size={14} className="inline -mt-0.5" />
                                            {product.originalPrice}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-green-600 font-medium">In stock</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={addToCart}
                                    className="px-5 py-2.5 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={buyNow}
                                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-yellow-600 text-white rounded-lg font-medium shadow-md"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Sections */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Tabs Navigation */}
                        <div className="border-b border-gray-200">
                            <div className="flex overflow-x-auto hide-scrollbar">
                                {['description', 'specifications', 'seller', 'reviews'].map((section) => (
                                    <button
                                        key={section}
                                        onClick={() => setExpandedSection(section)}
                                        className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                                            expandedSection === section
                                                ? 'border-green-500 text-green-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {section.charAt(0).toUpperCase() + section.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {expandedSection === 'description' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                                    
                                    {product.features && product.features.length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {product.features.map((feature, index) => (
                                                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                                        <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {expandedSection === 'specifications' && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Product Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(product.specifications).map(([key, value], index) => (
                                            <div key={index} className="flex border-b border-gray-100 pb-3">
                                                <span className="w-1/3 font-medium text-gray-700">{key}</span>
                                                <span className="w-2/3 text-gray-600">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {expandedSection === 'seller' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900">Seller Information</h3>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">{product.seller.name}</h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center">
                                                        {[1,2,3,4,5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={14}
                                                                className={`${
                                                                    star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-gray-600">{product.seller.rating} rating</span>
                                                </div>
                                            </div>
                                            <button className="px-6 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50">
                                                Visit Store
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {expandedSection === 'reviews' && (
                                <ProductReviews productId={product.id} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Placeholder for similar products */}
                        {[1,2,3,4].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="aspect-square bg-gray-100 rounded-lg mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Zoom Modal */}
            <AnimatePresence>
                {showImageZoom && <ImageZoomModal />}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <Toast message={toastMessage} onClose={() => setShowToast(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default ProductDetailsPage;