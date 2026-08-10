import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface LoginPageProps {
  loginRole: UserRole;
}

const LoginPage: React.FC<LoginPageProps> = ({ loginRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const navigate = useNavigate();
  const { currentUser, userRole, loading, getUserRole } = useAuth();
  const isAdmin = loginRole === 'admin';

  useEffect(() => {
    if (hasRedirected || loading) return;
    if (currentUser && userRole) {
      if (userRole === loginRole) {
        navigate(loginRole === 'admin' ? '/admin-dashboard' : '/user-dashboard', { replace: true });
      } else {
        navigate(userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard', { replace: true });
      }
      setHasRedirected(true);
    }
  }, [currentUser, userRole, loading, navigate, loginRole, hasRedirected]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    const cleanedEmail = email.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, password);
      const user = userCredential.user;
      const role = await getUserRole(user);

      if (role !== loginRole) {
        await signOut(auth);
        setError(
          isAdmin
            ? 'This account is not assigned as an admin. Please use the resident login page instead.'
            : 'This account is not assigned as a resident user. Please use the admin login page instead.'
        );
        return;
      }

      setHasRedirected(true);
      navigate(loginRole === 'admin' ? '/admin-dashboard' : '/user-dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        if (password === 'ADMIN123') {
          setError('Incorrect password. "ADMIN123" is only the admin registration passcode, not your personal account password.');
        } else {
          setError(`Incorrect password for ${cleanedEmail}. Please check your password or click "Forgot Password?" to reset it.`);
        }
      } else if (err.code === 'auth/user-not-found') {
        setError(`No account found for ${cleanedEmail}. Please click "Create Account" below to register.`);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    setError(null);
    setInfoMessage(null);
    try {
      await sendPasswordResetEmail(auth, cleanedEmail);
      setInfoMessage(`Password reset link sent to ${cleanedEmail}. Please check your email inbox!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please check your email address.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 1rem auto',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 8px 20px rgba(14, 165, 233, 0.4)',
            }}
          >
            {isAdmin ? '🛡️' : '👤'}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            {isAdmin ? 'Admin Login' : 'User Login'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            {isAdmin
              ? 'Sign in to access the administration dashboard.'
              : 'Sign in to access your resident dashboard.'}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Link
            to="/login/admin"
            style={{
              textDecoration: 'none',
              color: isAdmin ? '#fff' : '#38bdf8',
              fontWeight: 600,
              background: isAdmin ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' : 'transparent',
              padding: '0.5rem 0.9rem',
              borderRadius: '999px',
            }}
          >
            Admin
          </Link>
          <Link
            to="/login/user"
            style={{
              textDecoration: 'none',
              color: !isAdmin ? '#fff' : '#38bdf8',
              fontWeight: 600,
              background: !isAdmin ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' : 'transparent',
              padding: '0.5rem 0.9rem',
              borderRadius: '999px',
            }}
          >
            User
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {infoMessage && (
            <div style={{ padding: '0.75rem', backgroundColor: '#22c55e20', border: '1px solid #22c55e50', borderRadius: '10px', color: '#4ade80', fontSize: '0.85rem' }}>
              {infoMessage}
            </div>
          )}

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#ef444420', border: '1px solid #ef444450', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {isSubmitting ? 'Authenticating…' : 'Sign In 🚀'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export const LoginSelectionPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>Choose Your Portal</h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.75rem' }}>
          Select the login page for your account type.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link
            to="/login/admin"
            style={{
              textDecoration: 'none',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            Admin Login
          </Link>
          <Link
            to="/login/user"
            style={{
              textDecoration: 'none',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontWeight: 700,
              backgroundColor: '#0f172a',
            }}
          >
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
