import { knowledgeCards } from '../../src/data/knowledge.js';
import type { KnowledgeCard, KnowledgeDocument } from '../../shared/contracts.js';
import { getKnowledgeDocuments } from '../services/knowledgeIngestService.js';
const cards: KnowledgeCard[] = knowledgeCards.map((card) => ({
  ...card,
  backingDocumentIds:
    card.id === 'ferie-avvikling'
      ? ['doc-ferie-local', 'doc-ferie-law']
      : card.id === 'arbeidstid-overtid'
        ? ['doc-worktime-turnus', 'doc-worktime-law']
        : card.id === 'onboarding-ny-leder'
          ? ['doc-onboarding-oppvekst']
          : []
}));

export function listKnowledgeCards(search = '') {
  const query = search.trim().toLowerCase();
  if (!query) {
    return cards;
  }

  return cards.filter((card) =>
    [card.title, card.summary, ...card.tags].join(' ').toLowerCase().includes(query)
  );
}

export function listDocuments() {
  return getKnowledgeDocuments();
}

export function listDocumentsForRole(role: KnowledgeDocument['accessRoles'][number]) {
  return getKnowledgeDocuments().filter((document) => document.accessRoles.includes(role));
}
