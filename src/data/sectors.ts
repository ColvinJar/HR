import type { Sector } from '../types';

export const sectors: Sector[] = [
  {
    id: 'helse-velferd',
    label: 'Helse og velferd',
    shortLabel: 'Helse',
    summary: 'Støtte for turnus, bemanning, sykefravær, vikarbruk og heltidskultur.',
    concerns: ['Turnus og nattarbeid', 'Bemanning og vikarbruk', 'Sykefravær og oppfølging', 'Heltid og deltid'],
    workflows: ['Vurder arbeidstid opp mot lov og tariff', 'Avklar lokal turnusrutine', 'Eskalér ved helse- og personalsensitiv sak']
  },
  {
    id: 'oppvekst-utdanning',
    label: 'Oppvekst og utdanning',
    shortLabel: 'Oppvekst',
    summary: 'Støtte for ledere med høy administrativ belastning, onboarding og kompetanseutvikling.',
    concerns: ['Onboarding av nyansatte', 'Kompetanseutvikling', 'Rekruttering og fastholdelse', 'Lederstøtte i travel drift'],
    workflows: ['Bruk onboardingmal', 'Knytt spørsmål til rolle og skole/barnehagekontekst', 'Løft sensitive saker tidlig']
  },
  {
    id: 'bygg-byutvikling',
    label: 'Bygg og byutvikling',
    shortLabel: 'Bygg',
    summary: 'Dekker rekruttering av fagspesialister, regelverkstunge onboardingsløp og dokumentasjonskrav.',
    concerns: ['Fagspesialist-rekruttering', 'Onboarding til komplisert regelverk', 'Kvalitetssikring', 'Friststyring'],
    workflows: ['Velg rekrutteringsstøtte', 'Bruk dokumentasjonsnære kunnskapskort', 'Eskaler ved usikre regelverkskonflikter']
  },
  {
    id: 'teknisk-drift',
    label: 'Teknisk / drift',
    shortLabel: 'Drift',
    summary: 'Støtte for praktisk drift, beredskap, skift og nær ledelsesoppfølging.',
    concerns: ['Skift og beredskap', 'Arbeidstid ute i drift', 'Fravær i små team', 'Sikker og tydelig oppfølging'],
    workflows: ['Avklar arbeidstidsspørsmål raskt', 'Bruk lederstøtteverktøy', 'Følg opp høyrisikosaker uten detaljlagring']
  },
  {
    id: 'sentraladministrasjon',
    label: 'Sentraladministrasjon',
    shortLabel: 'Admin',
    summary: 'Gir helhetlig støtte til policy, HR-rutiner, dokumentasjon og intern samhandling.',
    concerns: ['Policy og styringsdokumenter', 'HR-koordinering', 'Interne rutiner og FAQ', 'Tverrfaglig rådgivning'],
    workflows: ['Prioriter lokale rutiner først', 'Skilj tydelig mellom lov og anbefaling', 'Hold kontaktpunkter oppdatert']
  }
];
