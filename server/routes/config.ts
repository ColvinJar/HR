import type { FastifyInstance } from 'fastify';
import type { AdminConfig } from '../../shared/contracts.js';
import { getConfig, updateConfig } from '../repositories/configRepository.js';

export async function configRoutes(app: FastifyInstance) {
  app.get<{ Reply: AdminConfig }>('/config', async () => getConfig());
  app.put<{ Body: AdminConfig; Reply: AdminConfig }>('/config', async (request) =>
    updateConfig(request.body)
  );
}
