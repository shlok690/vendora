import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../AuthPages.css';

const rolePath = (role: string | null) => (role === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard');

interface LoginNavState {
  justRegistered?: boolean;
  email?: string;
}

const LoginPage: React.FC = () => {
  const location = useLocation();
  const navState = (location.state as LoginNavState | null) ?? null;

  const [email, setEmail] = useState(navState?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    navState?.justRegistered ? 'Account created! Log in to continue setting up your shop.' : null
  );
  const [busy, setBusy] = useState(false);
  const [redirected, setRedirected] = useState(false);

  const navigate = useNavigate();
  const { currentUser, userRole, loading, getUserRole } = useAuth();
  const { showToast } = useToast();

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
        const message = 'Your account has no role assigned. Please register first.';
        setError(message);
        showToast(message, 'error');
        return;
      }

      setInfo('Login successful — redirecting…');
      navigate(rolePath(role), { replace: true });
    } catch (err: any) {
      const code = err?.code ?? '';
      let message: string;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        message = 'Incorrect password. Please try again or reset your password.';
      } else if (code === 'auth/user-not-found') {
        message = `No account found for ${cleanEmail}. Please register first.`;
      } else {
        message = err.message || 'Login failed. Please check your credentials.';
      }
      setError(message);
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      const message = 'Enter your email first to receive a reset link.';
      setError(message);
      showToast(message, 'error');
      return;
    }
    setError(null); setInfo(null);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfo(`Password reset link sent to ${cleanEmail}. Check your inbox!`);
    } catch (err: any) {
      const message = err.message || 'Failed to send reset email.';
      setError(message);
      showToast(message, 'error');
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
