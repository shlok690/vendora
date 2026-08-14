import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../AuthPages.css';

interface RegisterPageProps {
  registerRole: UserRole;
}

const rolePath = (role: UserRole) => (role === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard');

const RegisterPage: React.FC<RegisterPageProps> = ({ registerRole }) => {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<UserRole>(registerRole);
  const [error, setError]         = useState<string | null>(null);
  const [busy, setBusy]           = useState(false);

  const navigate = useNavigate();
  const { saveUserRole, logout } = useAuth();
  const { showToast } = useToast();

  useEffect(() => { setRole(registerRole); }, [registerRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

      if (role === 'vendor') {
        // Vendors must authenticate with a fresh login before they can proceed
        // to onboarding — registering only creates the account, it doesn't
        // grant a session that skips straight to the dashboard.
        await logout();
        navigate('/login', {
          replace: true,
          state: { justRegistered: true, email: email.trim() },
        });
      } else {
        navigate(rolePath(role), { replace: true });
      }
    } catch (err: any) {
      const code = err?.code ?? '';
      let message: string;
      if (code === 'auth/email-already-in-use' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        message = 'This email is already registered. Please login instead.';
      } else if (code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters.';
      } else {
        message = err.message || 'Registration failed. Please try again.';
      }
      setError(message);
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join Vendora and start trading locally.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
