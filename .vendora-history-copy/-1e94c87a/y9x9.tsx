import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface LoginPageProps {
  loginRole?: UserRole;
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
  const isVendor = loginRole === 'vendor';
  const isCustomer = loginRole === 'customer';

  const redirectPath = (role: string | null) => {
    if (role === 'admin') return '/admin-dashboard';
    if (role === 'vendor') return '/vendor-onboarding';
    if (role === 'customer') return '/customer-explore';
    return '/user-dashboard';
  };

  useEffect(() => {
    if (hasRedirected || loading) return;
    if (currentUser && userRole) {
      navigate(redirectPath(userRole), { replace: true });
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

      if (!role) {
        await signOut(auth);
        setError('Your account does not have a role yet. Please register first.');
        return;
      }

      setInfoMessage('Login successful. Redirecting you to your dashboard...');
      navigate(redirectPath(role), { replace: true });
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
        background: 'radial-gradient(circle at top, rgba(236, 250, 255, 0.9), rgba(226, 232, 255, 0.9) 40%, #0f172a 100%)',
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
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '32px',
          padding: '2.25rem',
          boxShadow: '0 35px 80px rgba(15, 23, 42, 0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 1rem auto',
              borderRadius: '18px',
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.7rem',
              color: '#2563eb',
              boxShadow: '0 18px 40px rgba(37, 99, 235, 0.14)',
            }}
          >
            ✉️
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Sign in to continue to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              width: '100%',
              padding: '1rem 1.1rem',
              borderRadius: '18px',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 700,
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
              placeholder="Password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '1rem 1.1rem',
                borderRadius: '18px',
                border: '1px solid rgba(15, 23, 42, 0.12)',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          {infoMessage && (
            <div style={{ padding: '1rem', borderRadius: '18px', backgroundColor: '#ecfdf5', border: '1px solid #22c55e33', color: '#166534', fontSize: '0.95rem' }}>
              {infoMessage}
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', borderRadius: '18px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.95rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 18px 40px rgba(37, 99, 235, 0.18)',
              transition: 'transform 0.2s ease',
            }}
          >
            {isSubmitting ? 'Authenticating…' : 'Login'}
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.2rem' }}>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '0.95rem',
              borderRadius: '18px',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              background: '#fff',
              color: '#111827',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Google
          </button>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '0.95rem',
              borderRadius: '18px',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              background: '#10b981',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Phone
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
