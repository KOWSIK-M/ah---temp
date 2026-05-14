// contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { cartApi } from '../services/api'; // userApi/authApi removed as we use useAuth now
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Update cart count from items
  const updateCartCount = useCallback((items) => {
    const count = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    setCartCount(count);
  }, []);

  // Fetch cart from server (for logged-in users) or localStorage (guests)
  const fetchCart = useCallback(async () => {
    if (authLoading) return; // Wait for auth to initialize

    if (!isAuthenticated) {
      // Load from localStorage for guests
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCart({ items: parsed, totalAmount: 0 });
        updateCartCount(parsed);
      } else {
        setCart({ items: [], totalAmount: 0 });
        updateCartCount([]);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await cartApi.get();
      setCart(response);
      updateCartCount(response.items);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Fallback to empty cart
      setCart({ items: [], totalAmount: 0 });
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, [updateCartCount, isAuthenticated, authLoading]);

  // Sync guest cart to server on login
  const syncGuestCart = useCallback(async () => {
    const guestCart = localStorage.getItem('guestCart');
    if (guestCart && isAuthenticated) {
      try {
        console.log('Syncing guest cart to server...');
        const items = JSON.parse(guestCart);
        for (const item of items) {
            // Backend handles merging (adds to existing quantity)
            await cartApi.addItem(item.productId, item.quantity);
        }
        localStorage.removeItem('guestCart');
        console.log('Guest cart synced and cleared from localStorage');
        // Dispatch event to notify others if needed
        window.dispatchEvent(new Event('cartUpdated')); 
      } catch (error) {
        console.error('Failed to sync guest cart:', error);
      }
    } else {
        // If no guest cart, just fetch the user's cart
        console.log('No guest cart to sync or not authenticated, fetching cart...');
    }
    await fetchCart();
  }, [fetchCart, isAuthenticated]);

  // Effect to handle auth changes and initial load
  useEffect(() => {
    if (!authLoading) {
        if (isAuthenticated) {
            // User is logged in: Try to sync guest cart, then fetch
            syncGuestCart();
        } else {
            // User is guest: Just fetch (load from local storage)
            fetchCart();
        }
    }
  }, [isAuthenticated, authLoading, syncGuestCart, fetchCart]);


  // Add to cart
  const addToCart = async (productId, quantity = 1, productData = null) => {
    if (!isAuthenticated) {
      // Guest: store in localStorage with product details if available
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingIndex = guestCart.findIndex(item => item.productId === productId);
      
      if (existingIndex > -1) {
        guestCart[existingIndex].quantity += quantity;
      } else {
        guestCart.push({ 
          productId, 
          quantity,
          productName: productData?.name || productData?.productName || 'Product',
          productPrice: productData?.price || productData?.productPrice || 0,
          productImageUrl: productData?.imageUrl || productData?.image || ''
        });
      }
      
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      setCart({ items: guestCart, totalAmount: 0 });
      updateCartCount(guestCart);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    try {
      setLoading(true);
      const response = await cartApi.addItem(productId, quantity);
      setCart(response);
      updateCartCount(response.items);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        .filter(item => item.productId !== itemId);
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      setCart({ items: guestCart, totalAmount: 0 });
      updateCartCount(guestCart);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    try {
      setLoading(true);
      const response = await cartApi.removeItem(itemId);
      setCart(response);
      updateCartCount(response.items);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    if (!isAuthenticated) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        .map(item => item.productId === itemId ? { ...item, quantity: newQuantity } : item);
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      setCart({ items: guestCart, totalAmount: 0 });
      updateCartCount(guestCart);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    try {
      setLoading(true);
      const response = await cartApi.updateItem(itemId, newQuantity);
      setCart(response);
      updateCartCount(response.items);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem('guestCart');
      setCart({ items: [], totalAmount: 0 });
      setCartCount(0);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    try {
      setLoading(true);
      await cartApi.clear();
      setCart({ items: [], totalAmount: 0 });
      setCartCount(0);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.totalAmount || cart.items?.reduce((total, item) => {
      const price = item.productPrice || item.price || 0;
      return total + (price * item.quantity);
    }, 0) || 0;
  };

  const refreshCart = () => fetchCart();

  return (
    <CartContext.Provider value={{
      cart,
      cartItems: cart.items || [],
      cartCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      refreshCart,
      isLoggedIn: isAuthenticated
    }}>
      {children}
    </CartContext.Provider>
  );
};