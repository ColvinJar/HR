import { listDocuments } from '../../../server/repositories/knowledgeRepository.js';
import { generateStavangerAssistantMessage } from '../../../shared/stavangerAssistantEngine.js';
import { stavangerAdminConfig } from '../../data/stavangerAdminDefaults.js';
import type { SectorId, UserRole } from '../../types/index.js';

export function generateAssistantMessage(
  question: string,
  sector: SectorId,
  role: UserRole,
  contactPoints = stavangerAdminConfig.contactPoints
) {
  return generateStavangerAssistantMessage(
    question,
    sector,
    role,
    stavangerAdminConfig.municipalityName,
    contactPoints,
    listDocuments()
  );
}
