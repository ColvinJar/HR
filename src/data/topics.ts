import type { Topic } from '../types';

export const topics: Topic[] = [
  { id: 'ferie', label: 'Ferie', description: 'Ferieavvikling, feriepenger og planlegging.' },
  { id: 'arbeidstid', label: 'Arbeidstid', description: 'Arbeidstid, pauser, hviletid og overtid.' },
  { id: 'fravaer', label: 'Fravær', description: 'Sykefravær, oppfølging og tilrettelegging på et overordnet nivå.' },
  { id: 'rekruttering', label: 'Rekruttering', description: 'Stillingsutlysning, intervjuer og fagspesialistbehov.' },
  { id: 'onboarding', label: 'Onboarding', description: 'Planer, ansvar og trygg oppstart i ny rolle.' },
  { id: 'arbeidsmiljo', label: 'Arbeidsmiljø', description: 'Trygt arbeidsmiljø, forebygging og praksisnær støtte.' },
  { id: 'lederstotte', label: 'Lederstøtte', description: 'Praktisk støtte for ledere i krevende HR-situasjoner.' }
];
