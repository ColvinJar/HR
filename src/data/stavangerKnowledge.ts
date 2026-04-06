import type { KnowledgeCard } from '../types/index.js';

export const stavangerKnowledgeCards: KnowledgeCard[] = [
  {
    id: 'ferie-avvikling',
    title: 'Ferie i Stavanger kommune',
    category: 'ferie',
    sector: 'alle',
    summary:
      'Kombinerer Stavanger kommunes interne rutinespor med ferieloven og tariff i kommunesektoren.',
    tags: ['ferie', 'sommerferie', 'hovedferie', 'stavanger', 'tariff'],
    sources: [
      {
        title: 'Intern informasjon til ansatte i Stavanger kommune',
        type: 'lokal-rutine',
        owner: 'Stavanger kommune',
        href: 'https://www.stavanger.kommune.no/om-stavanger-kommune/intern-informasjon-til-ansatte-i-stavanger-kommune/'
      },
      {
        title: 'Ferieloven § 7',
        type: 'lovdata',
        owner: 'Lovdata',
        href: 'https://lovdata.no/lov/1988-04-29-21/%C2%A78'
      },
      {
        title: 'KS om ferie i kommunesektoren',
        type: 'tariff',
        owner: 'KS',
        note: 'Brukes som tariffspor for kommunal ferie utover lovens minimum'
      }
    ]
  },
  {
    id: 'arbeidstid-overtid',
    title: 'Arbeidstid og overtid i Stavanger kommune',
    category: 'arbeidstid',
    sector: 'helse-velferd',
    summary:
      'Skiller mellom arbeidsmiljolovens minimumskrav, Arbeidstilsynets veiledning og lokal turnuspraksis.',
    tags: ['arbeidstid', 'overtid', 'turnus', 'hviletid', 'stavanger'],
    sources: [
      {
        title: 'Stavanger intranett og Firmaportal',
        type: 'lokal-rutine',
        owner: 'Stavanger kommune',
        href: 'https://www.stavanger.kommune.no/om-stavanger-kommune/intern-informasjon-til-ansatte-i-stavanger-kommune/'
      },
      {
        title: 'Arbeidstilsynet om overtid',
        type: 'arbeidstilsynet',
        owner: 'Arbeidstilsynet',
        href: 'https://www.arbeidstilsynet.no/arbeidstid-og-organisering/arbeidstid/overtid/'
      },
      {
        title: 'Arbeidsmiljoloven om arbeidstid',
        type: 'lovdata',
        owner: 'Lovdata'
      }
    ]
  },
  {
    id: 'onboarding-ny-leder',
    title: 'Onboarding og tilgang i Stavanger kommune',
    category: 'onboarding',
    sector: 'oppvekst-utdanning',
    summary:
      'Viser at nyansatte og ledere ma inn i kommunens interne kanaler tidlig for a finne lokale rutiner og kontaktflater.',
    tags: ['onboarding', 'leder', 'oppvekst', 'firmaportal', 'intranett'],
    sources: [
      {
        title: 'Intern informasjon til ansatte i Stavanger kommune',
        type: 'lokal-rutine',
        owner: 'Stavanger kommune',
        href: 'https://www.stavanger.kommune.no/om-stavanger-kommune/intern-informasjon-til-ansatte-i-stavanger-kommune/'
      }
    ]
  },
  {
    id: 'rekruttering-spesialister',
    title: 'Rekruttering og oppstart av fagspesialister',
    category: 'rekruttering',
    sector: 'bygg-byutvikling',
    summary:
      'Forbereder ledere pa at lokale rutiner, dokumentasjon og intern tilgang ma pa plass tidlig i Stavanger kommune.',
    tags: ['rekruttering', 'byggesak', 'fagspesialist', 'stavanger'],
    sources: [
      {
        title: 'Intern informasjon til ansatte i Stavanger kommune',
        type: 'lokal-rutine',
        owner: 'Stavanger kommune',
        href: 'https://www.stavanger.kommune.no/om-stavanger-kommune/intern-informasjon-til-ansatte-i-stavanger-kommune/'
      }
    ]
  }
];
