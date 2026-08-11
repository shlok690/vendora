import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import './ProductsPage.css';

const CATEGORIES = ['All', 'Furniture', 'Clothing', 'Handicrafts', 'Electronics', 'Food & Spices', 'Jewellery'];

const PRODUCTS = [
  { name: 'Bamboo Lamp',       vendor: 'EcoLight Co.',    price: '₹2,200', rating: '4.5', category: 'Furniture',     image: 'https://images.unsplash.com/photo-1578678809569-1a8ead9cb802?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wooden Stool',      vendor: 'Oakcraft',        price: '₹1,350', rating: '4.6', category: 'Furniture',     image: 'https://images.unsplash.com/photo-1634798245965-03669c757183?auto=format&fit=crop&w=400&q=80' },
  { name: 'Linen Kurta',       vendor: 'Weavers Hub',     price: '₹1,800', rating: '4.7', category: 'Clothing',      image: 'https://images.unsplash.com/photo-1727835523545-70ee992b5763?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wool Scarf',        vendor: 'Weavers Hub',     price: '₹650',   rating: '4.4', category: 'Clothing',      image: 'https://images.unsplash.com/photo-1609803384069-19f3e5a70e75?auto=format&fit=crop&w=400&q=80' },
  { name: 'Handwoven Basket',  vendor: 'Riya Crafts',     price: '₹850',   rating: '4.9', category: 'Handicrafts',   image: 'https://images.unsplash.com/photo-1601330862030-1e08c703ac04?auto=format&fit=crop&w=400&q=80' },
  { name: 'Ceramic Mug Set',   vendor: 'Pottery House',   price: '₹1,200', rating: '4.8', category: 'Handicrafts',   image: 'https://images.unsplash.com/photo-1616241673111-508b4662c707?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wireless Earbuds',  vendor: 'TechNook Store',  price: '₹1,499', rating: '4.5', category: 'Electronics',   image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=400&q=80' },
  { name: 'Smart Plug',        vendor: 'TechNook Store',  price: '₹799',   rating: '4.3', category: 'Electronics',   image: 'https://images.unsplash.com/photo-1586943029669-98ae685c5c4c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Organic Turmeric',  vendor: 'Spice Trail',     price: '₹350',   rating: '4.6', category: 'Food & Spices', image: 'https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Wild Honey',        vendor: 'Spice Trail',     price: '₹480',   rating: '4.7', category: 'Food & Spices', image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=400&q=80' },
  { name: 'Silver Earrings',   vendor: 'GoldSmith Works', price: '₹950',   rating: '4.8', category: 'Jewellery',     image: 'https://images.unsplash.com/photo-1693212793204-bcea856c75fe?auto=format&fit=crop&w=400&q=80' },
  { name: 'Gold Ring',         vendor: 'GoldSmith Works', price: '₹5,200', rating: '4.9', category: 'Jewellery',     image: 'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?auto=format&fit=crop&w=400&q=80' },
];

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
              <Link className="btn btn-blue" to={dashPath}>{displayName} →</Link>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">Login</Link>
                <Link className="btn btn-solid" to="/register">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="products-main">
        <div className="products-intro">
          <h1>Browse all products</h1>
          <p>Explore what local vendors are selling, by category.</p>
        </div>

        <div className="products-search">
          <span className="products-search-icon">🔍</span>
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
                    <span className="product-card-rating">⭐ {p.rating}</span>
                  </div>
                  <Link to="/register/buyer" className="product-card-btn">Shop Now</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
