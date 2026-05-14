import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/api';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  User,
  Copy,
  Check,
  Filter,
  Download,
  UserPlus,
  Shield,
  TrendingUp,
  Activity,
  CreditCard,
  MapPin,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Printer,
  X,
  Star,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  BarChart3,
  Users as UsersIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminCustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedEmails, setCopiedEmails] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [filterBy, setFilterBy] = useState('ALL');
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeCustomers: 0,
        newThisMonth: 0,
        avgOrdersPerCustomer: 0,
        totalRevenue: 0
    });

    const fetchCustomers = useCallback(async (pageNo) => {
        setLoading(true);
        try {
            const params = {
                page: pageNo,
                size: 10,
                search: searchTerm || undefined,
                filter: filterBy !== 'ALL' ? filterBy : undefined
            };
            
            const response = await adminApi.getCustomers(params);
            setCustomers(response.content);
            setTotalPages(response.totalPages);
            setTotalCustomers(response.totalElements);
            setPage(response.number);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterBy]);

    const fetchCustomerStats = useCallback(async () => {
        try {
            const data = await adminApi.getCustomerStats({
                filter: filterBy !== 'ALL' ? filterBy : undefined
            });
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, [filterBy]);

    useEffect(() => {
        fetchCustomers(0);
        fetchCustomerStats();
    }, [fetchCustomers, fetchCustomerStats]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 0) {
                fetchCustomers(0);
            } else {
                setPage(0);
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchTerm, filterBy]);

    const copyAllEmails = () => {
        const emails = customers.map(c => c.email).join(', ');
        navigator.clipboard.writeText(emails);
        setCopiedEmails(true);
        setTimeout(() => setCopiedEmails(false), 2000);
    };

    const exportToExcel = async () => {
        try {
            setExportLoading(true);
            setShowExportMenu(false);
            
            const allCustomers = await adminApi.getAllCustomers({
                search: searchTerm || undefined,
                filter: filterBy !== 'ALL' ? filterBy : undefined
            });

            const exportData = allCustomers.map(customer => ({
                'Customer ID': customer.id,
                'First Name': customer.firstName,
                'Last Name': customer.lastName,
                'Email': customer.email,
                'Phone': customer.phone || 'N/A',
                'Join Date': new Date(customer.createdAt).toLocaleDateString(),
                'Status': customer.status || 'Active',
                'Total Orders': customer.totalOrders || 0,
                'Total Spent': customer.totalSpent || 0,
                'Last Order Date': customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
            
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const filename = `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            saveAs(blob, filename);
            
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export customers.');
        } finally {
            setExportLoading(false);
        }
    };

    const exportToCSV = async () => {
        try {
            setExportLoading(true);
            setShowExportMenu(false);
            
            const allCustomers = await adminApi.getAllCustomers({
                search: searchTerm || undefined,
                filter: filterBy !== 'ALL' ? filterBy : undefined
            });

            const exportData = allCustomers.map(customer => ({
                'Customer ID': customer.id,
                'Name': `${customer.firstName} ${customer.lastName}`,
                'Email': customer.email,
                'Phone': customer.phone || 'N/A',
                'Join Date': new Date(customer.createdAt).toLocaleDateString(),
                'Status': customer.status || 'Active'
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            
            const filename = `customers_${new Date().toISOString().split('T')[0]}.csv`;
            saveAs(blob, filename);
            
        } catch (err) {
            console.error('CSV export failed:', err);
            alert('Failed to export CSV.');
        } finally {
            setExportLoading(false);
        }
    };

    const viewCustomerDetails = (customer) => {
        setSelectedCustomer(customer);
        setShowCustomerDetails(true);
    };

    const CustomerDetailsModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl lg:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div>
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900">Customer Details</h3>
                        <p className="text-xs lg:text-sm text-gray-600">
                            {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCustomerDetails(false)}
                        className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={18} className="lg:w-5 lg:h-5" />
                    </button>
                </div>
                
                <div className="p-4 lg:p-6 overflow-y-auto max-h-[70vh]">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl lg:rounded-2xl flex items-center justify-center">
                            <div className="text-2xl lg:text-3xl font-bold text-blue-700">
                                {selectedCustomer?.firstName?.charAt(0)}{selectedCustomer?.lastName?.charAt(0)}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-3 lg:mb-4">
                                <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs lg:text-sm font-medium">
                                    <CheckCircle size={10} className="lg:w-3 lg:h-3" />
                                    Active Customer
                                </span>
                                {selectedCustomer?.totalOrders > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs lg:text-sm font-medium">
                                        <ShoppingBag size={10} className="lg:w-3 lg:h-3" />
                                        {selectedCustomer.totalOrders} Orders
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <div className="bg-gray-50 p-3 lg:p-4 rounded-lg lg:rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2 lg:mb-3 flex items-center gap-2 text-sm lg:text-base">
                                <User size={14} className="text-blue-600 lg:w-4 lg:h-4" />
                                Contact Information
                            </h4>
                            <div className="space-y-2 lg:space-y-3">
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <Mail size={14} className="text-gray-400 lg:w-4 lg:h-4" />
                                    <span className="text-sm lg:text-base text-gray-700">{selectedCustomer?.email}</span>
                                </div>
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <Phone size={14} className="text-gray-400 lg:w-4 lg:h-4" />
                                    <span className="text-sm lg:text-base text-gray-700">{selectedCustomer?.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <Calendar size={14} className="text-gray-400 lg:w-4 lg:h-4" />
                                    <span className="text-sm lg:text-base text-gray-700">
                                        Joined {new Date(selectedCustomer?.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 lg:p-4 rounded-lg lg:rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2 lg:mb-3 flex items-center gap-2 text-sm lg:text-base">
                                <BarChart3 size={14} className="text-green-600 lg:w-4 lg:h-4" />
                                Purchase Statistics
                            </h4>
                            <div className="space-y-2 lg:space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs lg:text-sm text-gray-600">Total Orders</span>
                                    <span className="text-sm lg:text-base font-bold text-gray-900">{selectedCustomer?.totalOrders || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs lg:text-sm text-gray-600">Total Spent</span>
                                    <span className="text-sm lg:text-base font-bold text-green-600">
                                        ₹{selectedCustomer?.totalSpent?.toLocaleString() || '0'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs lg:text-sm text-gray-600">Avg Order Value</span>
                                    <span className="text-sm lg:text-base font-bold text-gray-900">
                                        ₹{selectedCustomer?.avgOrderValue?.toLocaleString() || '0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 lg:p-4 rounded-lg lg:rounded-xl border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-sm lg:text-base">Customer Activity</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs lg:text-sm text-gray-600">Last Order</span>
                                <span className="text-sm lg:text-base font-medium text-gray-900">
                                    {selectedCustomer?.lastOrderDate 
                                        ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString()
                                        : 'No orders yet'
                                    }
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs lg:text-sm text-gray-600">Account Status</span>
                                <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs lg:text-sm font-medium">
                                    <Activity size={10} className="lg:w-3 lg:h-3" />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                        <button className="flex-1 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-white border border-gray-300 text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors font-medium">
                            Send Email
                        </button>
                        <button className="flex-1 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg lg:rounded-xl hover:opacity-90 transition-opacity font-medium">
                            View Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const filterOptions = [
        { value: 'ALL', label: 'All Customers' },
        { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
        { value: 'NEW_THIS_MONTH', label: 'New This Month', color: 'bg-blue-100 text-blue-800' },
        { value: 'HIGH_VALUE', label: 'High Value', color: 'bg-purple-100 text-purple-800' },
        { value: 'INACTIVE', label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AdminLayout>
            <div className="mb-4 lg:mb-8 px-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
                    <div>
                        <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Customer Management</h1>
                        <p className="text-gray-600 mt-1 text-xs lg:text-base">
                            {Number(totalCustomers || 0).toLocaleString()} total customers • Manage and analyze customer data
                        </p>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        {/* Export Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                disabled={exportLoading}
                                className="hidden lg:flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg lg:rounded-xl hover:opacity-90 transition-opacity text-sm lg:text-base font-medium shadow-lg disabled:opacity-70"
                            >
                                {exportLoading ? (
                                    <>
                                        <RefreshCw size={14} className="lg:w-4 lg:h-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download size={14} className="lg:w-4 lg:h-4" />
                                        Export
                                    </>
                                )}
                            </button>
                            
                            {showExportMenu && (
                                <div className="absolute top-full left-0 mt-2 w-40 lg:w-48 bg-white rounded-lg lg:rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
                                    <div className="p-1 lg:p-2">
                                        <button
                                            onClick={exportToExcel}
                                            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                                        >
                                            <FileSpreadsheet size={14} className="lg:w-4 lg:h-4" />
                                            <div>
                                                <div className="font-medium">Export to Excel</div>
                                                <div className="text-xs text-gray-500">.xlsx format</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={exportToCSV}
                                            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                                        >
                                            <FileText size={14} className="lg:w-4 lg:h-4" />
                                            <div>
                                                <div className="font-medium">Export to CSV</div>
                                                <div className="text-xs text-gray-500">.csv format</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={copyAllEmails}
                            className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg lg:rounded-xl hover:opacity-90 transition-opacity font-medium shadow-lg"
                        >
                            {copiedEmails ? <Check size={12} className="lg:w-4 lg:h-4" /> : <Copy size={12} className="lg:w-4 lg:h-4" />}
                            {copiedEmails ? 'Copied!' : 'Copy Emails'}
                        </button>

                        <button
                            onClick={() => fetchCustomers(page)}
                            disabled={loading}
                            className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 shadow-sm"
                        >
                            <RefreshCw size={12} className={loading ? 'lg:w-4 lg:h-4 animate-spin' : 'lg:w-4 lg:h-4'} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 lg:p-4 rounded-lg lg:rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Total Customers</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
                            <div className="flex items-center gap-1 mt-1 lg:mt-2">
                                <TrendingUp size={12} className="lg:w-3 lg:h-3 text-blue-600" />
                                <span className="text-xs text-blue-600">15% growth</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                            <UsersIcon size={16} className="lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 lg:p-4 rounded-lg lg:rounded-2xl border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Active Customers</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">{stats.activeCustomers}</p>
                        </div>
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                            <Activity size={16} className="lg:w-6 lg:h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 lg:p-4 rounded-lg lg:rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs lg:text-sm font-medium text-gray-600">New This Month</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">+{stats.newThisMonth}</p>
                        </div>
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                            <UserPlus size={16} className="lg:w-6 lg:h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 lg:p-4 rounded-lg lg:rounded-2xl border border-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Avg Customer Value</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.avgOrdersPerCustomer)}</p>
                        </div>
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                            <IndianRupee size={16} className="lg:w-6 lg:h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="mb-4 lg:mb-8">
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="search"
                            placeholder="Search customers by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 lg:pl-12 pr-8 lg:pr-4 py-2 lg:py-3 text-sm lg:text-base bg-white rounded-lg lg:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} className="lg:w-4 lg:h-4" />
                            </button>
                        )}
                    </div>
                    
                    {/* Filter Button (Mobile) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Filter size={16} />
                        Filters
                        {showFilters && <X size={14} />}
                    </button>
                    
                    {/* Desktop Filters */}
                    <div className="hidden lg:flex items-center gap-3">
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg lg:rounded-xl">
                            {filterOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setFilterBy(option.value)}
                                    className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all ${
                                        filterBy === option.value
                                            ? option.value === 'ALL' 
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : `text-white ${option.value === 'ACTIVE' ? 'bg-green-500' : option.value === 'NEW_THIS_MONTH' ? 'bg-blue-500' : option.value === 'HIGH_VALUE' ? 'bg-purple-500' : 'bg-gray-500'}`
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={exportToExcel}
                            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                            <Download size={14} />
                            Export
                        </button>
                    </div>
                </div>
                
                {/* Mobile Filters Dropdown */}
                {showFilters && (
                    <div className="lg:hidden mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-lg">
                        <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Filter By Status</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {filterOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setFilterBy(option.value);
                                            setShowFilters(false);
                                        }}
                                        className={`p-2 rounded-lg border transition-all text-xs font-medium ${
                                            filterBy === option.value
                                                ? option.value === 'ALL'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : `${option.color} border-transparent`
                                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Customers List */}
            {loading ? (
                <div className="bg-white rounded-lg lg:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="animate-pulse p-4 lg:p-6 space-y-3 lg:space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 lg:h-20 bg-gray-200 rounded-lg lg:rounded-xl" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                                                    <span className="text-lg font-bold text-blue-700">
                                                        {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {customer.firstName} {customer.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">ID: {String(customer.id).slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail size={14} />
                                                    <span className="text-sm">{customer.email}</span>
                                                </div>
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone size={14} />
                                                        <span className="text-sm">{customer.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{customer.totalOrders || 0} orders</span>
                                                <span className="text-sm text-green-600">
                                                    ₹{(customer.totalSpent || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                                                    customer.status === 'ACTIVE' 
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                    {customer.status === 'ACTIVE' ? (
                                                        <>
                                                            <CheckCircle size={12} />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock size={12} />
                                                            Inactive
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => viewCustomerDetails(customer)}
                                                    className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200 hover:border-blue-200"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors border border-gray-200 hover:border-green-200">
                                                    <Mail size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {customers.length === 0 && (
                            <div className="text-center py-12 lg:py-16">
                                <div className="w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <UsersIcon size={24} className="lg:w-10 lg:h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">No customers found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-4 lg:mb-6 text-sm lg:text-base">
                                    No customers match your current filters. Try adjusting your search criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilterBy('ALL');
                                        setSearchTerm('');
                                    }}
                                    className="px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg lg:rounded-xl hover:opacity-90 transition-opacity font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                        {customers.map((customer) => (
                            <div key={customer.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                                            <span className="text-base font-bold text-blue-700">
                                                {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">
                                                {customer.firstName} {customer.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{customer.email}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                        customer.status === 'ACTIVE' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {customer.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                <div className="mb-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Orders</p>
                                            <p className="text-sm font-bold text-gray-900">{customer.totalOrders || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Total Spent</p>
                                            <p className="text-sm font-bold text-green-600">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <Calendar size={12} />
                                        {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => viewCustomerDetails(customer)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <Eye size={12} />
                                            View
                                        </button>
                                        <button className="p-1 text-gray-600 hover:text-green-600 rounded">
                                            <Mail size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {customers.length === 0 && (
                            <div className="text-center py-8 bg-white rounded-lg border border-gray-200 shadow-lg">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <UsersIcon size={20} className="text-gray-300" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">No customers found</h3>
                                <p className="text-xs text-gray-500 mb-4">Try adjusting your filters or search term</p>
                                <button
                                    onClick={() => {
                                        setFilterBy('ALL');
                                        setSearchTerm('');
                                    }}
                                    className="px-4 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 lg:mt-8 bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4">
                                <div className="text-xs lg:text-sm text-gray-600">
                                    Showing {customers.length} of {totalCustomers} customers • Page {page + 1} of {totalPages}
                                </div>
                                <div className="flex items-center gap-1 lg:gap-2">
                                    <button
                                        onClick={() => fetchCustomers(page - 1)}
                                        disabled={page === 0 || loading}
                                        className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        <ChevronLeft size={14} className="lg:w-4 lg:h-4" />
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
                                                    onClick={() => fetchCustomers(pageNum)}
                                                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-all ${
                                                        page === pageNum
                                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={() => fetchCustomers(page + 1)}
                                        disabled={page >= totalPages - 1 || loading}
                                        className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        Next
                                        <ChevronRight size={14} className="lg:w-4 lg:h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Customer Details Modal */}
            {showCustomerDetails && selectedCustomer && <CustomerDetailsModal />}
        </AdminLayout>
    );
};

export default AdminCustomersPage;