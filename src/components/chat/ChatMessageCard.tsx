import type { ChatMessage } from '../../types';

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
