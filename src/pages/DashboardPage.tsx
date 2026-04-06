import { Link } from 'react-router-dom';
import { QuickTopicGrid } from '../components/ui/QuickTopicGrid';
import { RoleSectorControls } from '../components/ui/RoleSectorControls';
import { PageHeader } from '../components/ui/PageHeader';
import { sectors } from '../data/sectors';

export function DashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Forside"
        title="Trygg HR-støtte for ansatte, ledere og HR"
        description="KommuneHR hjelper kommunen med å finne riktig kilde, forstå hva som gjelder og vite når en sak må løftes videre."
        actions={
          <div className="hero-actions">
            <Link to="/chat" className="primary-button">
              Start chat
            </Link>
            <Link to="/knowledge" className="secondary-button">
              Åpne kunnskapsbase
            </Link>
          </div>
        }
      />

      <RoleSectorControls />

      <section className="dashboard-grid">
        <article className="card">
          <h3>Raske innganger</h3>
          <QuickTopicGrid />
        </article>
        <article className="card">
          <h3>Hva KommuneHR gjør</h3>
          <ul className="feature-list">
            <li>Skiller mellom lov, tariff, lokal rutine og anbefalt praksis.</li>
            <li>Gir sektorbevisst støtte for helse, oppvekst, bygg, drift og sentraladministrasjon.</li>
            <li>Advarer ved sensitive personopplysninger og eskalerer høyrisikosaker tydelig.</li>
          </ul>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sektorhub</p>
            <h3>Tilpasset kommunal virkelighet</h3>
          </div>
          <Link to="/sectors" className="text-link">
            Se alle sektorer
          </Link>
        </div>
        <div className="sector-preview-grid">
          {sectors.map((sector) => (
            <article key={sector.id} className="sector-preview">
              <h4>{sector.label}</h4>
              <p>{sector.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
