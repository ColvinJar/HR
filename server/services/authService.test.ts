import { describe, expect, it, vi } from 'vitest';
import { getAuthConfig, resolveSession } from './authService.js';

describe('authService', () => {
  it('uses mock auth by default', () => {
    vi.stubEnv('AUTH_PROVIDER', undefined);

    const config = getAuthConfig();

    expect(config.provider).toBe('mock');
    expect(config.manualRoleSwitchAllowed).toBe(true);
  });

  it('parses Entra-style headers when provider is enabled', () => {
    vi.stubEnv('AUTH_PROVIDER', 'entra-id');
    vi.stubEnv('ENTRA_TENANT_ID', 'tenant-123');
    vi.stubEnv('ENTRA_CLIENT_ID', 'client-123');

    const principal = {
      userId: 'entra-user-1',
      userDetails: 'leder@kommune.no',
      claims: [{ typ: 'roles', val: 'leder' }]
    };

    const session = resolveSession({
      headers: {
        'x-ms-client-principal': Buffer.from(JSON.stringify(principal)).toString('base64'),
        'x-ms-client-principal-name': 'leder@kommune.no',
        'x-ms-client-principal-id': 'entra-user-1'
      }
    } as never);

    expect(session.provider).toBe('entra-id');
    expect(session.role).toBe('leder');
    expect(session.displayName).toBe('leder@kommune.no');

    vi.unstubAllEnvs();
  });
});
