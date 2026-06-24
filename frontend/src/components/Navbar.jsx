import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, LogOut, User, ShoppingCart, Bell, BellOff, Package, CreditCard, Trash } from 'lucide-react';

export default function Navbar({ 
  user, 
  cartCount, 
  onCartClick, 
  onAuthClick, 
  onLogout, 
  activeTab, 
  onTabChange,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'PRODUCT_CREATED':
        return <Package size={16} className="notif-icon product" />;
      case 'ORDER_STATUS_UPDATE':
        return <ShoppingCart size={16} className="notif-icon order" />;
      case 'PAYMENT_SUCCESS':
        return <CreditCard size={16} className="notif-icon payment" />;
      default:
        return <ShoppingCart size={16} className="notif-icon general" />;
    }
  };

  const getRelativeTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
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
          {/* Notifications Center */}
          {user && (
            <div className="notification-container" ref={notifRef}>
              <button 
                className={`notif-trigger ${isNotificationsOpen ? 'active' : ''}`} 
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                title="Notifications"
              >
                <Bell size={20} className={unreadCount > 0 ? 'bell-ringing' : ''} />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="notifications-dropdown glass-panel">
                  <div className="notif-dropdown-header">
                    <h3>Notifications</h3>
                    <div className="notif-header-actions">
                      {unreadCount > 0 && (
                        <button className="btn-link" onClick={onMarkAllAsRead}>
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button className="btn-link btn-clear" onClick={onClearAll} title="Clear all">
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <BellOff size={32} className="empty-bell-icon" />
                        <p className="empty-title">All quiet here</p>
                        <p className="empty-subtitle">You have no new notifications.</p>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        const isRead = notif.read;
                        const notifIcon = getNotifIcon(notif.type);
                        const relativeTime = getRelativeTime(notif.timestamp);
                        
                        return (
                          <div 
                            key={notif.id} 
                            className={`notif-item ${isRead ? 'read' : 'unread'}`}
                            onClick={() => onMarkAsRead(notif.id)}
                          >
                            {!isRead && <span className="unread-dot"></span>}
                            <div className="notif-icon-wrapper">
                              {notifIcon}
                            </div>
                            <div className="notif-content">
                              <p className="notif-message">{notif.message}</p>
                              <span className="notif-time">{relativeTime}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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

        /* Notifications Center styling */
        .notification-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .notif-trigger {
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          position: relative;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .notif-trigger:hover, .notif-trigger.active {
          background: rgba(255, 255, 255, 0.1);
          color: var(--primary);
        }

        .notif-badge {
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
          position: absolute;
          top: -2px;
          right: -2px;
          box-shadow: 0 0 8px var(--danger-glow);
        }

        .bell-ringing {
          animation: bellWobble 1.5s ease-in-out infinite;
        }

        @keyframes bellWobble {
          0%, 100% { transform: rotate(0); }
          15% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(4deg); }
          60% { transform: rotate(-4deg); }
          75% { transform: rotate(2deg); }
          85% { transform: rotate(-2deg); }
        }

        .notifications-dropdown {
          position: absolute;
          top: 40px;
          right: 0;
          width: 320px;
          background: rgba(8, 9, 14, 0.95);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          transform-origin: top right;
          animation: slideDownFade 0.2s ease forwards;
          padding: 12px 0 6px 0;
        }

        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .notif-dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px 10px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .notif-dropdown-header h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .notif-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-link {
          background: transparent;
          border: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          transition: all 0.2s;
        }

        .btn-link:hover {
          filter: brightness(1.2);
        }

        .btn-clear {
          background: transparent;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          cursor: pointer;
          border-radius: var(--radius-xs);
          transition: all 0.2s;
        }

        .btn-clear:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.05);
        }

        .notif-dropdown-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notif-dropdown-list::-webkit-scrollbar {
          width: 4px;
        }

        .notif-dropdown-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
        }

        .notif-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }

        .notif-item:last-child {
          border-bottom: none;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .notif-item.unread {
          background: rgba(139, 92, 246, 0.03);
          border-left: 3px solid var(--primary);
        }

        .unread-dot {
          position: absolute;
          top: 14px;
          right: 16px;
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--primary);
        }

        .notif-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.03);
          flex-shrink: 0;
        }

        .notif-icon {
          color: var(--text-muted);
        }

        .notif-icon.product {
          color: var(--primary);
        }
        .notif-icon.order {
          color: var(--secondary);
        }
        .notif-icon.payment {
          color: var(--action-orange);
        }

        .notif-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
          text-align: left;
        }

        .notif-message {
          font-size: 0.82rem;
          line-height: 1.4;
          color: #fff;
          margin: 0;
          font-weight: 500;
        }

        .notif-item.read .notif-message {
          color: var(--text-muted);
          font-weight: 400;
        }

        .notif-time {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* Empty State */
        .notif-empty-state {
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-bell-icon {
          color: var(--text-muted);
          opacity: 0.3;
          margin-bottom: 12px;
        }

        .empty-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px 0;
        }

        .empty-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>
    </nav>
  );
}
