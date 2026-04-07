export type UserRole = 'ansatt' | 'leder' | 'hr';

export type SectorId =
  | 'helse-velferd'
  | 'oppvekst-utdanning'
  | 'bygg-byutvikling'
  | 'teknisk-drift'
  | 'sentraladministrasjon';

export type TopicId =
  | 'ferie'
  | 'arbeidstid'
  | 'fravaer'
  | 'rekruttering'
  | 'onboarding'
  | 'arbeidsmiljo'
  | 'lederstotte';

export type SourceTier =
  | 'lokal-rutine'
  | 'tariff'
  | 'lovdata'
  | 'arbeidstilsynet'
  | 'annen-offentlig';

export interface NavItem {
  label: string;
  to: string;
}

export interface Topic {
  id: TopicId;
  label: string;
  description: string;
}

export interface Sector {
  id: SectorId;
  label: string;
  shortLabel: string;
  summary: string;
  concerns: string[];
  workflows: string[];
}

export interface KnowledgeSource {
  title: string;
  type: SourceTier;
  owner: string;
  href?: string;
  note?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  summary: string;
  sourceTier: SourceTier;
  owner: string;
  sector: SectorId | 'alle';
  topics: TopicId[];
  tags: string[];
  updatedAt: string;
  sensitivity: 'public' | 'internal' | 'restricted';
  accessRoles: UserRole[];
  canonicalUrl?: string;
  excerpts: Array<{
    id: string;
    heading: string;
    text: string;
    relevanceHints: string[];
  }>;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  category: TopicId;
  sector: SectorId | 'alle';
  summary: string;
  tags: string[];
  sources: KnowledgeSource[];
  backingDocumentIds?: string[];
}

export interface TemplateItem {
  id: string;
  title: string;
  purpose: string;
  audience: UserRole | 'alle';
  bullets: string[];
}

export interface AnswerSection {
  title:
    | 'Kort svar'
    | 'Hva som gjelder'
    | 'Hva dette betyr i praksis'
    | 'Forbehold/unntak'
    | 'Neste steg'
    | 'Kildegrunnlag';
  content: string;
}

export interface EscalationAdvice {
  level: 'info' | 'warning' | 'critical';
  title: string;
  reason: string;
  contacts: string[];
}

export interface SourceHighlight {
  documentId: string;
  title: string;
  owner: string;
  sourceTier: SourceTier;
  heading: string;
  excerpt: string;
  whyItMatters: string;
  canonicalUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  createdAt: string;
  sections?: AnswerSection[];
  sourceHighlights?: SourceHighlight[];
  escalation?: EscalationAdvice;
  detectedSensitive?: boolean;
}

export interface AdminConfig {
  municipalityName: string;
  sectors: SectorId[];
  localRoutineLinks: Array<{ label: string; url: string }>;
  contactPoints: {
    hr: string;
    verneombud: string;
    tillitsvalgt: string;
    juridisk: string;
  };
  sourcePriority: SourceTier[];
}

export interface AssistantAskRequest {
  question: string;
  sector: SectorId;
  role: UserRole;
}

export interface AssistantAskResponse {
  message: ChatMessage;
}

export interface KnowledgeCardsResponse {
  cards: KnowledgeCard[];
}

export interface KnowledgeDocumentsResponse {
  documents: KnowledgeDocument[];
}

export interface AuthSession {
  userId: string;
  displayName: string;
  role: UserRole;
  provider: 'mock' | 'entra-id';
  isAuthenticated: boolean;
  authenticatedAt: string;
  availableRoles: UserRole[];
  loginUrl?: string;
}

export interface AuthSessionResponse {
  session: AuthSession;
}

export interface AuthConfig {
  provider: 'mock' | 'entra-id';
  manualRoleSwitchAllowed: boolean;
  entra: {
    enabled: boolean;
    tenantId?: string;
    clientId?: string;
    authority?: string;
    appRoleClaim?: string;
    headerAuthEnabled: boolean;
  };
}

export interface AuthConfigResponse {
  config: AuthConfig;
}

export interface AuthSwitchRoleRequest {
  role: UserRole;
}

export interface IngestSourceSummary {
  sourceId: string;
  title: string;
  documentCount: number;
  lastLoadedAt: string;
}

export interface KnowledgeIngestStatusResponse {
  totalDocuments: number;
  sources: IngestSourceSummary[];
  lastReloadedAt: string;
}
