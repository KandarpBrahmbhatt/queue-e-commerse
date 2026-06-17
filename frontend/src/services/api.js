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
  },
  products: {
    getAll: (page = 1, limit = 10, search = '') =>
      request(`/product/get?page=${page}&limit=${limit}&search=${search}`),
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
};
