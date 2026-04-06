import type { FastifyInstance } from 'fastify';
import { generateStavangerAssistantMessage } from '../../shared/stavangerAssistantEngine.js';
import type { AssistantAskRequest, AssistantAskResponse } from '../../shared/contracts.js';
import { resolveSession } from '../services/authService.js';
import { getConfig } from '../repositories/configRepository.js';
import { listDocumentsForRole } from '../repositories/knowledgeRepository.js';

export async function assistantRoutes(app: FastifyInstance) {
  app.post<{ Body: AssistantAskRequest; Reply: AssistantAskResponse }>(
    '/assistant/ask',
    async (request) => {
      const config = getConfig();
      const { question, sector, role } = request.body;
      const effectiveRole = resolveSession(request).role ?? role;
      const documents = listDocumentsForRole(effectiveRole).filter(
        (document) => document.owner !== 'Eksempel kommune'
      );

      return {
        message: generateStavangerAssistantMessage(
          question,
          sector,
          effectiveRole,
          config.municipalityName,
          config.contactPoints,
          documents
        )
      };
    }
  );
}
