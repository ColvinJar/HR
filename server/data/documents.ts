import type { KnowledgeDocument } from '../../shared/contracts.js';

export const seedDocuments: KnowledgeDocument[] = [
  {
    id: 'doc-ferie-local',
    title: 'Personalhåndbok: ferie og ferieplanlegging',
    summary: 'Kommunens lokale rutine for ferieønsker, frister og lederansvar.',
    sourceTier: 'lokal-rutine',
    owner: 'Eksempel kommune',
    sector: 'alle',
    topics: ['ferie'],
    tags: ['ferie', 'frister', 'personalhåndbok'],
    updatedAt: '2026-01-15',
    sensitivity: 'internal',
    accessRoles: ['ansatt', 'leder', 'hr'],
    canonicalUrl: 'https://intranett.kommune.no/personalhandbok/ferie',
    excerpts: [
      {
        id: 'ferie-local-1',
        heading: 'Planlegging',
        text: 'Ferieønsker bør registreres tidlig slik at leder kan vurdere drift, bemanning og samordning i tjenesten.',
        relevanceHints: ['ferieønsker', 'driftsplan', 'leder']
      },
      {
        id: 'ferie-local-2',
        heading: 'Lokal praksis',
        text: 'Ved konkurrerende ferieønsker må kommunen vurdere forsvarlig drift og likebehandling opp mot lokal rutine.',
        relevanceHints: ['lokal praksis', 'likebehandling']
      }
    ]
  },
  {
    id: 'doc-ferie-law',
    title: 'Ferieloven',
    summary: 'Primær lovkilde for ferie, feriepenger og ferieavvikling.',
    sourceTier: 'lovdata',
    owner: 'Lovdata',
    sector: 'alle',
    topics: ['ferie'],
    tags: ['ferieloven', 'lov', 'feriepenger'],
    updatedAt: '2025-12-01',
    sensitivity: 'public',
    accessRoles: ['ansatt', 'leder', 'hr'],
    canonicalUrl: 'https://lovdata.no',
    excerpts: [
      {
        id: 'ferie-law-1',
        heading: 'Minimumskrav',
        text: 'Ferieloven regulerer arbeidstakers rett til ferie og arbeidsgivers plikt til å sikre ferieavvikling.',
        relevanceHints: ['minimumskrav', 'rett til ferie']
      }
    ]
  },
  {
    id: 'doc-worktime-turnus',
    title: 'Rutine for arbeidstid og turnus',
    summary: 'Lokal rutine for vurdering av turnus, overtid og hviletid i døgnkontinuerlige tjenester.',
    sourceTier: 'lokal-rutine',
    owner: 'Eksempel kommune',
    sector: 'helse-velferd',
    topics: ['arbeidstid', 'fravaer'],
    tags: ['arbeidstid', 'turnus', 'overtid', 'hviletid'],
    updatedAt: '2026-02-10',
    sensitivity: 'internal',
    accessRoles: ['leder', 'hr', 'ansatt'],
    canonicalUrl: 'https://intranett.kommune.no/arbeidstid',
    excerpts: [
      {
        id: 'worktime-1',
        heading: 'Turnusvurdering',
        text: 'Leder skal kontrollere hviletid, bemanning, vikarbruk og gjeldende tariff før overtid eller endring i turnus besluttes.',
        relevanceHints: ['turnus', 'bemanning', 'vikar']
      }
    ]
  },
  {
    id: 'doc-worktime-law',
    title: 'Arbeidsmiljøloven om arbeidstid',
    summary: 'Primær lovkilde for arbeidstid, pauser, hviletid, nattarbeid og overtid.',
    sourceTier: 'lovdata',
    owner: 'Lovdata',
    sector: 'alle',
    topics: ['arbeidstid', 'arbeidsmiljo'],
    tags: ['arbeidsmiljøloven', 'arbeidstid', 'overtid'],
    updatedAt: '2025-12-01',
    sensitivity: 'public',
    accessRoles: ['ansatt', 'leder', 'hr'],
    canonicalUrl: 'https://lovdata.no',
    excerpts: [
      {
        id: 'worktime-law-1',
        heading: 'Lovens minimum',
        text: 'Arbeidsmiljøloven setter minimumsgrenser for alminnelig arbeidstid, overtid, pauser og daglig/ukentlig hvile.',
        relevanceHints: ['minimum', 'hviletid', 'overtid']
      }
    ]
  },
  {
    id: 'doc-onboarding-oppvekst',
    title: 'Onboarding i oppvekst og utdanning',
    summary: 'Lokal anbefalt arbeidsflyt for ny leder eller nyansatt i skole og barnehage.',
    sourceTier: 'lokal-rutine',
    owner: 'Eksempel kommune',
    sector: 'oppvekst-utdanning',
    topics: ['onboarding', 'lederstotte', 'rekruttering'],
    tags: ['onboarding', 'oppvekst', 'leder'],
    updatedAt: '2026-03-01',
    sensitivity: 'internal',
    accessRoles: ['leder', 'hr'],
    canonicalUrl: 'https://intranett.kommune.no/onboarding',
    excerpts: [
      {
        id: 'onboarding-1',
        heading: 'Første 90 dager',
        text: 'Oppstart bør omfatte systemtilganger, lokal regelverksforståelse, introduksjon til støttefunksjoner og tidlige oppfølgingssamtaler.',
        relevanceHints: ['90 dager', 'oppstart', 'støttefunksjoner']
      }
    ]
  }
];
