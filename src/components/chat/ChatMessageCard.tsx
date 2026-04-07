import type { ChatMessage } from '../../types';

function sourceTierLabel(sourceTier: NonNullable<ChatMessage['sourceHighlights']>[number]['sourceTier']) {
  switch (sourceTier) {
    case 'lokal-rutine':
      return 'Lokal rutine';
    case 'tariff':
      return 'Tariff';
    case 'lovdata':
      return 'Lovdata';
    case 'arbeidstilsynet':
      return 'Arbeidstilsynet';
    default:
      return 'Offentlig kilde';
  }
}

export function ChatMessageCard({ message }: { message: ChatMessage }) {
  return (
    <article className={`message-card ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}>
      <div className="message-meta">
        <strong>{message.sender === 'user' ? 'Du' : 'KommuneHR'}</strong>
        <span>{new Date(message.createdAt).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p>{message.text}</p>
      {message.detectedSensitive ? (
        <div className="notice warning">
          Ikke del helseopplysninger, personnummer eller andre sensitive persondata i chatten.
        </div>
      ) : null}
      {message.sections ? (
        <div className="answer-sections">
          {message.sections.map((section) => (
            <section key={section.title} className="answer-section">
              <h3>{section.title}</h3>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      ) : null}
      {message.sourceHighlights?.length ? (
        <section className="source-highlights" aria-label="Dokumenttreff brukt i svaret">
          <h3>Dokumenttreff brukt i svaret</h3>
          <div className="source-highlight-list">
            {message.sourceHighlights.map((highlight) => (
              <article key={`${highlight.documentId}-${highlight.heading}`} className="source-highlight-card">
                <div className="card-label-row">
                  <span className="pill">{sourceTierLabel(highlight.sourceTier)}</span>
                  <span className="pill secondary">{highlight.owner}</span>
                </div>
                <h4>{highlight.title}</h4>
                <p className="muted">{highlight.heading}</p>
                <p>{highlight.excerpt}</p>
                <p className="muted">{highlight.whyItMatters}</p>
                {highlight.canonicalUrl ? (
                  <a className="text-link" href={highlight.canonicalUrl} target="_blank" rel="noreferrer">
                    Apne kilde
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {message.escalation ? (
        <div className={`notice ${message.escalation.level}`}>
          <strong>{message.escalation.title}</strong>
          <p>{message.escalation.reason}</p>
          <ul>
            {message.escalation.contacts.map((contact) => (
              <li key={contact}>{contact}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
