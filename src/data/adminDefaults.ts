import type { AdminConfig } from '../types/index.js';

export const defaultAdminConfig: AdminConfig = {
  municipalityName: 'Eksempel kommune',
  sectors: [
    'helse-velferd',
    'oppvekst-utdanning',
    'bygg-byutvikling',
    'teknisk-drift',
    'sentraladministrasjon'
  ],
  localRoutineLinks: [
    { label: 'Personalhåndbok', url: 'https://intranett.kommune.no/personalhandbok' },
    { label: 'Rutiner for arbeidstid', url: 'https://intranett.kommune.no/arbeidstid' }
  ],
  contactPoints: {
    hr: 'hr@eksempel.kommune.no',
    verneombud: 'verneombud@eksempel.kommune.no',
    tillitsvalgt: 'tillitsvalgt@eksempel.kommune.no',
    juridisk: 'juridisk@eksempel.kommune.no'
  },
  sourcePriority: ['lokal-rutine', 'tariff', 'lovdata', 'arbeidstilsynet', 'annen-offentlig']
};
