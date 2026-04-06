import type { KnowledgeCardsResponse, KnowledgeDocumentsResponse, UserRole } from '../types';
import { apiRequest } from './apiClient';

export function fetchKnowledgeCards(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest<KnowledgeCardsResponse>(`/knowledge/cards${query}`);
}

export function fetchKnowledgeDocuments(role?: UserRole) {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  return apiRequest<KnowledgeDocumentsResponse>(`/knowledge/documents${query}`);
}
