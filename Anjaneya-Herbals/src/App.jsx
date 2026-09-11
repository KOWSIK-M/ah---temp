import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Pages
import HomePage from './pages/HomePage';
const PasswordRecoveryPage = lazy(() => import('./pages/PasswordRecoveryPage'));
const InformationPage = lazy(() => import('./pages/InformationPage'));
const StoresPage = lazy(() => import('./pages/StoresPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AllProductsPage = lazy(() => import('./pages/AllProductsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import Navbar from './components/Navbar';
const OAuth2RedirectHandler = lazy(() => import('./components/OAuth2RedirectHandler'));
const ChatWidget = lazy(() => import('./components/ChatWidget'));

const PageLoader = () => (
  <div className="flex min-h-[55vh] items-center justify-center bg-brand-cream" role="status" aria-label="Loading page">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-sage/30 border-t-brand-moss" />
  </div>
);

function App() {
  const location = useLocation();
  return (
    <AuthProvider>
      <CartProvider>
        <Suspense fallback={<PageLoader />}>
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
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/category/:categoryId" element={<AllProductsPage />} />
                    <Route path="/products" element={<AllProductsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
                    <Route path="/reset-password" element={<PasswordRecoveryPage />} />
                    <Route path="/information/:page" element={<InformationPage />} />
                    {/* Keep common policy URLs and old bookmarks out of the 404 page. */}
                    <Route path="/terms" element={<Navigate to="/information/terms" replace />} />
                    <Route path="/privacy" element={<Navigate to="/information/privacy" replace />} />
                    <Route path="/shipping" element={<Navigate to="/information/shipping" replace />} />
                    <Route path="/refunds" element={<Navigate to="/information/refunds" replace />} />
                    <Route path="/faq" element={<Navigate to="/information/faq" replace />} />
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
                {location.pathname === '/' && (
                  <Suspense fallback={null}>
                    <ChatWidget />
                  </Suspense>
                )}
              </div>
            } />
          </Routes>
        </Suspense>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
