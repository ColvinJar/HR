import type { AssistantAskResponse, ChatMessage, SectorId, UserRole } from '../types';
import { apiRequest } from './apiClient';

interface AssistantRequest {
  question: string;
  sector: SectorId;
  role: UserRole;
}

export async function askAssistant({
  question,
  sector,
  role
}: AssistantRequest): Promise<ChatMessage> {
  const response = await apiRequest<AssistantAskResponse>('/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({ question, sector, role })
  });

  return response.message;
}
