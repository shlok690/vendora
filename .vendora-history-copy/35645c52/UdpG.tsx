import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth, UserRole } from '../../context/AuthContext';

interface RegisterPageProps {
  registerRole: UserRole;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ registerRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(registerRole);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { saveUserRole } = useAuth();

  useEffect(() => {
    setRole(registerRole);
  }, [registerRole]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (role === 'admin' && adminPasscode !== 'ADMIN123') {
      setError('Invalid Admin Security Passcode. Access denied.');
      return;
    }

    setLoading(true);

    try {
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        user = userCredential.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          const signInCred = await signInWithEmailAndPassword(auth, email.trim(), password);
          user = signInCred.user;
        } else {
          throw authErr;
        }
      }

      await saveUserRole(user, role, displayName.trim(), true);

      if (role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (role === 'vendor') {
        navigate('/vendor-onboarding', { replace: true });
      } else if (role === 'customer') {
        navigate('/customer-explore', { replace: true });
      } else {
        navigate('/user-dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      if (err.code === 'auth/email-already-in-use' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('This email is already registered in Firebase with a different password. Please click "Sign In" below to log in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please check details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #eef2ff 0%, #f8fafc 45%, #ffffff 100%)',
        color: '#0f172a',
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
          maxWidth: '520px',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderRadius: '32px',
          padding: '2.5rem',
          boxShadow: '0 40px 90px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 1rem auto',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.7rem',
              boxShadow: '0 18px 40px rgba(59, 130, 246, 0.18)',
            }}
          >
            📨
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Create your account</h1>
          <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.95rem' }}>
            Registration
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Full Name"
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
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
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

          <div style={{ display: 'flex', gap: '0.75rem', borderRadius: '22px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setRole('vendor')}
              style={{
                flex: 1,
                border: '1px solid rgba(15, 23, 42, 0.12)',
                borderRadius: '18px',
                padding: '1rem',
                background: role === 'vendor' ? '#eef2ff' : 'white',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sell Products
            </button>
            <button
              type="button"
              onClick={() => setRole('customer')}
              style={{
                flex: 1,
                border: '1px solid rgba(15, 23, 42, 0.12)',
                borderRadius: '18px',
                padding: '1rem',
                background: role === 'customer' ? '#eef2ff' : 'white',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Buy Products
            </button>
          </div>

          {role === 'admin' && (
            <input
              type="password"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              placeholder="Admin Passcode"
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
          )}

          {error && (
            <div style={{ padding: '1rem', borderRadius: '18px', background: '#fee2e2', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 18px 40px rgba(37, 99, 235, 0.2)',
            }}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', color: '#475569', fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export const RegisterSelectionPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#eef2ff',
        color: '#0f172a',
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
          maxWidth: '500px',
          backgroundColor: 'white',
          borderRadius: '32px',
          padding: '2.5rem',
          boxShadow: '0 40px 90px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Create your account</h1>
        <p style={{ marginBottom: '1.75rem', color: '#64748b' }}>
          Choose how you want to join Vendora.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Link
            to="/register/vendor"
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '18px',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              background: '#eef2ff',
              color: '#111827',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sell Products (Vendor)
          </Link>
          <Link
            to="/register/customer"
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '18px',
              background: '#1d4ed8',
              color: 'white',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Buy Products (Customer)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
