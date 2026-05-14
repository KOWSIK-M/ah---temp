import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  MapPin,
  CreditCard,
  Download,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Home,
} from "lucide-react";
import { ordersApi } from "../services/api";
import toast from "react-hot-toast";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Error loading order:", err);
      setError("Order not found");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle size={24} className="text-green-600" />;
      case "shipped":
        return <Truck size={24} className="text-blue-600" />;
      case "processing":
      case "confirmed":
        return <Clock size={24} className="text-yellow-600" />;
      case "cancelled":
        return <XCircle size={24} className="text-red-600" />;
      default:
        return <Package size={24} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
      case "confirmed":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusMessage = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "Your order has been delivered";
      case "shipped":
        return "Your order is on the way";
      case "processing":
      case "confirmed":
        return "Your order is being prepared";
      case "cancelled":
        return "This order was cancelled";
      default:
        return "Order placed successfully";
    }
  };

  const downloadInvoice = () => {
    if (!order) return;
    
    const invoice = `
INVOICE
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}

Items:
${(order.items || [])
  .map((item) => `- ${item.productName || 'Product'} x${item.quantity}: ₹${(item.priceAtPurchase || 0) * item.quantity}`)
  .join("\n")}

Subtotal: ₹${order.totalAmount || 0}
Total: ₹${order.totalAmount || 0}
Payment: ${order.paymentStatus || 'COD'}
Status: ${order.status}
    `;

    const blob = new Blob([invoice], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    a.click();
    toast.success("Invoice downloaded");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-green-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/orders")}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
            >
              View All Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress || {};
  const items = order.items || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 lg:pt-20 lg:pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Orders</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600">Order #{order.id}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadInvoice}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download size={18} />
                <span>Invoice</span>
              </button>
              <Link
                to={`/track-order/${order.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Truck size={18} />
                <span>Track</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            {getStatusIcon(order.status)}
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {(order.status || "PENDING").toUpperCase()}
              </span>
              <p className="text-gray-600 mt-1">{getStatusMessage(order.status)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment</p>
              <p className="font-medium text-gray-900 capitalize">
                {order.paymentStatus || "COD"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Items</p>
              <p className="font-medium text-gray-900">{items.length} item(s)</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-green-600 text-lg">
                ₹{(order.totalAmount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.productImageUrl || "/placeholder.jpg"}
                      alt={item.productName || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="font-medium text-gray-900 hover:text-green-600 block truncate"
                    >
                      {item.productName || "Product"}
                    </Link>
                    <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                    <p className="text-sm text-gray-500">₹{item.priceAtPurchase || 0} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{(order.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">₹{(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {shippingAddress.addressLine1 || shippingAddress.address}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                  </p>
                </div>
              </div>
              
              {shippingAddress.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400 flex-shrink-0" />
                  <p className="text-gray-600">{shippingAddress.phone}</p>
                </div>
              )}
              
              {shippingAddress.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400 flex-shrink-0" />
                  <p className="text-gray-600 text-sm">{shippingAddress.email}</p>
                </div>
              )}
            </div>

            {/* Need Help Section */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
              <div className="space-y-2">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <Phone size={16} />
                  <span className="text-sm">Call Support</span>
                </a>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <Mail size={16} />
                  <span className="text-sm">Contact Us</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Enjoying your order?</h3>
              <p className="text-green-100">Continue shopping for more wellness products</p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
