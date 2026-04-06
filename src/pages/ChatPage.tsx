import { useState } from 'react';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatMessageCard } from '../components/chat/ChatMessageCard';
import { PageHeader } from '../components/ui/PageHeader';
import { RoleSectorControls } from '../components/ui/RoleSectorControls';
import { suggestedQuestions } from '../data/suggestions';
import { askAssistant } from '../services/assistantApi';
import { useAppStore } from '../store/appStore';
import type { ChatMessage } from '../types';
import { createId } from '../utils/id';

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedSector = useAppStore((state) => state.selectedSector);
  const selectedRole = useAppStore((state) => state.selectedRole);

  async function handleQuestion(question: string) {
    const userMessage: ChatMessage = {
      id: createId(),
      sender: 'user',
      text: question,
      createdAt: new Date().toISOString()
    };
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    const assistantMessage = await askAssistant({
      question,
      sector: selectedSector,
      role: selectedRole
    });

    setMessages((current) => [...current, assistantMessage]);
    setIsLoading(false);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Chat"
        title="Trygg og strukturert HR-chat"
        description="Velg rolle og sektor først. KommuneHR gir ikke endelige konklusjoner i sensitive personalsaker."
      />

      <RoleSectorControls />

      <section className="chat-layout">
        <div className="chat-thread" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state card">
              <h3>Spør på vanlig norsk</h3>
              <p className="muted">
                Svarene struktureres i kort svar, hva som gjelder, praktisk betydning, forbehold,
                neste steg og kildegrunnlag.
              </p>
              <div className="suggestions">
                {suggestedQuestions.map((question) => (
                  <button
                    type="button"
                    key={question}
                    className="suggestion-chip"
                    onClick={() => handleQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => <ChatMessageCard key={message.id} message={message} />)
          )}
          {isLoading ? (
            <div className="message-card assistant-message" aria-label="KommuneHR vurderer spørsmålet">
              <div className="message-meta">
                <strong>KommuneHR</strong>
                <span>...</span>
              </div>
              <p>Vurderer spørsmålet opp mot kildehierarki, sektor og rolle.</p>
            </div>
          ) : null}
        </div>
        <aside className="chat-sidepanel card">
          <h3>Trygg bruk</h3>
          <ul className="feature-list">
            <li>Del minst mulig personopplysninger.</li>
            <li>Bruk HR, verneombud eller tillitsvalgt ved sensitive saker.</li>
            <li>Kontroller alltid lokal rutine før du konkluderer.</li>
          </ul>
        </aside>
      </section>

      <ChatComposer onSubmit={(question) => void handleQuestion(question)} disabled={isLoading} />
    </div>
  );
}
