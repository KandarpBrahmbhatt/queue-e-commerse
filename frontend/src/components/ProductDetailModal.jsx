import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Star, ShoppingCart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function ProductDetailModal({ productId, onClose, onAddToCart, showNotification }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.products.getCurrentProduct(productId);
      if (response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to retrieve product details.', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await onAddToCart(product._id);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-modal-overlay">
        <div className="detail-modal glass-panel loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isOutOfStock = product.stock <= 0;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  const avgRating = product.ratingsAverage !== undefined ? product.ratingsAverage : (product.averageRating || 0);
  const reviewsCount = product.ratingsQuantity !== undefined ? product.ratingsQuantity : (product.totalReviews || 0);

  return (
    <div className="detail-modal-overlay">
      <div className="detail-modal glass-panel">
        <button className="detail-close-btn" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        <div className="detail-grid">
          {/* Product Image Column */}
          <div className="detail-image-section">
            {imageError ? (
              <div className="detail-image-fallback">
                <span>{product.name.slice(0, 1).toUpperCase()}</span>
              </div>
            ) : (
              <img 
                className="detail-image" 
                src={product.images?.[0] || 'https://picsum.photos/seed/' + product._id + '/400/400'} 
                alt={product.name}
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Product Info Column */}
          <div className="detail-info-section">
            <span className="detail-category-badge">
              {product.category?.name || 'Product Detail'}
            </span>
            <h2 className="detail-title">{product.name}</h2>
            
            <div className="detail-rating-row">
              <div className="detail-rating">
                <span>{avgRating.toFixed(1)}</span>
                <Star size={12} className="star-icon" />
              </div>
              <span className="detail-reviews-count">({reviewsCount} customer reviews)</span>
              <span className="detail-sku">SKU: {product.sku}</span>
            </div>

            <div className="detail-price-box">
              {hasDiscount ? (
                <div className="detail-pricing">
                  <span className="detail-price-current">₹{product.discountPrice.toLocaleString()}</span>
                  <span className="detail-price-old">₹{product.price.toLocaleString()}</span>
                  <span className="detail-price-discount">{discountPercent}% OFF</span>
                </div>
              ) : (
                <span className="detail-price-current">₹{product.price.toLocaleString()}</span>
              )}
            </div>

            <div className="detail-divider"></div>

            <div className="detail-description-box">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="detail-stock-box">
              {isOutOfStock ? (
                <span className="badge-stock out">Out of Stock</span>
              ) : (
                <span className="badge-stock in">In Stock ({product.stock} units available)</span>
              )}
              {product.stock > 0 && product.stock <= 10 && (
                <span className="detail-stock-warning">Hurry! Only a few items left in stock.</span>
              )}
            </div>

            <div className="detail-actions">
              <button 
                className="btn btn-primary detail-add-btn" 
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
              >
                <ShoppingCart size={18} />
                <span>{adding ? 'Adding to Cart...' : 'Add to Shopping Cart'}</span>
              </button>
            </div>

            <div className="detail-trust-badges">
              <div className="trust-badge">
                <Truck size={16} />
                <span>Express Delivery</span>
              </div>
              <div className="trust-badge">
                <ShieldCheck size={16} />
                <span>Secure Checkout</span>
              </div>
              <div className="trust-badge">
                <RefreshCw size={16} />
                <span>Easy 7-Day Returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .detail-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 24px;
        }

        .detail-modal {
          max-width: 900px;
          width: 100%;
          padding: 32px;
          position: relative;
          background: rgba(10, 11, 16, 0.95);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-height: 90vh;
          overflow-y: auto;
        }

        .detail-modal.loading-container {
          max-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px;
        }

        .detail-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }

        .detail-close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.2fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        /* Image Column */
        .detail-image-section {
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .detail-image-section {
            height: 260px;
          }
        }

        .detail-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.3s;
        }

        .detail-image:hover {
          transform: scale(1.04);
        }

        .detail-image-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, #2e2f3e 100%);
          font-size: 5rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-xs);
        }

        /* Info Column */
        .detail-info-section {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .detail-category-badge {
          align-self: flex-start;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.1);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .detail-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .detail-rating-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .detail-rating {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #fff;
          background: var(--rating-green);
          padding: 3px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 8px var(--secondary-glow);
        }

        .detail-rating .star-icon {
          fill: #fff;
        }

        .detail-reviews-count {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .detail-sku {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-left: auto;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .detail-price-box {
          margin-bottom: 20px;
        }

        .detail-pricing {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .detail-price-current {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .detail-price-old {
          font-size: 1.1rem;
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .detail-price-discount {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--secondary);
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .detail-divider {
          height: 1px;
          background: var(--border-color);
          margin-bottom: 20px;
        }

        .detail-description-box {
          margin-bottom: 20px;
        }

        .detail-description-box h3 {
          font-size: 0.9rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .detail-description-box p {
          font-size: 0.95rem;
          color: var(--text-main);
          line-height: 1.5;
        }

        .detail-stock-box {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .badge-stock {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .badge-stock.in {
          background: rgba(16, 185, 129, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .badge-stock.out {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .detail-stock-warning {
          font-size: 0.8rem;
          color: var(--danger);
          font-weight: 700;
        }

        .detail-actions {
          margin-bottom: 28px;
        }

        .detail-add-btn {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          font-weight: 700;
          background: var(--primary);
          box-shadow: 0 4px 16px var(--primary-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .detail-add-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--primary-glow);
        }

        .detail-trust-badges {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          gap: 12px;
        }

        .trust-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          flex: 1;
          text-align: center;
        }

        .trust-badge span {
          font-size: 0.7rem;
          font-weight: 600;
        }

        .trust-badge svg {
          color: #a78bfa;
        }
      `}</style>
    </div>
  );
}
