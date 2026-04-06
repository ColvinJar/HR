import type { FastifyInstance } from 'fastify';
import type {
  AuthConfigResponse,
  AuthSessionResponse,
  AuthSwitchRoleRequest
} from '../../shared/contracts.js';
import { getAuthConfig, resolveSession, switchRole } from '../services/authService.js';

export async function authRoutes(app: FastifyInstance) {
  app.get<{ Reply: AuthConfigResponse }>('/auth/config', async () => ({
    config: getAuthConfig()
  }));

  app.get<{ Reply: AuthSessionResponse }>('/auth/session', async (request) => ({
    session: resolveSession(request)
  }));

  app.post<{ Body: AuthSwitchRoleRequest; Reply: AuthSessionResponse }>(
    '/auth/switch-role',
    async (request, reply) => {
      try {
        return {
          session: switchRole(request.body.role)
        };
      } catch {
        reply.status(403);
        return {
          session: resolveSession(request)
        };
      }
    }
  );
}
