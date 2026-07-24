import { Link } from 'react-router-dom';
import './VideoPage.css';

function VideoPage() {
  return (
    <div className="video-page">
      <div className="video-shell">
        <header className="video-header">
          <Link className="brand" to="/">
            <span className="brand-mark">S</span>
            <span>
              <strong>SocietyOS</strong>
              <small>Management Suite</small>
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
                <h1>See how SocietyOS makes community operations effortless.</h1>
                <p>
                  From visitor approvals to maintenance reminders, everything stays organized in
                  one calm, connected workspace.
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
