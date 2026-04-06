import { defaultAdminConfig } from '../../src/data/adminDefaults.js';
import type { AdminConfig } from '../../shared/contracts.js';

let currentConfig: AdminConfig = structuredClone(defaultAdminConfig);

export function getConfig() {
  return currentConfig;
}

export function updateConfig(next: AdminConfig) {
  currentConfig = structuredClone(next);
  return currentConfig;
}
