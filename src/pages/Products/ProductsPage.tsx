import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import Icon from '../../components/Icon';
import { CATEGORIES, PRODUCTS } from '../../constants/products';
import './ProductsPage.css';

export default function ProductsPage() {
  const { currentUser, userProfile, userRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');

  const activeCategory = searchParams.get('category') || 'All';
  const setActiveCategory = (cat: string) => {
    if (cat === 'All') { setSearchParams({}); } else { setSearchParams({ category: cat }); }
  };

  const displayName = userProfile?.displayName ?? currentUser?.email?.split('@')[0];
  const dashPath = userRole === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="products-page">
      <header className="products-header">
        <div className="products-header-inner">
          <Link className="products-brand" to="/">
            <Logo size={24} />
          </Link>
          <div className="products-header-cta">
            {currentUser && displayName ? (
              <Link className="btn btn-blue" to={dashPath}>
                {displayName}
                <Icon name="arrowRight" size={15} strokeWidth={2} />
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">Login</Link>
                <Link className="btn btn-solid" to="/register">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="products-main">
        <div className="products-intro">
          <h1>The whole market.</h1>
          <p>Everything local vendors are selling right now, by category.</p>
        </div>

        <div className="products-search">
          <Icon name="search" size={18} className="products-search-icon" />
          <input
            type="text"
            placeholder="Search products or vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="products-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`products-chip${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="products-empty">No products match your search.</div>
        ) : (
          <div className="products-grid">
            {filtered.map((p) => (
              <div key={p.name} className="product-card">
                <img className="product-card-image" src={p.image} alt={p.name} loading="lazy" />
                <div className="product-card-body">
                  <div className="product-card-tag">{p.category}</div>
                  <div className="product-card-name">{p.name}</div>
                  <div className="product-card-vendor">by {p.vendor}</div>
                  <div className="product-card-meta">
                    <span className="product-card-price">{p.price}</span>
                  </div>
                  <Link to="/register/buyer" className="product-card-btn">
                    Shop now
                    <Icon name="arrowRight" size={15} strokeWidth={2} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
