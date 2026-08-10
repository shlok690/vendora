import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth, type UserRole } from '../../context/AuthContext';
import '../AuthPages.css';

interface RegisterPageProps {
  registerRole: UserRole;
}

const rolePath = (role: UserRole) => {
  if (role === 'admin') return '/admin-dashboard';
  if (role === 'vendor') return '/seller-dashboard';
  return '/buyer-dashboard';
};

const RegisterPage: React.FC<RegisterPageProps> = ({ registerRole }) => {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<UserRole>(registerRole);
  const [passcode, setPasscode]   = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [busy, setBusy]           = useState(false);

  const navigate = useNavigate();
  const { saveUserRole } = useAuth();

  useEffect(() => { setRole(registerRole); }, [registerRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'admin' && passcode !== 'ADMIN123') {
      setError('Invalid admin passcode. Access denied.');
      return;
    }

    setBusy(true);
    try {
      let user;
      try {
        user = (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;
      } catch (err: any) {
        if (err.code !== 'auth/email-already-in-use') throw err;
        // If account exists, sign in instead
        user = (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
      }

      await saveUserRole(user, role, name.trim(), true);
      navigate(rolePath(role), { replace: true });
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/email-already-in-use' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('This email is already registered. Please login instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/vendora-logo.jpg" alt="Vendora" className="auth-logo-img" />
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join Vendora and start trading locally.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selection — shown only on general /register or /register/seller|buyer */}
          {registerRole !== 'admin' && (
            <div className="auth-role-toggle" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={`role-btn ${role === 'vendor' ? 'active' : ''}`}
                onClick={() => setRole('vendor')}
              >
                <span className="role-btn-icon">🏪</span>
                <span className="role-btn-title">Sell Products</span>
                <span className="role-btn-sub">Vendor</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'customer' ? 'active' : ''}`}
                onClick={() => setRole('customer')}
              >
                <span className="role-btn-icon">🛍️</span>
                <span className="role-btn-title">Buy Products</span>
                <span className="role-btn-sub">Customer</span>
              </button>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="fullname">Full name</label>
            <input
              id="fullname"
              className="auth-input"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {role === 'admin' && (
            <div className="auth-admin-box">
              <label className="auth-label" htmlFor="passcode">Admin security passcode</label>
              <input
                id="passcode"
                className="auth-input"
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                style={{ marginTop: 4 }}
              />
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-note">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
