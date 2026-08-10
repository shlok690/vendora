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
        // 1. Try creating account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        user = userCredential.user;
      } catch (authErr: any) {
        // If account already exists in Firebase Auth, automatically sign in with provided password
        if (authErr.code === 'auth/email-already-in-use') {
          const signInCred = await signInWithEmailAndPassword(auth, email.trim(), password);
          user = signInCred.user;
        } else {
          throw authErr;
        }
      }

      // 2. Save user role to Firestore and local cache
      await saveUserRole(user, role, displayName.trim(), true);

      // 3. Navigate to designated dashboard after auth is ready
      if (role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
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
        background: 'radial-gradient(circle at top, #1e1b4b 0%, #0f172a 70%, #020617 100%)',
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
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 1rem auto',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            🏢
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#fff' }}>Create Account</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Register as an Admin or Resident User
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Link
              to="/register/admin"
              style={{
                textDecoration: 'none',
                color: role === 'admin' ? '#fff' : '#38bdf8',
                fontWeight: 600,
                background: role === 'admin' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                padding: '0.5rem 0.9rem',
                borderRadius: '999px',
              }}
            >
              Admin
            </Link>
            <Link
              to="/register/user"
              style={{
                textDecoration: 'none',
                color: role === 'user' ? '#fff' : '#38bdf8',
                fontWeight: 600,
                background: role === 'user' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'transparent',
                padding: '0.5rem 0.9rem',
                borderRadius: '999px',
              }}
            >
              User
            </Link>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Johnson"
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Password
            </label>
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

          {role === 'admin' && (
            <div style={{ backgroundColor: '#6366f115', border: '1px solid #6366f140', padding: '1rem', borderRadius: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc', marginBottom: '0.4rem' }}>
                Admin Security Passcode
              </label>
              <input
                type="password"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                placeholder="Enter Security Passcode"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #6366f160',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#ef444420', border: '1px solid #ef444450', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: role === 'admin' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              boxShadow: role === 'admin' ? '0 4px 15px rgba(99, 102, 241, 0.4)' : '0 4px 15px rgba(14, 165, 233, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Creating Account…' : role === 'admin' ? 'Register as Admin 👑' : 'Register as Resident 👤'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
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
        background: 'radial-gradient(circle at top, #1e1b4b 0%, #0f172a 70%, #020617 100%)',
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>Create Your Account</h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.75rem' }}>
          Choose the dashboard you want to access.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link
            to="/register/admin"
            style={{
              textDecoration: 'none',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            Register as Admin
          </Link>
          <Link
            to="/register/user"
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
            Register as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
