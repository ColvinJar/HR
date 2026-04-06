import type { KnowledgeCard } from '../types/index.js';

export const knowledgeCards: KnowledgeCard[] = [
  {
    id: 'ferie-avvikling',
    title: 'Ferieavvikling i kommunen',
    category: 'ferie',
    sector: 'alle',
    summary: 'Forklarer grunnregler for ferieplanlegging, med plass for lokale rutiner og tariffavklaringer.',
    tags: ['ferie', 'ferieloven', 'planlegging'],
    sources: [
      { title: 'Personalhåndbok: ferie', type: 'lokal-rutine', owner: 'Kommunen', note: 'Plassholder for intern lenke' },
      { title: 'Ferieloven', type: 'lovdata', owner: 'Lovdata' },
      { title: 'Veiledning om ferie', type: 'arbeidstilsynet', owner: 'Arbeidstilsynet' }
    ]
  },
  {
    id: 'arbeidstid-overtid',
    title: 'Arbeidstid, pauser og overtid',
    category: 'arbeidstid',
    sector: 'helse-velferd',
    summary: 'Skiller lovens minimumskrav fra tariff- og turnusspørsmål i driftstunge tjenester.',
    tags: ['arbeidstid', 'overtid', 'turnus'],
    sources: [
      { title: 'Rutine for turnusplanlegging', type: 'lokal-rutine', owner: 'Kommunen', note: 'Plassholder for intern lenke' },
      { title: 'Arbeidsmiljøloven', type: 'lovdata', owner: 'Lovdata' },
      { title: 'Arbeidstid og overtid', type: 'arbeidstilsynet', owner: 'Arbeidstilsynet' }
    ]
  },
  {
    id: 'onboarding-ny-leder',
    title: 'Onboarding av ny leder i oppvekst',
    category: 'onboarding',
    sector: 'oppvekst-utdanning',
    summary: 'Dekker første 90 dager, ansvarslinjer, opplæring og intern forventningsavklaring.',
    tags: ['onboarding', 'leder', 'oppvekst'],
    sources: [
      { title: 'Onboardingrutine', type: 'lokal-rutine', owner: 'Kommunen', note: 'Plassholder for intern lenke' },
      { title: 'Lokale avtaler', type: 'tariff', owner: 'KS/partene' }
    ]
  },
  {
    id: 'rekruttering-spesialister',
    title: 'Rekruttering av fagspesialister',
    category: 'rekruttering',
    sector: 'bygg-byutvikling',
    summary: 'Foreslår en strukturert prosess for stillingsutlysning, intervju og kvalitetssikring.',
    tags: ['rekruttering', 'byggesak', 'fagspesialist'],
    sources: [
      { title: 'Rekrutteringsprosess', type: 'lokal-rutine', owner: 'Kommunen', note: 'Plassholder for intern lenke' },
      { title: 'Praktisk veiledning', type: 'annen-offentlig', owner: 'Offentlig ressurs' }
    ]
  }
];
