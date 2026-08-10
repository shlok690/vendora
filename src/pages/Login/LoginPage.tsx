import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import '../AuthPages.css';

const rolePath = (role: string | null) => (role === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard');

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [redirected, setRedirected] = useState(false);

  const navigate = useNavigate();
  const { currentUser, userRole, loading, getUserRole } = useAuth();

  /* Auto-redirect if already logged in */
  useEffect(() => {
    if (redirected || loading) return;
    if (currentUser && userRole) {
      navigate(rolePath(userRole), { replace: true });
      setRedirected(true);
    }
  }, [currentUser, userRole, loading, navigate, redirected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();
    try {
      const { user } = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const role = await getUserRole(user);

      if (!role) {
        await signOut(auth);
        setError('Your account has no role assigned. Please register first.');
        return;
      }

      setInfo('Login successful — redirecting…');
      navigate(rolePath(role), { replace: true });
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again or reset your password.');
      } else if (code === 'auth/user-not-found') {
        setError(`No account found for ${cleanEmail}. Please register first.`);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError('Enter your email first to receive a reset link.'); return; }
    setError(null); setInfo(null);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfo(`Password reset link sent to ${cleanEmail}. Check your inbox!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to your Vendora account to continue.
        </p>

        {info  && <div className="auth-success">{info}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <div className="auth-pw-row">
              <label className="auth-label" htmlFor="password">Password</label>
              <button type="button" className="auth-forgot" onClick={handleForgotPassword}>
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="auth-footer-note">
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
