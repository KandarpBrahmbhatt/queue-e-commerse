import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, CreditCard } from 'lucide-react';
import { api } from '../services/api';

export default function CartDrawer({ isOpen, onClose, cart, onCartChange, showNotification }) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  if (!isOpen) return null;

  const cartItems = cart?.items || [];
  
  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleRemoveItem = async (productId) => {
    setUpdatingItemId(productId);
    try {
      const response = await api.cart.remove(productId);
      showNotification('Product removed from cart', 'info');
      onCartChange(response.cart);
    } catch (err) {
      showNotification(err.message || 'Failed to remove item', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    setUpdatingItemId(productId);
    try {
      const response = await api.cart.add(productId, delta);
      onCartChange(response.cart);
    } catch (err) {
      showNotification(err.message || 'Failed to update quantity', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const response = await api.orders.create();
      showNotification(`Order placed successfully! Order Number: ${response.order?.orderNumber || ''}`, 'success');
      onCartChange({ items: [] });
      onClose();
    } catch (err) {
      showNotification('Checkout failed: ' + err.message, 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title-area">
            <h2>My Cart</h2>
            <span className="cart-count-pill">{totalItems} items</span>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} className="empty-cart-icon" />
              <h3>Your cart is empty</h3>
              <p>Add products from the store to continue shopping.</p>
              <button className="btn btn-outline" onClick={onClose}>Shop Now</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const product = item.product || {};
                const pId = product._id || product;
                const isUpdating = updatingItemId === pId;

                return (
                  <div key={pId} className="cart-item glass-panel">
                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{product.name || 'Product'}</h4>
                      <span className="cart-item-sku">{product.sku}</span>
                      <span className="cart-item-price">₹{item.price.toLocaleString()}</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controller">
                        <button 
                          className="qty-btn"
                          disabled={isUpdating}
                          onClick={() => handleUpdateQuantity(pId, item.quantity, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          disabled={isUpdating}
                          onClick={() => handleUpdateQuantity(pId, item.quantity, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button 
                        className="item-remove-btn"
                        disabled={isUpdating}
                        onClick={() => handleRemoveItem(pId)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Price ({totalItems} items)</span>
                <span className="summary-val">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row delivery">
                <span>Delivery Charges</span>
                <span className="summary-val delivery-free">FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span className="summary-val total-price">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-block checkout-btn" 
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              <CreditCard size={18} />
              <span>{checkingOut ? 'Placing Order...' : 'Place Order'}</span>
            </button>
          </div>
        )}
      </div>
      <style>{`
        .cart-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 95;
          display: flex;
          justify-content: flex-end;
        }

        .cart-drawer {
          width: 100%;
          max-width: 420px;
          height: 100%;
          border-radius: 0;
          border-right: none;
          border-top: none;
          border-bottom: none;
          display: flex;
          flex-direction: column;
          animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background: rgba(10, 11, 16, 0.95);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-left: 1px solid var(--border-color);
          box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .cart-header {
          padding: 16px 20px;
          background: transparent;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cart-title-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-title-area h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cart-count-pill {
          background: rgba(255, 255, 255, 0.05);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
        }

        .cart-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .cart-close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .cart-empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: var(--radius-sm);
        }

        .empty-cart-icon {
          color: var(--text-muted);
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .cart-empty-state h3 {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 6px;
          color: var(--text-main);
        }

        .cart-empty-state p {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 240px;
          margin-bottom: 20px;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cart-item {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: border-color 0.2s;
        }

        .cart-item:hover {
          border-color: rgba(139, 92, 246, 0.2);
        }

        .cart-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .cart-item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-item-sku {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .cart-item-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quantity-controller {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xs);
        }

        .qty-btn {
          background: transparent;
          border: none;
          color: var(--text-main);
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .qty-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .qty-val {
          font-size: 0.85rem;
          font-weight: 700;
          min-width: 26px;
          text-align: center;
          border-left: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
          line-height: 26px;
        }

        .item-remove-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .item-remove-btn:hover:not(:disabled) {
          color: var(--danger);
        }

        .cart-footer {
          padding: 18px 24px;
          background: rgba(10, 11, 16, 0.6);
          border-top: 1px solid var(--border-color);
          backdrop-filter: var(--glass-blur);
        }

        .cart-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .summary-val {
          font-weight: 500;
          color: var(--text-main);
        }

        .delivery-free {
          color: var(--rating-green);
          font-weight: 700;
        }

        .cart-summary .total {
          border-top: 1px dashed var(--border-color);
          padding-top: 14px;
          font-size: 1.05rem;
          color: var(--text-main);
          font-weight: 700;
        }

        .total-price {
          color: var(--text-main);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .checkout-btn {
          width: 100%;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          text-transform: none;
        }
      `}</style>
    </div>
  );
}
