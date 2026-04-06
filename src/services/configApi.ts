import type { AdminConfig } from '../types';
import { apiRequest } from './apiClient';

export function fetchAdminConfig() {
  return apiRequest<AdminConfig>('/config');
}

export function saveAdminConfig(config: AdminConfig) {
  return apiRequest<AdminConfig>('/config', {
    method: 'PUT',
    body: JSON.stringify(config)
  });
}
