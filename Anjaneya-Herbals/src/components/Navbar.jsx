import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, User, Leaf, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { cartCount } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Close mobile menu on route change
        setIsMenuOpen(false);
    }, [location.pathname]);

    const menuItems = [
        { label: 'HOME', href: '/' },
        { 
            label: 'SHOPS', 
            href: '/#products',
            dropdown: [
                { label: 'Spices (Premium)', href: '/category/spices' },
                { label: 'Herbal Powders', href: '/category/herbal-powders' },
                { label: 'Hair Care', href: '/category/hair-care' },
                { label: 'Wellness', href: '/category/wellness' },
                { label: 'Dry Fruits', href: '/category/dry-fruits' }
            ]
        },
        { label: 'SPICES', href: '/category/spices' },
        { label: 'HERBAL POWDERS', href: '/category/herbal-powders' },
        { label: 'ABOUT', href: '/#about' },
        { label: 'CONTACT', href: '/contact' },
    ];

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        toast.success('Logged out successfully');
        navigate('/');
    };

    const handleProductClick = (e, href) => {
        if (href.includes('#')) {
            // Handle hash navigation
            const [path, hash] = href.split('#');
            if (location.pathname === path && hash) {
                // If we're already on the same page, scroll to section
                e.preventDefault();
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-effect py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center space-x-3 group cursor-pointer"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center space-x-3"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-moss to-brand-sage rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white">
                                    <img
                                        src="/logo.jpg"
                                        alt="Anjaneya Herbals Logo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/48x48/5C7A59/FFFFFF?text=AH";
                                        }}
                                    />
                                </div>
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="absolute -inset-1 bg-gradient-to-r from-brand-terracotta/20 to-brand-sage/20 rounded-full blur"
                                />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-serif font-bold text-brand-earth group-hover:text-brand-terracotta transition-colors">
                                    Anjaneya Herbals
                                </h1>
                                <span className="text-xs text-brand-sage font-medium tracking-widest">
                                    Pure • Traditional • Natural
                                </span>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {menuItems.map((item) => (
                            <div key={item.label} className="relative group" onMouseEnter={() => item.dropdown && setIsDropdownOpen(true)}
                                onMouseLeave={() => item.dropdown && setIsDropdownOpen(false)}>
                                <Link
                                    to={item.href}
                                    onClick={(e) => handleProductClick(e, item.href)}
                                    className="px-4 py-2 text-sm font-medium text-brand-black hover:text-brand-terracotta transition-colors flex items-center"
                                >
                                    {item.label}
                                    {item.dropdown && <ChevronDown size={16} className="ml-1" />}
                                </Link>

                                {item.dropdown && (
                                    <div className={`absolute top-full left-0 w-48 pt-2 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                        <div className="glass-effect rounded-xl p-3 shadow-2xl border border-white/20">
                                            {item.dropdown.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    to={subItem.href}
                                                    className="block px-4 py-2 text-sm text-brand-black hover:bg-brand-sand hover:text-brand-terracotta rounded-lg transition-all"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-brand-terracotta to-brand-sage transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden sm:block p-2 rounded-full hover:bg-brand-sand transition-colors"
                            onClick={() => {
                                // Implement search functionality
                                toast.success('Search feature coming soon!');
                            }}
                        >
                            <Search size={20} className="text-brand-earth" />
                        </motion.button>

                        {/* User Authentication */}
                        <div className="relative hidden sm:block">
                            {isAuthenticated ? (
                                <div className="relative group">
                                    <button
                                        className="p-2 rounded-full hover:bg-brand-sand transition-colors flex items-center"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        <User size={20} className="text-brand-earth" />
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 top-full mt-2 w-48 glass-effect rounded-xl shadow-2xl border border-white/20 overflow-hidden"
                                                onMouseLeave={() => setIsDropdownOpen(false)}
                                            >
                                                <div className="p-2">
                                                    <div className="px-4 py-3 border-b border-white/10">
                                                        <p className="font-medium text-brand-earth">Hi, {user?.name?.split(' ')[0] || 'User'}</p>
                                                        <p className="text-xs text-brand-sage">{user?.email}</p>
                                                    </div>
                                                    <Link
                                                        to="/profile"
                                                        className="block px-4 py-3 hover:bg-brand-sand transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        My Profile
                                                    </Link>
                                                    <Link
                                                        to="/orders"
                                                        className="block px-4 py-3 hover:bg-brand-sand transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        My Orders
                                                    </Link>
                                                    <Link
                                                        to="/wishlist"
                                                        className="block px-4 py-3 hover:bg-brand-sand transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        Wishlist
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-3 hover:bg-brand-sand transition-colors text-red-600 flex items-center"
                                                    >
                                                        <LogOut size={16} className="mr-2" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="p-2 rounded-full hover:bg-brand-sand transition-colors flex items-center text-brand-earth"
                                >
                                    <User size={20} />
                                </Link>
                            )}
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="relative">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-full hover:bg-brand-sand transition-colors"
                            >
                                <ShoppingBag size={20} className="text-brand-earth" />
                            </motion.button>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                                >
                                    {cartCount > 99 ? '99+' : cartCount}
                                </motion.span>
                            )}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-brand-sand transition-colors"
                        >
                            {isMenuOpen ? (
                                <X size={24} className="text-brand-earth" />
                            ) : (
                                <Menu size={24} className="text-brand-earth" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden fixed inset-0 top-20 bg-white z-40"
                    >
                        <div className="h-full overflow-y-auto">
                            {/* User Info in Mobile Menu */}
                            <div className="p-4 border-b bg-brand-sand">
                                {isAuthenticated ? (
                                    <div>
                                        <p className="font-bold text-brand-earth">Welcome, {user?.name}</p>
                                        <p className="text-sm text-brand-sage">{user?.email}</p>
                                    </div>
                                ) : (
                                    <div className="flex space-x-3">
                                        <Link
                                            to="/login"
                                            className="flex-1 py-2 text-center border border-brand-terracotta text-brand-terracotta rounded-lg hover:bg-brand-terracotta hover:text-white transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="flex-1 py-2 text-center bg-brand-terracotta text-white rounded-lg hover:bg-brand-earth transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Items */}
                            <div className="p-4 space-y-2">
                                {menuItems.map((item) => (
                                    <div key={item.label}>
                                        <Link
                                            to={item.href}
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleProductClick({ preventDefault: () => { } }, item.href);
                                            }}
                                            className="block py-3 px-4 rounded-xl text-brand-black hover:bg-brand-sand hover:text-brand-terracotta transition-colors font-semibold text-lg"
                                        >
                                            {item.label}
                                        </Link>

                                        {/* Mobile Dropdown */}
                                        {item.dropdown && (
                                            <div className="ml-4 pl-4 border-l-2 border-brand-sand mt-1 space-y-1">
                                                {item.dropdown.map((subItem) => (
                                                    <Link
                                                        key={subItem.label}
                                                        to={subItem.href}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="block py-3 px-4 text-base text-brand-sage hover:text-brand-terracotta transition-colors"
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Authenticated User Links in Mobile */}
                                {isAuthenticated && (
                                    <>
                                        <div className="border-t border-brand-sand my-4 pt-4">
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block py-3 px-4 rounded-xl text-brand-black hover:bg-brand-sand hover:text-brand-terracotta transition-colors font-medium"
                                            >
                                                My Profile
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block py-3 px-4 rounded-xl text-brand-black hover:bg-brand-sand hover:text-brand-terracotta transition-colors font-medium"
                                            >
                                                My Orders
                                            </Link>
                                            <Link
                                                to="/wishlist"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block py-3 px-4 rounded-xl text-brand-black hover:bg-brand-sand hover:text-brand-terracotta transition-colors font-medium"
                                            >
                                                Wishlist
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile Cart Button */}
                            <div className="p-4 border-t">
                                <Link
                                    to="/cart"
                                    className="flex items-center justify-between py-3 px-4 rounded-lg bg-brand-sand hover:bg-brand-sage/10 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="font-medium">View Cart</span>
                                    <div className="flex items-center">
                                        <ShoppingBag size={20} className="mr-2" />
                                        {cartCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                {cartCount} items
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;