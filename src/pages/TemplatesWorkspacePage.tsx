import { useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { templates } from '../data/templates';

export function TemplatesWorkspacePage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id ?? '');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId]
  );

  async function handleCopyTemplate() {
    if (!selectedTemplate || !navigator.clipboard) {
      return;
    }

    const content = `${selectedTemplate.title}\n\n${selectedTemplate.bullets
      .map((bullet, index) => `${index + 1}. ${bullet}`)
      .join('\n')}`;

    await navigator.clipboard.writeText(content);
    setCopyStatus('copied');
    window.setTimeout(() => setCopyStatus('idle'), 1800);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Maler og verktoy"
        title="Praktiske maler for ledere og HR"
        description="Velg en mal for a se innholdet og bruke den som utgangspunkt i leder- og HR-arbeid."
      />
      <div className="template-layout">
        <div className="template-grid">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={
                template.id === selectedTemplate?.id
                  ? 'card template-card template-card-button active'
                  : 'card template-card template-card-button'
              }
              onClick={() => {
                setSelectedTemplateId(template.id);
                setCopyStatus('idle');
              }}
              aria-pressed={template.id === selectedTemplate?.id}
            >
              <span className="pill secondary">{template.audience}</span>
              <h3>{template.title}</h3>
              <p className="muted">{template.purpose}</p>
              <p className="template-card-action">Trykk for a apne mal</p>
            </button>
          ))}
        </div>
        {selectedTemplate ? (
          <section className="card template-preview" aria-live="polite">
            <div className="card-label-row">
              <span className="pill">{selectedTemplate.audience}</span>
              <span className="pill secondary">Aktiv mal</span>
            </div>
            <h3>{selectedTemplate.title}</h3>
            <p className="muted">{selectedTemplate.purpose}</p>
            <ol className="ordered-list">
              {selectedTemplate.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ol>
            <div className="template-preview-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => void handleCopyTemplate()}
              >
                {copyStatus === 'copied' ? 'Mal kopiert' : 'Kopier maltekst'}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
