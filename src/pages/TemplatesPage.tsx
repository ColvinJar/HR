import { PageHeader } from '../components/ui/PageHeader';
import { templates } from '../data/templates';

export function TemplatesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Maler og verktøy"
        title="Praktiske maler for ledere og HR"
        description="MVP-en viser korte, gjenbrukbare strukturer som senere kan kobles mot interne dokumentmaler."
      />
      <div className="template-grid">
        {templates.map((template) => (
          <article key={template.id} className="card template-card">
            <span className="pill secondary">{template.audience}</span>
            <h3>{template.title}</h3>
            <p className="muted">{template.purpose}</p>
            <ul className="feature-list">
              {template.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
