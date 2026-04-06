import { PageHeader } from '../components/ui/PageHeader';
import { sectors } from '../data/sectors';

export function SectorsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Sektorhub"
        title="Kommunale sektorer med ulike HR-behov"
        description="KommuneHR tilpasser språk, forslag og arbeidsflyter til sektorens hverdag."
      />
      <div className="sector-page-grid">
        {sectors.map((sector) => (
          <article key={sector.id} className="card sector-detail-card">
            <div className="card-label-row">
              <span className="pill">{sector.shortLabel}</span>
            </div>
            <h3>{sector.label}</h3>
            <p className="muted">{sector.summary}</p>
            <div>
              <h4>Typiske problemstillinger</h4>
              <ul className="feature-list">
                {sector.concerns.map((concern) => (
                  <li key={concern}>{concern}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Anbefalt arbeidsflyt</h4>
              <ol className="ordered-list">
                {sector.workflows.map((workflow) => (
                  <li key={workflow}>{workflow}</li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
