import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import Notification from './components/Notification';
import { Search, ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [activeTab, setActiveTab] = useState('shop');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  // Sync user profile to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      setOrders([]);
    }
  }, [user]);

  // Toast helper
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  // Fetch Products via Aggregation API
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await api.products.getAggregation(page, 9, debouncedSearch);
      setProducts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      showNotification(err.message || 'Failed to load products', 'error');
    } finally {
      setProductsLoading(false);
    }
  }, [page, debouncedSearch, showNotification]);

  // Fetch Orders via Current User endpoint
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const response = await api.orders.getCurrentUser();
      setOrders(response.order || []);
      setOrdersTotalPages(1);
    } catch (err) {
      setOrders([]);
      if (!err.message.includes('not found')) {
        showNotification(err.message || 'Failed to load orders', 'error');
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [user, showNotification]);

  // Fetch Cart
  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.cart.get();
      setCart(response.cart || { items: [] });
    } catch (err) {
      // If 401 Unauthorized, clear user state
      if (err.message.includes('unauthorized') || err.message.includes('Authenticated')) {
        setUser(null);
        setCart({ items: [] });
      }
    }
  }, [user]);

  // Initial loads and hooks
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, ordersPage]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page to 1 on new search
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  // Cart actions
  const handleAddToCart = async (productId) => {
    if (!user) {
      setIsAuthOpen(true);
      showNotification('Please sign in to add items to your cart.', 'info');
      return;
    }

    try {
      const response = await api.cart.add(productId, 1);
      setCart(response.cart);
      showNotification('Product added to cart!', 'success');
    } catch (err) {
      showNotification(err.message || 'Could not add product', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCart({ items: [] });
    showNotification('Logged out successfully', 'info');
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar 
        user={user}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Dashboard / Shop Area / Orders Area */}
      <main className="main-content">
        {activeTab === 'shop' ? (
          <>
            <section className="hero-banner glass-panel">
              <div className="hero-banner-content">
                <span className="hero-badge">Special Welcome Offer</span>
                <h1>Modern E-Commerce Store</h1>
                <p>
                  Experience blazing fast catalog browsing and real-time cart queue processing built with state-of-the-art tech.
                </p>
                <button className="btn btn-primary" onClick={() => document.getElementById('catalog-search')?.focus()}>
                  <span>Explore Products</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>

            {/* Catalog Control Bar */}
            <div className="catalog-controls">
              <div className="search-bar-wrapper glass-panel">
                <Search className="search-icon" size={18} />
                <input 
                  id="catalog-search"
                  type="text" 
                  className="search-input" 
                  placeholder="Search products by title..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-clear-btn" onClick={() => setSearch('')}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Retrieving products catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-catalog-state glass-panel">
                <ShoppingBag size={48} className="empty-catalog-icon" />
                <h3>No products found</h3>
                <p>Try refining your search keyword or go back to previous pages.</p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      user={user}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="btn btn-outline btn-icon-only"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <span className="pagination-text">
                      Page <strong>{page}</strong> of {totalPages}
                    </span>

                    <button 
                      className="btn btn-outline btn-icon-only"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="orders-container">
            <h2 className="orders-title">My Order History</h2>
            
            {ordersLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Retrieving your order history...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-catalog-state glass-panel">
                <ShoppingBag size={48} className="empty-catalog-icon" />
                <h3>No orders placed yet</h3>
                <p>Add some products to your cart and place an order to see it here!</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('shop')}>
                  Go Shopping
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const statusColors = {
                    PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' },
                    CONFIRM: { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' },
                    PROCESSED: { bg: '#f5f3ff', text: '#7c3aed', border: '#ede9fe' },
                    SHIPPED: { bg: '#ecfeff', text: '#0891b2', border: '#cffafe' },
                    DELIVERD: { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' },
                    CANCELLED: { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' },
                    RETURNED: { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
                  };
                  const status = order.orderStatus || 'PENDING';
                  const styleColors = statusColors[status] || statusColors.PENDING;
                  
                  return (
                    <div key={order._id} className="order-card glass-panel">
                      <div className="order-card-header">
                        <div className="order-meta-info">
                          <span className="order-number">{order.orderNumber}</span>
                          <span className="order-date">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span 
                          className="order-status-badge"
                          style={{
                            backgroundColor: styleColors.bg,
                            color: styleColors.text,
                            borderColor: styleColors.border
                          }}
                        >
                          {status}
                        </span>
                      </div>
                      
                      <div className="order-card-body">
                        <div className="order-details-grid">
                          <div className="order-detail-col">
                            <span className="detail-label">Items Count</span>
                            <span className="detail-value">{(order.itemCount !== undefined ? order.itemCount : (order.items?.length || 0))} item{(order.itemCount !== undefined ? order.itemCount : (order.items?.length || 0)) !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="order-detail-col">
                            <span className="detail-label">Total Amount</span>
                            <span className="detail-value total-amount">₹{(order.totalAmount !== undefined && order.totalAmount !== null ? order.totalAmount : (order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)).toLocaleString()}</span>
                          </div>
                          <div className="order-detail-col">
                            <span className="detail-label">Payment Status</span>
                            <span className="detail-value text-capitalize">{order.paymentStatus || 'PENDING'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Orders Pagination */}
                {ordersTotalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="btn btn-outline btn-icon-only"
                      disabled={ordersPage <= 1}
                      onClick={() => setOrdersPage(p => Math.max(p - 1, 1))}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <span className="pagination-text">
                      Page <strong>{ordersPage}</strong> of {ordersTotalPages}
                    </span>

                    <button 
                      className="btn btn-outline btn-icon-only"
                      disabled={ordersPage >= ordersTotalPages}
                      onClick={() => setOrdersPage(p => Math.min(p + 1, ordersTotalPages))}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Auth View Modal */}
      {isAuthOpen && (
        <AuthView 
          onClose={() => setIsAuthOpen(false)}
          onSuccess={setUser}
          showNotification={showNotification}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onCartChange={setCart}
        showNotification={showNotification}
      />

      {/* Notification Toast */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <style>{`
        /* Hero Banner */
        .hero-banner {
          padding: 40px 32px;
          margin-bottom: 24px;
          text-align: left;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #e8f0fe 0%, #c2ecff 100%);
          border-color: #d2e3fc;
          border-radius: 4px;
        }

        .hero-banner-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }

        .hero-badge {
          background: rgba(40, 116, 240, 0.1);
          color: var(--primary);
          border: 1px solid rgba(40, 116, 240, 0.2);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-block;
          margin-bottom: 16px;
        }

        .hero-banner h1 {
          font-size: 2.3rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
          color: #1a1a1a;
          text-transform: none;
        }

        .hero-banner p {
          font-size: 1.05rem;
          color: #4a4a4a;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        /* Controls */
        .catalog-controls {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 20px;
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          padding: 4px 8px 4px 16px;
          max-width: 460px;
          width: 100%;
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: 2px;
          box-shadow: var(--shadow-sm);
        }

        .search-icon {
          color: var(--text-muted);
          margin-right: 12px;
          flex-shrink: 0;
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          font-size: 0.95rem;
          font-family: var(--font-sans);
          height: 38px;
          width: 100%;
        }

        .search-clear-btn {
          background: #f5f5f5;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 4px 10px;
          border-radius: 2px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: none;
        }

        .search-clear-btn:hover {
          background: #e0e0e0;
          color: var(--text-main);
        }

        /* Loading State */
        .loading-state {
          padding: 80px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(40, 116, 240, 0.1);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-state p {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 500;
        }

        /* Empty State */
        .empty-catalog-state {
          padding: 80px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: #fff;
          border-radius: 2px;
        }

        .empty-catalog-icon {
          color: var(--text-muted);
          opacity: 0.3;
          margin-bottom: 20px;
        }

        .empty-catalog-state h3 {
          font-size: 1.2rem;
          font-weight: 500;
          margin-bottom: 8px;
          color: #212121;
        }

        .empty-catalog-state p {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 300px;
        }

        /* Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        /* Pagination */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 20px;
          margin-bottom: 40px;
        }

        .pagination-text {
          font-size: 0.95rem;
          color: var(--text-muted);
        }

        .pagination-text strong {
          color: var(--text-main);
        }

        @media (max-width: 768px) {
          .hero-banner {
            padding: 30px 20px;
          }
          .hero-banner h1 {
            font-size: 1.8rem;
          }
        }

        /* Orders Dashboard */
        .orders-container {
          text-align: left;
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .orders-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #212121;
          margin-bottom: 24px;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 30px;
        }

        .order-card {
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 20px;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 14px;
          margin-bottom: 14px;
        }

        .order-meta-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-number {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
        }

        .order-date {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .order-status-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 2px;
          border: 1px solid transparent;
          text-transform: uppercase;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .order-detail-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .detail-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .detail-value.total-amount {
          color: #212121;
          font-size: 1.05rem;
          font-weight: 700;
        }

        .text-capitalize {
          text-transform: capitalize;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
