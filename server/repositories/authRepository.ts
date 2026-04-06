import type { AuthSession, UserRole } from '../../shared/contracts.js';

let session: AuthSession = {
  userId: 'mock-user-1',
  displayName: 'Ola Nordmann',
  role: 'ansatt',
  provider: 'mock',
  isAuthenticated: true,
  authenticatedAt: new Date().toISOString(),
  availableRoles: ['ansatt', 'leder', 'hr']
};

export function getSession() {
  return session;
}

export function switchRole(role: UserRole) {
  if (!session.availableRoles.includes(role)) {
    throw new Error(`Role ${role} is not available for this session`);
  }

  session = {
    ...session,
    role,
    authenticatedAt: new Date().toISOString()
  };

  return session;
}
