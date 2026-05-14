import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi, categoriesApi } from '../../services/api';
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  IndianRupee,
  Box,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  BarChart3,
  Download,
  AlertCircle,
  Star,
  Layers,
  Tag,
  Hash,
  Grid,
  List
} from 'lucide-react';

const AdminProductsPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [stockFilter, setStockFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [page, categoryFilter, stockFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                size: viewMode === 'grid' ? 12 : 10,
                category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
                stock: stockFilter !== 'ALL' ? stockFilter : undefined,
                search: searchTerm || undefined
            };
            
            const data = await adminApi.getProducts(params);
            setProducts(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalProducts(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await adminApi.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
        try {
            await adminApi.deleteProduct(id);
            fetchProducts();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) return;
        
        try {
            await Promise.all(selectedProducts.map(id => adminApi.deleteProduct(id)));
            setSelectedProducts([]);
            fetchProducts();
        } catch (err) {
            alert('Failed to delete selected products');
        }
    };

    const toggleProductSelection = (id) => {
        setSelectedProducts(prev => 
            prev.includes(id) 
                ? prev.filter(productId => productId !== id)
                : [...prev, id]
        );
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <XCircle size={12} /> };
        if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle size={12} /> };
        return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    product.name.toLowerCase().includes(searchLower) ||
                    product.sku?.toLowerCase().includes(searchLower) ||
                    product.categoryName?.toLowerCase().includes(searchLower)
                );
            }
            return true;
        });
    }, [products, searchTerm]);

    const stockFilters = [
        { value: 'ALL', label: 'All Stock' },
        { value: 'IN_STOCK', label: 'In Stock' },
        { value: 'LOW_STOCK', label: 'Low Stock (<10)' },
        { value: 'OUT_OF_STOCK', label: 'Out of Stock' }
    ];

    const stats = {
        total: totalProducts,
        inStock: products.filter(p => p.stock > 10).length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        outOfStock: products.filter(p => p.stock === 0).length
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1 text-sm lg:text-base">
                            {totalProducts.toLocaleString()} products • Manage your catalog
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/products/new"
                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <PlusCircle size={20} />
                            <span className="hidden sm:inline">Add Product</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 lg:mb-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Package size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">In Stock</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">{stats.inStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.lowStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <AlertCircle size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-700 mt-1">{stats.outOfStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <XCircle size={24} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="search"
                            placeholder="Search products by name, SKU, category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                        />
                    </div>
                    
                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <Filter size={20} />
                        Filters
                        {showFilters && <ChevronRight size={16} className="rotate-90" />}
                    </button>
                    
                    {/* Desktop Filters & Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'grid' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'list' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                        
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            {stockFilters.map(filter => (
                                <option key={filter.value} value={filter.value}>{filter.label}</option>
                            ))}
                        </select>
                        
                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
                
                {/* Mobile Filters Dropdown */}
                {showFilters && (
                    <div className="lg:hidden mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                    <option value="ALL">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                    {stockFilters.map(filter => (
                                        <option key={filter.value} value={filter.value}>{filter.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex-1 py-2 rounded-lg border ${
                                            viewMode === 'grid' 
                                                ? 'bg-green-50 border-green-300 text-green-600' 
                                                : 'border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex-1 py-2 rounded-lg border ${
                                            viewMode === 'list' 
                                                ? 'bg-green-50 border-green-300 text-green-600' 
                                                : 'border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border border-green-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Package size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{selectedProducts.length} products selected</p>
                                    <p className="text-sm text-gray-600">Select actions to perform</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                >
                                    Delete Selected
                                </button>
                                <button
                                    onClick={() => setSelectedProducts([])}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Content */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="animate-pulse p-4 lg:p-6 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {filteredProducts.map((product) => {
                                const stockStatus = getStockStatus(product.stock);
                                return (
                                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                        {/* Product Image & Selection */}
                                        <div className="relative">
                                            <div className="aspect-square bg-gradient-to-br from-green-50 to-yellow-50 overflow-hidden">
                                                <img
                                                    src={product.imageUrl || 'https://placehold.co/400x400?text=No+Image'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="absolute top-3 left-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product.id)}
                                                    onChange={() => toggleProductSelection(product.id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                />
                                            </div>
                                            {product.featured && (
                                                <div className="absolute top-3 right-3 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <Star size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Layers size={12} />
                                                            {product.categoryName || 'Uncategorized'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Hash size={12} />
                                                            {product.sku || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price & Stock */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 text-lg">
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                        {product.onSale && product.oldPrice && (
                                                            <span className="text-sm text-gray-400 line-through">
                                                                {formatCurrency(product.oldPrice)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                            {stockStatus.icon}
                                                            {stockStatus.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <Link
                                                    to={`/admin/products/${product.id}/edit`}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                                    onChange={() => {
                                                        if (selectedProducts.length === filteredProducts.length) {
                                                            setSelectedProducts([]);
                                                        } else {
                                                            setSelectedProducts(filteredProducts.map(p => p.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                />
                                            </th>
                                            <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                                            <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                            <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                            <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                                            <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredProducts.map((product) => {
                                            const stockStatus = getStockStatus(product.stock);
                                            return (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedProducts.includes(product.id)}
                                                            onChange={() => toggleProductSelection(product.id)}
                                                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={product.imageUrl || 'https://placehold.co/50x50?text=?'}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                                <div className="text-sm text-gray-500 mt-1">SKU: {product.sku || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-700">{product.categoryName || 'Uncategorized'}</span>
                                                            {product.featured && (
                                                                <Star size={14} className="text-yellow-500" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{formatCurrency(product.price)}</div>
                                                            {product.onSale && product.oldPrice && (
                                                                <div className="text-sm text-gray-400 line-through">
                                                                    {formatCurrency(product.oldPrice)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                            {stockStatus.icon}
                                                            {stockStatus.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                to={`/admin/products/${product.id}/edit`}
                                                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            >
                                                                <Edit size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <Package size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-6">Try changing your filters or search term</p>
                            <Link
                                to="/admin/products/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                <PlusCircle size={20} />
                                Add Your First Product
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && filteredProducts.length > 0 && (
                        <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Showing {filteredProducts.length} of {totalProducts} products
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0 || loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i;
                                        } else if (page <= 2) {
                                            pageNum = i;
                                        } else if (page >= totalPages - 3) {
                                            pageNum = totalPages - 5 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                                    page === pageNum
                                                        ? 'bg-green-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}
                                    
                                    {totalPages > 5 && (
                                        <span className="px-2 text-gray-500">...</span>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1 || loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
};

export default AdminProductsPage;