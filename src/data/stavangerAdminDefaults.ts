import type { AdminConfig } from '../types/index.js';

export const stavangerAdminConfig: AdminConfig = {
  municipalityName: 'Stavanger kommune',
  sectors: [
    'helse-velferd',
    'oppvekst-utdanning',
    'bygg-byutvikling',
    'teknisk-drift',
    'sentraladministrasjon'
  ],
  localRoutineLinks: [
    {
      label: 'Intern informasjon til ansatte i Stavanger kommune',
      url: 'https://www.stavanger.kommune.no/om-stavanger-kommune/intern-informasjon-til-ansatte-i-stavanger-kommune/'
    },
    {
      label: 'Stavanger intranett og Firmaportal',
      url: 'https://www.stavanger.kommune.no/om-stavanger-kommune/intern-informasjon-til-ansatte-i-stavanger-kommune/'
    }
  ],
  contactPoints: {
    hr: 'Naermeste leder eller HR i tjenesteomradet i Stavanger kommune',
    verneombud: 'Lokalt verneombud i virksomheten',
    tillitsvalgt: 'Lokal tillitsvalgt via virksomheten eller intranett',
    juridisk: 'HR eller juridisk stotte via sentraladministrasjonen'
  },
  sourcePriority: ['lokal-rutine', 'tariff', 'lovdata', 'arbeidstilsynet', 'annen-offentlig']
};
