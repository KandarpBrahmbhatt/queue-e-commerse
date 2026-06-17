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
          transition: box-shadow 0.2s ease-in-out;
          border: 1px solid #f0f0f0;
          background: #fff;
        }

        .product-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .product-image-container {
          height: 180px;
          position: relative;
          background: #fff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .product-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.04);
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
          color: rgba(255, 255, 255, 0.7);
        }

        .badge {
          position: absolute;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .stock-badge {
          top: 8px;
          left: 8px;
          background: #d32f2f;
          color: #fff;
        }

        .product-info {
          padding: 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-title {
          font-size: 0.95rem;
          font-weight: 500;
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
          background: var(--rating-green); /* Rating Green */
          padding: 2px 6px;
          border-radius: 3px;
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
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
          text-align: left;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 34px;
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
          font-size: 1.15rem;
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
          color: #d32f2f;
          font-weight: 700;
        }

        .btn-add-cart {
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: 2px;
          text-transform: uppercase;
          border: 1px solid #e0e0e0;
        }

        .out-of-stock {
          opacity: 0.65;
        }
        
        .out-of-stock .btn-add-cart {
          background: #f0f0f0;
          color: var(--text-muted);
          box-shadow: none;
          cursor: not-allowed;
          border-color: #d0d0d0;
        }
      `}</style>
    </div>
  );
}
