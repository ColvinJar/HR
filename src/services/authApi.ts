import type { AuthConfigResponse, AuthSessionResponse, UserRole } from '../types';
import { apiRequest } from './apiClient';

export function fetchAuthConfig() {
  return apiRequest<AuthConfigResponse>('/auth/config');
}

export function fetchAuthSession() {
  return apiRequest<AuthSessionResponse>('/auth/session');
}

export function switchAuthRole(role: UserRole) {
  return apiRequest<AuthSessionResponse>('/auth/switch-role', {
    method: 'POST',
    body: JSON.stringify({ role })
  });
}
