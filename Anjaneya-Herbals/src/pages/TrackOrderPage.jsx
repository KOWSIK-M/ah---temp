import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Package, Truck, CheckCircle, MapPin, Calendar,
    CreditCard, ChevronRight, ArrowLeft, Home
} from 'lucide-react';
import { motion } from 'framer-motion';

const TrackOrderPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch delay
        const timer = setTimeout(() => {
            try {
                const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                const foundOrder = savedOrders.find(o => o.id === orderId);
                setOrder(foundOrder);
            } catch (error) {
                console.error('Error finding order:', error);
            } finally {
                setLoading(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find an order with ID #{orderId}. Please check the ID and try again.
                        </p>
                        <Link
                            to="/orders"
                            className="inline-flex items-center px-6 py-3 bg-brand-black text-white rounded-lg hover:bg-black transition-colors"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate current step based on status
    const steps = [
        { id: 'placed', label: 'Order Placed', icon: Calendar, date: order.createdAt },
        { id: 'processing', label: 'Processing', icon: Package, date: null },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: null },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle, date: order.estimatedDelivery }
    ];

    const getCurrentStepIndex = (status) => {
        switch (status) {
            case 'processing': return 1;
            case 'shipped': return 2;
            case 'delivered': return 3;
            case 'cancelled': return -1;
            default: return 0;
        }
    };

    const currentStep = getCurrentStepIndex(order.status);

    return (
        <div className="min-h-screen bg-brand-cream pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/orders" className="inline-flex items-center text-gray-500 hover:text-brand-terracotta mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-1" />
                        Back to My Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-brand-black">Track Order</h1>
                            <p className="text-gray-600 mt-1">Order ID: <span className="font-mono text-gray-700">#{order.id}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${order.status === 'delivered' ? 'bg-brand-moss/10 text-brand-moss' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                    'bg-brand-earth/10 text-brand-earth'
                                }`}>
                                {order.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tracking Timeline */}
                {order.status !== 'cancelled' ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-10 mb-8 border border-brand-sand">
                        <div className="relative">
                            {/* Progress Bar Background */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-brand-sand -translate-y-1/2 z-0"></div>

                            {/* Active Progress Bar */}
                            <div
                                className="hidden md:block absolute top-1/2 left-0 h-1 bg-brand-terracotta -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            ></div>

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                                {steps.map((step, index) => {
                                    const isCompleted = index <= currentStep;
                                    const isCurrent = index === currentStep;

                                    return (
                                        <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-4 group">
                                            {/* Icon Circle */}
                                            <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isCompleted
                                                    ? 'bg-brand-terracotta border-brand-terracotta text-white'
                                                    : 'bg-white border-brand-sand text-gray-300 group-hover:border-brand-clay'
                                                }
                        ${isCurrent ? 'ring-4 ring-orange-100 scale-110' : ''}
                      `}>
                                                <step.icon size={20} />
                                            </div>

                                            {/* Text */}
                                            <div className="md:text-center flex-1">
                                                <p className={`font-semibold ${isCompleted ? 'text-brand-black' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {step.date && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(step.date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-50 rounded-xl p-8 mb-8 border border-red-100 flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-full">
                            <Home size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-800">Order Cancelled</h3>
                            <p className="text-red-600">This order has been cancelled and will not be delivered.</p>
                        </div>
                    </div>
                )}

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-brand-sand overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-bold text-brand-black">Order Items</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item, index) => (
                                <div key={index} className="p-6 flex items-start gap-4">
                                    <div className="w-20 h-20 bg-brand-sand/30 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <Link to={`/product/${item.id}`} className="font-medium text-brand-black hover:text-brand-terracotta transition-colors">
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold text-brand-black">₹{item.price}</span>
                                            <span className="text-sm font-medium text-gray-600">Total: ₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-brand-cream border-t border-brand-sand">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{order.payment.amount - 50}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-brand-moss">Free</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-brand-sand">
                                <span className="text-lg font-bold text-brand-black">Total Amount</span>
                                <span className="text-lg font-bold text-brand-terracotta">₹{order.payment.amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Payment Info */}
                    <div className="space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-xl shadow-sm border border-brand-sand p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="text-brand-terracotta" size={20} />
                                <h2 className="font-bold text-brand-black">Delivery Address</h2>
                            </div>
                            <div className="text-gray-600 text-sm leading-relaxed">
                                <p className="font-medium text-gray-900 mb-1">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.addressLine1}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                <p>{order.shippingAddress.zipCode}</p>
                                <p className="mt-2">Phone: {order.shippingAddress.mobile}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-brand-sand p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="text-brand-terracotta" size={20} />
                                <h2 className="font-bold text-brand-black">Payment Info</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-medium">{order.payment.method}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Status</span>
                                    <span className="font-medium text-brand-moss flex items-center gap-1">
                                        <CheckCircle size={14} />
                                        {order.payment.status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Transaction ID</span>
                                    <span className="font-mono text-xs text-gray-500">TXN-{order.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-brand-sand/50 rounded-xl p-6 border border-brand-sand">
                            <h3 className="font-bold text-brand-earth mb-2">Need Help?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                If you have questions about your order, our support team is ready to help.
                            </p>
                            <Link to="/contact" className="block w-full py-2 bg-white text-brand-earth text-center rounded-lg text-sm font-bold hover:bg-brand-cream transition-colors border border-brand-sand">
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrderPage;