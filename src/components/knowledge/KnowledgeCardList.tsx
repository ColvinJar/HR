import type { KnowledgeCard } from '../../types';
import { formatSourceTier } from '../../utils/format';

interface KnowledgeCardListProps {
  search: string;
  cards: KnowledgeCard[];
  isLoading?: boolean;
}

export function KnowledgeCardList({ search, cards, isLoading = false }: KnowledgeCardListProps) {
  if (isLoading) {
    return <div className="card muted">Laster kunnskapskort...</div>;
  }

  if (cards.length === 0) {
    return (
      <div className="card muted">
        {search.trim() ? 'Ingen kunnskapskort matchet søket ditt.' : 'Ingen kunnskapskort er tilgjengelige.'}
      </div>
    );
  }

  return (
    <div className="knowledge-grid">
      {cards.map((card) => (
        <article key={card.id} className="card knowledge-card">
          <div className="card-label-row">
            <span className="pill">{card.category}</span>
            <span className="pill secondary">{card.sector === 'alle' ? 'Alle sektorer' : card.sector}</span>
          </div>
          <h3>{card.title}</h3>
          <p className="muted">{card.summary}</p>
          <div className="tag-row">
            {card.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          <div className="sources-block">
            <h4>Kilder</h4>
            <ul>
              {card.sources.map((source) => (
                <li key={source.title}>
                  <strong>{formatSourceTier(source.type)}:</strong> {source.title}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
