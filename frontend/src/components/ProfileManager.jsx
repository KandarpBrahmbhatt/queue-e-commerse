import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Mail, Lock, Calendar, ShieldCheck, Activity, Save, AlertCircle, Clock, Trash2, ExternalLink } from 'lucide-react';

export default function ProfileManager({ onUserUpdate, showNotification, onOpenProductDetail }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [recentViews, setRecentViews] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchRecentViews();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.profile.get();
      if (response.data) {
        setProfile(response.data);
        setName(response.data.name || '');
        setEmail(response.data.email || '');
      }
    } catch (err) {
      showNotification(err.message || 'Failed to fetch profile info.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentViews = async () => {
    setRecentLoading(true);
    try {
      const response = await api.products.getRecent();
      if (response.recent) {
        setRecentViews(response.recent);
      }
    } catch (err) {
      console.error('Failed to fetch recent views:', err);
    } finally {
      setRecentLoading(false);
    }
  };

  const handleClearRecent = async () => {
    try {
      await api.products.clearRecent();
      setRecentViews([]);
      showNotification('Browsing history cleared successfully.', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to clear browsing history.', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showNotification('Name and email are required fields.', 'error');
      return;
    }

    setUpdating(true);
    try {
      const payload = { name, email };
      if (showPasswordSection && password) {
        payload.password = password;
      }

      const response = await api.profile.update(payload);
      showNotification(response.message || 'Profile updated successfully!', 'success');
      
      if (response.data) {
        setProfile(response.data);
        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setPassword('');
        setShowPasswordSection(false);
        
        // Sync with parent App.jsx user state
        onUserUpdate(response.data);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update profile.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Retrieving your account details...</p>
      </div>
    );
  }

  const joinDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  return (
    <div className="profile-container">
      <div className="profile-grid">
        
        {/* Profile Card / Sidebar */}
        <div className="profile-sidebar glass-panel">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <span>{initials}</span>
              <div className="avatar-ring"></div>
            </div>
            <h2 className="profile-name">{profile?.name}</h2>
            <p className="profile-badge">Customer Account</p>
          </div>
          
          <div className="profile-meta-list">
            <div className="meta-item">
              <Calendar size={18} className="meta-icon" />
              <div>
                <span className="meta-label">Member Since</span>
                <span className="meta-value">{joinDate}</span>
              </div>
            </div>
            <div className="meta-item">
              <ShieldCheck size={18} className="meta-icon verified" />
              <div>
                <span className="meta-label">Verification Status</span>
                <span className="meta-value text-success">
                  {profile?.isOtpVerifed ? 'Email Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
            <div className="meta-item">
              <Activity size={18} className="meta-icon active-status" />
              <div>
                <span className="meta-label">Account Status</span>
                <span className="meta-value text-active">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Area */}
        <div className="profile-form-panel glass-panel">
          <h3 className="panel-title">Account Details</h3>
          
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="form-input with-icon" 
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  className="form-input with-icon" 
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Change Password Collapsible Section */}
            <div className="password-trigger-section">
              <button 
                type="button" 
                className="btn btn-outline btn-sm change-pwd-btn"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                <Lock size={14} />
                <span>{showPasswordSection ? 'Cancel Password Change' : 'Change Password'}</span>
              </button>
            </div>

            {showPasswordSection && (
              <div className="password-fields-container glass-panel-nested">
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">New Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      className="form-input with-icon" 
                      placeholder="Enter new password (minimum 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required={showPasswordSection}
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary profile-save-btn" 
              disabled={updating}
            >
              <Save size={16} />
              <span>{updating ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Recently Viewed Section */}
      <div className="profile-recent-section glass-panel">
        <div className="recent-header">
          <div className="recent-title-wrapper">
            <Clock className="recent-header-icon" size={20} />
            <h3 className="recent-section-title">Recently Viewed Products</h3>
          </div>
          {recentViews.length > 0 && (
            <button 
              type="button" 
              className="btn btn-outline btn-sm clear-history-btn"
              onClick={handleClearRecent}
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {recentLoading ? (
          <div className="recent-loading">
            <div className="loading-spinner spinner-sm"></div>
            <p>Retrieving history...</p>
          </div>
        ) : recentViews.length === 0 ? (
          <div className="recent-empty">
            <p>You haven't viewed any products recently.</p>
          </div>
        ) : (
          <div className="recent-grid">
            {recentViews.map((item) => {
              const prod = item.productId;
              if (!prod) return null;
              return (
                <div 
                  key={item._id} 
                  className="recent-item-card"
                  onClick={() => onOpenProductDetail && onOpenProductDetail(prod._id)}
                  title={`View details for ${prod.name}`}
                >
                  <img 
                    src={prod.images?.[0] || 'https://picsum.photos/seed/' + prod._id + '/100/100'} 
                    alt={prod.name} 
                    className="recent-item-img"
                  />
                  <div className="recent-item-info">
                    <span className="recent-item-name">{prod.name}</span>
                    <span className="recent-item-price">₹{prod.price?.toLocaleString()}</span>
                  </div>
                  <ExternalLink size={14} className="recent-item-link-icon" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .profile-container {
          text-align: left;
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Sidebar Styling */
        .profile-sidebar {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: rgba(255, 255, 255, 0.015);
        }

        .profile-avatar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
          position: relative;
          width: 100%;
        }

        .profile-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          position: relative;
          box-shadow: 0 8px 24px var(--primary-glow);
          margin-bottom: 16px;
        }

        .avatar-ring {
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 50%;
          border: 2px solid rgba(139, 92, 246, 0.3);
          animation: pulseRing 3s linear infinite;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.4;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }

        .profile-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 4px;
          letter-spacing: -0.3px;
        }

        .profile-badge {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.1);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          letter-spacing: 0.5px;
          display: inline-block;
        }

        .profile-meta-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
        }

        .meta-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .meta-icon.verified {
          color: var(--secondary);
        }

        .meta-icon.active-status {
          color: #3b82f6;
        }

        .meta-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 2px;
        }

        .meta-value {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .text-success {
          color: var(--secondary) !important;
        }

        .text-active {
          color: #60a5fa !important;
        }

        /* Form Styling */
        .profile-form-panel {
          padding: 32px;
          background: rgba(255, 255, 255, 0.015);
        }

        .panel-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-input.with-icon {
          padding-left: 44px;
        }

        .password-trigger-section {
          display: flex;
          justify-content: flex-start;
          margin-top: 4px;
        }

        .change-pwd-btn {
          border-color: rgba(255, 255, 255, 0.08);
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.01);
        }

        .change-pwd-btn:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .password-fields-container {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-xs);
          padding: 16px;
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-save-btn {
          width: fit-content;
          align-self: flex-start;
          margin-top: 12px;
          padding: 12px 24px;
          background: var(--primary);
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .profile-save-btn:hover {
          box-shadow: 0 6px 18px var(--primary-glow);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Recent Views Styling */
        .profile-recent-section {
          grid-column: span 2;
          padding: 24px;
          margin-top: 24px;
          background: rgba(255, 255, 255, 0.015);
        }

        @media (max-width: 768px) {
          .profile-recent-section {
            grid-column: span 1;
          }
        }

        .recent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .recent-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .recent-header-icon {
          color: #a78bfa;
        }

        .recent-section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .clear-history-btn {
          padding: 6px 12px;
          font-size: 0.75rem;
          border-color: rgba(239, 68, 68, 0.2);
          color: var(--danger);
          background: transparent;
          transition: all 0.2s;
        }

        .clear-history-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--danger);
          color: #fff;
        }

        .recent-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 30px 0;
          color: var(--text-muted);
        }

        .spinner-sm {
          width: 18px;
          height: 18px;
          border-width: 2px;
        }

        .recent-empty {
          padding: 30px 0;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .recent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .recent-item-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xs);
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          position: relative;
          overflow: hidden;
        }

        .recent-item-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(167, 139, 250, 0.3);
          transform: translateY(-2px);
        }

        .recent-item-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }

        .recent-item-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          flex: 1;
        }

        .recent-item-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: left;
        }

        .recent-item-price {
          font-size: 0.8rem;
          color: var(--secondary);
          font-weight: 700;
          margin-top: 2px;
        }

        .recent-item-link-icon {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s, color 0.2s;
          flex-shrink: 0;
        }

        .recent-item-card:hover .recent-item-link-icon {
          opacity: 1;
          color: #a78bfa;
        }
      `}</style>
    </div>
  );
}
