import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Heart, ShoppingBag, Trash2, ArrowRight, Sparkles,
    Star, Gift, Zap, Package, TrendingUp, ArrowLeft,
    IndianRupee, CheckCircle, Clock, Eye, Share2,
    Heart as HeartSolid, ShoppingCart, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadWishlist();
        window.scrollTo(0, 0);
    }, []);

    const loadWishlist = () => {
        try {
            const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            // Add some mock data for demo if empty
            const demoItems = [
                {
                    id: 'prod1',
                    name: 'Organic Ashwagandha Powder',
                    price: 599,
                    originalPrice: 799,
                    image: 'https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=800&auto=format&fit=crop',
                    rating: 4.8,
                    reviews: 128,
                    category: 'Herbal Supplements',
                    inStock: true,
                    tags: ['Best Seller', 'Trending']
                },
                {
                    id: 'prod2',
                    name: 'Premium Chyawanprash',
                    price: 399,
                    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w-800&auto=format&fit=crop',
                    rating: 4.9,
                    reviews: 256,
                    category: 'Ayurvedic Products',
                    inStock: true,
                    tags: ['New Arrival']
                },
                {
                    id: 'prod3',
                    name: 'Almonds (California) 500g',
                    price: 589,
                    originalPrice: 699,
                    image: 'https://images.unsplash.com/photo-1607304027036-a5af54d4937b?w=800&auto=format&fit=crop',
                    rating: 4.7,
                    reviews: 89,
                    category: 'Dry Fruits',
                    inStock: false,
                    tags: ['Premium']
                }
            ];

            const combinedWishlist = savedWishlist.length > 0 ? savedWishlist : demoItems;
            setWishlist(combinedWishlist);
        } catch (error) {
            console.error('Error loading wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = (id, event) => {
        if (event) event.stopPropagation();
        setRemovingId(id);
        
        setTimeout(() => {
            const updatedWishlist = wishlist.filter(item => item.id !== id);
            setWishlist(updatedWishlist);
            localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
            setRemovingId(null);
            toast.success('Removed from wishlist 💔');
        }, 300);
    };

    const addToCart = async (item, event) => {
        if (event) event.stopPropagation();
        if (!item.inStock) {
            toast.error('Product is out of stock');
            return;
        }

        setAddingToCart(item.id);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
            
            const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);

            if (existingItemIndex > -1) {
                existingCart[existingItemIndex].quantity += 1;
            } else {
                existingCart.push({
                    id: item.id,
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    productPrice: item.price,
                    productImageUrl: item.image,
                    quantity: 1,
                    productName: item.name
                });
            }

            localStorage.setItem('cart', JSON.stringify(existingCart));
            window.dispatchEvent(new Event('cartUpdated'));
            
            // Remove from wishlist after adding to cart
            removeFromWishlist(item.id);
            
            toast.success(
                <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Added to cart! 🎉</span>
                </div>
            );
        } catch (error) {
            toast.error('Failed to add to cart');
        } finally {
            setAddingToCart(null);
        }
    };

    const addAllToCart = async () => {
        const inStockItems = wishlist.filter(item => item.inStock);
        if (inStockItems.length === 0) {
            toast.error('No items in stock to add');
            return;
        }

        try {
            for (const item of inStockItems) {
                await addToCart(item);
            }
            toast.success(`Added ${inStockItems.length} items to cart! 🛍️`);
        } catch (error) {
            toast.error('Failed to add some items to cart');
        }
    };

    const shareWishlist = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My Wishlist - Anjaneya Herbals',
                text: `Check out my wishlist with ${wishlist.length} amazing wellness products!`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Wishlist link copied! 📋');
        }
    };

    const QuickViewModal = ({ item, onClose }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Quick View</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="aspect-square rounded-xl overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[1,2,3,4,5].map(star => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={`${star <= Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">{item.rating} ({item.reviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-3xl font-bold text-gray-900">
                                    <IndianRupee size={24} className="inline -mt-1" />
                                    {item.price}
                                </span>
                                {item.originalPrice && (
                                    <span className="text-lg text-gray-400 line-through">
                                        <IndianRupee size={18} className="inline -mt-0.5" />
                                        {item.originalPrice}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        addToCart(item);
                                        onClose();
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-lg transition-shadow"
                                >
                                    {addingToCart === item.id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            Adding...
                                        </span>
                                    ) : 'Add to Cart'}
                                </button>
                                <Link
                                    to={`/product/${item.id}`}
                                    className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} />
                                    View Product Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-24 pb-12 flex justify-center items-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full"
                />
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50/30 pt-24 pb-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-48 h-48 mx-auto mb-8 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-red-200 rounded-full animate-pulse"></div>
                        <Heart className="absolute inset-0 m-auto text-pink-500 w-32 h-32" />
                    </motion.div>
                    
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-4"
                    >
                        Your Wishlist Awaits
                    </motion.h1>
                    
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-lg mb-8"
                    >
                        Your collection of favorites is empty. Let's fill it with wellness products you'll love! 💝
                    </motion.p>
                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl"
                        >
                            <Sparkles className="inline mr-2 -mt-1" />
                            Start Exploring
                        </button>
                        <button
                            onClick={() => navigate('/category/best-sellers')}
                            className="w-full py-4 border-2 border-pink-500 text-pink-600 font-medium rounded-xl hover:bg-pink-50"
                        >
                            Discover Best Sellers
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50/30 pt-16 lg:pt-24 pb-12">
                {/* Header */}
                <div className="max-w-7xl mx-auto px-4 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                                >
                                    <HeartSolid className="w-6 h-6 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Wishlist</h1>
                                    <p className="text-gray-600">
                                        <span className="text-pink-600 font-bold">{wishlist.length}</span> cherished items
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Your personal collection of wellness favorites
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addAllToCart}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg"
                            >
                                <ShoppingCart className="inline mr-2 -mt-1" size={18} />
                                Add All to Cart
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={shareWishlist}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50"
                            >
                                <Share2 size={18} className="inline mr-2 -mt-1" />
                                Share
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="max-w-7xl mx-auto px-4 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Total Items</div>
                            <div className="text-2xl font-bold text-gray-900">{wishlist.length}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">In Stock</div>
                            <div className="text-2xl font-bold text-green-600">
                                {wishlist.filter(item => item.inStock).length}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Average Rating</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {wishlist.length > 0 ? (wishlist.reduce((sum, item) => sum + item.rating, 0) / wishlist.length).toFixed(1) : '0.0'}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Total Value</div>
                            <div className="text-2xl font-bold text-gray-900">
                                <IndianRupee size={20} className="inline -mt-1" />
                                {wishlist.reduce((sum, item) => sum + item.price, 0)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wishlist Items */}
                <div className="max-w-7xl mx-auto px-4">
                    <AnimatePresence>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {wishlist.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setShowQuickView(true);
                                    }}
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <motion.img
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.3 }}
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Tags */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            {item.tags?.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        {/* Remove Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => removeFromWishlist(item.id, e)}
                                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                            title="Remove from wishlist"
                                        >
                                            {removingId === item.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </motion.button>
                                        
                                        {/* Stock Status */}
                                        <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                                            item.inStock 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-pink-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-bold text-gray-900">
                                                    <IndianRupee size={18} className="inline -mt-1" />
                                                    {item.price}
                                                </span>
                                                {item.originalPrice && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        <IndianRupee size={14} className="inline -mt-0.5" />
                                                        {item.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="text-yellow-400 fill-current" />
                                                <span className="text-sm font-medium">{item.rating}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item, e);
                                                }}
                                                disabled={!item.inStock || addingToCart === item.id}
                                                className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 ${
                                                    item.inStock
                                                        ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white hover:shadow-lg'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {addingToCart === item.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ShoppingBag size={16} />
                                                )}
                                                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                            </motion.button>
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/product/${item.id}`);
                                                }}
                                                className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye size={16} />
                                                Quick View
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                    
                    {/* Empty Space Message */}
                    {wishlist.length < 4 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-12 text-center"
                        >
                            <div className="max-w-md mx-auto p-6 bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl border border-pink-200">
                                <Gift className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Add More Wellness!</h3>
                                <p className="text-gray-600 mb-4">
                                    Your wishlist has space for more healthful products. Keep exploring!
                                </p>
                                <button
                                    onClick={() => navigate('/category/new-arrivals')}
                                    className="px-6 py-2 bg-white border-2 border-pink-500 text-pink-600 rounded-xl hover:bg-pink-50 font-medium"
                                >
                                    Discover New Arrivals
                                </button>
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Bottom Navigation */}
                    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:border-green-500 hover:text-green-600 hover:bg-green-50 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => navigate('/cart')}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={18} />
                            View Cart
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <AnimatePresence>
                {showQuickView && selectedItem && (
                    <QuickViewModal
                        item={selectedItem}
                        onClose={() => {
                            setShowQuickView(false);
                            setSelectedItem(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default WishlistPage;