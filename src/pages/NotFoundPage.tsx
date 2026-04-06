import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="card not-found-card">
      <p className="eyebrow">404</p>
      <h2>Siden finnes ikke</h2>
      <p className="muted">Gå tilbake til forsiden eller åpne chatten for å finne riktig inngang.</p>
      <div className="hero-actions">
        <Link to="/" className="primary-button">
          Gå til forsiden
        </Link>
        <Link to="/chat" className="secondary-button">
          Åpne chat
        </Link>
      </div>
    </section>
  );
}
