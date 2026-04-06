import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { assistantRoutes } from './routes/assistant.js';
import { authRoutes } from './routes/auth.js';
import { configRoutes } from './routes/config.js';
import { healthRoutes } from './routes/health.js';
import { knowledgeRoutes } from './routes/knowledge.js';
import { loadKnowledgeSources } from './services/knowledgeIngestService.js';

export async function buildServer() {
  const app = Fastify({ logger: false });
  const distPath = join(process.cwd(), 'dist');

  void app.register(cors, {
    origin: true
  });

  await loadKnowledgeSources();

  if (existsSync(distPath)) {
    void app.register(fastifyStatic, {
      root: distPath,
      prefix: '/'
    });
  }

  void app.register(async (api) => {
    void api.register(healthRoutes);
    void api.register(authRoutes, { prefix: '/api' });
    void api.register(configRoutes, { prefix: '/api' });
    void api.register(assistantRoutes, { prefix: '/api' });
    void api.register(knowledgeRoutes, { prefix: '/api' });
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api')) {
      reply.status(404).send({ error: 'Not found' });
      return;
    }

    if (existsSync(join(distPath, 'index.html'))) {
      void reply.type('text/html').sendFile('index.html');
      return;
    }

    reply.status(404).send({ error: 'Frontend not built' });
  });

  return app;
}
