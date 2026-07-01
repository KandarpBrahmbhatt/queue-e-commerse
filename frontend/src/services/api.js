const API_BASE = '/api';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  auth: {
    signup: (name, email, password, phone) =>
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      }),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    sendOtp: (email) =>
      request('/auth/sendotp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email, otp) =>
      request('/auth/verifyotp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }),
    resetPassword: (email, password) =>
      request('/auth/resetpassword', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    forgotPassword: (oldPassword, newPassword) =>
      request('/auth/forgotpassword', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      }),
  },
  products: {
    getAggregation: (page = 1, limit = 10, search = '') => {
      let url = `/product/getAggregationProduct?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      return request(url);
    },
    getCurrentProduct: (id) => request(`/product/currentProduct/${id}`),
    getRecent: () => request('/product/recent'),
    clearRecent: () =>
      request('/product/recent', {
        method: 'DELETE',
      }),
  },
  orders: {
    create: (orderData = {}) => // Modified to accept orderData (added by AI assistant)
      request('/order/create', {
        method: 'POST',
        body: JSON.stringify(orderData), // Sends shippingAddress and paymentMethod (added by AI assistant)
      }),
    getAggregation: (page = 1, limit = 10) =>
      request(`/order/getaggragationOrder?page=${page}&limit=${limit}`),
    getCurrentUser: () =>
      request('/order/getCuurentUserOrder'),
    cancel: (orderId) =>
      request(`/order/cancel/${orderId}`, {
        method: 'PATCH',
      }),
    requestReturn: (orderId, reason) =>
      request(`/order/return/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    requestReplacement: (orderId, reason) =>
      request(`/order/replace/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    getAll: (page = 1, limit = 10) =>
      request(`/order/get?page=${page}&limit=${limit}`),
    approveReturn: (orderId) =>
      request(`/order/approve-return/${orderId}`, {
        method: 'PATCH',
      }),
    markAsShipped: (orderId) =>
      request(`/order/shipped/${orderId}`, {
        method: 'PATCH',
      }),
    markAsDelivered: (orderId) =>
      request(`/order/delivered/${orderId}`, {
        method: 'PATCH',
      }),
  },
  address: { // Added address API module (added by AI assistant)
    get: () => request('/address/get'),
    create: (addressData) =>
      request('/address/create', {
        method: 'POST',
        body: JSON.stringify(addressData),
      }),
    update: (id, addressData) =>
      request(`/address/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      }),
    delete: (id) =>
      request(`/address/delete/${id}`, {
        method: 'DELETE',
      }),
  },
  inventory: {
    getAll: (page = 1, limit = 10, search = "") =>
      request(`/inventory/getAllInventory?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
    getById: (id) => request(`/inventory/getInventoryById/${id}`),
    create: (inventoryData) =>
      request('/inventory/create', {
        method: 'POST',
        body: JSON.stringify(inventoryData),
      }),
    update: (id, inventoryData) =>
      request(`/inventory/updateInventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(inventoryData),
      }),
    addStock: (id, quantity) =>
      request(`/inventory/addStock/${id}`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      }),
    delete: (id) =>
      request(`/inventory/deleteInventory/${id}`, {
        method: 'DELETE',
      }),
    getLowStock: () => request('/inventory/getLowStockProducts'),
    getHistory: (id) => request(`/inventory/getInventoryHistory/${id}`),
  },
  cart: {
    get: () => request('/cart/get'),
    add: (productId, quantity = 1) =>
      request('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    remove: (productId) =>
      request(`/cart/remove/${productId}`, {
        method: 'DELETE',
      }),
  },
  payment: {
    create: (orderId) =>
      request('/payment/create', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      }),
  },
  coupon: {
    apply: (code, cartTotal) =>
      request('/coupon/apply', {
        method: 'POST',
        body: JSON.stringify({ code, cartTotal }),
      }),
    list: () => request('/coupon/list'),
  },
  review: {
    create: (productId, rating, comment) =>
      request('/review/create', {
        method: 'POST',
        body: JSON.stringify({ productId, rating, comment }),
      }),
    get: (productId, page = 1, limit = 10) =>
      request(`/review/get/${productId}?page=${page}&limit=${limit}`),
    update: (id, rating, comment) =>
      request(`/review/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ rating, comment }),
      }),
    delete: (id) =>
      request(`/review/delete/${id}`, {
        method: 'DELETE',
      }),
  },
  profile: {
    get: () => request('/profile/currentProfile'),
    update: (profileData) =>
      request('/profile/update', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },
  dashboard: {
    getSummary: () => request('/dashboard/get'),
  },
  security: {
    getSessions: () => request('/security/sessions'),
    revokeSession: (sessionId) =>
      request(`/security/sessions/${sessionId}`, {
        method: 'DELETE',
      }),
    getLoginHistory: () => request('/security/login-history'),
    getAllLoginHistory: () => request('/security/login-history/all'),
  },
};
