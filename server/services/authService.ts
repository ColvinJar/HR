import type { FastifyRequest } from 'fastify';
import type { AuthConfig, AuthSession, UserRole } from '../../shared/contracts.js';
import { getSession, switchRole as switchMockRole } from '../repositories/authRepository.js';

const KNOWN_ROLE_CLAIMS = [
  'roles',
  'role',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
] as const;

function mapRole(value?: string | null): UserRole | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'ansatt' || normalized === 'leder' || normalized === 'hr') {
    return normalized;
  }

  return null;
}

function parseClientPrincipal(headerValue?: string) {
  if (!headerValue) {
    return null;
  }

  try {
    const json = Buffer.from(headerValue, 'base64').toString('utf8');
    return JSON.parse(json) as {
      claims?: Array<{ typ?: string; val?: string }>;
      userId?: string;
      userDetails?: string;
      name_typ?: string;
      role_typ?: string;
    };
  } catch {
    return null;
  }
}

export function getAuthConfig(): AuthConfig {
  const provider = process.env.AUTH_PROVIDER === 'entra-id' ? 'entra-id' : 'mock';
  const tenantId = process.env.ENTRA_TENANT_ID;
  const clientId = process.env.ENTRA_CLIENT_ID;
  const authority =
    tenantId && clientId
      ? `https://login.microsoftonline.com/${tenantId}`
      : undefined;

  return {
    provider,
    manualRoleSwitchAllowed: provider === 'mock',
    entra: {
      enabled: provider === 'entra-id',
      tenantId,
      clientId,
      authority,
      appRoleClaim: process.env.ENTRA_APP_ROLE_CLAIM ?? 'roles',
      headerAuthEnabled: true
    }
  };
}

export function resolveSession(request?: FastifyRequest): AuthSession {
  const config = getAuthConfig();
  if (config.provider === 'mock') {
    return {
      ...getSession(),
      isAuthenticated: true
    };
  }

  const clientPrincipal = parseClientPrincipal(
    request?.headers['x-ms-client-principal'] as string | undefined
  );
  const directRole = mapRole(request?.headers['x-entra-role'] as string | undefined);
  const claims = clientPrincipal?.claims ?? [];
  const claimRoles = claims
    .filter((claim) => claim.typ && KNOWN_ROLE_CLAIMS.includes(claim.typ as (typeof KNOWN_ROLE_CLAIMS)[number]))
    .map((claim) => mapRole(claim.val))
    .filter((value): value is UserRole => value !== null);

  const availableRoles = Array.from(new Set([directRole, ...claimRoles].filter(Boolean))) as UserRole[];
  const isAuthenticated = Boolean(clientPrincipal || request?.headers['x-ms-client-principal-id']);
  const role = availableRoles[0] ?? 'ansatt';
  const name =
    (request?.headers['x-ms-client-principal-name'] as string | undefined) ??
    clientPrincipal?.userDetails ??
    (isAuthenticated ? 'Entra-bruker' : 'Ikke logget inn');
  const userId =
    (request?.headers['x-ms-client-principal-id'] as string | undefined) ??
    clientPrincipal?.userId ??
    (isAuthenticated ? 'entra-user' : 'anonymous');

  return {
    userId,
    displayName: name,
    role,
    provider: 'entra-id',
    isAuthenticated,
    authenticatedAt: new Date().toISOString(),
    availableRoles: availableRoles.length > 0 ? availableRoles : [role],
    loginUrl: isAuthenticated ? undefined : '/.auth/login/aad?post_login_redirect_uri=/'
  };
}

export function switchRole(role: UserRole) {
  const config = getAuthConfig();
  if (config.provider !== 'mock') {
    throw new Error('Manual role switching is disabled when Entra ID is active');
  }

  return switchMockRole(role);
}
