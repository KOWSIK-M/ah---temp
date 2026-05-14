import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Star,
  MessageSquare,
  MapPin,
  CreditCard,
  ChevronRight,
  ShoppingBag,
  HelpCircle,
  Phone,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ordersApi } from "../services/api";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      // If not authenticated, try localStorage fallback
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(savedOrders);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll(0, 50);
      // Map API response to frontend format
      const mappedOrders = (data.content || data || []).map((order) => ({
        id: order.id,
        status: order.status?.toLowerCase() || "pending",
        createdAt: order.createdAt,
        estimatedDelivery: order.updatedAt,
        payment: {
          amount: order.totalAmount,
          method: order.paymentStatus || "COD",
        },
        items: (order.items || []).map((item) => ({
          id: item.productId,
          name: item.productName || "Product",
          image: item.productImageUrl || "/placeholder.jpg",
          price: item.priceAtPurchase || 0,
          quantity: item.quantity || 1,
        })),
        shippingAddress: order.shippingAddress,
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      // Fallback to localStorage
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(savedOrders);
      if (savedOrders.length === 0) {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={20} className="text-green-600" />;
      case "shipped":
        return <Truck size={20} className="text-blue-600" />;
      case "processing":
      case "confirmed":
        return <RefreshCw size={20} className="text-yellow-600" />;
      case "cancelled":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Package size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700 border border-green-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "processing":
      case "confirmed":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const cancelOrder = (orderId) => {
    // TODO: Implement backend cancel order API
    toast.error("Order cancellation requires backend support");
  };

  const returnOrder = (orderId) => {
    toast.success(
      "Return request submitted. Our team will contact you shortly.",
    );
  };

  const downloadInvoice = (order) => {
    const invoice = `
INVOICE
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}

Items:
${order.items
  .map(
    (item) =>
      `- ${item.name} x${item.quantity}: ₹${item.price * item.quantity}`,
  )
  .join("\n")}

Total: ₹${order.payment.amount}
Payment Method: ${order.payment.method}
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

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return (
      order.status === filter ||
      (filter === "processing" && order.status === "confirmed")
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-24 lg:py-8">
        {" "}
        {/* Added bottom padding for mobile nav */}
        <div className="container mx-auto px-4">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/profile" className="p-2">
                  <ChevronRight size={20} className="rotate-180" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
              </div>
              <button className="p-2">
                <ShoppingBag size={20} />
              </button>
            </div>
          </div>

          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8 hidden lg:block"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-24 lg:py-12">
        {" "}
        {/* Added bottom padding */}
        <div className="container mx-auto px-4">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/profile" className="p-2">
                  <ChevronRight size={20} className="rotate-180" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
              </div>
              <button className="p-2">
                <ShoppingBag size={20} />
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto text-center bg-white rounded-xl shadow-sm p-6 lg:p-8">
            <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 lg:mb-6">
              <Package size={32} className="text-gray-400 lg:size-40" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">
              No Orders Yet
            </h2>
            <p className="text-gray-600 text-sm lg:text-base mb-4 lg:mb-6">
              You haven't placed any orders. Start shopping to see your orders
              here.
            </p>
            <div className="space-y-3">
              <Link
                to="/"
                className="block py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm lg:text-base"
              >
                Start Shopping
              </Link>
              <Link
                to="/categories/best-sellers"
                className="block py-3 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 text-sm lg:text-base"
              >
                Browse Best Sellers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 lg:py-8">
      {" "}
      {/* Increased bottom padding */}
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/profile" className="p-2">
                <ChevronRight size={20} className="rotate-180" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                <Phone size={20} />
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle size={20} className="text-gray-500" />
                <span className="font-medium">Need Help?</span>
              </div>
              <div className="space-y-2">
                <a
                  href="tel:+919876543210"
                  className="block text-sm text-gray-600"
                >
                  Call Support: +91 98765 43210
                </a>
                <Link
                  to="/contact"
                  className="block text-sm text-green-600 font-medium"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track, return, or buy things again</p>
        </div>

        {/* Filter Tabs - Horizontal scroll on mobile */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible">
            {[
              { id: "all", label: "All", count: orders.length },
              {
                id: "processing",
                label: "Processing",
                count: orders.filter((o) => o.status === "processing").length,
              },
              {
                id: "shipped",
                label: "Shipped",
                count: orders.filter((o) => o.status === "shipped").length,
              },
              {
                id: "delivered",
                label: "Delivered",
                count: orders.filter((o) => o.status === "delivered").length,
              },
              {
                id: "cancelled",
                label: "Cancelled",
                count: orders.filter((o) => o.status === "cancelled").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2.5 rounded-full flex items-center whitespace-nowrap flex-shrink-0 text-sm lg:text-base ${
                  filter === tab.id
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    filter === tab.id
                      ? "bg-green-500"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4 lg:space-y-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
            >
              {/* Order Header */}
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{String(order.id).slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg lg:text-2xl font-bold">
                        ₹{order.payment.amount}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items - Compact on mobile */}
              <div className="p-4 lg:p-6">
                <div className="space-y-3">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.id}`}
                          className="font-medium text-gray-900 hover:text-green-600 text-sm lg:text-base truncate block"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs lg:text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                          <span className="font-medium text-sm lg:text-base">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500 text-center">
                        + {order.items.length - 2} more items
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Footer - Stacked on mobile */}
              <div className="p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 text-sm">
                      {order.status === "processing" && "Preparing your order"}
                      {order.status === "shipped" && "On the way"}
                      {order.status === "delivered" && `Delivered`}
                      {order.status === "cancelled" && "Cancelled"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === "processing" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm flex-1 lg:flex-none"
                      >
                        Cancel
                      </button>
                    )}

                    {order.status === "delivered" && (
                      <button
                        onClick={() => returnOrder(order.id)}
                        className="px-3 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex-1 lg:flex-none"
                      >
                        Return
                      </button>
                    )}

                    <button
                      onClick={() => downloadInvoice(order)}
                      className="px-3 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex-1 lg:flex-none flex items-center justify-center"
                    >
                      <Download size={14} className="mr-1 lg:mr-2" />
                      Invoice
                    </button>

                    <Link
                      to={`/track-order/${order.id}`}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex-1 lg:flex-none flex items-center justify-center"
                    >
                      <Eye size={14} className="mr-1 lg:mr-2" />
                      Track
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Need Help Section - Simplified on mobile */}
        <div className="mt-8 lg:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg lg:text-2xl font-bold mb-1 lg:mb-2">
                Need help with your orders?
              </h3>
              <p className="text-green-100 text-sm lg:text-base">
                Our support team is available 24/7
              </p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <a
                href="tel:+919876543210"
                className="px-4 lg:px-6 py-2.5 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 text-sm lg:text-base flex-1 lg:flex-none text-center"
              >
                Call Now
              </a>
              <Link
                to="/contact"
                className="px-4 lg:px-6 py-2.5 border border-white text-white rounded-lg font-medium hover:bg-green-500 text-sm lg:text-base flex-1 lg:flex-none text-center"
              >
                Chat
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="lg:hidden mt-6 bg-white rounded-xl shadow-sm p-4">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/profile"
              className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
            >
              <div className="flex items-center justify-center gap-2">
                <User size={16} />
                <span className="text-sm">Profile</span>
              </div>
            </Link>
            <Link
              to="/wishlist"
              className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
            >
              <div className="flex items-center justify-center gap-2">
                <Star size={16} />
                <span className="text-sm">Wishlist</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
