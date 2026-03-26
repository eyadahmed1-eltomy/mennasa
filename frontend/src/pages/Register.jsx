import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', birthday: '', gender: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key, val) => setForm({ ...form, [key]: val });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ name: `${form.firstName} ${form.lastName}`, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div className="auth-page">
      <div style={{
        position: 'absolute', top: '15%', right: '10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div className="auth-container">
        <div className="auth-brand">
          <h1>Velora</h1>
          <p>Join millions of people who use Velora to stay connected with friends, family, and communities that matter.</p>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit} style={{ width: '440px' }}>
          <h2>Create Your Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>It's quick and easy.</p>
          {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input placeholder="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required id="reg-first" />
            <input placeholder="Last name"  value={form.lastName}  onChange={(e) => update('lastName',  e.target.value)} required id="reg-last" />
          </div>
          <div className="form-group">
            <input type="email" placeholder="Email address" value={form.email} onChange={(e) => update('email', e.target.value)} required id="reg-email" />
          </div>
          <div className="form-group">
            <input type="password" placeholder="New password" value={form.password} onChange={(e) => update('password', e.target.value)} required id="reg-pass" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Birthday</label>
            <input type="date" value={form.birthday} onChange={(e) => update('birthday', e.target.value)} id="reg-birthday" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Gender</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['Female', 'Male', 'Other'].map((g) => (
                <label key={g} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${form.gender === g ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', fontSize: '0.9rem',
                }}>
                  {g}
                  <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => update('gender', g)}
                    style={{ width: 'auto', accentColor: 'var(--accent)' }} />
                </label>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '12px 0' }}>
            By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
          </p>

          <button type="submit" className="btn btn-primary" id="reg-submit">Sign Up</button>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
