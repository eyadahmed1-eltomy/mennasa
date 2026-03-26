import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="auth-page">
      <div style={{
        position: 'absolute', top: '20%', left: '10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: '250px', height: '250px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(241,196,15,0.1) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div className="auth-container">
        <div className="auth-brand">
          <h1>Velora</h1>
          <p>Connect with the world in a premium, elegant social experience. Share moments, discover communities, and build meaningful connections.</p>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="login-email"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="login-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" id="login-submit">Sign In</button>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <a href="#" style={{ fontSize: '0.88rem' }}>Forgot password?</a>
          </div>

          <div className="auth-divider">or</div>

          <Link to="/register" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
            Create New Account
          </Link>
        </form>
      </div>
    </div>
  );
}
