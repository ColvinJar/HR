import { stavangerKnowledgeCards } from '../../src/data/stavangerKnowledge.js';
import type { KnowledgeCard, KnowledgeDocument } from '../../shared/contracts.js';
import { getKnowledgeDocuments } from '../services/knowledgeIngestService.js';
const cards: KnowledgeCard[] = stavangerKnowledgeCards.map((card) => ({
  ...card,
  backingDocumentIds:
    card.id === 'ferie-avvikling'
      ? [
          'doc-stavanger-feriepraksis',
          'doc-stavanger-lonn-feriepenger',
          'doc-ferie-law-main',
          'doc-ks-ferie',
          'doc-ks-fastsetting-ferie',
          'doc-at-feriepenger'
        ]
      : card.id === 'arbeidstid-overtid'
        ? [
            'doc-stavanger-arbeidstidpraksis',
            'doc-stavanger-mintid',
            'doc-at-overtid',
            'doc-at-arbeidstid-overview',
            'doc-aml-overtid-law',
            'doc-aml-arbeidsfri',
            'doc-aml-pauser'
          ]
        : card.id === 'sykefravaer-oppfolging'
          ? [
              'doc-nav-sykefravaer-oppfolging',
              'doc-nav-oppfolgingsplan',
              'doc-stavanger-bedriftshelsetjeneste'
            ]
        : card.id === 'onboarding-ny-leder'
          ? ['doc-stavanger-ansatteinfo']
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
