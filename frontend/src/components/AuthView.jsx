import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

export default function AuthView({ onClose, onSuccess, showNotification }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await api.auth.login(email, password);
        showNotification(response.message || 'Logged in successfully!', 'success');
        onSuccess(response.user);
      } else {
        const response = await api.auth.signup(name, email, password);
        showNotification(response.message || 'Account created successfully!', 'success');
        onSuccess(response.user);
      }
      onClose();
    } catch (err) {
      showNotification(err.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal glass-panel">
        <button className="auth-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
            type="button"
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
            type="button"
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="form-input with-icon" 
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="form-input with-icon" 
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input with-icon" 
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block auth-submit-btn" 
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
      
      <style>{`
        .auth-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .auth-modal {
          max-width: 400px;
          width: 100%;
          padding: 32px 24px;
          position: relative;
          background: rgba(10, 11, 16, 0.95);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          animation: modalAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalAppear {
          from {
            transform: scale(0.95) translateY(10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .auth-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .auth-close-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .auth-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 24px;
        }

        .auth-tab {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.95rem;
          padding: 12px 0;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          text-transform: none;
          letter-spacing: 0.2px;
          font-family: var(--font-sans);
        }

        .auth-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-input.with-icon {
          padding-left: 38px;
        }

        .form-input:focus + .input-icon {
          color: var(--primary);
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .password-toggle:hover {
          color: var(--text-main);
        }

        .auth-submit-btn {
          margin-top: 16px;
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          background: var(--primary);
          color: #fff;
          text-transform: none;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .auth-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px var(--primary-glow);
          filter: brightness(1.1);
        }

        .btn-block {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
