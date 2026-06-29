import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { 
  ShieldAlert, Package, Truck, CheckCircle2, RotateCcw, AlertTriangle, 
  ChevronLeft, ChevronRight, RefreshCw, User, PlusCircle, Edit, 
  History, Trash2, MapPin, Sliders, ClipboardList, Plus
} from 'lucide-react';

export default function AdminDashboard({ showNotification }) {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' or 'inventory'

  // ==========================================
  // Order Management State & Logic
  // ==========================================
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
      setOrders(response.order || []);
      setTotalOrders(response.order?.length || 0);
    } catch (err) {
      showNotification(err.message || 'Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, showNotification]);

  useEffect(() => {
    if (activeSubTab === 'orders') {
      fetchAllOrders();
    }
  }, [fetchAllOrders, activeSubTab]);

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

  // ==========================================
  // Inventory Management State & Logic
  // ==========================================
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [totalInventory, setTotalInventory] = useState(0);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryDebouncedSearch, setInventoryDebouncedSearch] = useState('');
  const [lowStockCount, setLowStockCount] = useState(0);

  // Modals & Action States
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedInventory, setSelectedInventory] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  // Edit fields
  const [editSku, setEditSku] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editThreshold, setEditThreshold] = useState('');

  // Create fields
  const [unmanagedProducts, setUnmanagedProducts] = useState([]);
  const [createProductId, setCreateProductId] = useState('');
  const [createSku, setCreateSku] = useState('');
  const [createStock, setCreateStock] = useState('0');
  const [createLocation, setCreateLocation] = useState('Main Warehouse');
  const [createThreshold, setCreateThreshold] = useState('10');

  // History state
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Search Debouncing for inventory
  useEffect(() => {
    const timer = setTimeout(() => {
      setInventoryDebouncedSearch(inventorySearch);
      setInventoryPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [inventorySearch]);

  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const response = await api.inventory.getAll(inventoryPage, limit, inventoryDebouncedSearch);
      setInventoryList(response.data || []);
      setTotalInventory(response.total || 0);
    } catch (err) {
      showNotification(err.message || 'Failed to load inventory.', 'error');
    } finally {
      setInventoryLoading(false);
    }
  }, [inventoryPage, inventoryDebouncedSearch, showNotification]);

  const fetchLowStockCount = useCallback(async () => {
    try {
      const response = await api.inventory.getLowStock();
      setLowStockCount(response.count || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUnmanagedProducts = useCallback(async () => {
    try {
      // Fetch all products (page size 100 for lookup)
      const productsResponse = await api.products.getAggregation(1, 100);
      const allProducts = productsResponse.data || [];

      // Fetch all active inventories (page size 100)
      const inventoryResponse = await api.inventory.getAll(1, 100);
      const activeInventories = inventoryResponse.data || [];
      const managedProductIds = new Set(
        activeInventories.map(inv => String(inv.productId?._id || inv.productId))
      );

      const unmanaged = allProducts.filter(p => !managedProductIds.has(String(p._id)));
      setUnmanagedProducts(unmanaged);
      if (unmanaged.length > 0) {
        setCreateProductId(unmanaged[0]._id);
        setCreateSku(unmanaged[0].sku || '');
      } else {
        setCreateProductId('');
        setCreateSku('');
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeSubTab === 'inventory') {
      fetchInventory();
      fetchLowStockCount();
    }
  }, [activeSubTab, fetchInventory, fetchLowStockCount]);

  const handleRestockClick = (inv) => {
    setSelectedInventory(inv);
    setRestockQty('');
    setIsRestockModalOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(restockQty);
    if (isNaN(qty) || qty <= 0) {
      showNotification('Please enter a valid stock quantity.', 'error');
      return;
    }
    setActionLoadingId(selectedInventory._id);
    try {
      const response = await api.inventory.addStock(selectedInventory._id, qty);
      showNotification(response.message || 'Stock restocked successfully!', 'success');
      setIsRestockModalOpen(false);
      fetchInventory();
      fetchLowStockCount();
    } catch (err) {
      showNotification(err.message || 'Failed to add stock.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEditClick = (inv) => {
    setSelectedInventory(inv);
    setEditSku(inv.sku || '');
    setEditLocation(inv.warehouseLocation || '');
    setEditThreshold(inv.lowStockThreshold || '10');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editSku.trim()) {
      showNotification('SKU code is required.', 'error');
      return;
    }
    setActionLoadingId(selectedInventory._id);
    try {
      const response = await api.inventory.update(selectedInventory._id, {
        sku: editSku,
        warehouseLocation: editLocation,
        lowStockThreshold: Number(editThreshold)
      });
      showNotification(response.message || 'Inventory settings updated!', 'success');
      setIsEditModalOpen(false);
      fetchInventory();
    } catch (err) {
      showNotification(err.message || 'Failed to update inventory details.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfigureClick = () => {
    fetchUnmanagedProducts();
    setCreateStock('0');
    setCreateLocation('Main Warehouse');
    setCreateThreshold('10');
    setIsCreateModalOpen(true);
  };

  const handleProductSelectChange = (productId) => {
    setCreateProductId(productId);
    const prod = unmanagedProducts.find(p => String(p._id) === String(productId));
    if (prod) {
      setCreateSku(prod.sku || '');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createProductId) {
      showNotification('Please select a product.', 'error');
      return;
    }
    if (!createSku.trim()) {
      showNotification('SKU code is required.', 'error');
      return;
    }
    try {
      const response = await api.inventory.create({
        productId: createProductId,
        sku: createSku,
        stock: Number(createStock),
        warehouseLocation: createLocation,
        lowStockThreshold: Number(createThreshold)
      });
      showNotification(response.message || 'Inventory configured successfully!', 'success');
      setIsCreateModalOpen(false);
      fetchInventory();
      fetchLowStockCount();
    } catch (err) {
      showNotification(err.message || 'Failed to create inventory config.', 'error');
    }
  };

  const handleViewHistory = async (inv) => {
    setSelectedInventory(inv);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const response = await api.inventory.getHistory(inv._id);
      setHistoryLogs(response.data || []);
    } catch (err) {
      showNotification(err.message || 'Failed to load stock history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory configuration? (Catalog product details will not be lost)')) return;
    try {
      const response = await api.inventory.delete(id);
      showNotification(response.message || 'Inventory configuration deleted.', 'success');
      fetchInventory();
      fetchLowStockCount();
    } catch (err) {
      showNotification(err.message || 'Failed to delete inventory config.', 'error');
    }
  };

  const getStockStatusBadge = (inv) => {
    if (inv.stock <= 0) {
      return <span className="inv-badge out-of-stock">Out of Stock</span>;
    } else if (inv.stock <= inv.lowStockThreshold) {
      return <span className="inv-badge low-stock">Low Stock</span>;
    } else {
      return <span className="inv-badge in-stock">In Stock</span>;
    }
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
          Manage product shipment lifecycles, confirm courier drop-offs, track warehouse stock levels, and customize SKU alerts.
        </p>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="admin-tabs-nav glass-panel">
        <button 
          className={`tab-nav-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('orders')}
        >
          <Truck size={16} />
          <span>Orders Processing</span>
        </button>
        <button 
          className={`tab-nav-btn ${activeSubTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('inventory')}
        >
          <Package size={16} />
          <span>Inventory Manager</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ORDERS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'orders' && (
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
      )}

      {/* ========================================================================= */}
      {/* INVENTORY TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && (
        <div className="admin-orders-section glass-panel">
          
          {/* Inventory Overview metrics cards */}
          <div className="inventory-metrics-row">
            <div className="metric-card glass-panel">
              <Package className="metric-icon" size={20} />
              <div className="metric-details">
                <span className="metric-title">Tracked SKUs</span>
                <span className="metric-val">{totalInventory}</span>
              </div>
            </div>
            <div className={`metric-card glass-panel ${lowStockCount > 0 ? 'warning-bg' : ''}`}>
              <AlertTriangle className={`metric-icon ${lowStockCount > 0 ? 'spin-pulse' : ''}`} size={20} />
              <div className="metric-details">
                <span className="metric-title">Low Stock Alert</span>
                <span className="metric-val">{lowStockCount}</span>
              </div>
            </div>
          </div>

          {lowStockCount > 0 && (
            <div className="low-stock-alert-banner">
              <AlertTriangle size={18} style={{ marginRight: '8px' }} />
              <span>Attention: <strong>{lowStockCount}</strong> product SKU(s) have fallen below their configured low-stock thresholds! Please restock immediately.</span>
            </div>
          )}

          <div className="section-header" style={{ marginTop: '16px' }}>
            <div className="header-actions-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <h2>Warehouse Inventory</h2>
              <div className="search-bar-wrapper glass-panel" style={{ maxWidth: '300px', margin: 0, padding: '2px 8px 2px 12px' }}>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ height: '32px', fontSize: '0.85rem' }}
                  placeholder="Search by SKU code..." 
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                />
              </div>
            </div>
            <div className="header-actions-right" style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleConfigureClick}>
                <Plus size={14} style={{ marginRight: '4px' }} />
                <span>Configure SKU</span>
              </button>
              <button className="btn btn-outline btn-sm refresh-btn" onClick={fetchInventory} disabled={inventoryLoading}>
                <RefreshCw size={14} className={inventoryLoading ? 'spin-animation' : ''} />
                <span>Sync Stock</span>
              </button>
            </div>
          </div>

          {inventoryLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Fetching warehouse stock levels...</p>
            </div>
          ) : inventoryList.length === 0 ? (
            <div className="empty-state">
              <Package size={48} className="empty-icon" />
              <h3>No inventory items found</h3>
              <p>Try resetting the search filter or configure a new SKU inventory entry.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product & Thumbnail</th>
                    <th>SKU Code</th>
                    <th>Stock Count</th>
                    <th>Reserved Stock</th>
                    <th>Warehouse Location</th>
                    <th>Min. Threshold</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map((inv) => {
                    const isLowStock = inv.stock <= inv.lowStockThreshold && inv.stock > 0;
                    const isOutOfStock = inv.stock <= 0;
                    
                    let stockColor = '#10b981'; // Green
                    if (isOutOfStock) stockColor = '#ef4444'; // Red
                    else if (isLowStock) stockColor = '#f59e0b'; // Amber

                    return (
                      <tr key={inv._id} className="order-row">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={inv.productId?.images?.[0] || 'https://picsum.photos/seed/' + inv._id + '/40/40'} 
                              alt="product" 
                              style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            />
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {inv.productId?.name || 'Unknown Product'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#a78bfa' }}>
                            {inv.sku}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: stockColor }}>
                            {inv.stock}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {inv.reservedStock || 0}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <MapPin size={12} style={{ color: '#8b5cf6' }} />
                            <span>{inv.warehouseLocation || 'Main'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)' }}>{inv.lowStockThreshold}</span>
                        </td>
                        <td>{getStockStatusBadge(inv)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-actions-cell">
                            <button
                              className="btn btn-outline btn-sm action-btn ship"
                              title="Restock / Add Stock"
                              onClick={() => handleRestockClick(inv)}
                            >
                              <PlusCircle size={13} />
                              <span>Restock</span>
                            </button>
                            <button
                              className="btn btn-outline btn-sm action-btn approve"
                              title="Edit Threshold / Location"
                              onClick={() => handleEditClick(inv)}
                            >
                              <Edit size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="btn btn-outline btn-sm action-btn"
                              style={{ borderColor: 'rgba(139, 92, 246, 0.3)', color: '#8b5cf6' }}
                              title="View History Logs"
                              onClick={() => handleViewHistory(inv)}
                            >
                              <History size={13} />
                              <span>History</span>
                            </button>
                            <button
                              className="btn btn-outline btn-sm action-btn"
                              style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                              title="Delete Configuration"
                              onClick={() => handleDeleteInventory(inv._id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Inventory Pagination */}
          {totalInventory > limit && (
            <div className="pagination" style={{ margin: '24px 0 8px 0' }}>
              <button 
                className="btn btn-outline btn-icon-only"
                disabled={inventoryPage <= 1}
                onClick={() => setInventoryPage(p => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="pagination-text">Page {inventoryPage}</span>
              <button 
                className="btn btn-outline btn-icon-only"
                disabled={inventoryList.length < limit}
                onClick={() => setInventoryPage(p => p + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESTOCK STOCK MODAL */}
      {/* ========================================================================= */}
      {isRestockModalOpen && selectedInventory && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <ClipboardList size={18} style={{ color: '#a78bfa', marginRight: '6px' }} />
              <h3>Add Stock to Inventory</h3>
            </div>
            <p className="modal-desc">
              Restock product: <strong>{selectedInventory.productId?.name}</strong> (SKU: <code>{selectedInventory.sku}</code>)
            </p>
            <form onSubmit={handleRestockSubmit}>
              <div className="form-group">
                <label>Current Stock</label>
                <input type="text" className="form-control" value={selectedInventory.stock} disabled />
              </div>
              <div className="form-group">
                <label>Add Stock Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="form-control" 
                  placeholder="Enter positive integer..."
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsRestockModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoadingId === selectedInventory._id}>
                  {actionLoadingId === selectedInventory._id ? 'Saving...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedInventory && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <Sliders size={18} style={{ color: '#a78bfa', marginRight: '6px' }} />
              <h3>Edit Inventory Configuration</h3>
            </div>
            <p className="modal-desc">
              Configure parameters for: <strong>{selectedInventory.productId?.name}</strong>
            </p>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>SKU Code</label>
                <input 
                  type="text" 
                  required
                  className="form-control" 
                  value={editSku}
                  onChange={(e) => setEditSku(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Warehouse Location</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editLocation}
                  placeholder="e.g. Rack B2, Main Warehouse"
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Low Stock Threshold Alert</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  className="form-control" 
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoadingId === selectedInventory._id}>
                  {actionLoadingId === selectedInventory._id ? 'Updating...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INITIALIZE SKU/CONFIG MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <PlusCircle size={18} style={{ color: '#a78bfa', marginRight: '6px' }} />
              <h3>Configure SKU Inventory</h3>
            </div>
            <p className="modal-desc">
              Assign and initialize warehouse inventory parameters for an active catalog product.
            </p>
            {unmanagedProducts.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <Package size={32} style={{ opacity: 0.3 }} />
                <p style={{ marginTop: '8px' }}>All catalog products are already configured with SKU inventories!</p>
                <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '12px' }} onClick={() => setIsCreateModalOpen(false)}>
                  Dismiss
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label>Select Product</label>
                  <select 
                    className="form-control"
                    value={createProductId}
                    onChange={(e) => handleProductSelectChange(e.target.value)}
                  >
                    {unmanagedProducts.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} (Original Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>SKU Code</label>
                  <input 
                    type="text" 
                    required
                    className="form-control" 
                    placeholder="e.g. TS-BLUE-MED"
                    value={createSku}
                    onChange={(e) => setCreateSku(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Initial Physical Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    className="form-control" 
                    value={createStock}
                    onChange={(e) => setCreateStock(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Warehouse Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Aisle 4, Shelf C"
                    value={createLocation}
                    onChange={(e) => setCreateLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold Alert</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    className="form-control" 
                    value={createThreshold}
                    onChange={(e) => setCreateThreshold(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Inventory Config
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HISTORY TRANSACTION LOG MODAL */}
      {/* ========================================================================= */}
      {isHistoryModalOpen && selectedInventory && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <History size={18} style={{ color: '#a78bfa', marginRight: '6px' }} />
              <h3>Stock Transaction History</h3>
            </div>
            <p className="modal-desc">
              Audit log records for: <strong>{selectedInventory.productId?.name}</strong> (SKU: <code>{selectedInventory.sku}</code>)
            </p>
            
            {historyLoading ? (
              <div className="loading-state" style={{ padding: '30px 0' }}>
                <div className="loading-spinner"></div>
                <p>Loading transaction history...</p>
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <ClipboardList size={32} style={{ opacity: 0.3 }} />
                <p style={{ marginTop: '8px' }}>No transaction history logs exist for this inventory entry yet.</p>
              </div>
            ) : (
              <div className="history-logs-list">
                {historyLogs.map((log) => {
                  let changeSign = log.quantity >= 0 ? `+${log.quantity}` : `${log.quantity}`;
                  let changeColor = log.quantity >= 0 ? '#10b981' : '#ef4444';
                  
                  return (
                    <div key={log._id} className="log-item">
                      <div className="log-meta">
                        <span className="log-type-badge">{log.type}</span>
                        <span className="log-reason">{log.reason || 'No description'}</span>
                        <span className="log-date">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="log-numbers" style={{ textAlign: 'right' }}>
                        <span className="log-change" style={{ color: changeColor, fontWeight: '800', fontSize: '0.95rem' }}>
                          {changeSign} units
                        </span>
                        <span className="log-stock-flow" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Stock: {log.previousStock} → {log.newStock}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsHistoryModalOpen(false)}>
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

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

        /* Tabs Nav */
        .admin-tabs-nav {
          display: flex;
          gap: 8px;
          padding: 6px;
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.01);
        }

        .tab-nav-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          text-transform: none;
        }

        .tab-nav-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-main);
        }

        .tab-nav-btn.active {
          background: rgba(139, 92, 246, 0.15);
          color: #fff;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        /* Inventory metrics cards */
        .inventory-metrics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.01);
        }

        .metric-card.warning-bg {
          background: rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.2);
        }

        .metric-icon {
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.1);
          padding: 8px;
          box-sizing: content-box;
          border-radius: var(--radius-sm);
        }

        .warning-bg .metric-icon {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .metric-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .metric-title {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .spin-pulse {
          animation: pulseIcon 2s infinite ease-in-out;
        }

        @keyframes pulseIcon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .low-stock-alert-banner {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-xs);
          color: #ef4444;
          font-size: 0.85rem;
          margin-bottom: 20px;
          text-align: left;
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

        /* Stock Alert Badges */
        .inv-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .inv-badge.in-stock {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .inv-badge.low-stock {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .inv-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
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

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .modal-content {
          width: 100%;
          max-width: 440px;
          background: #0d0f17;
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: var(--radius-sm);
          animation: modalFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          text-align: left;
        }

        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .modal-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        .modal-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .form-control {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: #fff;
          padding: 10px 14px;
          border-radius: var(--radius-xs);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          border-color: #8b5cf6;
        }

        .form-control:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.05);
        }

        select.form-control option {
          background: #0d0f17;
          color: #fff;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        /* History log modal styling */
        .history-logs-list {
          max-height: 320px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xs);
          background: rgba(0, 0, 0, 0.2);
        }

        .log-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .log-item:last-child {
          border-bottom: none;
        }

        .log-meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
          align-items: flex-start;
        }

        .log-type-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          padding: 1px 5px;
          border-radius: 2px;
        }

        .log-reason {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .log-date {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
