import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Wallet,
  Smartphone,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  Check,
  AlertCircle,
  Package,
  Shield,
  ArrowLeft,
  Home,
  IndianRupee,
  Truck as TruckIcon,
  Clock,
  CheckCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Gift,
  Percent,
  ShieldCheck,
  Lock as LockIcon,
  ChevronRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Tag,
  Info,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ordersApi, addressApi, paymentApi } from "../services/api";
import Toast from "../components/Toast";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [addresses, setAddresses] = useState([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const items = location.state?.cartItems || cartItems || [];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "home",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
    loadSavedAddresses();
  }, [user]);

  const loadSavedAddresses = async () => {
    try {
      const saved = await addressApi.getAll();
      setAddresses(saved);
      if (saved.length > 0) {
        const defaultAddr = saved.find((addr) => addr.isDefault) || saved[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = item.productPrice || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = location.state?.discount || 0;
    const delivery = subtotal > 999 ? 0 : 49;
    const codCharge = paymentMethod === "cod" ? 29 : 0;
    return subtotal - discount + delivery + codCharge;
  };

  const validateAddressForm = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];
    for (const field of required) {
      if (!formData[field]?.trim()) {
        showToastMessage(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      showToastMessage("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      showToastMessage("Please enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  const handleAddressSubmit = async () => {
    if (!validateAddressForm()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        addressType: formData.addressType,
        isDefault: addresses.length === 0,
      };

      const newAddress = await addressApi.create(payload);
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress);
      setIsAddingNewAddress(false);
      showToastMessage("✅ Address saved successfully");
      setStep(2);
    } catch (error) {
      console.error(error);
      showToastMessage("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addressApi.delete(addressId);
      const updated = addresses.filter((addr) => addr.id !== addressId);
      setAddresses(updated);
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(updated[0] || null);
      }
      showToastMessage("🗑️ Address deleted");
    } catch (error) {
      showToastMessage("Failed to delete address");
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      showToastMessage("Please select a shipping address");
      return;
    }

    // ── Cash on Delivery ────────────────────────────────────────────
    if (paymentMethod === "cod") {
      setLoading(true);
      try {
        const couponCode = location.state?.couponCode || null;
        const orderData = await ordersApi.create({
          shippingAddressId: selectedAddress.id,
          paymentMethod: "cod",
          ...(couponCode ? { couponCode } : {}),
        });
        await clearCart();
        setOrderDetails(orderData);
        setOrderComplete(true);
        setStep(3);
      } catch (error) {
        showToastMessage(error.message || "Order failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Razorpay (card / upi) ───────────────────────────────────────
    setLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      showToastMessage("Payment gateway unavailable. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const amountInPaise = Math.round(calculateTotal() * 100);
      const rzpOrderData  = await paymentApi.createRazorpayOrder(amountInPaise);
      setLoading(false); // stop spinner before Razorpay popup opens

      const couponCode = location.state?.couponCode || null;

      const options = {
        key:         rzpOrderData.keyId,
        amount:      rzpOrderData.amount,
        currency:    rzpOrderData.currency,
        name:        "Anjaneya Herbals",
        description: "Ayurvedic Products Order",
        order_id:    rzpOrderData.razorpayOrderId,
        prefill: {
          name:    `${selectedAddress.firstName ?? ""} ${selectedAddress.lastName ?? ""}`.trim(),
          email:   user?.email ?? "",
          contact: selectedAddress.phone ?? "",
        },
        theme:   { color: "#10b981" },
        modal:   { ondismiss: () => showToastMessage("Payment cancelled") },

        handler: async (response) => {
          setLoading(true);
          try {
            const orderData = await paymentApi.verifyRazorpayPayment({
              razorpayOrderId:  response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              shippingAddressId: selectedAddress.id,
              ...(couponCode ? { couponCode } : {}),
            });
            await clearCart();
            setOrderDetails(orderData);
            setOrderComplete(true);
            setStep(3);
          } catch (err) {
            showToastMessage(err.message || "Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        showToastMessage("Payment failed: " + (resp.error?.description ?? "Unknown error"));
      });
      rzp.open();
    } catch (error) {
      showToastMessage(error.message || "Failed to initialise payment");
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-50 to-yellow-50 rounded-full flex items-center justify-center mb-4">
            <Package size={40} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some wellness products to your cart first!
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI / QR",
      icon: <Smartphone size={20} />,
      description: "GPay, PhonePe, Paytm & more",
      badge: "Instant",
    },
    {
      id: "card",
      name: "Credit / Debit Card",
      icon: <CreditCard size={20} />,
      description: "Visa, Mastercard, RuPay",
      badge: null,
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: <Wallet size={20} />,
      description: "Pay when your order arrives",
      badge: null,
    },
  ];

  const addressTypes = [
    { id: "home", label: "Home", icon: <Home size={16} /> },
    { id: "work", label: "Work", icon: <Home size={16} /> },
    { id: "other", label: "Other", icon: <MapPin size={16} /> },
  ];

  const MobileHeader = () => (
    <div className="bg-white shadow-sm px-4 py-3 mb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
        <button
          onClick={() => setShowOrderSummary(!showOrderSummary)}
          className="p-2 -mr-2 rounded-lg hover:bg-gray-100"
        >
          {showOrderSummary ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mt-4">
        {["Address", "Payment", "Confirm"].map((label, index) => (
          <div key={label} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm ${
                step > index + 1
                  ? "bg-green-500 border-green-500 text-white"
                  : step === index + 1
                  ? "bg-white border-green-500 text-green-500"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              {step > index + 1 ? <Check size={16} /> : index + 1}
            </div>
            <div
              className={`ml-2 ${
                step >= index + 1 ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <p className="font-medium text-xs">{label}</p>
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  step > index + 1 ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Order Summary Toggle */}
      <AnimatePresence>
        {showOrderSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="space-y-2">
                {items.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-900">
                      {item.productName || item.name} × {item.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {(
                        (item.productPrice || item.price || 0) * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="text-center text-sm text-gray-500">
                    + {items.length - 2} more items
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-green-600">₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden min-h-screen bg-gray-50 pb-24">
        <MobileHeader />

        <div className="px-4">
          {/* Address Section */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Saved Addresses
                  </h3>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-3 rounded-lg border-2 ${
                          selectedAddress?.id === address.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {address.addressType}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(address.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {address.firstName} {address.lastName}
                          </p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">{address.address}</p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Address */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Add New Address</h3>
                  <button
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="flex items-center gap-1 text-green-600 text-sm"
                  >
                    {isAddingNewAddress ? <X size={18} /> : <Plus size={18} />}
                    <span>{isAddingNewAddress ? "Cancel" : "New"}</span>
                  </button>
                </div>

                {isAddingNewAddress ? (
                  <div className="space-y-4">
                    {/* Address Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {addressTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, addressType: type.id })
                            }
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                              formData.addressType === type.id
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-200"
                            }`}
                          >
                            {type.icon}
                            <span className="text-xs mt-1">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        rows="2"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <button
                      onClick={handleAddressSubmit}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-lg"
                    >
                      Save Address
                    </button>
                  </div>
                ) : (
                  selectedAddress && (
                    <div className="mt-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              Selected Address
                            </p>
                            <p className="text-xs text-gray-600">
                              {selectedAddress.addressType}
                            </p>
                          </div>
                          <button
                            onClick={() => setIsAddingNewAddress(true)}
                            className="text-green-600 text-sm"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-lg"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Payment Section */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>

                <div className="space-y-3 mb-4">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start p-3 rounded-lg border-2 ${
                        paymentMethod === method.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mt-0.5 mr-3 text-green-600"
                      />
                      <div className="flex items-center flex-1">
                        <div className="mr-3 text-gray-700">{method.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {method.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "cod" && (
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        size={16}
                        className="text-yellow-600 mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-gray-600">
                          Additional ₹29 charges apply. Please keep exact change
                          ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading || !selectedAddress}
                    className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-1">
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Pay ₹${calculateTotal()}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Confirmation */}
          {step === 3 && orderDetails && (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Order Confirmed!
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Thank you for your purchase.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Order ID</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {orderDetails.id}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Amount Paid</span>
                  <span className="font-bold text-green-600 text-sm">
                    ₹{orderDetails.payment?.amount || calculateTotal()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Payment Method</span>
                  <span className="font-medium text-gray-900 text-sm capitalize">
                    {orderDetails.payment?.method || paymentMethod}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-2.5 border border-green-600 text-green-600 rounded-lg text-sm"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate(`/orders/${orderDetails.id}`)}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm"
                >
                  View Order Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Footer */}
        {(step === 1 || step === 2) && !orderComplete && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  ₹{calculateTotal()}
                </p>
                <p className="text-xs text-gray-600">{items.length} items</p>
              </div>
              <button
                onClick={step === 1 ? () => setStep(2) : handlePayment}
                disabled={step === 1 ? !selectedAddress : loading}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-lg text-sm"
              >
                {step === 1
                  ? "Continue to Payment"
                  : `Pay ₹${calculateTotal()}`}
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <TruckIcon size={12} />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle size={12} />
                <span>30-Day Return</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Desktop Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <p className="text-gray-600">Complete your purchase</p>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600"
              >
                <ArrowLeft size={18} />
                Back to Cart
              </button>
            </div>

            {/* Desktop Progress Steps */}
            <div className="flex items-center justify-center py-6">
              {["Address", "Payment", "Confirm"].map((label, index) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step > index + 1
                        ? "bg-green-500 border-green-500 text-white"
                        : step === index + 1
                        ? "bg-white border-green-500 text-green-500"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {step > index + 1 ? <Check size={20} /> : index + 1}
                  </div>
                  <div
                    className={`ml-3 ${
                      step >= index + 1 ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    <p className="font-medium">{label}</p>
                    <p className="text-sm mt-1">Step {index + 1}</p>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-24 h-1 mx-6 ${
                        step > index + 1 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Step 1: Address */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Saved Addresses</h3>
                      <div className="grid gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddress?.id === address.id
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-green-300"
                            }`}
                            onClick={() => setSelectedAddress(address)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 capitalize">{address.addressType}</span>
                                {address.isDefault && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                                )}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteAddress(address.id); }}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="font-medium text-gray-900">{address.firstName} {address.lastName}</p>
                            <p className="text-gray-600">{address.phone}</p>
                            <p className="text-gray-600">{address.addressLine1 || address.address}</p>
                            <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Address Form */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {addresses.length === 0 ? "Shipping Address" : "Add New Address"}
                      </h3>
                      {addresses.length > 0 && (
                        <button
                          onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                          className="flex items-center gap-1 text-green-600"
                        >
                          {isAddingNewAddress ? <X size={18} /> : <Plus size={18} />}
                          <span>{isAddingNewAddress ? "Cancel" : "Add New"}</span>
                        </button>
                      )}
                    </div>

                    {(isAddingNewAddress || addresses.length === 0) && (
                      <div className="space-y-4">
                        {/* Address Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                          <div className="flex gap-3">
                            {addressTypes.map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, addressType: type.id })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                                  formData.addressType === type.id
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-200 hover:border-green-300"
                                }`}
                              >
                                {type.icon}
                                <span>{type.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Contact Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows="2"
                          />
                        </div>

                        {/* City, State, Pincode */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                            <input
                              type="text"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                            <input
                              type="text"
                              value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleAddressSubmit}
                          disabled={loading}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save & Continue"}
                        </button>
                      </div>
                    )}

                    {!isAddingNewAddress && addresses.length > 0 && selectedAddress && (
                      <button
                        onClick={() => setStep(2)}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                      >
                        Continue to Payment
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Select Payment Method</h3>
                  
                  <div className="space-y-4 mb-6">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="mr-4 text-green-600 w-5 h-5"
                        />
                        <div className="mr-4 text-gray-700">{method.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Cash on Delivery</p>
                          <p className="text-sm text-gray-600">Additional ₹29 charges apply. Please keep exact change ready.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Back to Address
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={loading || !selectedAddress}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={20} className="animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        `Pay ₹${calculateTotal().toLocaleString()}`
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Confirmation */}
              {step === 3 && orderDetails && (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} className="text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been placed successfully.</p>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-bold text-gray-900">{orderDetails.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="font-bold text-green-600">₹{orderDetails.payment?.amount || calculateTotal()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium text-gray-900 capitalize">{orderDetails.payment?.method || paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate("/")}
                      className="flex-1 py-3 border border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-all"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={() => navigate(`/orders/${orderDetails.id}`)}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                    >
                      View Order Details
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                
                {/* Items List */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.productImageUrl || item.imageUrl || "/placeholder.jpg"}
                        alt={item.productName || item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName || item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{((item.productPrice || item.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  {location.state?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{location.state.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>{calculateSubtotal() > 999 ? "FREE" : "₹49"}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-gray-600">
                      <span>COD Charges</span>
                      <span>₹29</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                    <div className="flex flex-col items-center gap-1">
                      <ShieldCheck size={16} className="text-green-600" />
                      <span>Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <TruckIcon size={16} className="text-green-600" />
                      <span>Free Delivery</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>30-Day Return</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <Toast message={toastMessage} onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default CheckoutPage;
