import type {
  AdminConfig,
  AnswerSection,
  ChatMessage,
  EscalationAdvice,
  SectorId,
  UserRole
} from './contracts.js';

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `kh-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sensitivePattern =
  /navn|fødselsnummer|personnummer|diagnose|sykmelding|helseopplysning|adresse|telefonnummer/i;

const highRiskPattern =
  /oppsigelse|avskjed|trakassering|varsling|konflikt|disiplinær|tilrettelegging|personalsak/i;

function buildEscalation(
  question: string,
  contactPoints: AdminConfig['contactPoints']
): EscalationAdvice | undefined {
  if (!highRiskPattern.test(question)) {
    return undefined;
  }

  return {
    level: 'critical',
    title: 'Denne saken bør løftes videre',
    reason:
      'Spørsmålet berører en høyrisikosak der appen ikke skal være endelig beslutningsstøtte. Du bør bruke løsningen til prosesshjelp, ikke til å konkludere alene.',
    contacts: [
      `HR: ${contactPoints.hr}`,
      `Tillitsvalgt: ${contactPoints.tillitsvalgt}`,
      `Verneombud: ${contactPoints.verneombud}`,
      `Juridisk rådgiver: ${contactPoints.juridisk}`
    ]
  };
}

function buildLegalContext(question: string, sector: SectorId) {
  const lower = question.toLowerCase();

  if (lower.includes('ferie')) {
    return {
      short:
        'Ferie reguleres først av ferieloven, men gjennomføring påvirkes ofte av lokal rutine og eventuelle tariffbestemmelser.',
      applies:
        'Lovens minimumskrav er utgangspunktet. Kommunens ferieplanlegging, frister og prioritering mellom ansatte må ses opp mot interne rutiner og avtaler.',
      practice:
        'Sjekk kommunens ferieprosess før du lover noe i teamet. I helsetjenester og drift bør bemanning vurderes tidlig, mens skole og barnehage ofte må samordne ferie med driftsperioder.',
      caveat:
        'Hvis spørsmålet gjelder tvist om tidspunkt, overføring eller særregler, må lokal praksis og tariff vurderes konkret.',
      next:
        'Avklar først lokal rutine, deretter eventuell tariffbestemmelse. Eskalér til leder eller HR ved konflikt om ferieavvikling.'
    };
  }

  if (lower.includes('overtid') || lower.includes('arbeidstid') || lower.includes('turnus')) {
    return {
      short:
        'Arbeidstidsspørsmål må vurderes opp mot arbeidsmiljøloven først, og ofte deretter opp mot tariff, turnusordning og lokal praksis.',
      applies:
        'Lovens minimumskrav for arbeidstid, pauser, hviletid, nattarbeid og overtid gjelder alltid. I kommunen vil turnus, beredskap og lokale avtaler ofte avgjøre hvordan reglene brukes i praksis.',
      practice:
        sector === 'helse-velferd'
          ? 'I helse og velferd bør du kontrollere bemanningsbehov, planlagt turnus, hviletid og bruk av vikar før du konkluderer om overtid eller forskyvning.'
          : 'Bruk lokal arbeidstidsrutine og vurder om behovet kan løses innen ordinær plan før overtid vurderes.',
      caveat:
        'Svaret avhenger ofte av tariff og den konkrete arbeidstidsordningen. Nakne lovspørsmål kan derfor ikke alltid besvares uten lokal kontekst.',
      next:
        'Sammenlign lovkrav med turnusplan, avtaleverk og kommunens rutiner. Be HR om kontroll når spørsmålet gjelder regelmessig overtid eller avvik fra hviletid.'
    };
  }

  if (lower.includes('syk') || lower.includes('fravær')) {
    return {
      short:
        'Ved sykefravær bør appen gi overordnet prosesshjelp, men ikke brukes til vurdering av medisinske eller sensitive personopplysninger.',
      applies:
        'Arbeidsmiljølov, folketrygdregler, lokale rutiner og IA-praksis kan være relevante. Kommunen bør følge egne oppfølgingspunkter og dokumentasjonskrav.',
      practice:
        'Fokuser på oppfølging, dialog, tilrettelegging på overordnet nivå og tydelig rollefordeling mellom leder, HR og ansatte.',
      caveat:
        'Unngå å dele detaljerte helseopplysninger i chatten. Konkrete personalsaker må løftes ut av løsningen.',
      next:
        'Bruk kontaktpunkt for HR ved behov, og involver verneombud eller bedriftshelsetjeneste når arbeidsmiljøspørsmål krever det.'
    };
  }

  return {
    short:
      'Spørsmålet bør vurderes etter kommunens interne rutiner først, deretter relevant lovverk og eventuelle tariffbestemmelser.',
    applies:
      'KommuneHR skiller mellom lovens minimumskrav, lokale rutiner og anbefalt praksis. Det gir tryggere svar og færre feilslutninger i kommunal drift.',
    practice:
      'Velg sektor og rolle for mer presis veiledning, og bruk kunnskapskort eller maler når du trenger et neste steg.',
    caveat:
      'Hvis saken påvirker enkeltpersoner eller kan få personalmessige konsekvenser, bør den vurderes av HR eller leder.',
    next:
      'Avklar hva som er sikkert, hvilke kilder som gjelder, og hvem som bør involveres videre.'
  };
}

export function generateAssistantMessage(
  question: string,
  sector: SectorId,
  role: UserRole,
  contactPoints: AdminConfig['contactPoints']
): ChatMessage {
  const escalation = buildEscalation(question, contactPoints);
  const context = buildLegalContext(question, sector);
  const detectedSensitive = sensitivePattern.test(question);

  const sections: AnswerSection[] = [
    { title: 'Kort svar', content: context.short },
    { title: 'Hva som gjelder', content: context.applies },
    {
      title: 'Hva dette betyr i praksis',
      content: `${context.practice} Rollen din er registrert som ${role}.`
    },
    { title: 'Forbehold/unntak', content: context.caveat },
    { title: 'Neste steg', content: context.next },
    {
      title: 'Kildegrunnlag',
      content:
        '1. Kommunens rutiner og personalhåndbok. 2. Tariff og lokale avtaler. 3. Lovdata for lov og forskrift. 4. Arbeidstilsynet for praktisk veiledning.'
    }
  ];

  return {
    id: createId(),
    sender: 'assistant',
    text: 'Her er en strukturert vurdering basert på valgt sektor, rolle og kommunalt kildehierarki.',
    createdAt: new Date().toISOString(),
    sections,
    escalation,
    detectedSensitive
  };
}
