import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  Home,
  Package,
  Heart,
  MapPin,
  Phone,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close menus on route change
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const menuItems = [
    { label: "Home", href: "/", icon: <Home size={20} /> },
    {
      label: "Shop",
      href: "/#products",
      icon: <Package size={20} />,
      dropdown: [
        { label: "Spices (Premium)", href: "/category/spices" },
        { label: "Herbal Powders", href: "/category/herbal-powders" },
        { label: "Hair Care", href: "/category/hair-care" },
        { label: "Wellness", href: "/category/wellness" },
        { label: "Dry Fruits", href: "/category/dry-fruits" },
      ],
    },
    { label: "Spices", href: "/category/spices" },
    { label: "Herbal Powders", href: "/category/herbal-powders" },
    { label: "About Us", href: "/about", icon: <MapPin size={20} /> },
    { label: "Contact", href: "/contact", icon: <Phone size={20} /> },
  ];

  const mobileQuickLinks = [
    { label: "Home", href: "/", icon: <Home size={20} /> },
    { label: "Categories", href: "/#products", icon: <Package size={20} /> },
    { label: "Wishlist", href: "/wishlist", icon: <Heart size={20} /> },
    { label: "Cart", href: "/cart", icon: <ShoppingBag size={20} /> },
    { label: "Profile", href: "/profile", icon: <User size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (e, href) => {
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      if (location.pathname === path && hash) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          scrolled ? "bg-white shadow-lg py-2" : "bg-white py-3"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left: Menu Button (Mobile) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} className="text-gray-700" />
            </button>

            {/* Center: Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 mx-auto lg:mx-0"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white">
                  <img
                    src="/logo.jpg"
                    alt="Anjaneya Herbals Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // data: URI never fails → loop stops immediately
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%235C7A59' rx='20'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='13' font-weight='bold' fill='white' text-anchor='middle' dy='.35em'%3EAH%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-lg font-bold text-gray-900">
                  Anjaneya Herbals
                </h1>
                <span className="text-xs text-gray-500 font-medium">
                  Pure • Traditional • Natural
                </span>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">Anjaneya</h1>
              </div>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button (Mobile) */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-gray-700" />
              </button>

              {/* Desktop Search */}
              <div className="hidden lg:block relative w-64">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* User (Desktop) */}
              <div className="hidden lg:block relative">
                {isAuthenticated ? (
                  <div className="relative group">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <User size={20} className="text-gray-700" />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                          onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                          <div className="p-2">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <p className="font-medium text-gray-900">
                                Hi, {user?.name?.split(" ")[0] || "User"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user?.email}
                              </p>
                            </div>
                            <Link
                              to="/profile"
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              My Profile
                            </Link>
                            <Link
                              to="/orders"
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              My Orders
                            </Link>
                            <Link
                              to="/wishlist"
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              Wishlist
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-red-600 flex items-center"
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
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center text-gray-700"
                  >
                    <User size={20} />
                  </Link>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ShoppingBag size={20} className="text-gray-700" />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex items-center justify-around py-2 px-1">
          {mobileQuickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`flex flex-col items-center p-1 rounded-lg transition-colors flex-1 ${
                location.pathname === link.href
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
              onClick={(e) => {
                if (link.href.includes("#")) {
                  const [path, hash] = link.href.split("#");
                  if (location.pathname === path && hash) {
                    e.preventDefault();
                    const element = document.getElementById(hash);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }
              }}
            >
              <div className="relative">
                {link.icon}
                {link.label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsSearchOpen(false)}
            />

            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="fixed top-0 left-0 right-0 bg-white z-50 lg:hidden rounded-b-2xl shadow-lg"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">
                    Search Products
                  </h2>
                </div>

                <form onSubmit={handleSearch} className="relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search herbs, oils, medicines..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                </form>

                {/* Popular Searches */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Turmeric",
                      "Ashwagandha",
                      "Aloe Vera",
                      "Hair Oil",
                      "Weight Loss",
                    ].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          navigate(
                            `/products?search=${encodeURIComponent(term)}`
                          );
                          setIsSearchOpen(false);
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-screen w-80 max-w-full bg-white z-50 overflow-y-auto pb-20" // Added bottom padding
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full overflow-hidden border-2 border-white">
                      <img
                        src="/logo.jpg"
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">
                        Anjaneya Herbals
                      </h2>
                      <p className="text-xs text-gray-500">
                        Ayurvedic Wellness
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Info */}
                {isAuthenticated ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      Hello, {user?.name?.split(" ")[0]}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 py-2 text-center border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 py-2 text-center bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-4 pb-24"> {/* Increased bottom padding */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Menu
                </h3>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.label}>
                      <Link
                        to={item.href}
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleProductClick(
                            { preventDefault: () => {} },
                            item.href
                          );
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        {item.icon && (
                          <span className="text-gray-500">{item.icon}</span>
                        )}
                        <span className="font-medium">{item.label}</span>
                      </Link>

                      {/* Dropdown items */}
                      {item.dropdown && (
                        <div className="ml-8 pl-3 border-l-2 border-gray-200 space-y-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-2 px-3 text-sm text-gray-600 hover:text-green-600"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Account Links for logged in users */}
                {isAuthenticated && (
                  <>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        My Account
                      </h3>
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <User size={20} className="text-gray-500" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <Package size={20} className="text-gray-500" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <Heart size={20} className="text-gray-500" />
                          <span className="font-medium">Wishlist</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                        >
                          <LogOut size={20} />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Contact Info */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Contact
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="tel:+919876543210"
                      className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-xs text-gray-500">Call us at</p>
                      <p className="font-semibold text-gray-900">
                        +91 98765 43210
                      </p>
                    </a>
                    <a
                      href="mailto:support@anjaneyaherbals.com"
                      className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-xs text-gray-500">Email us at</p>
                      <p className="font-semibold text-gray-900">
                        support@anjaneyaherbals.com
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar and bottom navigation - Increased height */}
      <div className="lg:hidden h-20" />
      <div className="hidden lg:block h-16" />
    </>
  );
};

export default Navbar;