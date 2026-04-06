import { stavangerAdminConfig } from '../../src/data/stavangerAdminDefaults.js';
import type { AdminConfig } from '../../shared/contracts.js';

let currentConfig: AdminConfig = structuredClone(stavangerAdminConfig);

export function getConfig() {
  return currentConfig;
}

export function updateConfig(next: AdminConfig) {
  currentConfig = structuredClone(next);
  return currentConfig;
}
