import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/api';
import {
  Search,
  Eye,
  Download,
  Printer,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Calendar,
  User,
  ExternalLink,
  ShoppingBag,
  Filter as FilterIcon,
  X,
  FileSpreadsheet,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={14} /> },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: <Package size={14} /> },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: <Truck size={14} /> },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle size={14} /> }
];

const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
    });

    // Debounced search term - waits 500ms after user stops typing
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchOrders();
        fetchOrderStats();
    }, [page, statusFilter, dateFilter, debouncedSearchTerm]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                size: 10,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                dateRange: dateFilter !== 'ALL' ? dateFilter : undefined,
                search: debouncedSearchTerm || undefined
            };
            
            const data = await adminApi.getOrders(params);
            setOrders(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalOrders(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const data = await adminApi.getOrderStats({
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                dateRange: dateFilter !== 'ALL' ? dateFilter : undefined
            });
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            fetchOrders();
            fetchOrderStats();
            if (showOrderDetails) {
                setShowOrderDetails(false);
            }
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    const getStatusInfo = (status) => {
        return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    (order.id && String(order.id).toLowerCase().includes(searchLower)) ||
                    (order.customerName?.toLowerCase().includes(searchLower)) ||
                    (order.customerEmail?.toLowerCase().includes(searchLower)) ||
                    (order.customerPhone?.toLowerCase().includes(searchLower))
                );
            }
            return true;
        });
    }, [orders, searchTerm]);

    const dateRanges = [
        { value: 'ALL', label: 'All Time' },
        { value: 'TODAY', label: 'Today' },
        { value: 'YESTERDAY', label: 'Yesterday' },
        { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
        { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
        { value: 'THIS_MONTH', label: 'This Month' }
    ];

    // Export Functions
    const exportToExcel = async () => {
        try {
            setExportLoading(true);
            setShowExportMenu(false);
            
            // Get all orders for export
            const response = await adminApi.getAllOrders({
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                dateRange: dateFilter !== 'ALL' ? dateFilter : undefined,
                search: searchTerm || undefined
            });
            const allOrders = response.content || [];

            const exportData = allOrders.map(order => ({
                'Order ID': order.id,
                'Date': formatDate(order.createdAt),
                'Customer Name': order.customerName,
                'Customer Email': order.customerEmail,
                'Customer Phone': order.customerPhone,
                'Status': getStatusInfo(order.status).label,
                'Items': order.items?.map(i => `${i.productName || i.name || ''} (x${i.quantity})`).join(', ') || '',
                'Discount': order.discountAmount || 0,
                'Shipping': order.shippingCharges || 0,
                'Tax': order.taxAmount,
                'Total Amount': order.totalAmount,
                'Shipping Address': `${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}`,
                'Payment Method': order.paymentMethod,
                'Payment Status': order.paymentStatus
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
            
            // Auto-size columns
            const maxWidth = exportData.reduce((w, r) => Math.max(w, r['Customer Name']?.length || 0), 10);
            worksheet['!cols'] = [{ wch: maxWidth + 2 }];
            
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const filename = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            saveAs(blob, filename);
            
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export orders. Please try again.');
        } finally {
            setExportLoading(false);
        }
    };

    const exportToCSV = async () => {
    try {
        setExportLoading(true);
        setShowExportMenu(false);
        
        const response = await adminApi.getAllOrders({
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            dateRange: dateFilter !== 'ALL' ? dateFilter : undefined,
            search: searchTerm || undefined
        });
        const allOrders = response.content || [];

        const exportData = allOrders.map(order => ({
            'Order ID': order.id,
            'Date': formatDate(order.createdAt),
            'Customer Name': order.customerName,
            'Customer Email': order.customerEmail,
            'Customer Phone': order.customerPhone,
            'Status': getStatusInfo(order.status).label,
            'Total Amount': order.totalAmount,
            'Payment Status': order.paymentStatus
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        saveAs(blob, filename);

    } catch (err) {
        console.error('CSV export failed:', err);
        alert('Failed to export CSV.');
    } finally {
        setExportLoading(false);
    }
};


    const printOrders = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Orders Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .stats { margin-bottom: 20px; }
                        .total { font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Orders Report</h1>
                        <p>Generated: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="stats">
                        <p>Total Orders: ${totalOrders}</p>
                        <p>Total Revenue: ${formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredOrders.map(order => `
                                <tr>
                                    <td>#${order.id.toString().padStart(6, '0')}</td>
                                    <td>${formatDate(order.createdAt)}</td>
                                    <td>${order.customerName}</td>
                                    <td>${formatCurrency(order.totalAmount)}</td>
                                    <td>${getStatusInfo(order.status).label}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        Total: ${filteredOrders.length} orders
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };

    const OrderDetailsModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                        <p className="text-sm text-gray-600">#{selectedOrder?.id} • {formatDate(selectedOrder?.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={printOrders}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Print Invoice"
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            onClick={() => setShowOrderDetails(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User size={16} className="text-green-600" />
                                Customer Details
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <User size={14} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedOrder?.customerName}</p>
                                        <p className="text-sm text-gray-500">Customer</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Mail size={14} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedOrder?.customerEmail}</p>
                                        <p className="text-sm text-gray-500">Email</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Phone size={14} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedOrder?.customerPhone}</p>
                                        <p className="text-sm text-gray-500">Phone</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin size={16} className="text-red-600" />
                                Shipping Address
                            </h4>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1 shrink-0">
                                    <MapPin size={14} className="text-red-600" />
                                </div>
                                <div className="space-y-1 text-sm">
                                    {selectedOrder?.shippingAddressSnapshot ? (
                                        <p className="text-gray-700 whitespace-pre-line">{selectedOrder.shippingAddressSnapshot}</p>
                                    ) : selectedOrder?.shippingAddress ? (
                                        <>
                                            <p className="font-medium text-gray-900">
                                                {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                                            </p>
                                            <p className="text-gray-600">{selectedOrder.shippingAddress.addressLine1}</p>
                                            {selectedOrder.shippingAddress.addressLine2 && (
                                                <p className="text-gray-600">{selectedOrder.shippingAddress.addressLine2}</p>
                                            )}
                                            <p className="text-gray-600">
                                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pincode}
                                            </p>
                                            {selectedOrder.shippingAddress.phone && (
                                                <p className="text-gray-600">📞 {selectedOrder.shippingAddress.phone}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-400 italic">Address not available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-8">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={16} className="text-orange-600" />
                            Order Items
                        </h4>
                        <div className="space-y-3">
                            {selectedOrder?.items?.map((item, index) => {
                                const name  = item.productName  || item.name  || 'Product';
                                const price = item.priceAtPurchase ?? item.price ?? 0;
                                const qty   = item.quantity || 1;
                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {item.productImageUrl ? (
                                                <img src={item.productImageUrl} alt={name}
                                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                                                    <Package size={18} className="text-orange-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{name}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-sm text-gray-500">Qty: {qty}</span>
                                                    <span className="text-sm text-gray-500">₹{Number(price).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-gray-900">
                                            ₹{Number(qty * price).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                        <div className="space-y-3">
                            {selectedOrder?.shippingCharges != null && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-gray-900">
                                        {Number(selectedOrder.shippingCharges) === 0 ? 'Free' : formatCurrency(selectedOrder.shippingCharges)}
                                    </span>
                                </div>
                            )}
                            {selectedOrder?.taxAmount != null && Number(selectedOrder.taxAmount) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Tax (GST)</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(selectedOrder.taxAmount)}</span>
                                </div>
                            )}
                            {selectedOrder?.discountAmount != null && Number(selectedOrder.discountAmount) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-700">
                                        Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}
                                    </span>
                                    <span className="font-medium text-green-700">
                                        -{formatCurrency(selectedOrder.discountAmount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span className="text-green-600">{formatCurrency(selectedOrder?.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Update Order Status</label>
                            <select
                                value={selectedOrder?.status}
                                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                            >
                                {ORDER_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={printOrders}
                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 justify-center"
                        >
                            <Printer size={18} />
                            Print Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-gray-600 mt-1 text-sm lg:text-base">
                            {totalOrders.toLocaleString()} total orders • Manage and track customer orders
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Export Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                disabled={exportLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-lg disabled:opacity-70"
                            >
                                {exportLoading ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        Export
                                    </>
                                )}
                            </button>
                            
                            {showExportMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
                                    <div className="p-2">
                                        <button
                                            onClick={exportToExcel}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors text-sm"
                                        >
                                            <FileSpreadsheet size={16} />
                                            <div>
                                                <div className="font-medium">Export to Excel</div>
                                                <div className="text-xs text-gray-500">.xlsx format</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={exportToCSV}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors text-sm"
                                        >
                                            <FileText size={16} />
                                            <div>
                                                <div className="font-medium">Export to CSV</div>
                                                <div className="text-xs text-gray-500">.csv format</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={printOrders}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors text-sm"
                                        >
                                            <Printer size={16} />
                                            <div>
                                                <div className="font-medium">Print Report</div>
                                                <div className="text-xs text-gray-500">Printer friendly</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={fetchOrders}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp size={14} className="text-green-600" />
                                <span className="text-xs text-green-600">12% from last month</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <DollarSign size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.avgOrderValue)}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BarChart3 size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingOrders}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <AlertCircle size={14} className="text-yellow-600" />
                                <span className="text-xs text-yellow-600">Requires attention</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Delivered</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.deliveredOrders}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp size={14} className="text-purple-600" />
                                <span className="text-xs text-purple-600">Successfully delivered</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <CheckCircle size={24} className="text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="search"
                            placeholder="Search orders by ID, customer, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                        />
                    </div>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <FilterIcon size={20} />
                        Filters
                        {showFilters && <X size={16} />}
                    </button>
                    
                    <div className="hidden lg:flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm shadow-sm"
                        >
                            <option value="ALL">All Status</option>
                            {ORDER_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                        
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm shadow-sm"
                        >
                            {dateRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {showFilters && (
                    <div className="lg:hidden mt-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Status Filter</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setStatusFilter('ALL')}
                                        className={`px-4 py-2 rounded-lg transition-all ${statusFilter === 'ALL' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        All
                                    </button>
                                    {ORDER_STATUSES.map(status => (
                                        <button
                                            key={status.value}
                                            onClick={() => setStatusFilter(status.value)}
                                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${statusFilter === status.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            {status.icon}
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {dateRanges.map(range => (
                                        <button
                                            key={range.value}
                                            onClick={() => setDateFilter(range.value)}
                                            className={`p-3 rounded-xl border transition-all ${dateFilter === range.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="animate-pulse p-6 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px]">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Update Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.map((order) => {
                                    const statusInfo = getStatusInfo(order.status);
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">#{order.id.toString().padStart(6, '0')}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{order.items?.length || 0} items</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{order.customerName}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{order.customerEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-lg">{formatCurrency(order.totalAmount)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color} border border-transparent`}>
                                                        {statusInfo.icon}
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => viewOrderDetails(order)}
                                                        className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors border border-gray-200 hover:border-green-200"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                                    >
                                                        {ORDER_STATUSES.map(status => (
                                                            <option key={status.value} value={status.value}>
                                                                {status.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>{/* end overflow-x-auto */}

                        {filteredOrders.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <ShoppingBag size={40} className="text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">No orders found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    No orders match your current filters. Try adjusting your search criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setStatusFilter('ALL');
                                        setDateFilter('ALL');
                                        setSearchTerm('');
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                        {filteredOrders.map((order) => {
                            const statusInfo = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-gray-900 text-lg">#{order.id.toString().padStart(6, '0')}</h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900 text-xl">{formatCurrency(order.totalAmount)}</div>
                                            <p className="text-xs text-gray-500 mt-1">{order.items?.length || 0} items</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                                                <User size={18} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.customerName}</p>
                                                <p className="text-sm text-gray-500 mt-1">{order.customerEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => viewOrderDetails(order)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-green-600 hover:text-green-700 font-medium"
                                        >
                                            <Eye size={18} />
                                            View Details
                                        </button>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                        >
                                            {ORDER_STATUSES.map(status => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {filteredOrders.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <ShoppingBag size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                                <button
                                    onClick={() => {
                                        setStatusFilter('ALL');
                                        setDateFilter('ALL');
                                        setSearchTerm('');
                                    }}
                                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-600">
                                    Showing {orders.length} of {totalOrders} orders • Page {page + 1} of {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0 || loading}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        <ChevronLeft size={18} />
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
                                                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                                                        page === pageNum
                                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1 || loading}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        Next
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && <OrderDetailsModal />}
        </AdminLayout>
    );
};

export default AdminOrdersPage;