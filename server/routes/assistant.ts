import type { FastifyInstance } from 'fastify';
import { generateAssistantMessage } from '../../shared/assistantEngine.js';
import type { AssistantAskRequest, AssistantAskResponse } from '../../shared/contracts.js';
import { resolveSession } from '../services/authService.js';
import { getConfig } from '../repositories/configRepository.js';

export async function assistantRoutes(app: FastifyInstance) {
  app.post<{ Body: AssistantAskRequest; Reply: AssistantAskResponse }>(
    '/assistant/ask',
    async (request) => {
      const config = getConfig();
      const { question, sector, role } = request.body;
      const effectiveRole = resolveSession(request).role ?? role;

      return {
        message: generateAssistantMessage(question, sector, effectiveRole, config.contactPoints)
      };
    }
  );
}
