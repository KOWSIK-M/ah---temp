import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Trash2, Plus, Minus, ChevronRight,
  Package, Shield, Truck, ArrowLeft, CreditCard,
  Tag, X, AlertCircle, CheckCircle, Loader2,
  Heart, IndianRupee, Truck as TruckIcon, Clock,
  ShieldCheck, RefreshCw, Percent, Lock, ArrowRight,
  ShoppingCart, Home, Tag as TagIcon, ArrowUp
} from 'lucide-react';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import { couponApi } from '../services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, updateQuantity, removeFromCart, clearCart, getCartTotal, refreshCart } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [savingForLater, setSavingForLater] = useState([]);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    refreshCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
      showToastMessage('Quantity updated');
    } catch (error) {
      showToastMessage('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdating(itemId);
    try {
      await removeFromCart(itemId);
      showToastMessage('Item removed from cart');
    } catch (error) {
      showToastMessage('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        showToastMessage('Cart cleared');
      } catch (error) {
        showToastMessage('Failed to clear cart');
      }
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const subtotal = calculateSubtotal();
    setCouponLoading(true);
    try {
      const result = await couponApi.validate(couponCode.trim(), subtotal);
      if (result.valid) {
        setAppliedCoupon({
          code: result.couponCode,
          discountAmount: result.discountAmount,  // actual ₹ off
          discountType: result.discountType,
          discountValue: result.discountValue,
        });
        showToastMessage(`🎉 Coupon applied! You save ₹${Number(result.discountAmount).toFixed(2)}`);
        setCouponCode('');
        setShowCouponInput(false);
      } else {
        showToastMessage(`❌ ${result.message || 'Invalid coupon code'}`);
      }
    } catch (err) {
      showToastMessage('❌ Could not validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.productPrice || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    // Use the server-computed discount amount directly
    return Number(appliedCoupon.discountAmount) || 0;
  };

  const getDeliveryCharge = () => {
    const subtotal = calculateSubtotal();
    if (subtotal > 999) return 0;
    return deliveryOption === 'express' ? 99 : 49;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const delivery = getDeliveryCharge();
    return subtotal - discount + delivery;
  };

  const saveForLater = (item) => {
    setSavingForLater([...savingForLater, item]);
    handleRemoveItem(item.id || item.productId);
    showToastMessage('💝 Item saved for later');
  };

  const moveToCart = (item, index) => {
    const updatedSaved = [...savingForLater];
    updatedSaved.splice(index, 1);
    setSavingForLater(updatedSaved);
    showToastMessage('📦 Moved to cart');
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      showToastMessage('Your cart is empty');
      return;
    }
    navigate('/checkout', {
      state: {
        cartItems,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        appliedCoupon: appliedCoupon,
        couponCode: appliedCoupon?.code || null,
        deliveryCharge: getDeliveryCharge(),
        total: calculateTotal()
      }
    });
  };

  const EmptyCart = () => (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center px-4"
      >
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-50 to-yellow-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={48} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added any items to your cart yet
        </p>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-medium rounded-xl shadow-md"
          >
            <Home size={20} className="inline mr-2 -mt-1" />
            Continue Shopping
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/category/best-sellers')}
            className="w-full py-3 border border-green-500 text-green-600 font-medium rounded-xl hover:bg-green-50"
          >
            View Best Sellers
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  if (cartItems.length === 0 && savingForLater.length === 0) {
    return <EmptyCart />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-4 pb-24">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-3 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Shopping Cart</h1>
            <div className="w-10"></div>
          </div>
          <p className="text-sm text-gray-600 text-center mt-1">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • 
            <span className="font-medium text-green-600 ml-2">
              ₹{calculateTotal().toLocaleString()}
            </span>
          </p>
        </div>

        {/* Main Content */}
        <div className="px-4">
          {/* Cart Items */}
          <div className="space-y-3 mb-6">
            {cartItems.map((item, index) => {
              const itemId = item.id || item.productId;
              const productId = item.productId;
              const productName = item.productName || item.name || 'Product';
              const productImage = item.productImageUrl || item.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image';
              const productPrice = item.productPrice || item.price || 0;
              const maxStock = item.maxStock || 50;

              return (
                <div key={itemId} className="bg-white rounded-xl shadow-sm p-3">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link
                        to={`/product/${productId}`}
                        className="font-medium text-gray-900 line-clamp-2 text-sm"
                      >
                        {productName}
                      </Link>
                      
                      <div className="mt-1">
                        <span className="text-base font-bold text-gray-900">
                          ₹{productPrice.toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > productPrice && (
                          <span className="text-xs text-gray-500 line-through ml-2">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2">
                        {maxStock - item.quantity > 10 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            <CheckCircle size={10} />
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            <AlertCircle size={10} />
                            Only {maxStock - item.quantity} left
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                            disabled={updating === itemId || item.quantity <= 1}
                            className="px-3 py-1 bg-gray-50 text-gray-700 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1 min-w-[30px] text-center font-medium">
                            {updating === itemId ? (
                              <Loader2 size={14} className="animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                            disabled={updating === itemId || item.quantity >= maxStock}
                            className="px-3 py-1 bg-gray-50 text-gray-700 disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => saveForLater(item)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Heart size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(itemId)}
                            disabled={updating === itemId}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{(productPrice * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-600 ml-2">
                          ({item.quantity} × ₹{productPrice})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TruckIcon size={18} className="text-green-600" />
              Delivery Options
            </h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:border-green-300">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryOption === 'standard'}
                    onChange={() => setDeliveryOption('standard')}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Standard Delivery</p>
                    <p className="text-xs text-gray-600">Tomorrow, 10 AM - 8 PM</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${calculateSubtotal() > 999 ? 'text-green-600' : ''}`}>
                  {calculateSubtotal() > 999 ? 'FREE' : '₹49'}
                </span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:border-blue-300">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryOption === 'express'}
                    onChange={() => setDeliveryOption('express')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Express Delivery</p>
                    <p className="text-xs text-gray-600">Within 2 hours</p>
                  </div>
                </div>
                <span className="text-sm font-bold">₹99</span>
              </label>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <TagIcon size={18} className="text-green-600" />
                Apply Coupon
              </h3>
              {appliedCoupon ? (
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => setShowCouponInput(!showCouponInput)}
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  {showCouponInput ? 'Cancel' : 'Apply'}
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-700 text-sm">{appliedCoupon.name}</p>
                    <p className="text-xs text-green-600">
                      {appliedCoupon.discount}% off - ₹{calculateDiscount().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : showCouponInput ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Apply
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Enter a valid coupon code to get a discount
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowCouponInput(true)}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-green-500 hover:text-green-600 text-sm"
              >
                + Add coupon code
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={`font-medium ${getDeliveryCharge() === 0 ? 'text-green-600' : ''}`}>
                  {getDeliveryCharge() === 0 ? 'FREE' : `₹${getDeliveryCharge()}`}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{calculateDiscount().toLocaleString()}
                  </span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{calculateTotal().toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
              </div>
            </div>
          </div>

          {/* Saved for Later */}
          {savingForLater.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Saved for Later</h3>
              <div className="space-y-3">
                {savingForLater.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <img
                      src={item.productImageUrl || item.imageUrl}
                      alt={item.productName || item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">
                        {item.productName || item.name}
                      </p>
                      <p className="text-xs text-gray-600">₹{item.productPrice || item.price}</p>
                    </div>
                    <button
                      onClick={() => moveToCart(item, index)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                    >
                      Move to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Shopping */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">Continue Shopping</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/category/herbal-supplements')}
                className="py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 text-sm"
              >
                Herbal Supplements
              </button>
              <button
                onClick={() => navigate('/category/dry-fruits')}
                className="py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 text-sm"
              >
                Dry Fruits
              </button>
              <button
                onClick={() => navigate('/category/ayurvedic')}
                className="py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 text-sm"
              >
                Ayurvedic
              </button>
              <button
                onClick={() => navigate('/category/spices')}
                className="py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 text-sm"
              >
                Premium Spices
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Checkout Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{calculateTotal().toLocaleString()}
                  </span>
                  {calculateSubtotal() <= 999 && (
                    <span className="text-xs text-gray-500">
                      + ₹{getDeliveryCharge()} delivery
                    </span>
                  )}
                </div>
                <p className="text-xs text-green-600">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={proceedToCheckout}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl shadow-lg text-sm"
              >
                Checkout
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <ShieldCheck size={12} className="text-green-600" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Clock size={12} className="text-blue-600" />
                <span>30-day Return</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Truck size={12} className="text-purple-600" />
                <span>Free Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        {window.scrollY > 300 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-4 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-30"
          >
            <ArrowUp size={20} />
          </button>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={20} className="text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">Your Cart Items</h2>
                        <p className="text-sm text-gray-500">Manage your products</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft size={18} />
                        Continue Shopping
                      </button>
                      {cartItems.length > 0 && (
                        <button
                          onClick={handleClearCart}
                          className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          Clear Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.productImageUrl || item.imageUrl}
                            alt={item.productName || item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                to={`/product/${item.productId}`}
                                className="text-xl font-semibold text-gray-900 hover:text-green-600"
                              >
                                {item.productName || item.name}
                              </Link>
                              <div className="mt-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  ₹{(item.productPrice || item.price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={updating === item.id || item.quantity <= 1}
                                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                                >
                                  <Minus size={18} />
                                </button>
                                <span className="px-4 py-2 min-w-[50px] text-center font-medium">
                                  {updating === item.id ? (
                                    <Loader2 size={16} className="animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={updating === item.id || item.quantity >= (item.maxStock || 50)}
                                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                                >
                                  <Plus size={18} />
                                </button>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveForLater(item)}
                                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                >
                                  <Heart size={18} />
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              {item.quantity} × ₹{item.productPrice || item.price} = 
                              <span className="font-bold text-gray-900 ml-2">
                                ₹{(item.productPrice * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-6 text-lg">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className={`font-medium ${getDeliveryCharge() === 0 ? 'text-green-600' : ''}`}>
                        {getDeliveryCharge() === 0 ? 'FREE' : `₹${getDeliveryCharge()}`}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-700">{appliedCoupon.name}</p>
                            <p className="text-sm text-green-600">
                              {appliedCoupon.discount}% off - ₹{calculateDiscount().toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => setAppliedCoupon(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span className="text-green-600">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={proceedToCheckout}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <Lock size={20} />
                    Proceed to Checkout
                    <ChevronRight size={20} />
                  </button>
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

export default CartPage;