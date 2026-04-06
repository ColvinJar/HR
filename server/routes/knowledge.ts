import type { FastifyInstance } from 'fastify';
import type {
  KnowledgeCardsResponse,
  KnowledgeDocumentsResponse,
  KnowledgeIngestStatusResponse,
  UserRole
} from '../../shared/contracts.js';
import {
  listDocuments,
  listDocumentsForRole,
  listKnowledgeCards
} from '../repositories/knowledgeRepository.js';
import {
  getKnowledgeIngestStatus,
  loadKnowledgeSources
} from '../services/knowledgeIngestService.js';

export async function knowledgeRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { search?: string }; Reply: KnowledgeCardsResponse }>(
    '/knowledge/cards',
    async (request) => ({
      cards: listKnowledgeCards(request.query.search)
    })
  );

  app.get<{ Querystring: { role?: UserRole }; Reply: KnowledgeDocumentsResponse }>(
    '/knowledge/documents',
    async (request) => ({
      documents: request.query.role ? listDocumentsForRole(request.query.role) : listDocuments()
    })
  );

  app.get<{ Reply: KnowledgeIngestStatusResponse }>('/knowledge/ingest/status', async () =>
    getKnowledgeIngestStatus()
  );

  app.post<{ Reply: KnowledgeIngestStatusResponse }>('/knowledge/ingest/reload', async () => {
    await loadKnowledgeSources();
    return getKnowledgeIngestStatus();
  });
}
