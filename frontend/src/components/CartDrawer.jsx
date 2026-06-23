import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, CreditCard, MapPin, Check, PlusCircle } from 'lucide-react';
import { api } from '../services/api';

// Modified by AI assistant:
// 1. Added address fetching on drawer open.
// 2. Added states for address selection and inline address creation form.
// 3. Modified checkout flow to require and pass the selected address to order creation.

export default function CartDrawer({ isOpen, onClose, cart, onCartChange, showNotification }) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New Address Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Fetch saved addresses when drawer opens
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await api.address.get();
      const list = response.address || [];
      setAddresses(list);
      // Automatically select default address
      const def = list.find(a => a.isDefault);
      if (def) {
        setSelectedAddressId(def._id);
      } else if (list.length > 0) {
        setSelectedAddressId(list[0]._id);
      }
    } catch (err) {
      console.log('Failed to fetch addresses in checkout', err);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      setShowAddressForm(false);
    }
  }, [isOpen]);

  const handleSaveAndSelectAddress = async (e) => {
    e.preventDefault();
    if (!fullName || !mobile || !addressLine1 || !city || !state || !pincode) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }
    setCheckingOut(true);
    try {
      const payload = {
        fullName,
        mobile,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country: 'India',
        isDefault: addresses.length === 0
      };
      const response = await api.address.create(payload);
      showNotification('Shipping address saved!', 'success');
      
      // Clear form states
      setFullName('');
      setMobile('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPincode('');
      setShowAddressForm(false);

      // Add to list and select
      const newAddress = response.address;
      setAddresses(prev => [...prev, newAddress]);
      setSelectedAddressId(newAddress._id);
    } catch (err) {
      showNotification(err.message || 'Failed to save address', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

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
    if (!selectedAddressId) {
      showNotification('Please select or add a shipping address to checkout.', 'error');
      return;
    }

    const shippingAddress = addresses.find(a => a._id === selectedAddressId);
    if (!shippingAddress) {
      showNotification('Selected shipping address is invalid.', 'error');
      return;
    }

    setCheckingOut(true);
    try {
      // Pass the selected address to the backend createOrder function
      const response = await api.orders.create({ shippingAddress });
      showNotification('Order placed successfully! Redirecting to checkout...', 'success');
      onCartChange({ items: [] });
      onClose();
      
      // Request Stripe Payment Session and Redirect
      const paymentRes = await api.payment.create(response.order._id);
      if (paymentRes.success && paymentRes.checkoutUrl) {
        window.location.href = paymentRes.checkoutUrl;
      } else {
        throw new Error('Failed to generate secure payment URL');
      }
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
            <div className="cart-content-wrapper">
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

              {/* Shipping Address Section (added by AI assistant) */}
              <div className="checkout-address-section">
                <div className="section-title-row">
                  <h3 className="section-title">Shipping Address</h3>
                  {addresses.length > 0 && !showAddressForm && (
                    <button 
                      className="add-address-link-btn"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <PlusCircle size={14} />
                      <span>New Address</span>
                    </button>
                  )}
                </div>

                {addressesLoading ? (
                  <div className="addresses-mini-loading">
                    <div className="mini-spinner"></div>
                    <span>Fetching addresses...</span>
                  </div>
                ) : showAddressForm || addresses.length === 0 ? (
                  <form onSubmit={handleSaveAndSelectAddress} className="checkout-address-form glass-panel">
                    <h4 className="form-subheading">{addresses.length === 0 ? 'Add Shipping Address' : 'Add New Address'}</h4>
                    <div className="input-group">
                      <label className="input-label">Full Name *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Mobile Number *</label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Address Line 1 *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Flat, House no., Building"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Address Line 2 (Optional)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Area, Colony, Street"
                      />
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Pincode *</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="6-digit PIN"
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">City *</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">State *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        required
                      />
                    </div>
                    <div className="form-actions-mini">
                      {addresses.length > 0 && (
                        <button 
                          type="button" 
                          className="btn btn-outline btn-sm"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="btn btn-secondary btn-sm" disabled={checkingOut}>
                        Save & Select
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="checkout-addresses-list">
                    {addresses.map((addr) => (
                      <label 
                        key={addr._id} 
                        className={`checkout-address-option glass-panel ${selectedAddressId === addr._id ? 'selected' : ''}`}
                      >
                        <input 
                          type="radio" 
                          name="shipping_address"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="address-radio"
                        />
                        <div className="address-radio-label">
                          <div className="address-radio-title">
                            <strong>{addr.fullName}</strong>
                            {addr.isDefault && <span className="mini-default-pill">Default</span>}
                          </div>
                          <span className="address-radio-details">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                          </span>
                          <span className="address-radio-phone">Mobile: {addr.mobile}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
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

        /* Shipping Address Styles in Drawer (added by AI assistant) */
        .cart-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .checkout-address-section {
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          text-align: left;
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .add-address-link-btn {
          background: transparent;
          border: none;
          color: #a78bfa;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          transition: all 0.2s;
        }

        .add-address-link-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          color: #c084fc;
        }

        .addresses-mini-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 12px;
        }

        .mini-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: spin 0.8s linear infinite;
        }

        .checkout-addresses-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkout-address-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-surface);
        }

        .checkout-address-option:hover {
          border-color: rgba(139, 92, 246, 0.2);
          background: var(--bg-surface-hover);
        }

        .checkout-address-option.selected {
          border-color: var(--primary);
          background: rgba(139, 92, 246, 0.05);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.1);
        }

        .address-radio {
          margin-top: 4px;
          accent-color: var(--primary);
        }

        .address-radio-label {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .address-radio-title {
          font-size: 0.9rem;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mini-default-pill {
          background: rgba(167, 139, 250, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.3);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .address-radio-details {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .address-radio-phone {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .checkout-address-form {
          padding: 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-subheading {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
          margin-bottom: 4px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-actions-mini {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }
      `}</style>
    </div>
  );
}
