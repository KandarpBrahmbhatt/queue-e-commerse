import React, { useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, user }) {
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    await onAddToCart(product._id);
    setAdding(false);
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isOutOfStock = product.stock <= 0;

  // Calculate discount percentage if valid
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  // Generate a clean geometric gradient fallback based on product ID
  const getGradientFallback = (id) => {
    const hex = id.slice(-6);
    return `linear-gradient(135deg, #${hex} 0%, #e0e0e0 100%)`;
  };

  return (
    <div className={`product-card glass-panel ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="product-image-container">
        {imageError ? (
          <div 
            className="product-image-fallback" 
            style={{ background: getGradientFallback(product._id) }}
          >
            <span className="fallback-text">{product.name.slice(0, 1).toUpperCase()}</span>
          </div>
        ) : (
          <img 
            className="product-image" 
            src={product.images?.[0] || 'https://picsum.photos/seed/' + product._id + '/200/200'} 
            alt={product.name}
            onError={() => setImageError(true)}
          />
        )}
        {isOutOfStock && <span className="badge badge-error stock-badge">Out of Stock</span>}
      </div>

      <div className="product-info">
        <h3 className="product-title" title={product.name}>{product.name}</h3>
        
        <div className="product-rating-row">
          <div className="product-rating">
            <span>{product.averageRating?.toFixed(1) || '4.1'}</span>
            <Star size={10} className="star-icon" />
          </div>
          <span className="product-sku">{product.sku}</span>
        </div>

        <p className="product-desc" title={product.description}>{product.description}</p>
        
        <div className="product-footer">
          <div className="product-pricing">
            <div className="price-row">
              {hasDiscount ? (
                <>
                  <span className="price-current">₹{product.discountPrice.toLocaleString()}</span>
                  <span className="price-old">₹{product.price.toLocaleString()}</span>
                  <span className="price-discount">{discountPercent}% off</span>
                </>
              ) : (
                <span className="price-current">₹{product.price.toLocaleString()}</span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 10 && (
              <span className="stock-warning">Only {product.stock} left!</span>
            )}
          </div>

          <button 
            className="btn btn-primary btn-add-cart" 
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
          >
            <ShoppingCart size={14} />
            <span>{adding ? '...' : 'Add'}</span>
          </button>
        </div>
      </div>
      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s, border-color 0.3s;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-radius: var(--radius-sm);
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px var(--primary-glow);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .product-image-container {
          height: 180px;
          position: relative;
          background: rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .product-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover .product-image {
          transform: scale(1.06);
        }

        .product-image-fallback {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fallback-text {
          font-size: 3rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
        }

        .badge {
          position: absolute;
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .stock-badge {
          top: 8px;
          left: 8px;
          background: var(--danger);
          color: #fff;
          box-shadow: 0 2px 8px var(--danger-glow);
        }

        .product-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 6px;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-title:hover {
          color: var(--primary);
        }

        .product-rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .product-rating {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          background: var(--rating-green);
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0 2px 6px var(--secondary-glow);
        }

        .star-icon {
          fill: #fff;
        }

        .product-sku {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .product-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
          text-align: left;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 38px;
          margin-bottom: 12px;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: auto;
        }

        .product-pricing {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 6px;
        }

        .price-current {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .price-old {
          font-size: 0.8rem;
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .price-discount {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--rating-green);
        }

        .stock-warning {
          font-size: 0.75rem;
          color: var(--danger);
          font-weight: 700;
        }

        .btn-add-cart {
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: var(--radius-xs);
          text-transform: none;
          background: var(--primary);
          color: #fff;
          box-shadow: 0 4px 10px var(--primary-glow);
        }

        .btn-add-cart:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px var(--primary-glow);
          filter: brightness(1.1);
        }

        .out-of-stock {
          opacity: 0.65;
        }
        
        .out-of-stock .btn-add-cart {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          box-shadow: none;
          cursor: not-allowed;
          border-color: var(--border-color);
        }
      `}</style>
    </div>
  );
}
