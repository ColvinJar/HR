import type { TemplateItem } from '../types';

export const templates: TemplateItem[] = [
  {
    id: 'onboardingplan',
    title: 'Onboardingplan',
    purpose: 'Gir leder en enkel 30-60-90-dagers struktur for oppstart.',
    audience: 'leder',
    bullets: ['Mål for første uke', 'Nødvendige systemtilganger', 'Opplæring i lokale rutiner', 'Samtalepunkter etter 30/60/90 dager']
  },
  {
    id: 'intervjuguide',
    title: 'Intervjuguide',
    purpose: 'Sikrer en strukturert, lik og dokumenterbar intervjuprosess.',
    audience: 'leder',
    bullets: ['Kompetansespørsmål', 'Verdier og samarbeid', 'Praktiske caser', 'Lik behandling av kandidater']
  },
  {
    id: 'medarbeidersamtale',
    title: 'Medarbeidersamtale',
    purpose: 'Støtte for utviklingssamtaler med tydelige tema og oppfølging.',
    audience: 'leder',
    bullets: ['Arbeidsoppgaver og mestring', 'Arbeidsmiljø og samarbeid', 'Kompetansebehov', 'Avtalt oppfølging']
  },
  {
    id: 'oppfolgingsnotat',
    title: 'Oppfølgingsnotat',
    purpose: 'Nøytral struktur for saklig dokumentasjon uten unødig sensitiv detaljlagring.',
    audience: 'hr',
    bullets: ['Tema for samtalen', 'Hva er avtalt', 'Ansvar og frister', 'Behov for videre eskalering']
  },
  {
    id: 'lederstotte',
    title: 'Lederstøtte',
    purpose: 'Kort støttemal for ledere i krevende personalsituasjoner.',
    audience: 'leder',
    bullets: ['Hva er saken', 'Hva vet vi sikkert', 'Hva må avklares', 'Hvem bør involveres videre']
  },
  {
    id: 'intern-faq',
    title: 'Intern FAQ / intranett-tekst',
    purpose: 'Hjelper HR med å omforme svar til enkel intern informasjon.',
    audience: 'hr',
    bullets: ['Kort ingress', 'Hva gjelder', 'Hva ansatte skal gjøre', 'Lenker til rutiner og kontaktpunkt']
  }
];
