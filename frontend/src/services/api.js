const API_BASE = '/api';

// Cryptographic HMAC-SHA256 signature generator using the browser's native Web Crypto API (added by AI assistant)
async function generateHMAC(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Matches the backend signature secret (added by AI assistant)
const SIGNATURE_SECRET = 'dsfsdfsdsdfsdfsdfsdjfjklsfdjlsdfkjkldsjf';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Automatically compute and inject x-signature header for write requests (added by AI assistant)
  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE' || options.body) {
    let bodyStr = '';
    if (options.body) {
      bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    } else if (options.method === 'POST') {
      bodyStr = '{}';
    }
    const signature = await generateHMAC(bodyStr, SIGNATURE_SECRET);
    headers['x-signature'] = signature;
  }

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
    signup: (name, email, password) =>
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
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
  },
  products: {
    getAggregation: (page = 1, limit = 10, search = '') => {
      let url = `/product/getAggregationProduct?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      return request(url);
    },
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
};
