import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

export default function AuthView({ onClose, onSuccess, showNotification }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot', 'verify-otp', 'reset-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'login') {
      if (!email || !password) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }
      setLoading(true);
      try {
        const response = await api.auth.login(email, password);
        showNotification(response.message || 'Logged in successfully!', 'success');
        onSuccess(response.user);
        onClose();
      } catch (err) {
        showNotification(err.message || 'Login failed. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signup') {
      if (!name || !email || !password) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }
      setLoading(true);
      try {
        const response = await api.auth.signup(name, email, password);
        showNotification(response.message || 'Account created successfully!', 'success');
        onSuccess(response.user);
        onClose();
      } catch (err) {
        showNotification(err.message || 'Sign up failed. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email) {
        showNotification('Email address is required.', 'error');
        return;
      }
      setLoading(true);
      try {
        const response = await api.auth.sendOtp(email);
        showNotification(response.message || 'OTP sent successfully to email.', 'success');
        setMode('verify-otp');
      } catch (err) {
        showNotification(err.message || 'Failed to send OTP.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'verify-otp') {
      if (!otp) {
        showNotification('OTP code is required.', 'error');
        return;
      }
      setLoading(true);
      try {
        const response = await api.auth.verifyOtp(email, otp);
        showNotification(response.message || 'OTP verified successfully!', 'success');
        setMode('reset-password');
      } catch (err) {
        showNotification(err.message || 'Invalid or expired OTP.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'reset-password') {
      if (!password) {
        showNotification('New password is required.', 'error');
        return;
      }
      setLoading(true);
      try {
        const response = await api.auth.resetPassword(email, password);
        showNotification(response.message || 'Password reset successfully! Please login with your new password.', 'success');
        setPassword('');
        setMode('login');
      } catch (err) {
        showNotification(err.message || 'Failed to reset password.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal glass-panel">
        <button className="auth-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {['login', 'signup'].includes(mode) ? (
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Login
            </button>
            <button 
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
              type="button"
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="auth-header">
            <h2 className="auth-title">
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'verify-otp' && 'Verify OTP'}
              {mode === 'reset-password' && 'New Password'}
            </h2>
            <p className="auth-subtitle">
              {mode === 'forgot' && 'Enter your email to receive a password reset code.'}
              {mode === 'verify-otp' && `We sent a 6-digit OTP code to ${email}`}
              {mode === 'reset-password' && 'Enter your new password below.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
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

          {['login', 'signup', 'forgot'].includes(mode) && (
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
                  disabled={mode === 'forgot' && loading}
                />
              </div>
            </div>
          )}

          {mode === 'verify-otp' && (
            <div className="input-group">
              <label className="input-label">OTP Verification Code</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="form-input with-icon" 
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>
          )}

          {['login', 'signup', 'reset-password'].includes(mode) && (
            <div className="input-group">
              <label className="input-label">
                {mode === 'reset-password' ? 'New Password' : 'Password'}
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input with-icon" 
                  placeholder={mode === 'reset-password' ? 'Enter new password' : 'Enter Password'}
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
          )}

          {mode === 'login' && (
            <div className="forgot-password-link-container">
              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => setMode('forgot')}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block auth-submit-btn" 
            disabled={loading}
          >
            {loading ? 'Processing...' : 
              mode === 'login' ? 'Login' : 
              mode === 'signup' ? 'Create Account' : 
              mode === 'forgot' ? 'Send OTP' : 
              mode === 'verify-otp' ? 'Verify OTP' : 
              'Reset Password'
            }
          </button>

          {['forgot', 'verify-otp', 'reset-password'].includes(mode) && (
            <button
              type="button"
              className="back-to-login-btn"
              onClick={() => {
                setMode('login');
                setOtp('');
                setPassword('');
              }}
            >
              Back to Login
            </button>
          )}
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

        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 8px 0;
          font-family: var(--font-sans);
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
          font-family: var(--font-sans);
        }

        .forgot-password-link-container {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 16px;
        }

        .forgot-password-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          font-family: var(--font-sans);
        }

        .forgot-password-btn:hover {
          color: #fff;
          text-decoration: underline;
        }

        .back-to-login-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: 16px;
          text-align: center;
          width: 100%;
          transition: color 0.2s;
          font-family: var(--font-sans);
        }

        .back-to-login-btn:hover {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
