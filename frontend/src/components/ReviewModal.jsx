import React, { useState, useEffect } from 'react';
import { Star, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

export default function ReviewModal({ isOpen, onClose, mode, productId, productName, showNotification }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // View Mode State
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (isOpen && mode === 'view' && productId) {
      fetchReviews(1);
    }
  }, [isOpen, mode, productId]);

  const fetchReviews = async (pageNum) => {
    setLoading(true);
    try {
      const response = await api.review.get(productId, pageNum, 5);
      setReviews(response.review || []);
      setTotalPages(response.totalPage || 1);
      setTotalReviews(response.total || 0);
      setPage(pageNum);
    } catch (err) {
      showNotification(err.message || 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      showNotification('Please select a rating between 1 and 5', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.review.create(productId, rating, comment);
      showNotification('Review submitted successfully!', 'success');
      onClose();
    } catch (err) {
      showNotification(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-card glass-panel animate-fade-in">
        <div className="review-modal-header">
          <h3>
            {mode === 'write' ? 'Write a Review' : 'Customer Reviews'}
            <span className="product-name-subtitle">{productName}</span>
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="review-modal-body">
          {mode === 'write' ? (
            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group rating-group">
                <label>Overall Rating</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-btn"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        size={28}
                        className={`star-icon-select ${
                          (hoverRating || rating) >= star ? 'filled' : ''
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="rating-desc-text">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Your Comment (Optional)</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="form-textarea"
                />
                <span className="char-count">{comment.length} / 500</span>
              </div>

              <div className="review-actions">
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          ) : (
            <div className="reviews-view">
              {loading ? (
                <div className="modal-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="empty-reviews-state">
                  <MessageSquare size={40} className="empty-icon" />
                  <h4>No reviews yet</h4>
                  <p>Be the first to purchase and review this product!</p>
                </div>
              ) : (
                <>
                  <div className="reviews-meta-summary">
                    <span className="total-reviews-count">{totalReviews} customer review{totalReviews !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="reviews-list-container">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="review-item-card">
                        <div className="review-item-header">
                          <span className="reviewer-name">{rev.userId?.name || 'Anonymous User'}</span>
                          <div className="review-stars-display">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={`star-icon-small ${rev.rating >= star ? 'filled' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.comment && <p className="review-comment-text">{rev.comment}</p>}
                        <span className="review-date-text">
                          {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="modal-pagination">
                      <button
                        className="btn btn-outline btn-icon-only btn-sm"
                        disabled={page <= 1}
                        onClick={() => fetchReviews(page - 1)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="page-indicator">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        className="btn btn-outline btn-icon-only btn-sm"
                        disabled={page >= totalPages}
                        onClick={() => fetchReviews(page + 1)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .review-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(8, 9, 14, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }

        .review-modal-card {
          max-width: 520px;
          width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        .review-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .review-modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .product-name-subtitle {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, color 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }

        .review-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .rating-group {
          align-items: center;
        }

        .star-rating-selector {
          display: flex;
          gap: 6px;
        }

        .star-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: transform 0.15s ease;
        }

        .star-btn:hover {
          transform: scale(1.15);
        }

        .star-icon-select {
          color: rgba(255, 255, 255, 0.15);
          fill: none;
          transition: color 0.2s, fill 0.2s;
        }

        .star-icon-select.filled {
          color: #ffb020;
          fill: #ffb020;
          filter: drop-shadow(0 0 6px rgba(255, 176, 32, 0.4));
        }

        .rating-desc-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
        }

        .form-textarea {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 10px;
          color: var(--text-main);
          font-family: inherit;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-textarea:focus {
          border-color: var(--primary);
        }

        .char-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          align-self: flex-end;
        }

        .review-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }

        .reviews-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }

        .reviews-meta-summary {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .reviews-list-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .review-item-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .review-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .reviewer-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .review-stars-display {
          display: flex;
          gap: 2px;
        }

        .star-icon-small {
          color: rgba(255, 255, 255, 0.1);
          fill: none;
        }

        .star-icon-small.filled {
          color: #ffb020;
          fill: #ffb020;
        }

        .review-comment-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .review-date-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          align-self: flex-end;
        }

        .empty-reviews-state {
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.3;
        }

        .empty-reviews-state h4 {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .empty-reviews-state p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .modal-loading {
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .modal-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
        }

        .page-indicator {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .animate-fade-in {
          animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
