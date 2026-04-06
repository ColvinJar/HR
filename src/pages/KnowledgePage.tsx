import { useEffect, useState } from 'react';
import { KnowledgeCardList } from '../components/knowledge/KnowledgeCardList';
import { PageHeader } from '../components/ui/PageHeader';
import {
  fetchKnowledgeCards,
  fetchKnowledgeDocuments
} from '../services/knowledgeApi';
import { useAppStore } from '../store/appStore';
import type {
  IngestSourceSummary,
  KnowledgeCard,
  KnowledgeDocument
} from '../types';
import { apiRequest } from '../services/apiClient';

export function KnowledgePage() {
  const [search, setSearch] = useState('');
  const [cards, setCards] = useState<KnowledgeCard[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [ingestSources, setIngestSources] = useState<IngestSourceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedRole = useAppStore((state) => state.selectedRole);

  useEffect(() => {
    setIsLoading(true);
    void Promise.all([
      fetchKnowledgeCards(search),
      fetchKnowledgeDocuments(selectedRole),
      apiRequest<{ sources: IngestSourceSummary[] }>('/knowledge/ingest/status')
    ])
      .then(([cardResponse, documentResponse, ingestResponse]) => {
        setCards(cardResponse.cards);
        setDocuments(documentResponse.documents);
        setIngestSources(ingestResponse.sources);
      })
      .finally(() => setIsLoading(false));
  }, [search, selectedRole]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Kunnskapsbase"
        title="Søk i lover, rutiner og tema"
        description="Her kan kommunen senere koble til interne dokumenter, Lovdata og praktiske veiledere på en kontrollert måte."
      />
      <section className="card search-card">
        <label htmlFor="knowledge-search">Søk i kunnskapskort</label>
        <input
          id="knowledge-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Søk etter ferie, arbeidstid, onboarding eller annet tema"
        />
      </section>
      <section className="dashboard-grid">
        <article className="card">
          <h3>RAG-klare dokumenter</h3>
          <p className="muted">
            {documents.length} dokumenter er tilgjengelige for rollen din. Disse er strukturert med
            kildeprioritet, tema, sektor, tilgang og utdrag for senere retrieval.
          </p>
        </article>
        <article className="card">
          <h3>Kildehierarki i backend</h3>
          <ol className="ordered-list">
            <li>Kommunens rutiner og personalhåndbok</li>
            <li>Tariff og lokale avtaler</li>
            <li>Lovdata</li>
            <li>Arbeidstilsynet</li>
            <li>Andre offentlige kilder</li>
          </ol>
        </article>
      </section>
      <section className="card">
        <h3>Ingest-kilder</h3>
        <div className="tag-row">
          {ingestSources.map((source) => (
            <span key={source.sourceId} className="pill secondary">
              {source.title}: {source.documentCount}
            </span>
          ))}
        </div>
      </section>
      <KnowledgeCardList search={search} cards={cards} isLoading={isLoading} />
    </div>
  );
}
