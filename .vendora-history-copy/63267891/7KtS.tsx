import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './LandingPage.css';
import './LandingPage.override.css';

const spaces = [
  {
    title: 'Home & living',
    copy: 'Discover local essentials',
    icon: '⌂',
    tone: 'peach',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Fashion',
    copy: 'Find independent style',
    icon: '✦',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Handcrafted',
    copy: 'Shop makers near you',
    icon: '✺',
    tone: 'lilac',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  },
];

function LandingPage() {
  const { currentUser, userProfile, userRole } = useAuth();
  const [pointer, setPointer] = useState({ x: '50%', y: '50%' });
  const name = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0];
  const dashboard = userRole === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard';

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;
    setPointer({ x: `${x.toFixed(1)}%`, y: `${y.toFixed(1)}%` });
  };

  const resetPointer = () => setPointer({ x: '50%', y: '50%' });

  return <div
    className="society-home"
    onMouseMove={handleMouseMove}
    onMouseLeave={resetPointer}
    style={{ '--pointer-x': pointer.x, '--pointer-y': pointer.y } as React.CSSProperties}
  >
    <header className="home-nav">
      <Link to="/" className="home-logo"><img src="/vendora-logo.png" alt="Vendora" /></Link>
      <nav><a href="#spaces">Explore</a><a href="#how">Start selling</a></nav>
      <div className="home-actions">
        {currentUser ? <Link className="button button-light" to={dashboard}>Dashboard</Link> : <Link className="button button-light" to="/login">Login</Link>}
        <Link className="button button-dark" to="/register">Get started</Link>
      </div>
    </header>
  <div className="hero-pointer" />
    <main>
      <section className="home-hero">
        <div className="hero-glow hero-glow-purple" />
        <div className="hero-glow hero-glow-cyan" />
        <div className="hero-dots"><span /><span /><span /></div>
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <p className="home-kicker">Marketplace for local businesses</p>
        <h1>Your business.<br /><em>Your store. Your rules.</em></h1>
        <p className="hero-lead">Discover remarkable local products and give independent sellers a home to grow.</p>
        <div className="home-search"><span>⌕</span><span>Search for products or shops</span></div>
        <div className="hero-cta"><Link className="button button-dark" to="/register">Explore Vendora</Link><Link className="text-link" to="/login">Login to continue →</Link></div>
      </section>

      <section className="space-section" id="spaces">
        <div className="section-top"><div><p className="home-kicker">Made for every member</p><h2>A better way to live together.</h2></div><Link to="/register" className="text-link">Explore all →</Link></div>
        <div className="space-grid">{spaces.map((space) => <article className={`space-card ${space.tone}`} key={space.title}>
          <div className="space-image" style={{ backgroundImage: `url(${space.image})` }} />
          <div className="space-overlay" />
          <span className="space-icon">{space.icon}</span>
          <div className="space-copy"><h3>{space.title}</h3><p>{space.copy}</p></div>
        </article>)} </div>
      </section>

      <section className="how-section" id="how"><p className="home-kicker">Everything connected</p><h2>Less chasing. More living.</h2><div className="benefit-grid"><p><b>Notices</b> Keep every update visible.</p><p><b>Bookings</b> Reserve amenities in seconds.</p><p><b>Support</b> Track every request with ease.</p></div></section>
    </main>
  </div>;
}

export default LandingPage;
