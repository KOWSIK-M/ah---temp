import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import { 
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight, 
  Package, X, Star, TrendingUp, Sparkles, DollarSign,
  SlidersHorizontal, Grid3x3, List
} from 'lucide-react';

const AllProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'ALL');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState([0, 3000]);
    const [minRating, setMinRating] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [onSaleOnly, setOnSaleOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Fetch Initial Data
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch Products with debounce
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                size: viewMode === 'grid' ? 12 : 8,
                category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
                search: searchTerm || undefined,
                sort: sortBy === 'price_asc' ? 'price,asc' : 
                      sortBy === 'price_desc' ? 'price,desc' : 
                      sortBy === 'rating' ? 'rating,desc' : 'createdAt,desc',
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                minRating: minRating > 0 ? minRating : undefined,
                inStockOnly,
                onSaleOnly
            };
            
            const data = await productsApi.getAll(params);
            setProducts(data.content || []);
            setTotalPages(data.page?.totalPages || 0);
            setTotalProducts(data.page?.totalElements || 0);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    }, [page, selectedCategory, sortBy, searchTerm, priceRange, minRating, inStockOnly, onSaleOnly, viewMode]);

    // Debounced fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            // Use categories from reference code structure
            const formattedCategories = data.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
            }));
            setCategories(formattedCategories);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            // Fallback to reference categories
            setCategories([
                { id: 1, name: "Spices", slug: "spices" },
                { id: 2, name: "Dry Fruits", slug: "dry-fruits" },
                { id: 3, name: "Hair Care", slug: "hair-care" },
                { id: 4, name: "Body Care", slug: "body-care" },
                { id: 5, name: "Face Care", slug: "face-care" },
                { id: 6, name: "Health & Wellness", slug: "health-wellness" }
            ]);
        }
    };

    // Helper to map API product to ProductCard format
    const mapProductToCard = (p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.imageUrl,
        rating: p.rating || 0,
        reviews: p.reviewCount || 0,
        sale: p.onSale,
        category: p.categoryName,
        stock: p.stock,
        slug: p.slug
    });

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCategory('ALL');
        setPriceRange([0, 3000]);
        setMinRating(0);
        setInStockOnly(false);
        setOnSaleOnly(false);
        setSortBy('newest');
        setSearchTerm('');
        setPage(0);
    };

    // Calculate active filter count
    const activeFilterCount = [
        selectedCategory !== 'ALL',
        priceRange[0] > 0 || priceRange[1] < 3000,
        minRating > 0,
        inStockOnly,
        onSaleOnly
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="text-center mb-10 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-yellow-50/50 rounded-3xl -rotate-1 transform scale-105"></div>
                    <div className="relative z-10 py-12 px-6">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
                            Discover Natural Wellness
                        </h1>
                        <div className="w-32 h-1.5 bg-gradient-to-r from-green-400 to-yellow-400 mx-auto rounded-full mb-6"></div>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                            Explore our curated collection of premium herbs, organic oils, and holistic remedies for your wellness journey.
                        </p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-28">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal size={20} />
                                    Filters
                                </h2>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Categories</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('ALL')}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${selectedCategory === 'ALL' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        All Products
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${selectedCategory === cat.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <span>{cat.name}</span>
                                            {selectedCategory === cat.id && (
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Price Range</h3>
                                    <span className="text-sm text-gray-500">${priceRange[0]} - ${priceRange[1]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="3000"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="3000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 mt-4"
                                />
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Minimum Rating</h3>
                                <div className="flex gap-2">
                                    {[0, 3, 4, 4.5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setMinRating(rating)}
                                            className={`flex-1 py-2 rounded-lg border transition-all ${minRating === rating ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                {rating > 0 ? (
                                                    <>
                                                        <Star size={14} className="fill-current" />
                                                        <span className="text-sm">{rating}+</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm">Any</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Filters */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={inStockOnly}
                                            onChange={(e) => setInStockOnly(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border transition-all ${inStockOnly ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-green-400'}`}>
                                            {inStockOnly && (
                                                <svg className="w-4 h-4 text-white mx-auto mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-700 group-hover:text-gray-900">In Stock Only</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={onSaleOnly}
                                            onChange={(e) => setOnSaleOnly(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border transition-all ${onSaleOnly ? 'bg-red-500 border-red-500' : 'border-gray-300 group-hover:border-red-400'}`}>
                                            {onSaleOnly && (
                                                <svg className="w-4 h-4 text-white mx-auto mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-700 group-hover:text-gray-900">On Sale</span>
                                    {onSaleOnly && (
                                        <span className="ml-auto px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Hot</span>
                                    )}
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        {/* Top Control Bar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-8 sticky top-24 z-30">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                {/* Search Bar */}
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search herbs, oils, remedies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder-gray-400"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Desktop Controls */}
                                <div className="hidden md:flex items-center gap-4">
                                    {/* View Toggle */}
                                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Grid3x3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <List size={18} />
                                        </button>
                                    </div>

                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="pl-4 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 text-gray-700 font-medium cursor-pointer appearance-none"
                                        >
                                            <option value="newest">
                                                <span className="flex items-center gap-2">
                                                    <Sparkles size={16} />
                                                    Newest
                                                </span>
                                            </option>
                                            <option value="rating">Highest Rated</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    </div>

                                    {/* Mobile Filters Toggle */}
                                    <button
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                        className="lg:hidden flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors relative"
                                    >
                                        <Filter size={18} />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Mobile Only Controls */}
                                <div className="flex md:hidden items-center gap-2 w-full">
                                    <button
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                        className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium flex-1 justify-center relative"
                                    >
                                        <Filter size={18} />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </button>
                                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                                        >
                                            <Grid3x3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                                        >
                                            <List size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Bar */}
                            {activeFilterCount > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm text-gray-500">Active filters:</span>
                                        {selectedCategory !== 'ALL' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                                                {categories.find(c => c.id === selectedCategory)?.name}
                                                <button onClick={() => setSelectedCategory('ALL')}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )}
                                        {(priceRange[0] > 0 || priceRange[1] < 3000) && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                                                ${priceRange[0]} - ${priceRange[1]}
                                                <button onClick={() => setPriceRange([0, 3000])}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )}
                                        {minRating > 0 && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                                                {minRating}+ Stars
                                                <button onClick={() => setMinRating(0)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )}
                                        {inStockOnly && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                                                In Stock
                                                <button onClick={() => setInStockOnly(false)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )}
                                        {onSaleOnly && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm">
                                                On Sale
                                                <button onClick={() => setOnSaleOnly(false)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )}
                                        <button
                                            onClick={clearAllFilters}
                                            className="ml-auto text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Filters Modal */}
                        {showMobileFilters && (
                            <div className="lg:hidden fixed inset-0 z-50">
                                {/* Overlay */}
                                <div 
                                    className="absolute inset-0 bg-black/50"
                                    onClick={() => setShowMobileFilters(false)}
                                />
                                
                                {/* Filters Panel */}
                                <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-slideInRight">
                                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                            <button
                                                onClick={() => setShowMobileFilters(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            {activeFilterCount} active filters
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-8">
                                        {/* Category Filter */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Categories</h3>
                                            <div className="space-y-2">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setSelectedCategory(cat.id)}
                                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-green-50 text-green-700 font-medium border border-green-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Range */}
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Price Range</h3>
                                                <span className="text-lg font-bold text-gray-900">${priceRange[0]} - ${priceRange[1]}</span>
                                            </div>
                                            <div className="px-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="3000"
                                                    step="10"
                                                    value={priceRange[0]}
                                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                                                />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="3000"
                                                    step="10"
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg mt-4"
                                                />
                                            </div>
                                        </div>

                                        {/* Rating Filter */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Minimum Rating</h3>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[0, 3, 4, 4.5].map(rating => (
                                                    <button
                                                        key={rating}
                                                        onClick={() => setMinRating(rating)}
                                                        className={`py-3 rounded-xl border-2 transition-all ${minRating === rating ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            {rating > 0 ? (
                                                                <>
                                                                    <div className="flex items-center gap-0.5">
                                                                        <Star size={14} className="fill-current" />
                                                                        <span className="font-bold">{rating}</span>
                                                                    </div>
                                                                    <span className="text-xs mt-1">Stars</span>
                                                                </>
                                                            ) : (
                                                                <span className="font-medium">Any</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Checkbox Filters */}
                                        <div className="space-y-4">
                                            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${inStockOnly ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                        {inStockOnly && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-700">In Stock Only</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={inStockOnly}
                                                    onChange={(e) => setInStockOnly(e.target.checked)}
                                                    className="sr-only"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${onSaleOnly ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                                                        {onSaleOnly && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-700">On Sale Items</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={onSaleOnly}
                                                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                                                    className="sr-only"
                                                />
                                                {onSaleOnly && (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Hot</span>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={clearAllFilters}
                                                className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Reset All
                                            </button>
                                            <button
                                                onClick={() => setShowMobileFilters(false)}
                                                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedCategory !== 'ALL' 
                                        ? categories.find(c => c.id === selectedCategory)?.name
                                        : 'All Products'}
                                </h2>
                                <p className="text-gray-500 mt-1">
                                    {loading ? 'Loading...' : `${totalProducts} products found`}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                Page {page + 1} of {totalPages}
                            </div>
                        </div>

                        {/* Product Grid/List */}
                        {loading ? (
                            <div className={viewMode === 'grid' 
                                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6"
                                : "space-y-4"
                            }>
                                {[...Array(viewMode === 'grid' ? 6 : 4)].map((_, i) => (
                                    <div key={i} className={
                                        viewMode === 'grid'
                                            ? "bg-white rounded-2xl shadow-sm p-4 animate-pulse"
                                            : "bg-white rounded-2xl shadow-sm p-6 animate-pulse"
                                    }>
                                        <div className={
                                            viewMode === 'grid'
                                                ? "aspect-square bg-gray-200 rounded-xl mb-4"
                                                : "flex gap-6"
                                        }>
                                            {viewMode === 'list' && (
                                                <div className="w-40 h-40 bg-gray-200 rounded-xl flex-shrink-0"></div>
                                            )}
                                            <div className={viewMode === 'list' ? "flex-1" : ""}>
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6"
                                    : "space-y-4"
                            }>
                                {products.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={mapProductToCard(product)}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-dashed border-gray-300">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <Package size={48} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">
                                    We couldn't find any products matching your criteria. Try adjusting your filters or search term.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button 
                                        onClick={clearAllFilters}
                                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        Clear All Filters
                                    </button>
                                    <button 
                                        onClick={() => navigate('/')}
                                        className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-gray-500">
                                    Showing {products.length} of {totalProducts} products
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i;
                                            } else if (page < 3) {
                                                pageNum = i;
                                            } else if (page > totalPages - 4) {
                                                pageNum = totalPages - 5 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${page === pageNum ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Add CSS animations */}
            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AllProductsPage;