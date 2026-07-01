import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  User, Mail, Phone, Lock, Calendar, ShieldCheck, Activity, Save, 
  AlertCircle, Clock, Trash2, ExternalLink, Smartphone, Monitor, LogOut, 
  CheckCircle, AlertOctagon, Key, Search, Filter, RefreshCw, ChevronLeft, 
  ChevronRight, X, Info, MapPin 
} from 'lucide-react';

export default function ProfileManager({ onUserUpdate, showNotification, onOpenProductDetail }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState('details'); // 'details' or 'security'
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Enhanced Security Login History states
  const [fullLoginHistory, setFullLoginHistory] = useState([]);
  const [historyViewMode, setHistoryViewMode] = useState('recent'); // 'recent' or 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [osFilter, setOsFilter] = useState('ALL');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage, setHistoryPerPage] = useState(5);
  const [selectedLog, setSelectedLog] = useState(null);

  const [recentViews, setRecentViews] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchRecentViews();
    fetchSecurityInfo();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.profile.get();
      if (response.data) {
        setProfile(response.data);
        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setPhone(response.data.phone || '');
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

  const fetchSecurityInfo = async () => {
    setSecurityLoading(true);
    try {
      if (historyViewMode === 'all') {
        const [sessionsRes, historyRes] = await Promise.all([
          api.security.getSessions(),
          api.security.getAllLoginHistory()
        ]);
        if (sessionsRes.data) setSessions(sessionsRes.data);
        if (historyRes.lloginhistory) {
          const sorted = [...historyRes.lloginhistory].sort(
            (a, b) => new Date(b.loginTime) - new Date(a.loginTime)
          );
          setFullLoginHistory(sorted);
        }
      } else {
        const [sessionsRes, historyRes] = await Promise.all([
          api.security.getSessions(),
          api.security.getLoginHistory()
        ]);
        if (sessionsRes.data) setSessions(sessionsRes.data);
        if (historyRes.data) setLoginHistory(historyRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch security info:', err);
    } finally {
      setSecurityLoading(false);
    }
  };

  const fetchAllLoginHistory = async () => {
    setSecurityLoading(true);
    try {
      const response = await api.security.getAllLoginHistory();
      if (response.lloginhistory) {
        const sorted = [...response.lloginhistory].sort(
          (a, b) => new Date(b.loginTime) - new Date(a.loginTime)
        );
        setFullLoginHistory(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch full login history:', err);
      showNotification(err.message || 'Failed to fetch full login history.', 'error');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleToggleHistoryView = (mode) => {
    setHistoryViewMode(mode);
    setHistoryPage(1);
    if (mode === 'all' && fullLoginHistory.length === 0) {
      fetchAllLoginHistory();
    }
  };

  const getFilteredLogs = () => {
    const logs = historyViewMode === 'recent' ? loginHistory : fullLoginHistory;
    return logs.filter(log => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        (log.deviceName && log.deviceName.toLowerCase().includes(query)) ||
        (log.browser && log.browser.toLowerCase().includes(query)) ||
        (log.os && log.os.toLowerCase().includes(query)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(query)) ||
        (log.location && log.location.toLowerCase().includes(query)) ||
        (log.failureReason && log.failureReason.toLowerCase().includes(query)) ||
        (log.email && log.email.toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

      let matchesOS = true;
      if (osFilter !== 'ALL') {
        const logOS = log.os ? log.os.toLowerCase() : '';
        if (osFilter === 'MOBILE') {
          matchesOS = logOS.includes('android') || logOS.includes('ios') || logOS.includes('iphone') || logOS.includes('ipad');
        } else if (osFilter === 'DESKTOP') {
          matchesOS = logOS.includes('windows') || logOS.includes('mac') || logOS.includes('linux') || logOS.includes('ubuntu');
        } else {
          matchesOS = logOS.includes(osFilter.toLowerCase());
        }
      }

      return matchesSearch && matchesStatus && matchesOS;
    });
  };

  useEffect(() => {
    setHistoryPage(1);
  }, [searchQuery, statusFilter, osFilter]);

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to terminate this device session? You will be logged out on that device.')) return;
    try {
      const response = await api.security.revokeSession(sessionId);
      showNotification(response.message || 'Session revoked successfully.', 'success');
      fetchSecurityInfo();
    } catch (err) {
      showNotification(err.message || 'Failed to revoke session.', 'error');
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
      const payload = { name, email, phone };
      const response = await api.profile.update(payload);
      showNotification(response.message || 'Profile updated successfully!', 'success');
      
      if (response.data) {
        setProfile(response.data);
        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setPhone(response.data.phone || '');
        
        // Sync with parent App.jsx user state
        onUserUpdate(response.data);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update profile.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showNotification('Both current and new passwords are required.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('New password must be at least 6 characters long.', 'error');
      return;
    }

    setUpdating(true);
    try {
      const response = await api.auth.forgotPassword(oldPassword, newPassword);
      showNotification(response.message || 'Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
    } catch (err) {
      showNotification(err.message || 'Failed to change password.', 'error');
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
          <div className="panel-tabs">
            <button 
              className={`panel-tab-btn ${activePanelTab === 'details' ? 'active' : ''}`}
              onClick={() => setActivePanelTab('details')}
              type="button"
            >
              Account Details
            </button>
            <button 
              className={`panel-tab-btn ${activePanelTab === 'security' ? 'active' : ''}`}
              onClick={() => {
                setActivePanelTab('security');
                fetchSecurityInfo();
              }}
              type="button"
            >
              Security & Active Devices
            </button>
          </div>

          {activePanelTab === 'details' && (
            <>
              <h3 className="panel-title" style={{ marginTop: '16px' }}>Account Details</h3>
              
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

                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input 
                      type="tel" 
                      className="form-input with-icon" 
                      placeholder="Your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Change Password Collapsible Section */}
                <div className="password-trigger-section">
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm change-pwd-btn"
                    onClick={() => {
                      setShowPasswordSection(!showPasswordSection);
                      setOldPassword('');
                      setNewPassword('');
                    }}
                  >
                    <Lock size={14} />
                    <span>{showPasswordSection ? 'Cancel Password Change' : 'Change Password'}</span>
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="password-fields-container glass-panel-nested" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Current Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input 
                          type="password" 
                          className="form-input with-icon" 
                          placeholder="Enter your current password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required={showPasswordSection}
                        />
                      </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">New Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input 
                          type="password" 
                          className="form-input with-icon" 
                          placeholder="Enter new password (minimum 6 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={6}
                          required={showPasswordSection}
                        />
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn btn-primary"
                      style={{ marginTop: '8px', alignSelf: 'flex-start', background: 'linear-gradient(135deg, #a78bfa 0%, var(--primary) 100%)', textTransform: 'none' }}
                      onClick={handleChangePassword}
                      disabled={updating}
                    >
                      <Key size={14} style={{ marginRight: '6px' }} />
                      <span>{updating ? 'Updating...' : 'Update Password'}</span>
                    </button>
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
            </>
          )}

          {activePanelTab === 'security' && (
            <div className="security-panel-content">
              {/* Active Devices / Sessions */}
              <div className="security-sub-section">
                <h3 className="panel-title-sec" style={{ marginTop: '16px' }}><Smartphone size={16} /> Active Logged-in Devices</h3>
                {securityLoading ? (
                  <p className="sec-loading-txt">Syncing active devices...</p>
                ) : sessions.length === 0 ? (
                  <p className="no-sec-data-txt">No active sessions found.</p>
                ) : (
                  <div className="sessions-list">
                    {sessions.map((sess) => {
                      return (
                        <div key={sess._id} className="session-item glass-panel-nested" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)' }}>
                          <div className="session-device-icon">
                            {sess.deviceName.toLowerCase().includes('iphone') || sess.deviceName.toLowerCase().includes('mobile') || sess.deviceName.toLowerCase().includes('phone') ? (
                              <Smartphone size={24} style={{ color: '#a78bfa' }} />
                            ) : (
                              <Monitor size={24} style={{ color: '#60a5fa' }} />
                            )}
                          </div>
                          <div className="session-details">
                            <div className="device-name-row">
                              <span className="device-name" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{sess.deviceName}</span>
                              {sess.refreshToken === localStorage.getItem('token') && <span className="current-badge">This Device</span>}
                            </div>
                            <span className="device-meta">
                              {sess.os} &bull; {sess.browser} &bull; IP: {sess.ipAddress || 'Unknown'}
                            </span>
                            <span className="session-active-time">
                              Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                            </span>
                          </div>
                          {sess.refreshToken !== localStorage.getItem('token') && (
                            <button 
                              className="btn btn-outline btn-sm revoke-session-btn"
                              onClick={() => handleRevokeSession(sess._id)}
                              title="Revoke session / Logout device"
                            >
                              <LogOut size={13} />
                              <span>Logout</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Login History logs */}
              <div className="security-sub-section" style={{ marginTop: '28px' }}>
                <div className="security-section-header">
                  <div className="security-title-container">
                    <Key size={16} style={{ color: '#a78bfa' }} />
                    <h3 className="panel-title-sec" style={{ margin: 0 }}>Login Activity Log</h3>
                    {historyViewMode === 'all' && fullLoginHistory.length > 0 && (
                      <span className="logs-count-badge">{fullLoginHistory.length} Total</span>
                    )}
                  </div>
                  
                  <div className="security-controls-row">
                    {/* Refresh button */}
                    <button 
                      type="button" 
                      className={`btn-icon-sec ${securityLoading ? 'spinning' : ''}`}
                      onClick={fetchSecurityInfo}
                      disabled={securityLoading}
                      title="Refresh activity logs"
                    >
                      <RefreshCw size={14} />
                    </button>

                    {/* View Switcher toggle */}
                    <div className="segmented-toggle">
                      <button 
                        type="button"
                        className={`toggle-btn ${historyViewMode === 'recent' ? 'active' : ''}`}
                        onClick={() => handleToggleHistoryView('recent')}
                      >
                        Recent (10)
                      </button>
                      <button 
                        type="button"
                        className={`toggle-btn ${historyViewMode === 'all' ? 'active' : ''}`}
                        onClick={() => handleToggleHistoryView('all')}
                      >
                        Full Audit Log
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Panel - only in "all" view mode */}
                {historyViewMode === 'all' && (
                  <div className="history-filter-panel glass-panel-nested" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)' }}>
                    <div className="search-box">
                      <Search size={14} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Search IP, device, OS, location..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="filter-input"
                      />
                    </div>
                    <div className="filter-selects">
                      <div className="select-wrapper">
                        <Filter size={12} className="select-icon" />
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="SUCCESS">Success Only</option>
                          <option value="FAILED">Failed Only</option>
                        </select>
                      </div>
                      <div className="select-wrapper">
                        <Monitor size={12} className="select-icon" />
                        <select 
                          value={osFilter}
                          onChange={(e) => setOsFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="ALL">All Platforms</option>
                          <option value="Windows">Windows</option>
                          <option value="macOS">macOS</option>
                          <option value="Linux">Linux</option>
                          <option value="MOBILE">Mobile (iOS/Android)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {securityLoading && (historyViewMode === 'recent' || fullLoginHistory.length === 0) ? (
                  <p className="sec-loading-txt">Syncing activity logs...</p>
                ) : getFilteredLogs().length === 0 ? (
                  <div className="no-sec-data-box" style={{ border: '1px dashed var(--border-color)' }}>
                    <p className="no-sec-data-txt">No matching login records found.</p>
                    {(searchQuery || statusFilter !== 'ALL' || osFilter !== 'ALL') && (
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm reset-filters-btn"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('ALL');
                          setOsFilter('ALL');
                        }}
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="history-logs-table-wrapper">
                      <table className="security-history-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Device & OS</th>
                            <th>IP Address</th>
                            <th>Location</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Use client-side paginated logs if mode is "all" */}
                          {(historyViewMode === 'recent' ? getFilteredLogs() : getFilteredLogs().slice((historyPage - 1) * historyPerPage, historyPage * historyPerPage)).map((log) => {
                            const isSuccess = log.status === 'SUCCESS';
                            return (
                              <tr key={log._id} onClick={() => setSelectedLog(log)} style={{ cursor: 'pointer' }} title="Click to view full login details">
                                <td>{new Date(log.loginTime).toLocaleString()}</td>
                                <td>
                                  <span className={`status-badge-sec ${isSuccess ? 'success' : 'failed'}`}>
                                    {isSuccess ? <CheckCircle size={10} style={{ marginRight: '4px' }} /> : <AlertOctagon size={10} style={{ marginRight: '4px' }} />}
                                    <span>{log.status}</span>
                                  </span>
                                  {!isSuccess && log.failureReason && (
                                    <div className="failed-reason" title={log.failureReason}>
                                      {log.failureReason}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div className="log-device-meta">
                                    <span className="log-dev-name" style={{ color: 'var(--text-main)' }}>{log.deviceName}</span>
                                    <span className="log-os-browser">{log.os} &bull; {log.browser}</span>
                                  </div>
                                </td>
                                <td className="font-mono">{log.ipAddress}</td>
                                <td>{log.location || 'Unknown'}</td>
                                <td>
                                  <button type="button" className="btn-table-action" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }} title="View details">
                                    <Info size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination - only in "all" view mode */}
                    {historyViewMode === 'all' && getFilteredLogs().length > historyPerPage && (
                      <div className="history-pagination-row">
                        <span className="pagination-info">
                          Showing {(historyPage - 1) * historyPerPage + 1} to {Math.min(historyPage * historyPerPage, getFilteredLogs().length)} of {getFilteredLogs().length} logs
                        </span>
                        <div className="pagination-buttons">
                          <button 
                            type="button" 
                            className="pagination-btn"
                            disabled={historyPage === 1}
                            onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          
                          {Array.from({ length: Math.ceil(getFilteredLogs().length / historyPerPage) }, (_, idx) => idx + 1).map(pageNum => (
                            <button
                              key={pageNum}
                              type="button"
                              className={`pagination-btn ${historyPage === pageNum ? 'active' : ''}`}
                              onClick={() => setHistoryPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button 
                            type="button" 
                            className="pagination-btn"
                            disabled={historyPage === Math.ceil(getFilteredLogs().length / historyPerPage)}
                            onClick={() => setHistoryPage(prev => Math.min(Math.ceil(getFilteredLogs().length / historyPerPage), prev + 1))}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
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

      {/* Login History Detail Modal */}
      {selectedLog && (
        <div className="security-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="security-modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(13, 15, 24, 0.95)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="security-modal-header">
              <div className="modal-title-row">
                <Info size={18} className="modal-title-icon" style={{ color: '#a78bfa' }} />
                <h3>Login Activity Details</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedLog(null)} title="Close dialog">
                <X size={18} />
              </button>
            </div>
            
            <div className="security-modal-body">
              <div className="modal-status-banner" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)' }}>
                <span className={`modal-status-badge ${selectedLog.status === 'SUCCESS' ? 'success' : 'failed'}`}>
                  {selectedLog.status === 'SUCCESS' ? <CheckCircle size={14} /> : <AlertOctagon size={14} />}
                  <span>{selectedLog.status === 'SUCCESS' ? 'Successful Login' : 'Failed Attempt'}</span>
                </span>
                {selectedLog.status !== 'SUCCESS' && selectedLog.failureReason && (
                  <div className="modal-failure-reason-box">
                    <strong>Reason:</strong> {selectedLog.failureReason}
                  </div>
                )}
              </div>

              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="detail-label">User Email</span>
                  <span className="detail-value">{selectedLog.email}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">Timestamp</span>
                  <span className="detail-value">{new Date(selectedLog.loginTime).toLocaleString()}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">IP Address</span>
                  <span className="detail-value font-mono">{selectedLog.ipAddress || 'Unknown'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">Device Name</span>
                  <span className="detail-value">{selectedLog.deviceName || 'Unknown Device'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">Operating System</span>
                  <span className="detail-value">{selectedLog.os || 'Unknown OS'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">Web Browser</span>
                  <span className="detail-value">{selectedLog.browser || 'Unknown Browser'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">Estimated Location</span>
                  <span className="detail-value">
                    <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#f87171' }} /> 
                    {selectedLog.location || 'Unknown Location'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .profile-container {
          text-align: left;
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Panel Tabs styling */
        .panel-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 20px;
          gap: 16px;
        }

        .panel-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.95rem;
          padding: 8px 0;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          text-transform: none;
        }

        .panel-tab-btn:hover {
          color: var(--text-main);
        }

        .panel-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* Security Content styling */
        .security-panel-content {
          animation: fadeIn 0.25s ease;
          text-align: left;
        }

        .panel-title-sec {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sec-loading-txt, .no-sec-data-txt {
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 16px 0;
          text-align: center;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.005);
          transition: all 0.2s ease;
        }

        .session-item:hover {
          background: rgba(255, 255, 255, 0.015);
        }

        .session-device-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          flex-shrink: 0;
        }

        .session-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          align-items: flex-start;
          min-width: 0;
        }

        .device-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }

        .device-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .current-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--secondary);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 1px 6px;
          border-radius: 4px;
          letter-spacing: 0.3px;
        }

        .device-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: left;
        }

        .session-active-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.8;
          margin-top: 2px;
        }

        .revoke-session-btn {
          padding: 6px 12px;
          font-size: 0.75rem;
          border-color: rgba(239, 68, 68, 0.2);
          color: var(--danger);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .revoke-session-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--danger);
          color: #fff;
        }

        /* History Activity Logs styling */
        .history-logs-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xs);
        }

        .security-history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.825rem;
        }

        .security-history-table th, .security-history-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .security-history-table th {
          background: rgba(255, 255, 255, 0.01);
          color: var(--text-muted);
          font-weight: 700;
        }

        .security-history-table tr:last-child td {
          border-bottom: none;
        }

        .security-history-table tr:hover td {
          background: rgba(255, 255, 255, 0.005);
        }

        .status-badge-sec {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.3px;
        }

        .status-badge-sec.success {
          color: var(--secondary);
          background: rgba(16, 185, 129, 0.1);
        }

        .status-badge-sec.failed {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }

        .failed-reason {
          font-size: 0.7rem;
          color: var(--danger);
          opacity: 0.9;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .log-device-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .log-dev-name {
          font-weight: 600;
          color: var(--text-main);
        }

        .log-os-browser {
          font-size: 0.75rem;
          color: var(--text-muted);
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

        /* Security Header, Controls, and Toggle */
        .security-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .security-title-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .security-title-container .panel-title-sec {
          margin-bottom: 0 !important;
        }
        .logs-count-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .security-controls-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-icon-sec {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-icon-sec:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.02);
        }
        .btn-icon-sec.spinning svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .segmented-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 2px;
          border-radius: 6px;
        }
        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .toggle-btn:hover {
          color: var(--text-main);
        }
        .toggle-btn.active {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        /* History Filters */
        .history-filter-panel {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.005);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          margin-bottom: 16px;
          align-items: center;
        }
        @media (max-width: 640px) {
          .history-filter-panel {
            grid-template-columns: 1fr;
          }
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .filter-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-size: 0.8rem;
          padding: 8px 12px 8px 30px;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.2s;
        }
        .filter-input:focus {
          border-color: rgba(167, 139, 250, 0.4);
        }
        .filter-selects {
          display: flex;
          gap: 8px;
        }
        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .select-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .filter-select {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-size: 0.8rem;
          padding: 8px 12px 8px 28px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          min-width: 130px;
          appearance: none;
          -webkit-appearance: none;
        }
        .filter-select:focus {
          border-color: rgba(167, 139, 250, 0.4);
        }

        /* Table Action Buttons */
        .btn-table-action {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .btn-table-action:hover {
          color: #a78bfa;
          background: rgba(255, 255, 255, 0.05);
        }

        /* No Data Box */
        .no-sec-data-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          border: 1px dashed var(--border-color);
          border-radius: 6px;
          text-align: center;
          width: 100%;
        }
        .no-sec-data-box .no-sec-data-txt {
          padding: 0;
          margin-bottom: 12px;
        }
        .reset-filters-btn {
          font-size: 0.75rem;
          padding: 4px 12px;
        }

        /* Pagination Styling */
        .history-pagination-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          font-size: 0.75rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
        }
        .pagination-buttons {
          display: flex;
          gap: 4px;
        }
        .pagination-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
        }
        .pagination-btn:hover:not(:disabled) {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.02);
        }
        .pagination-btn.active {
          background: #a78bfa;
          color: #000;
          border-color: #a78bfa;
          font-weight: 700;
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Modal Overlay & Card Styling */
        .security-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fadeInOverlay 0.25s ease forwards;
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .security-modal-content {
          width: 100%;
          max-width: 480px;
          background: rgba(13, 15, 24, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          animation: scaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleInModal {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .security-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .modal-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .modal-title-row h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .modal-title-icon {
          color: #a78bfa;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .modal-close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }
        .security-modal-body {
          padding: 16px;
        }
        .modal-status-banner {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .modal-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          letter-spacing: 0.5px;
        }
        .modal-status-badge.success {
          color: var(--secondary);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .modal-status-badge.failed {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .modal-failure-reason-box {
          font-size: 0.75rem;
          color: var(--danger);
          margin-top: 8px;
          text-align: center;
          background: rgba(239, 68, 68, 0.05);
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid rgba(239, 68, 68, 0.1);
          width: 100%;
        }
        .modal-details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .modal-detail-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          padding-bottom: 8px;
        }
        .modal-detail-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .detail-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }
        .detail-value {
          font-size: 0.85rem;
          color: var(--text-main);
          font-weight: 500;
          word-break: break-all;
          text-align: left;
        }
        .inline-icon {
          vertical-align: middle;
          margin-right: 4px;
          color: #ff8e8e;
        }
      `}</style>
    </div>
  );
}
