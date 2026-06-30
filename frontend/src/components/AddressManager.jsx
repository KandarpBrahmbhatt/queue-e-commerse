import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { MapPin, Plus, Trash2, Edit2, Check, Home, Briefcase, ChevronLeft } from 'lucide-react';

// New component created by AI assistant to manage user addresses (CRUD).
// This component provides a clean interface for adding, updating, and deleting delivery addresses.
// It integrates with the backend /api/address endpoints.

export default function AddressManager({ showNotification }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.address.get();
      setAddresses(response.address || []);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch addresses', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setFullName(address.fullName || '');
    setMobile(address.mobile || '');
    setAddressLine1(address.addressLine1 || '');
    setAddressLine2(address.addressLine2 || '');
    setCity(address.city || '');
    setState(address.state || '');
    setPincode(address.pincode || '');
    setCountry(address.country || 'India');
    setIsDefault(address.isDefault || false);
    setShowForm(true);
  };

  const handleAddNewClick = () => {
    setEditingAddress(null);
    setFullName('');
    setMobile('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPincode('');
    setCountry('India');
    setIsDefault(addresses.length === 0); // make it default if it's the first address
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.address.delete(id);
      showNotification('Address deleted successfully!', 'success');
      fetchAddresses();
    } catch (err) {
      showNotification(err.message || 'Failed to delete address', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !mobile || !addressLine1 || !city || !state || !pincode) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      fullName,
      mobile,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault
    };

    setLoading(true);
    try {
      if (editingAddress) {
        await api.address.update(editingAddress._id, payload);
        showNotification('Address updated successfully!', 'success');
      } else {
        await api.address.create(payload);
        showNotification('Address added successfully!', 'success');
      }
      setShowForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      showNotification(err.message || 'Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addresses-container">
      <div className="addresses-header-row">
        <h2 className="addresses-title">My Saved Addresses</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={handleAddNewClick}>
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {loading && addresses.length === 0 ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading addresses...</p>
        </div>
      ) : showForm ? (
        <div className="address-form-wrapper glass-panel">
          <div className="form-header">
            <button className="btn btn-outline btn-sm back-btn" onClick={handleCloseForm}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          </div>

          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Mobile Number *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="10-digit mobile number" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Address Line 1 (Flat, House no., Building, Company, Apartment) *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Street address, P.O. box, company name" 
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Address Line 2 (Area, Colony, Street, Sector, Village) - Optional</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Apartment, suite, unit, building, floor, etc." 
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>

            <div className="form-row-three">
              <div className="input-group">
                <label className="input-label">Pincode *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="6-digit PIN code" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">City *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Town/City" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">State *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="State" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Country</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                  />
                  <span>Set as default address</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleCloseForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-secondary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      ) : addresses.length === 0 ? (
        <div className="empty-catalog-state glass-panel">
          <MapPin size={48} className="empty-catalog-icon" />
          <h3>No saved addresses found</h3>
          <p>Add a delivery address to make checkout faster and easier.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleAddNewClick}>
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map((address) => (
            <div 
              key={address._id} 
              className={`address-card glass-panel ${address.isDefault ? 'default-address' : ''}`}
            >
              {address.isDefault && (
                <div className="default-badge">
                  <Check size={12} />
                  <span>Default Address</span>
                </div>
              )}
              
              <div className="address-card-body">
                <h4 className="address-name">{address.fullName}</h4>
                <p className="address-line">{address.addressLine1}</p>
                {address.addressLine2 && <p className="address-line">{address.addressLine2}</p>}
                <p className="address-city-state">
                  {address.city}, {address.state} - <strong>{address.pincode}</strong>
                </p>
                <p className="address-country">{address.country}</p>
                <p className="address-phone">Mobile: {address.mobile}</p>
              </div>

              <div className="address-card-actions">
                <button 
                  className="address-action-btn edit-btn" 
                  onClick={() => handleEditClick(address)}
                  title="Edit Address"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button 
                  className="address-action-btn delete-btn" 
                  onClick={(e) => handleDeleteAddress(address._id, e)}
                  title="Delete Address"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .addresses-container {
          text-align: left;
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .addresses-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .addresses-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #212121;
        }

        .addresses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .address-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: all 0.25s ease;
        }

        .address-card:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.2);
          box-shadow: var(--shadow-md);
        }

        .address-card.default-address {
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
        }

        .default-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .address-card-body {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .address-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .address-line {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .address-city-state {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .address-country {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .address-phone {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 8px;
        }

        .address-card-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          border-top: 1px solid var(--border-color);
          padding-top: 14px;
        }

        .address-action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
          padding: 4px 8px;
          border-radius: var(--radius-xs);
        }

        .address-action-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .address-action-btn.delete-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.05);
        }

        /* Form styling */
        .address-form-wrapper {
          padding: 30px;
          margin-bottom: 40px;
          text-align: left;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .form-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .back-btn {
          padding: 6px 12px;
        }

        .address-form {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-row-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          margin-top: 24px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-muted);
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 20px;
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
        }

        @media (max-width: 768px) {
          .form-row, .form-row-three {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}
