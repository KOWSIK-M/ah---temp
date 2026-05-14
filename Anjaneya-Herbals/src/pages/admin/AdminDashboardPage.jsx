import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/api';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  BarChart3,
  DollarSign,
  ShoppingBag,
  ChevronRight,
  Tag,
} from 'lucide-react';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        lowStockProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        setRefreshing(true);
        try {
            const statsData = await adminApi.getStats();
            setStats(statsData);
            setRecentOrders(statsData.recentOrders || []);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 24 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
        }
    };

    const statCards = [
        { 
            label: 'Total Products', 
            value: stats.totalProducts, 
            icon: <Package size={24} />, 
            color: 'from-blue-500 to-cyan-400',
            change: '+12%',
            link: '/admin/products',
            trend: 'up'
        },
        { 
            label: 'Total Orders', 
            value: stats.totalOrders, 
            icon: <ShoppingCart size={24} />, 
            color: 'from-green-500 to-emerald-400',
            change: '+24%',
            link: '/admin/orders',
            trend: 'up'
        },
        { 
            label: 'Total Revenue', 
            value: `₹${stats.totalRevenue.toLocaleString()}`, 
            icon: <DollarSign size={24} />, 
            color: 'from-purple-500 to-pink-400',
            change: '+18%',
            link: '/admin/orders',
            trend: 'up'
        },
        { 
            label: 'Total Customers', 
            value: stats.totalCustomers, 
            icon: <Users size={24} />, 
            color: 'from-orange-500 to-amber-400',
            change: '+8%',
            link: '/admin/customers',
            trend: 'up'
        },
        { 
            label: 'Pending Orders', 
            value: stats.pendingOrders, 
            icon: <Clock size={24} />, 
            color: 'from-yellow-500 to-orange-400',
            change: '',
            link: '/admin/orders?status=pending',
            trend: 'neutral'
        },
        { 
            label: 'Low Stock', 
            value: stats.lowStockProducts, 
            icon: <AlertCircle size={24} />, 
            color: 'from-red-500 to-rose-400',
            change: '-3',
            link: '/admin/products?filter=low-stock',
            trend: 'down'
        }
    ];

    const quickActions = [
        {
            label: 'Add New Product',
            description: 'Upload product with images & details',
            icon: <PlusCircle size={20} />,
            gradient: 'from-blue-500 to-cyan-400',
            link: '/admin/products/new',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
        },
        {
            label: 'Manage Orders',
            description: 'View and update order status',
            icon: <ShoppingCart size={20} />,
            gradient: 'from-green-500 to-emerald-400',
            link: '/admin/orders',
            bg: 'bg-green-50',
            border: 'border-green-200',
        },
        {
            label: 'View Customers',
            description: 'Browse and manage customers',
            icon: <Users size={20} />,
            gradient: 'from-purple-500 to-pink-400',
            link: '/admin/customers',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
        },
        {
            label: 'Low Stock Items',
            description: 'Restock products running low',
            icon: <AlertCircle size={20} />,
            gradient: 'from-orange-500 to-amber-400',
            link: '/admin/products?filter=low-stock',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
        },
        {
            label: 'Create Coupon',
            description: 'Add a new discount coupon code',
            icon: <Tag size={20} />,
            gradient: 'from-teal-500 to-emerald-400',
            link: '/admin/coupons',
            bg: 'bg-teal-50',
            border: 'border-teal-200',
        },
    ];



    return (
        <AdminLayout>
            <div className="mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-600 mt-1 text-sm lg:text-base">Welcome back! Here's what's happening with your store today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500 hidden lg:block">
                            Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-6 lg:mb-8">
                    {statCards.map((stat, index) => (
                        <Link
                            key={index}
                            to={stat.link}
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <div className="flex items-center gap-1">
                                    {stat.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                                    {stat.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                                    <span className={`text-xs font-medium ${
                                        stat.trend === 'up' ? 'text-green-600' : 
                                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                                    <span>View details</span>
                                    <ChevronRight size={12} className="ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Quick Actions & Recent Orders */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                            <Link
                                to="/admin/coupons"
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                Coupons →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    to={action.link}
                                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${action.bg} ${action.border}`}
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{action.label}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                            <Link 
                                to="/admin/orders"
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                View all →
                            </Link>
                        </div>
                        
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No recent orders</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="overflow-x-auto -mx-4 lg:mx-0">
                                    <table className="w-full min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className="font-medium text-green-600">
                                                            #{String(order.id).padStart(6, '0')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                                                {(order.customerName || order.userName || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{order.customerName || order.userName || 'Customer'}</p>
                                                                <p className="text-xs text-gray-500">{order.customerEmail || order.userEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {formatDate(order.createdAt)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-semibold text-gray-900">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {(() => {
                                                            const s = (order.status || '').toUpperCase();
                                                            const cfg = s === 'DELIVERED' ? 'bg-green-100 text-green-800'
                                                                      : s === 'PENDING'   ? 'bg-yellow-100 text-yellow-800'
                                                                      : s === 'SHIPPED'   ? 'bg-blue-100 text-blue-800'
                                                                      : s === 'CANCELLED' ? 'bg-red-100 text-red-800'
                                                                      : s === 'CONFIRMED' ? 'bg-cyan-100 text-cyan-800'
                                                                      : s === 'PROCESSING'? 'bg-purple-100 text-purple-800'
                                                                      : 'bg-gray-100 text-gray-800';
                                                            return (
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg}`}>
                                                                    {s.charAt(0) + s.slice(1).toLowerCase()}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Activity & Low Stock */}
                <div className="space-y-6">
                    {/* Activity Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentOrders.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No recent activity</p>
                                </div>
                            ) : (
                                recentOrders.slice(0, 5).map((order, index) => {
                                    const activity = {
                                        time: formatDate(order.createdAt),
                                        action: `Order #${String(order.id || '').padStart(6, '0')} placed`,
                                        user: order.customerName || order.userName || 'Customer',
                                        type: 'order',
                                    };

                                    return (
                                        <div key={order.id || index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    backgroundColor: '#DEF7EC',
                                                    color: '#0E9F6E'
                                                }}
                                            >
                                                <ShoppingCart size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-500">{activity.user}</span>
                                                    <span className="text-xs text-gray-400">{activity.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 p-4 lg:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
                                <p className="text-sm text-gray-600">{stats.lowStockProducts} products need attention</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {(stats.lowStockList || []).map((product, index) => (
                                <div key={product.id || index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-red-100">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                        <p className="text-xs text-red-600">Only {product.stock} left</p>
                                    </div>
                                    <Link 
                                        to={`/admin/products/${product.id}/edit`}
                                        className="text-xs font-medium text-red-600 hover:text-red-700"
                                    >
                                        Restock
                                    </Link>
                                </div>
                            ))}
                        </div>
                        
                        <Link 
                            to="/admin/products?filter=low-stock"
                            className="mt-4 block text-center text-sm font-medium text-red-600 hover:text-red-700 bg-white/80 py-2 rounded-lg border border-red-200 transition-colors"
                        >
                            View All Low Stock Items →
                        </Link>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Performance Summary</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">Order Completion</span>
                                    <span className="text-sm font-medium text-gray-900">94%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                                    <span className="text-sm font-medium text-gray-900">4.8/5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">Revenue Growth</span>
                                    <span className="text-sm font-medium text-green-600">+24%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            <div className="lg:hidden fixed bottom-20 right-4 z-40">
                <Link
                    to="/admin/products/new"
                    className="w-14 h-14 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                >
                    <PlusCircle size={24} className="text-white" />
                </Link>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage;