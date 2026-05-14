import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Pages
import HomePage from './pages/HomePage';
import StoresPage from './pages/StoresPage';
import ContactPage from './pages/ContactPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AllProductsPage from './pages/AllProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import TrackOrderPage from './pages/TrackOrderPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
          <Routes>
            {/* Admin Login — public, no auth guard */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin Routes - Protected, No Navbar/Footer */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/products/new" element={<AdminProductFormPage />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/customers" element={<AdminCustomersPage />} />
              <Route path="/admin/coupons" element={<AdminCouponsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            {/* Main Site Routes */}
            <Route path="/*" element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/stores" element={<StoresPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/category/:categoryId" element={<AllProductsPage />} />
                    <Route path="/products" element={<AllProductsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

                    <Route path="/checkout" element={
                      <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute><OrdersPage /></ProtectedRoute>
                    } />
                    <Route path="/orders/:orderId" element={
                      <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/track-order/:orderId" element={
                      <ProtectedRoute><TrackOrderPage /></ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute><WishlistPage /></ProtectedRoute>
                    } />

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: { background: '#1A1A1A', color: '#fff', border: '1px solid #5C7A59' },
                    success: { duration: 3000, iconTheme: { primary: '#5C7A59', secondary: '#fff' } },
                    error: { duration: 4000, style: { border: '1px solid #B3543D' }, iconTheme: { primary: '#B3543D', secondary: '#fff' } },
                  }}
                />
                <ChatWidget />
              </div>
            } />
          </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;