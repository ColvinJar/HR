import type {
  AdminConfig,
  AnswerSection,
  ChatMessage,
  EscalationAdvice,
  KnowledgeDocument,
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
  /navn|fodselsnummer|fÃ¸dselsnummer|personnummer|diagnose|sykmelding|helseopplysning|adresse|telefonnummer/i;

const highRiskPattern =
  /oppsigelse|avskjed|trakassering|varsling|konflikt|disiplinaer|disiplinÃ¦r|tilrettelegging|personalsak/i;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildEscalation(
  question: string,
  contactPoints: AdminConfig['contactPoints']
): EscalationAdvice | undefined {
  if (!highRiskPattern.test(normalize(question))) {
    return undefined;
  }

  return {
    level: 'critical',
    title: 'Denne saken bor loftes videre',
    reason:
      'Sporsmalet berorer en hoyrisikosak der appen ikke skal vaere endelig beslutningsstotte. Bruk losningen til prosesshjelp og involver riktig funksjon raskt.',
    contacts: [
      `HR: ${contactPoints.hr}`,
      `Tillitsvalgt: ${contactPoints.tillitsvalgt}`,
      `Verneombud: ${contactPoints.verneombud}`,
      `Juridisk radgiver: ${contactPoints.juridisk}`
    ]
  };
}

function scoreDocument(question: string, sector: SectorId, document: KnowledgeDocument) {
  const normalizedQuestion = normalize(question);
  const holidayQuestion =
    normalizedQuestion.includes('ferie') ||
    normalizedQuestion.includes('sommer') ||
    normalizedQuestion.includes('hovedferie');
  const haystack = normalize(
    [document.title, document.summary, ...document.tags, ...document.excerpts.map((excerpt) => excerpt.text)].join(' ')
  );
  const words = normalizedQuestion.split(' ').filter((word) => word.length > 2);
  const keywordScore = words.reduce((score, word) => score + (haystack.includes(word) ? 2 : 0), 0);
  const sectorScore = document.sector === sector ? 4 : document.sector === 'alle' ? 2 : 0;
  const topicScore =
    holidayQuestion && document.topics.includes('ferie')
      ? 5
      : normalizedQuestion.includes('overtid') || normalizedQuestion.includes('arbeidstid')
        ? document.topics.includes('arbeidstid')
          ? 5
          : 0
        : 0;
  const sourceBias =
    holidayQuestion && document.sourceTier === 'lovdata'
      ? 6
      : holidayQuestion && document.sourceTier === 'tariff'
        ? 4
        : 0;

  return keywordScore + sectorScore + topicScore + sourceBias;
}

function pickRelevantDocuments(question: string, sector: SectorId, documents: KnowledgeDocument[]) {
  return [...documents]
    .map((document) => ({ document, score: scoreDocument(question, sector, document) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.document);
}

function buildSourceSection(documents: KnowledgeDocument[]) {
  if (documents.length === 0) {
    return '1. Kommunens rutiner og personalhandbok. 2. Tariff og lokale avtaler. 3. Lovdata. 4. Arbeidstilsynet.';
  }

  return documents
    .map((document, index) => {
      const owner = `${document.owner}${document.canonicalUrl ? ` - ${document.canonicalUrl}` : ''}`;
      return `${index + 1}. ${document.title} (${document.sourceTier}) - ${owner}`;
    })
    .join('\n');
}

function buildHolidayContext(
  question: string,
  municipalityName: string,
  role: UserRole,
  relevantDocuments: KnowledgeDocument[]
) {
  const normalizedQuestion = normalize(question);
  const asksAboutSummer = normalizedQuestion.includes('sommer');
  const asksAboutWeeks = normalizedQuestion.includes('uker') || normalizedQuestion.includes('hvor mange');
  const localDoc = relevantDocuments.find((document) => document.sourceTier === 'lokal-rutine');
  const tariffDoc = relevantDocuments.find((document) => document.sourceTier === 'tariff');

  const short =
    asksAboutSummer && asksAboutWeeks
      ? 'Ja. En ansatt kan kreve 3 uker hovedferie om sommeren. Ferieloven gir rett til 18 virkedager i perioden 1. juni til 30. september.'
      : 'Ferie i kommunen bor besvares konkret: start med ferieloven, og legg sa pa tariff og lokal praksis.';

  const applies = [
    'Ferieloven § 7 gir rett til 18 virkedager hovedferie i hovedferieperioden 1. juni til 30. september.',
    'Restferien er 7 virkedager, og arbeidstaker kan kreve at den gis samlet innen feriearet.',
    tariffDoc
      ? 'I kommunal sektor kommer tariffgrunnlaget i tillegg. Mange ansatte har samlet ferie pa 30 virkedager, men den ekstra ferieuken gir ikke automatisk krav pa mer enn 3 uker akkurat i sommerperioden.'
      : 'Hvis tariff eller lokal avtale gir mer ferie enn loven, ma den ekstra ferien vurderes i tillegg til lovens minimum.'
  ].join(' ');

  const practice = [
    `For ${municipalityName} betyr dette at du normalt kan svare klart pa sommerferie-sporsmalet med 3 uker som lovkrav i sommerperioden.`,
    localDoc
      ? 'Deretter ma leder og ansatt sjekke kommunens intranett eller Firmaportal for lokal ferieplanlegging, frister og bemanningshensyn.'
      : 'Deretter ma leder og ansatt sjekke lokal ferieprosess og eventuelle tariffspor.'
  ].join(' ');

  const caveat = [
    'Hvis arbeidstakeren tiltrer etter 15. august i feriearet, gjelder ikke samme krav pa hovedferie i sommerperioden.',
    'Tvist om tidspunkt, overforing eller avtalefestet ekstraferie ma vurderes mot tariff og lokal praksis.'
  ].join(' ');

  const next = [
    'Et praktisk svar i chat kan vaere: "Du kan kreve 3 uker sammenhengende hovedferie om sommeren etter ferieloven. Dersom du i tillegg har avtalefestet ferie i kommunen, ma tidspunktet for den delen vurderes etter tariff og lokal ferieplanlegging."',
    `Rollen din er registrert som ${role}. Sjekk deretter intern rutine i Stavanger for den konkrete enheten hvis ferieonsker kolliderer.`
  ].join(' ');

  return { short, applies, practice, caveat, next };
}

function buildWorktimeContext(municipalityName: string, sector: SectorId, role: UserRole) {
  return {
    short:
      'Overtid og arbeidstid kan besvares mer konkret enn i dagens MVP: overtid skal ikke vaere en fast ordning, og ansatte skal normalt ha minst 40 prosent overtidsbetaling.',
    applies:
      'Arbeidsmiljoloven setter minimumskrav, og Arbeidstilsynet legger til grunn at overtid bare kan brukes ved et saerlig og tidsavgrenset behov. Tariff og lokale ordninger kan gi bedre vilkar.',
    practice:
      sector === 'helse-velferd'
        ? `I ${municipalityName} bor helse- og velferdssporsmal alltid ses mot faktisk turnus, hviletid, vikarbruk og bemanning for enheten. Rollen din er ${role}.`
        : `I ${municipalityName} bor arbeidstid og overtid ses mot tjenestens faktiske behov, arbeidsplan og lokal rutine. Rollen din er ${role}.`,
    caveat:
      'Nattarbeid, sok- og helgearbeid, beredskap og avvik fra hviletid krever ofte en mer konkret vurdering av tariff og lokal ordning.',
    next:
      'Avklar forst hva som er planlagt arbeidstid, hva som er avvik, og om saken egentlig handler om overtid, forskyvning eller turnusendring. Deretter kontroller lokal rutine i kommunen.'
  };
}

function buildGenericContext(municipalityName: string, role: UserRole) {
  return {
    short:
      `For ${municipalityName} bor svaret starte konkret: hva sier loven, hva sier tariffen, og hva ma sjekkes i kommunens egne rutiner.`,
    applies:
      'KommuneHR skiller mellom lovens minimumskrav, tariff/lokale avtaler og lokal praksis. Det gir tryggere og mer brukbare HR-svar.',
    practice:
      `Bruk sektor, rolle og relevante kunnskapskort for a komme raskt til et praktisk svar. Rollen din er ${role}.`,
    caveat:
      'Hvis saken far konsekvenser for enkeltpersoner eller arbeidsforholdet, skal den vurderes av leder eller HR og ikke bare i chatten.',
    next:
      'Avklar hvilket regelspor sporsmalet tilhorer, sjekk lokal rutine i kommunen, og bruk HR eller tillitsvalgt nar noe er uklart.'
  };
}

export function generateStavangerAssistantMessage(
  question: string,
  sector: SectorId,
  role: UserRole,
  municipalityName: string,
  contactPoints: AdminConfig['contactPoints'],
  documents: KnowledgeDocument[]
): ChatMessage {
  const normalizedQuestion = normalize(question);
  const looksLikeHolidayQuestion =
    normalizedQuestion.includes('ferie') ||
    normalizedQuestion.includes('sommer') ||
    normalizedQuestion.includes('hovedferie');
  const relevantDocuments = pickRelevantDocuments(question, sector, documents);
  const escalation = buildEscalation(question, contactPoints);
  const detectedSensitive = sensitivePattern.test(normalizedQuestion);

  const context =
    looksLikeHolidayQuestion
      ? buildHolidayContext(question, municipalityName, role, relevantDocuments)
      : normalizedQuestion.includes('overtid') ||
          normalizedQuestion.includes('arbeidstid') ||
          normalizedQuestion.includes('turnus')
        ? buildWorktimeContext(municipalityName, sector, role)
        : buildGenericContext(municipalityName, role);

  const sections: AnswerSection[] = [
    { title: 'Kort svar', content: context.short },
    { title: 'Hva som gjelder', content: context.applies },
    { title: 'Hva dette betyr i praksis', content: context.practice },
    { title: 'Forbehold/unntak', content: context.caveat },
    { title: 'Neste steg', content: context.next },
    { title: 'Kildegrunnlag', content: buildSourceSection(relevantDocuments) }
  ];

  return {
    id: createId(),
    sender: 'assistant',
    text: 'Her er en vurdering med Stavanger-kontekst og tydelig skille mellom lov, tariff og lokal praksis.',
    createdAt: new Date().toISOString(),
    sections,
    escalation,
    detectedSensitive
  };
}
