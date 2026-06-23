import React from 'react';
import { ShoppingBag, LogOut, User, ShoppingCart } from 'lucide-react';

export default function Navbar({ user, cartCount, onCartClick, onAuthClick, onLogout, activeTab, onTabChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand" onClick={() => onTabChange('shop')}>
          <ShoppingBag className="brand-icon" size={20} />
          <span className="brand-text">Aether<i>Store</i></span>
        </div>

        <div className="nav-links">
          <button 
            className={`nav-link-btn ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => onTabChange('shop')}
          >
            Explore Shop
          </button>
          {user && (
            <>
              <button 
                className={`nav-link-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => onTabChange('orders')}
              >
                My Orders
              </button>
              <button 
                className={`nav-link-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => onTabChange('addresses')}
              >
                My Addresses
              </button>
            </>
          )}
        </div>

        <div className="nav-actions">
          <button className="cart-trigger" onClick={onCartClick}>
            <ShoppingCart size={20} />
            <span className="cart-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="user-profile">
              <div className="user-info">
                <User size={16} className="user-avatar" />
                <span className="user-name">{user.name}</span>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onAuthClick}>
              Login
            </button>
          )}
        </div>
      </div>
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          z-index: 90;
          background: rgba(8, 9, 14, 0.7);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          color: #fff;
          box-shadow: var(--shadow-sm);
        }

        .navbar-container {
          max-width: 1248px;
          width: 100%;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .brand-icon {
          color: #a78bfa;
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.2px;
          color: #fff;
        }

        .brand-text i {
          font-weight: 400;
          font-size: 0.95rem;
          color: #a78bfa;
          margin-left: 2px;
          font-style: italic;
        }

        .nav-links {
          display: flex;
          margin-left: 24px;
          margin-right: auto;
        }

        .nav-link-btn {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 6px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          text-transform: none;
        }

        .nav-link-btn:hover, .nav-link-btn.active {
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .cart-trigger {
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          position: relative;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          text-transform: none;
        }

        .cart-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .cart-label {
          font-size: 0.95rem;
        }

        .cart-badge {
          background: var(--danger);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: absolute;
          top: -2px;
          right: -2px;
          box-shadow: 0 0 8px var(--danger-glow);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 6px 4px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .user-avatar {
          color: #a78bfa;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ff8e8e;
        }

        .btn-sm {
          background: #fff;
          color: var(--primary);
          padding: 6px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          border-radius: 2px;
          text-transform: none;
        }

        .btn-sm:hover {
          background: #f0f0f0;
          color: var(--primary);
        }
      `}</style>
    </nav>
  );
}
