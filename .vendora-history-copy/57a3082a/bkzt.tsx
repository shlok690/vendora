import { Link } from 'react-router-dom';
import './VideoPage.css';

function VideoPage() {
  return (
    <div className="video-page">
      <div className="video-shell">
        <header className="video-header">
          <Link className="brand" to="/">
            <span className="brand-mark">V</span>
            <span>
              <strong>Vendora</strong>
              <small>Vendor Marketplace</small>
            </span>
          </Link>
          <Link className="back-link" to="/">
            Back home
          </Link>
        </header>

        <main className="video-content">
          <section className="video-player-card">
            <div className="video-player">
              <div className="video-overlay">
                <p className="eyebrow">Intro preview</p>
                <h1>See how Vendora makes local selling and shopping effortless.</h1>
                <p>
                  From storefront setup to customer discovery, everything stays easy,
                  connected, and beautifully simple.
                </p>
                <button className="primary-button" type="button">
                  Play intro
                </button>
              </div>
            </div>
          </section>

          <aside className="video-info-card">
            <h2>What you’ll see</h2>
            <ul>
              <li>Resident and visitor management at a glance</li>
              <li>Fast maintenance billing and reminders</li>
              <li>Notice board and complaint workflows</li>
              <li>Simple tools for staff and committee members</li>
            </ul>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default VideoPage;
