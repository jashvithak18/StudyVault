import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Reset Password
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState(''); // Holds generated code for easy dev testing
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setSuccessMessage("Reset code sent! Check the console or see below for the code.");
      if (response.data.code) {
        setDevCode(response.data.code); // Display it on screen for easy verification
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !code || !newPassword) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        code,
        newPassword
      });
      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          {step === 1 
            ? "Enter your email address to receive a verification code" 
            : "Enter the 6-digit code and your new password"}
        </p>

        {error && (
          <div className="auth-error-alert" onClick={() => setError(null)}>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="alert-box success" style={{ marginBottom: '20px', fontSize: '0.85rem' }}>
            {successMessage}
          </div>
        )}

        {/* Developer testing assistant box */}
        {devCode && (
          <div className="alert-box success" style={{ background: 'rgba(20, 184, 166, 0.08)', color: '#0d9488', border: '1px solid rgba(20, 184, 166, 0.2)', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
            TESTING CODE: {devCode}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="e.g. name@student.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending code...' : 'Get Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '20px' }}>
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
