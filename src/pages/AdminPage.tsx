import { ChangeEvent } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { saveAdminConfig } from '../services/configApi';
import { useAppStore } from '../store/appStore';

export function AdminPage() {
  const adminConfig = useAppStore((state) => state.adminConfig);
  const updateAdminConfig = useAppStore((state) => state.updateAdminConfig);
  const setAdminConfig = useAppStore((state) => state.setAdminConfig);

  function persistConfig(nextConfig: typeof adminConfig) {
    updateAdminConfig(() => nextConfig);
    void saveAdminConfig(nextConfig).then((config) => setAdminConfig(config));
  }

  function handleContactChange(
    key: keyof typeof adminConfig.contactPoints,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const nextConfig = {
      ...adminConfig,
      contactPoints: {
        ...adminConfig.contactPoints,
        [key]: event.target.value
      }
    };

    persistConfig(nextConfig);
  }

  function handleMunicipalityChange(event: ChangeEvent<HTMLInputElement>) {
    persistConfig({
      ...adminConfig,
      municipalityName: event.target.value
    });
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin"
        title="Kommunekonfigurasjon"
        description="Denne flaten er enkel i MVP, men bygget for senere rollebasert tilgang, validering og sikre integrasjoner."
      />
      <section className="admin-grid">
        <article className="card form-card">
          <label htmlFor="municipalityName">Kommunenavn</label>
          <input
            id="municipalityName"
            value={adminConfig.municipalityName}
            onChange={handleMunicipalityChange}
          />

          <label htmlFor="hrContact">HR-kontakt</label>
          <input
            id="hrContact"
            value={adminConfig.contactPoints.hr}
            onChange={(event) => handleContactChange('hr', event)}
          />

          <label htmlFor="verneombudContact">Verneombud</label>
          <input
            id="verneombudContact"
            value={adminConfig.contactPoints.verneombud}
            onChange={(event) => handleContactChange('verneombud', event)}
          />

          <label htmlFor="tillitsvalgtContact">Tillitsvalgt</label>
          <input
            id="tillitsvalgtContact"
            value={adminConfig.contactPoints.tillitsvalgt}
            onChange={(event) => handleContactChange('tillitsvalgt', event)}
          />

          <label htmlFor="juridiskContact">Juridisk rådgiver</label>
          <input
            id="juridiskContact"
            value={adminConfig.contactPoints.juridisk}
            onChange={(event) => handleContactChange('juridisk', event)}
          />
        </article>

        <article className="card">
          <h3>Kildeprioritering</h3>
          <ol className="ordered-list">
            {adminConfig.sourcePriority.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ol>
          <p className="muted">
            I senere versjoner kan denne listen styres per tema, sektor eller rolle, med tilgangskontroll og revisjonsspor.
          </p>
        </article>
      </section>
    </div>
  );
}
