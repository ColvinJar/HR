import { describe, expect, it } from 'vitest';
import { buildServer } from './app.js';

describe('KommuneHR API', () => {
  it('returns config and knowledge cards', async () => {
    const app = await buildServer();

    const configResponse = await app.inject({
      method: 'GET',
      url: '/api/config'
    });

    expect(configResponse.statusCode).toBe(200);
    expect(configResponse.json().municipalityName).toBe('Stavanger kommune');

    const cardsResponse = await app.inject({
      method: 'GET',
      url: '/api/knowledge/cards?search=ferie'
    });

    expect(cardsResponse.statusCode).toBe(200);
    expect(cardsResponse.json().cards.length).toBeGreaterThan(0);

    const sessionResponse = await app.inject({
      method: 'GET',
      url: '/api/auth/session'
    });

    expect(sessionResponse.statusCode).toBe(200);
    expect(sessionResponse.json().session.role).toBe('ansatt');
    expect(sessionResponse.json().session.isAuthenticated).toBe(true);

    const ingestStatusResponse = await app.inject({
      method: 'GET',
      url: '/api/knowledge/ingest/status'
    });

    expect(ingestStatusResponse.statusCode).toBe(200);
    expect(ingestStatusResponse.json().totalDocuments).toBeGreaterThan(0);

    const switchRoleResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/switch-role',
      payload: {
        role: 'leder'
      }
    });

    expect(switchRoleResponse.statusCode).toBe(200);
    expect(switchRoleResponse.json().session.role).toBe('leder');

    await app.close();
  });
});
