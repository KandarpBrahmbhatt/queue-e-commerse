import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Package, Truck, CheckCircle2, RotateCcw, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, User } from 'lucide-react';

export default function AdminDashboard({ showNotification }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.orders.getAll(page, limit);
      // Backend returns { message: "...", order: [...] }
      setOrders(response.order || []);
      // We don't have a direct count returned in getOrder backend controller, so we approximate or use length
      setTotalOrders(response.order?.length || 0);
    } catch (err) {
      showNotification(err.message || 'Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, showNotification]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleMarkShipped = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const response = await api.orders.markAsShipped(orderId);
      showNotification(response.message || 'Order marked as shipped!', 'success');
      fetchAllOrders();
    } catch (err) {
      showNotification(err.message || 'Failed to update order status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const response = await api.orders.markAsDelivered(orderId);
      showNotification(response.message || 'Order marked as delivered!', 'success');
      fetchAllOrders();
    } catch (err) {
      showNotification(err.message || 'Failed to update order status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveReturn = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const response = await api.orders.approveReturn(orderId);
      showNotification(response.message || 'Return request approved successfully!', 'success');
      fetchAllOrders();
    } catch (err) {
      showNotification(err.message || 'Failed to approve return.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadgeStyles = (status) => {
    const styles = {
      PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
      CONFIRM: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
      PROCESSED: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' },
      SHIPPED: { bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.2)' },
      DELIVERD: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
      CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
      RETURNED: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.2)' }
    };
    return styles[status] || styles.PENDING;
  };

  return (
    <div className="admin-container">
      <div className="admin-header glass-panel">
        <div className="admin-title-row">
          <ShieldAlert className="admin-icon" size={24} />
          <h1>Admin Control Panel</h1>
          <span className="admin-badge">Secure System Admin</span>
        </div>
        <p className="admin-subtitle">
          Manage product shipment lifecycles, confirm courier drop-offs, and handle customer return/refund approvals.
        </p>
      </div>

      <div className="admin-orders-section glass-panel">
        <div className="section-header">
          <h2>Store Orders Overview</h2>
          <button className="btn btn-outline btn-sm refresh-btn" onClick={fetchAllOrders} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Sync Orders</span>
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Syncing database orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} className="empty-icon" />
            <h3>No orders found</h3>
            <p>Once customers place orders, they will show up here for status updates.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Info</th>
                  <th>Customer Details</th>
                  <th>Order Status</th>
                  <th>Financial Details</th>
                  <th>Dispute / Return Status</th>
                  <th style={{ textAlign: 'right' }}>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusColors = getStatusBadgeStyles(order.orderStatus);
                  const isProcessing = actionLoadingId === order._id;
                  
                  const isShippable = ['PENDING', 'CONFIRM', 'PROCESSED'].includes(order.orderStatus);
                  const isDeliverable = order.orderStatus === 'SHIPPED';
                  const isReturnPending = order.returnStatus === 'REQUESTED';
                  const isReplacementPending = order.replacementStatus === 'REQUESTED';

                  return (
                    <tr key={order._id} className="order-row">
                      <td>
                        <div className="order-num-col">
                          <span className="order-number-txt">{order.orderNumber}</span>
                          <span className="order-date-txt">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info-col">
                          <span className="cust-name">
                            <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#a78bfa' }} />
                            {order.user?.name || 'Unknown Client'}
                          </span>
                          <span className="cust-email">{order.user?.email || 'No email provided'}</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                            borderColor: statusColors.border
                          }}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <div className="pricing-info-col">
                          <span className="total-amount-txt">₹{order.totalAmount?.toLocaleString()}</span>
                          <span className="payment-status-txt">{order.paymentStatus || 'PENDING'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="dispute-col">
                          {order.returnStatus && order.returnStatus !== 'NONE' && (
                            <div className="dispute-item">
                              <span className="dispute-badge return">Return: {order.returnStatus}</span>
                              {order.returnReason && (
                                <span className="dispute-reason" title={order.returnReason}>
                                  Reason: {order.returnReason}
                                </span>
                              )}
                            </div>
                          )}
                          {order.replacementStatus && order.replacementStatus !== 'NONE' && (
                            <div className="dispute-item">
                              <span className="dispute-badge replacement">Replace: {order.replacementStatus}</span>
                              {order.replacementReason && (
                                <span className="dispute-reason" title={order.replacementReason}>
                                  Reason: {order.replacementReason}
                                </span>
                              )}
                            </div>
                          )}
                          {!order.returnStatus && !order.replacementStatus && (
                            <span className="no-disputes-txt">No requests</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-actions-cell">
                          {isShippable && (
                            <button
                              className="btn btn-outline btn-sm action-btn ship"
                              onClick={() => handleMarkShipped(order._id)}
                              disabled={isProcessing}
                            >
                              <Truck size={13} />
                              <span>Ship</span>
                            </button>
                          )}
                          {isDeliverable && (
                            <button
                              className="btn btn-secondary btn-sm action-btn deliver"
                              onClick={() => handleMarkDelivered(order._id)}
                              disabled={isProcessing}
                            >
                              <CheckCircle2 size={13} />
                              <span>Deliver</span>
                            </button>
                          )}
                          {isReturnPending && (
                            <button
                              className="btn btn-outline btn-sm action-btn approve"
                              onClick={() => handleApproveReturn(order._id)}
                              disabled={isProcessing}
                            >
                              <RotateCcw size={13} />
                              <span>Approve Return</span>
                            </button>
                          )}
                          {!isShippable && !isDeliverable && !isReturnPending && (
                            <span className="no-actions-txt">None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalOrders > limit && (
          <div className="pagination" style={{ margin: '24px 0 8px 0' }}>
            <button 
              className="btn btn-outline btn-icon-only"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="pagination-text">Page {page}</span>
            <button 
              className="btn btn-outline btn-icon-only"
              disabled={orders.length < limit}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .admin-container {
          text-align: left;
          animation: adminFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 1200px;
          margin: 0 auto;
        }

        @keyframes adminFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-header {
          padding: 32px;
          margin-bottom: 24px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.03) 100%);
        }

        .admin-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .admin-title-row h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .admin-icon {
          color: #a78bfa;
          filter: drop-shadow(0 0 8px var(--primary-glow));
        }

        .admin-badge {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          letter-spacing: 0.5px;
        }

        .admin-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin: 0;
          max-width: 700px;
        }

        .admin-orders-section {
          padding: 28px;
          background: rgba(255, 255, 255, 0.01);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .section-header h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        .refresh-btn {
          padding: 6px 14px;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-color: var(--border-color);
        }

        .refresh-btn:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .spin-animation {
          animation: refreshSpin 1s linear infinite;
        }

        @keyframes refreshSpin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.25;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-main);
        }

        .empty-state p {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 320px;
        }

        .admin-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xs);
          background: rgba(0, 0, 0, 0.15);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .admin-table th {
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-color);
          color: var(--text-muted);
          font-weight: 600;
          padding: 14px 20px;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }

        .admin-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }

        .order-row:hover {
          background: rgba(255, 255, 255, 0.015);
        }

        .order-num-col, .customer-info-col, .pricing-info-col, .dispute-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .order-number-txt {
          font-weight: 700;
          color: var(--text-main);
        }

        .order-date-txt {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .cust-name {
          font-weight: 600;
          color: var(--text-main);
        }

        .cust-email {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .total-amount-txt {
          font-weight: 700;
          color: var(--text-main);
        }

        .payment-status-txt {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--secondary);
        }

        .status-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Dispute items */
        .dispute-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .dispute-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .dispute-badge.return {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .dispute-badge.replacement {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .dispute-reason {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }

        .no-disputes-txt, .no-actions-txt {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .admin-actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .action-btn {
          padding: 6px 12px;
          font-size: 0.75rem;
          height: auto;
          text-transform: none;
        }

        .action-btn.ship {
          border-color: rgba(6, 182, 212, 0.3);
          color: #06b6d4;
          background: transparent;
        }

        .action-btn.ship:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: #06b6d4;
          color: #fff;
        }

        .action-btn.deliver {
          background: var(--secondary);
          color: #fff;
          box-shadow: 0 2px 8px var(--secondary-glow);
        }

        .action-btn.deliver:hover {
          box-shadow: 0 4px 12px var(--secondary-glow);
        }

        .action-btn.approve {
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
          background: transparent;
        }

        .action-btn.approve:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: #f59e0b;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
