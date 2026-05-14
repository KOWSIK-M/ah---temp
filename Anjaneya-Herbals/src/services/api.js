// API Configuration and Service Layer for Anjaneya Herbals
// Use relative URL '/api' in development (Vite proxy handles it)
// In production, set VITE_API_URL to the full backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Singleton refresh promise — prevents concurrent 401s from firing multiple refresh calls
let _refreshPromise = null;

const refreshAccessToken = async () => {
    if (_refreshPromise) return _refreshPromise;
    _refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    })
        .then(r => r.ok)
        .catch(() => false)
        .finally(() => { _refreshPromise = null; });
    return _refreshPromise;
};

// Fetch wrapper with authentication (HttpOnly cookies sent automatically)
const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const fetchOptions = {
        ...options,
        headers,
        credentials: 'include',
    };

    let response;
    try {
        response = await fetch(url, fetchOptions);
    } catch (networkError) {
        throw new Error('Network error. Please check your connection.');
    }

    // Handle 401 - try to refresh token once
    if (response.status === 401 && !options._retry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return apiFetch(endpoint, { ...options, _retry: true });
        } else {
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('sessionExpired'));
            return { ok: false, sessionExpired: true };
        }
    }

    return response;
};

// ============ AUTH API ============
export const authApi = {
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    logout: async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            localStorage.removeItem('user');
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => !!localStorage.getItem('user'), 
    // Optimization: Check local user presence first. True auth check is API call (getProfile).
};

// ============ CATEGORIES API ============
export const categoriesApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`);
        if (!response.ok) throw new Error('Category not found');
        return response.json();
    },

    getBySlug: async (slug) => {
        const response = await fetch(`${API_BASE_URL}/categories/slug/${slug}`);
        if (!response.ok) throw new Error('Category not found');
        return response.json();
    },
};

// ============ PRODUCTS API ============
export const productsApi = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        // Use 'category' param as categoryId for the backend
        if (params.categoryId || params.category) queryParams.append('categoryId', params.categoryId || params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size) queryParams.append('size', params.size);
        if (params.sort) queryParams.append('sort', params.sort);
        // Additional filters (for future backend support)
        if (params.minPrice !== undefined && params.minPrice > 0) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice !== undefined && params.maxPrice < 10000) queryParams.append('maxPrice', params.maxPrice);
        if (params.minRating) queryParams.append('minRating', params.minRating);
        if (params.inStockOnly) queryParams.append('inStockOnly', 'true');
        if (params.onSaleOnly) queryParams.append('onSaleOnly', 'true');

        const url = `${API_BASE_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        return response.json();
    },

    getNewArrivals: async () => {
        const response = await fetch(`${API_BASE_URL}/products/new-arrivals`);
        if (!response.ok) throw new Error('Failed to fetch new arrivals');
        return response.json();
    },

    getBestSellers: async () => {
        const response = await fetch(`${API_BASE_URL}/products/best-sellers`);
        if (!response.ok) throw new Error('Failed to fetch best sellers');
        return response.json();
    },
};

// ============ CART API ============
export const cartApi = {
    get: async () => {
        const response = await apiFetch('/cart');
        if (!response.ok) throw new Error('Failed to fetch cart');
        return response.json();
    },

    addItem: async (productId, quantity = 1) => {
        const response = await apiFetch('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add item');
        }
        return response.json();
    },

    updateItem: async (itemId, quantity) => {
        const response = await apiFetch(`/cart/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) throw new Error('Failed to update cart');
        return response.json();
    },

    removeItem: async (itemId) => {
        const response = await apiFetch(`/cart/${itemId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove item');
        return response.json();
    },

    clear: async () => {
        const response = await apiFetch('/cart', { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to clear cart');
    },
};

// ============ ORDERS API ============
export const ordersApi = {
    create: async (data) => {
        const response = await apiFetch('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
        }
        return response.json();
    },

    getAll: async (page = 0, size = 10) => {
        const response = await apiFetch(`/orders?page=${page}&size=${size}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    getById: async (orderId) => {
        const response = await apiFetch(`/orders/${orderId}`);
        if (!response.ok) throw new Error('Order not found');
        return response.json();
    },
};

// ============ ADDRESS API ============
export const addressApi = {
    getAll: async () => {
        const response = await apiFetch('/addresses');
        if (response.sessionExpired) return []; // Event handles redirect
        if (!response.ok) throw new Error('Failed to fetch addresses');
        return response.json();
    },

    create: async (data) => {
        const response = await apiFetch('/addresses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (response.sessionExpired) return null; // Event handles redirect
        if (!response.ok) throw new Error('Failed to save address');
        return response.json();
    },

    delete: async (id) => {
        const response = await apiFetch(`/addresses/${id}`, {
            method: 'DELETE',
        });
        if (response.sessionExpired) return; // Event handles redirect
        if (!response.ok) throw new Error('Failed to delete address');
    },
};

// ============ USER API ============
export const userApi = {
    getProfile: async () => {
        const response = await apiFetch('/users/me');
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    updateProfile: async (data) => {
        const response = await apiFetch('/users/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        const updated = await response.json();
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    },
};

// ============ ADMIN API ============
export const adminApi = {
    // Stats
    getStats: async () => {
        const response = await apiFetch('/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    // Products
    // Categories (Helper)
    getCategories: async () => {
        const response = await apiFetch('/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    // Products
    getProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.category) queryParams.append('categoryId', params.category);
        if (params.stock) queryParams.append('stockStatus', params.stock);
        if (params.search) queryParams.append('search', params.search);

        const response = await apiFetch(`/admin/products?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    getProductById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        return response.json();
    },

    createProduct: async (productData) => {
        const response = await apiFetch('/admin/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create product');
        }
        return response.json();
    },

    updateProduct: async (id, productData) => {
        const response = await apiFetch(`/admin/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    deleteProduct: async (id) => {
        const response = await apiFetch(`/admin/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
    },

    // Returns up to exportSize orders for CSV export — replace with a streaming backend
    // endpoint (/admin/orders/export) when order volume makes this impractical
    getAllOrders: async (params = {}) => {
        return adminApi.getOrders({ ...params, size: params.size ?? 500 });
    },

    getOrderStats: async () => {
        const response = await apiFetch('/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    getOrders: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        // Send label to backend — server resolves to start/end in its own timezone
        if (params.dateRange) queryParams.append('dateRange', params.dateRange);

        const response = await apiFetch(`/admin/orders?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await apiFetch(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return response.json();
    },

    // Image Upload
    uploadImage: async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        // Cookies sent automatically with credentials: include
        // Note: fetch options need to be constructed carefully for FormData (no Content-Type set manually)
        
        const response = await fetch(`${API_BASE_URL}/admin/upload/image`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.url;
    },

    // Customers
    getCustomers: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.search) queryParams.append('search', params.search);
        if (params.filter) queryParams.append('filter', params.filter);

        const response = await apiFetch(`/admin/customers?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        return response.json();
    },

    getCustomerStats: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.filter) queryParams.append('filter', params.filter);
        
        const response = await apiFetch(`/admin/customers/stats?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch customer stats');
        return response.json();
    },

    getAllCustomers: async (params = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append('size', params.size ?? 500);
        if (params.search) queryParams.append('search', params.search);
        if (params.filter) queryParams.append('filter', params.filter);

        const response = await apiFetch(`/admin/customers?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch all customers');
        const data = await response.json();
        return data.content;
    },
};

// ============ REVIEWS API ============
export const reviewsApi = {
    /**
     * GET paginated reviews for a product.
     * @param {number} productId
     * @param {{ sort?: 'recent'|'helpful', ratingFilter?: number, page?: number, size?: number }} params
     */
    getReviews: async (productId, params = {}) => {
        const query = new URLSearchParams();
        if (params.sort)         query.append('sort', params.sort);
        if (params.ratingFilter) query.append('ratingFilter', params.ratingFilter);
        if (params.page !== undefined) query.append('page', params.page);
        if (params.size !== undefined) query.append('size', params.size);
        const qs = query.toString();
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews${qs ? '?' + qs : ''}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },

    /** GET aggregate summary (avg rating, distribution, has-reviewed flag). */
    getSummary: async (productId) => {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews/summary`);
        if (!response.ok) throw new Error('Failed to fetch review summary');
        return response.json();
    },

    /** POST a new review. Authenticated. */
    createReview: async (productId, { rating, title, body }) => {
        const response = await apiFetch(`/products/${productId}/reviews`, {
            method: 'POST',
            body: JSON.stringify({ rating, title, body }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to submit review');
        }
        return response.json();
    },

    /** PUT increment helpful count. Authenticated. */
    markHelpful: async (reviewId) => {
        const response = await apiFetch(`/reviews/${reviewId}/helpful`, { method: 'PUT' });
        if (!response.ok) throw new Error('Failed to mark review as helpful');
        return response.json();
    },

    /** DELETE own review (or admin). Authenticated. */
    deleteReview: async (reviewId) => {
        const response = await apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete review');
    },
};

// ============ COUPON API ============
export const couponApi = {
    /**
     * Validate a coupon code against a cart subtotal.
     * Returns { valid, message, discountAmount, finalAmount, couponCode, discountType, discountValue }
     * No side-effects — does NOT consume the coupon.
     */
    validate: async (code, orderAmount) => {
        const response = await apiFetch('/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code, orderAmount }),
        });
        // 400 = invalid coupon — still parse the JSON for the message
        const data = await response.json().catch(() => ({}));
        if (!response.ok && response.status !== 400) {
            throw new Error(data.message || 'Failed to validate coupon');
        }
        return data;
    },

    // ── Admin CRUD ──────────────────────────────────────────────────
    getAll: async () => {
        const response = await apiFetch('/admin/coupons');
        if (!response.ok) throw new Error('Failed to fetch coupons');
        return response.json();
    },

    getById: async (id) => {
        const response = await apiFetch(`/admin/coupons/${id}`);
        if (!response.ok) throw new Error('Coupon not found');
        return response.json();
    },

    create: async (data) => {
        const response = await apiFetch('/admin/coupons', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || 'Failed to create coupon');
        return body;
    },

    update: async (id, data) => {
        const response = await apiFetch(`/admin/coupons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || 'Failed to update coupon');
        return body;
    },

    delete: async (id) => {
        const response = await apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete coupon');
    },
};

// ============ PAYMENT API ============
export const paymentApi = {
    /**
     * Create a Razorpay order on the backend.
     * @param {number} amountInPaise - amount in paise (₹1 = 100 paise)
     * @returns {{ razorpayOrderId, amount, currency, keyId }}
     */
    createRazorpayOrder: async (amountInPaise) => {
        const response = await apiFetch('/payment/razorpay/create-order', {
            method: 'POST',
            body: JSON.stringify({ amountInPaise }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Failed to create payment order');
        return data;
    },

    /**
     * Verify Razorpay payment and create the order in our DB.
     * @param {{ razorpayOrderId, razorpayPaymentId, razorpaySignature, shippingAddressId, couponCode }} payload
     * @returns {OrderResponse}
     */
    verifyRazorpayPayment: async (payload) => {
        const response = await apiFetch('/payment/razorpay/verify', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Payment verification failed');
        return data;
    },
};

// ============ CHAT / RAG API ============
export const chatApi = {
    /**
     * Send a message to the Vaidya AI assistant.
     * @param {string} message - The user's question
     * @param {Array<{role: string, content: string}>} history - Previous turns
     * @returns {{ reply: string, suggestions: Array }} Claude's response + product cards
     */
    sendMessage: async (message, history = []) => {
        const response = await apiFetch('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Chat service unavailable');
        }
        return response.json();
    },

    /**
     * Semantic product search — returns ranked product suggestions.
     * @param {string} query - Natural language search query
     * @returns {Array<ProductSuggestion>}
     */
    semanticSearch: async (query) => {
        const response = await fetch(`${API_BASE_URL}/search/semantic?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        return response.json();
    },
};

// Export all
export default {
    auth: authApi,
    categories: categoriesApi,
    products: productsApi,
    cart: cartApi,
    orders: ordersApi,
    addresses: addressApi,
    user: userApi,
    admin: adminApi,
    chat: chatApi,
    reviews: reviewsApi,
    coupons: couponApi,
};
