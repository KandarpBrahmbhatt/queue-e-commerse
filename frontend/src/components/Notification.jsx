import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="toast-icon success" size={20} />,
    error: <AlertCircle className="toast-icon error" size={20} />,
    info: <Info className="toast-icon info" size={20} />,
  };

  return (
    <div className={`toast-container ${type}`}>
      <div className="toast-content">
        {icons[type]}
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="toast-progress"></div>
      <style>{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 1000;
          min-width: 320px;
          max-width: 450px;
          background: rgba(18, 20, 29, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .toast-icon {
          flex-shrink: 0;
        }
        
        .toast-icon.success {
          color: #10b981;
        }
        
        .toast-icon.error {
          color: #ef4444;
        }
        
        .toast-icon.info {
          color: #3b82f6;
        }

        .toast-message {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: #f3f4f6;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .toast-progress {
          height: 3px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .toast-progress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: var(--primary);
          width: 0;
          animation: toastProgressAnimation 4s linear forwards;
        }

        .toast-container.error .toast-progress::after {
          background: #ef4444;
        }

        .toast-container.info .toast-progress::after {
          background: #3b82f6;
        }

        @keyframes toastProgressAnimation {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
