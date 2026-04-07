import type {
  AdminConfig,
  AnswerSection,
  ChatMessage,
  EscalationAdvice,
  KnowledgeDocument,
  SectorId,
  SourceHighlight,
  SourceTier,
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

interface ExcerptMatch {
  document: KnowledgeDocument;
  excerpt: KnowledgeDocument['excerpts'][number];
  score: number;
  matchedTerms: string[];
}

interface AnswerContext {
  intro: string;
  sections: AnswerSection[];
  sourceHighlights: SourceHighlight[];
}

const stopWords = new Set([
  'alle',
  'bare',
  'blir',
  'den',
  'det',
  'dette',
  'eller',
  'for',
  'fra',
  'har',
  'hva',
  'hvem',
  'hvor',
  'hvordan',
  'ikke',
  'kan',
  'kommune',
  'kommunen',
  'med',
  'men',
  'mot',
  'nar',
  'og',
  'om',
  'pa',
  'skal',
  'som',
  'til',
  'vil'
]);

const termExpansions: Record<string, string[]> = {
  ferie: ['hovedferie', 'restferie', 'sommerferie', 'feriedager', 'feriepenger'],
  sommer: ['sommerferie', 'hovedferie', '18', 'virkedager'],
  sommerferie: ['hovedferie', 'ferie', '18', 'virkedager'],
  feriepenger: ['opptjening', 'prosent', '10', '12', 'lonn'],
  arbeidstid: ['arbeidsplan', 'hviletid', 'pause', 'pauser', 'turnus'],
  overtid: ['merarbeid', 'overtidstillegg', '40', 'prosent'],
  turnus: ['arbeidstid', 'hviletid', 'bemanning'],
  hviletid: ['arbeidsfri', '11', '35', 'timer'],
  pause: ['pauser', 'matpause'],
  sykefravaer: ['sykmeldt', 'oppfolgingsplan', 'dialogmote'],
  sykmeldt: ['sykefravaer', 'oppfolgingsplan', 'dialogmote', 'tilrettelegging'],
  syk: ['sykmeldt', 'sykefravaer', 'oppfolgingsplan'],
  stavanger: ['firmaportal', 'mintid', 'intranett']
};

function tokenizeQuestion(question: string) {
  return normalize(question)
    .split(' ')
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

function expandTerms(question: string) {
  const tokens = tokenizeQuestion(question);
  return [...new Set(tokens.flatMap((term) => [term, ...(termExpansions[term] ?? [])]))];
}

function sourceTierScore(sourcePriority: SourceTier[], tier: SourceTier) {
  const index = sourcePriority.indexOf(tier);
  return index === -1 ? 1 : sourcePriority.length - index;
}

function scoreExcerpt(
  question: string,
  sector: SectorId,
  sourcePriority: SourceTier[],
  document: KnowledgeDocument,
  excerpt: KnowledgeDocument['excerpts'][number]
): ExcerptMatch {
  const normalizedQuestion = normalize(question);
  const terms = expandTerms(question);
  const title = normalize(document.title);
  const summary = normalize(document.summary);
  const tags = normalize(document.tags.join(' '));
  const heading = normalize(excerpt.heading);
  const text = normalize(excerpt.text);
  const hints = normalize(excerpt.relevanceHints.join(' '));
  const matchedTerms = new Set<string>();
  let score = 0;

  for (const term of terms) {
    let termScore = 0;

    if (hints.includes(term)) {
      termScore = 9;
    } else if (heading.includes(term)) {
      termScore = 8;
    } else if (title.includes(term)) {
      termScore = 7;
    } else if (tags.includes(term)) {
      termScore = 6;
    } else if (text.includes(term)) {
      termScore = 5;
    } else if (summary.includes(term)) {
      termScore = 4;
    }

    if (termScore > 0) {
      score += termScore;
      matchedTerms.add(term);
    }
  }

  if (document.sector === sector) {
    score += 6;
  } else if (document.sector === 'alle') {
    score += 3;
  }

  score += sourceTierScore(sourcePriority, document.sourceTier);

  if (normalizedQuestion.includes('lov') && document.sourceTier === 'lovdata') {
    score += 7;
  }

  if (normalizedQuestion.includes('kreve') && document.sourceTier === 'lovdata') {
    score += 5;
  }

  if (normalizedQuestion.includes('stavanger') && normalize(document.owner).includes('stavanger')) {
    score += 5;
  }

  if (/\bhvor mange|hvor mye|uker|dager|timer|prosent\b/.test(normalizedQuestion) && /\d/.test(text)) {
    score += 5;
  }

  if (normalizedQuestion.includes('sommer') && text.includes('18 virkedager')) {
    score += 9;
  }

  if (normalizedQuestion.includes('feriepenger') && /\b10|12\b/.test(text)) {
    score += 8;
  }

  if (normalizedQuestion.includes('overtid') && text.includes('40 prosent')) {
    score += 8;
  }

  if (normalizedQuestion.includes('sykmeld') && /\b4 uker|7 uker|26 uker\b/.test(text)) {
    score += 8;
  }

  return {
    document,
    excerpt,
    score,
    matchedTerms: [...matchedTerms]
  };
}

function retrieveExcerptMatches(
  question: string,
  sector: SectorId,
  sourcePriority: SourceTier[],
  documents: KnowledgeDocument[]
) {
  const matches = documents
    .flatMap((document) =>
      document.excerpts.map((excerpt) => scoreExcerpt(question, sector, sourcePriority, document, excerpt))
    )
    .filter((match) => match.score >= 12)
    .sort((left, right) => right.score - left.score);

  const uniqueMatches: ExcerptMatch[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const key = `${match.document.id}:${match.excerpt.id}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueMatches.push(match);

    if (uniqueMatches.length === 6) {
      break;
    }
  }

  return uniqueMatches;
}

function pickMatch(matches: ExcerptMatch[], predicate: (match: ExcerptMatch) => boolean) {
  return matches.find(predicate);
}

function sourceLabel(tier: SourceTier) {
  switch (tier) {
    case 'lokal-rutine':
      return 'Lokal rutine';
    case 'tariff':
      return 'Tariff';
    case 'lovdata':
      return 'Lov';
    case 'arbeidstilsynet':
      return 'Arbeidstilsynet';
    default:
      return 'Offentlig kilde';
  }
}

function buildRetrievedSourceSection(matches: ExcerptMatch[]) {
  if (matches.length === 0) {
    return 'Jeg fant ikke gode nok dokumenttreff. Presiser gjerne tema, for eksempel ferie, overtid eller sykefravaer.';
  }

  const documentIds = [...new Set(matches.map((match) => match.document.id))];

  return documentIds
    .map((documentId, index) => {
      const match = matches.find((candidate) => candidate.document.id === documentId)!;
      const url = match.document.canonicalUrl ? ` - ${match.document.canonicalUrl}` : '';
      return `${index + 1}. ${match.document.title} (${sourceLabel(match.document.sourceTier)})${url}`;
    })
    .join('\n');
}

function buildSourceHighlights(matches: ExcerptMatch[]): SourceHighlight[] {
  const prioritizedMatches: ExcerptMatch[] = [];
  const seenDocuments = new Set<string>();

  for (const tier of ['lovdata', 'tariff', 'arbeidstilsynet', 'annen-offentlig', 'lokal-rutine'] as SourceTier[]) {
    const match = matches.find((candidate) => candidate.document.sourceTier === tier);
    if (match && !seenDocuments.has(match.document.id)) {
      prioritizedMatches.push(match);
      seenDocuments.add(match.document.id);
    }
  }

  for (const match of matches) {
    if (prioritizedMatches.length === 3) {
      break;
    }

    if (!seenDocuments.has(match.document.id)) {
      prioritizedMatches.push(match);
      seenDocuments.add(match.document.id);
    }
  }

  return prioritizedMatches.slice(0, 3).map((match) => ({
    documentId: match.document.id,
    title: match.document.title,
    owner: match.document.owner,
    sourceTier: match.document.sourceTier,
    heading: match.excerpt.heading,
    excerpt: match.excerpt.text,
    whyItMatters:
      match.document.sourceTier === 'lovdata'
        ? 'Brukt for lovens minimumskrav.'
        : match.document.sourceTier === 'tariff'
          ? 'Brukt for a vise hva kommunal tariff legger oppa lovens minimum.'
          : match.document.sourceTier === 'lokal-rutine'
            ? 'Brukt for a koble svaret til Stavanger kommunes praksis og interne kanaler.'
            : 'Brukt som offentlig veiledning for praktisk gjennomforing.',
    canonicalUrl: match.document.canonicalUrl
  }));
}

function sectionText(lines: Array<string | undefined>) {
  return lines.filter(Boolean).join('\n');
}

function preferredHighlights(matches: Array<ExcerptMatch | undefined>, fallback: ExcerptMatch[]) {
  const compactMatches = matches.filter(Boolean) as ExcerptMatch[];
  return compactMatches.length > 0 ? compactMatches : fallback;
}

function detectRetrievedIntent(question: string, matches: ExcerptMatch[]) {
  const normalizedQuestion = normalize(question);
  const topicCounts = matches
    .flatMap((match) => match.document.topics)
    .reduce<Record<string, number>>((accumulator, topic) => {
      accumulator[topic] = (accumulator[topic] ?? 0) + 1;
      return accumulator;
    }, {});
  const topTopic = Object.entries(topicCounts).sort((left, right) => right[1] - left[1])[0]?.[0];

  if ((topTopic === 'ferie' || normalizedQuestion.includes('ferie')) && normalizedQuestion.includes('feriepenger')) {
    return 'holiday-pay';
  }

  if (
    (topTopic === 'ferie' || normalizedQuestion.includes('ferie')) &&
    (normalizedQuestion.includes('sommer') || normalizedQuestion.includes('hovedferie'))
  ) {
    return 'summer-holiday';
  }

  if (topTopic === 'ferie' || normalizedQuestion.includes('ferie')) {
    return 'holiday-general';
  }

  if (normalizedQuestion.includes('overtid') || normalizedQuestion.includes('merarbeid')) {
    return 'overtime';
  }

  if (
    topTopic === 'arbeidstid' ||
    normalizedQuestion.includes('arbeidstid') ||
    normalizedQuestion.includes('hviletid') ||
    normalizedQuestion.includes('pause')
  ) {
    return 'worktime-rest';
  }

  if (
    topTopic === 'fravaer' ||
    normalizedQuestion.includes('sykmeld') ||
    normalizedQuestion.includes('sykefravaer') ||
    normalizedQuestion.includes('oppfolgingsplan')
  ) {
    return 'sick-leave-followup';
  }

  return 'generic';
}

function buildRetrievedHolidayAnswer(
  question: string,
  municipalityName: string,
  role: UserRole,
  matches: ExcerptMatch[]
): AnswerContext {
  const lawMatch =
    pickMatch(matches, (match) => match.document.id === 'doc-ferie-law-main') ??
    pickMatch(matches, (match) => match.document.sourceTier === 'lovdata');
  const tariffMatch = pickMatch(matches, (match) => match.document.sourceTier === 'tariff');
  const localMatch =
    pickMatch(matches, (match) => match.document.id === 'doc-stavanger-feriepraksis') ??
    pickMatch(matches, (match) => match.document.sourceTier === 'lokal-rutine');
  const asksAboutSummer = normalize(question).includes('sommer') || normalize(question).includes('hovedferie');
  const short = asksAboutSummer
    ? 'Ja. En ansatt kan kreve 3 uker sammenhengende hovedferie om sommeren. I kommunesektoren er totalferien ofte 5 uker, men lovkravet i hovedferieperioden er 18 virkedager.'
    : 'Ferie ma avklares i tre lag: ferieloven, tariff i kommunesektoren og lokal planlegging i Stavanger kommune.';

  return {
    intro:
      'Jeg fant dokumenttreff i Lovdata, KS og Stavanger kommune. Derfor bygger svaret pa kilder, ikke bare pa temagjetting.',
    sections: [
      { title: 'Kort svar', content: short },
      {
        title: 'Hva som gjelder',
        content: sectionText([
          lawMatch ? `Lov: ${lawMatch.excerpt.text}` : undefined,
          tariffMatch ? `Tariff: ${tariffMatch.excerpt.text}` : undefined,
          localMatch ? `Lokal praksis: ${localMatch.excerpt.text}` : undefined
        ])
      },
      {
        title: 'Hva dette betyr i praksis',
        content: sectionText([
          `${municipalityName} ma fortsatt planlegge ferie lokalt ut fra drift og bemanning.`,
          'Bruk intranett, Firmaportal eller lokal lederlinje for konkrete frister og ferieplanlegging.',
          `Rollen din er registrert som ${role}.`
        ])
      },
      {
        title: 'Forbehold/unntak',
        content:
          'Hvis arbeidstaker tiltrer etter 15. august, gjelder ikke samme krav pa hovedferie i sommerperioden. Tvister om tidspunkt, overforing eller ekstra ferieuke ma vurderes mot tariff og lokal praksis.'
      },
      {
        title: 'Neste steg',
        content:
          'Praktisk svar: "Du kan kreve 3 uker hovedferie om sommeren etter ferieloven. Har du fem ukers ferie i kommunen, ma tidspunktet for den ekstra ferieuken avklares etter tariff og lokal ferieplanlegging i Stavanger."'
      },
      { title: 'Kildegrunnlag', content: buildRetrievedSourceSection(matches) }
    ],
    sourceHighlights: buildSourceHighlights(preferredHighlights([lawMatch, tariffMatch, localMatch], matches))
  };
}

function buildRetrievedHolidayPayAnswer(
  municipalityName: string,
  role: UserRole,
  matches: ExcerptMatch[]
): AnswerContext {
  const lawMatch = pickMatch(matches, (match) => match.document.id === 'doc-ferieloven-feriepenger');
  const guidanceMatch =
    pickMatch(matches, (match) => match.document.id === 'doc-at-feriepenger') ??
    pickMatch(matches, (match) => match.document.sourceTier === 'arbeidstilsynet');
  const localMatch = pickMatch(matches, (match) => match.document.id === 'doc-stavanger-lonn-feriepenger');

  return {
    intro:
      'Jeg fant konkrete dokumenttreff for feriepenger. Svaret kobler ferieloven, offentlig veiledning og Stavanger sitt lokale lonns- og kontaktspor.',
    sections: [
      {
        title: 'Kort svar',
        content:
          'Feriepenger opptjenes aret for ferien. Minstesatsen er normalt 10,2 prosent av feriepengegrunnlaget, og mange kommunalt ansatte har 12 prosent fordi tariffen gir femte ferieuke.'
      },
      {
        title: 'Hva som gjelder',
        content: sectionText([
          lawMatch ? `Lov: ${lawMatch.excerpt.text}` : undefined,
          guidanceMatch ? `Praktisk veiledning: ${guidanceMatch.excerpt.text}` : undefined,
          localMatch ? `Stavanger kommune: ${localMatch.excerpt.text}` : undefined
        ])
      },
      {
        title: 'Hva dette betyr i praksis',
        content: `I ${municipalityName} bor lonnsslipp og utbetaling sjekkes i lokal lonnsportal eller med naermeste leder. Rollen din er registrert som ${role}.`
      },
      {
        title: 'Forbehold/unntak',
        content:
          'Retten til ferie og opptjente feriepenger er ikke det samme. Tariff eller individuell avtale kan gi bedre vilkar enn lovens minimum.'
      },
      {
        title: 'Neste steg',
        content:
          'Sjekk lonnsslipp pa Min side, avklar eventuelle avvik med naermeste leder og bruk Stavanger sine interne kanaler hvis utbetalingen ser feil ut.'
      },
      { title: 'Kildegrunnlag', content: buildRetrievedSourceSection(matches) }
    ],
    sourceHighlights: buildSourceHighlights(preferredHighlights([lawMatch, guidanceMatch, localMatch], matches))
  };
}

function buildRetrievedOvertimeAnswer(
  municipalityName: string,
  sector: SectorId,
  role: UserRole,
  matches: ExcerptMatch[]
): AnswerContext {
  const lawMatch =
    pickMatch(matches, (match) => match.document.id === 'doc-aml-overtid-law') ??
    pickMatch(matches, (match) => match.document.sourceTier === 'lovdata');
  const guidanceMatch =
    pickMatch(matches, (match) => match.document.id === 'doc-at-overtid') ??
    pickMatch(matches, (match) => match.document.sourceTier === 'arbeidstilsynet');
  const localMatch = pickMatch(matches, (match) => match.document.sourceTier === 'lokal-rutine');

  return {
    intro:
      'Jeg fant treff i arbeidsmiljoloven, Arbeidstilsynet og Stavanger-rutiner. Det gir et mer konkret overtidsvar.',
    sections: [
      {
        title: 'Kort svar',
        content:
          'Overtid kan bare brukes ved et saerlig og tidsavgrenset behov. Ansatte skal minst ha 40 prosent overtidsbetaling, og overtid skal ikke bli en fast losning.'
      },
      {
        title: 'Hva som gjelder',
        content: sectionText([
          lawMatch ? `Lov: ${lawMatch.excerpt.text}` : undefined,
          guidanceMatch ? `Praktisk veiledning: ${guidanceMatch.excerpt.text}` : undefined,
          localMatch ? `Lokal praksis: ${localMatch.excerpt.text}` : undefined
        ])
      },
      {
        title: 'Hva dette betyr i praksis',
        content: sectionText([
          sector === 'helse-velferd'
            ? `I ${municipalityName} ma helse- og velferdsenheter kontrollere turnus, hviletid, bemanning og vikarbruk forst.`
            : `I ${municipalityName} ma leder kontrollere arbeidsplan, tjenestebehov og lokal ordning forst.`,
          `Rollen din er registrert som ${role}.`
        ])
      },
      {
        title: 'Forbehold/unntak',
        content:
          'Overtid blandes ofte med merarbeid, forskyvning eller turnusendring. Ved natt, son- og helgearbeid eller avvik fra hviletid ma tariff og lokal ordning vurderes i tillegg.'
      },
      {
        title: 'Neste steg',
        content:
          'Avklar hva som var planlagt arbeidstid, hva som er ekstraarbeid, og sjekk om vilkarene for overtid faktisk er oppfylt.'
      },
      { title: 'Kildegrunnlag', content: buildRetrievedSourceSection(matches) }
    ],
    sourceHighlights: buildSourceHighlights(preferredHighlights([lawMatch, guidanceMatch, localMatch], matches))
  };
}

function buildRetrievedWorktimeAnswer(
  municipalityName: string,
  role: UserRole,
  matches: ExcerptMatch[]
): AnswerContext {
  const ordinaryMatch = pickMatch(matches, (match) => match.document.id === 'doc-aml-alminnelig-arbeidstid');
  const restMatch = pickMatch(matches, (match) => match.document.id === 'doc-aml-arbeidsfri');
  const pauseMatch = pickMatch(matches, (match) => match.document.id === 'doc-aml-pauser');
  const localMatch = pickMatch(matches, (match) => match.document.sourceTier === 'lokal-rutine');

  return {
    intro:
      'Jeg fant dokumenttreff for arbeidstid, pauser og hviletid. Derfor kan svaret vise konkrete minimumstall.',
    sections: [
      {
        title: 'Kort svar',
        content:
          'Hovedreglene er 9 timer i lopet av 24 timer og 40 timer i lopet av 7 dager, minst 11 timer daglig arbeidsfri og 35 timer sammenhengende ukentlig arbeidsfri. Pauser ma ogsa vurderes hvis arbeidsdagen er lang nok.'
      },
      {
        title: 'Hva som gjelder',
        content: sectionText([
          ordinaryMatch ? `Lov om arbeidstid: ${ordinaryMatch.excerpt.text}` : undefined,
          restMatch ? `Lov om arbeidsfri: ${restMatch.excerpt.text}` : undefined,
          pauseMatch ? `Lov om pauser: ${pauseMatch.excerpt.text}` : undefined,
          localMatch ? `Lokal praksis: ${localMatch.excerpt.text}` : undefined
        ])
      },
      {
        title: 'Hva dette betyr i praksis',
        content: `I ${municipalityName} ma arbeidstidsvurderinger holdes opp mot faktisk arbeidsplan og lokal ordning. Rollen din er registrert som ${role}.`
      },
      {
        title: 'Forbehold/unntak',
        content:
          'Tariff, gjennomsnittsberegning, turnus og beredskapsordninger kan endre hvordan grensene brukes i praksis, men bare innenfor lov og avtale.'
      },
      {
        title: 'Neste steg',
        content:
          'Sjekk om sporsmalet gjelder ordinart arbeid, turnus, pause, hviletid eller overtid. Jo smalere sporsmal, desto mer presist svar.'
      },
      { title: 'Kildegrunnlag', content: buildRetrievedSourceSection(matches) }
    ],
    sourceHighlights: buildSourceHighlights(
      preferredHighlights([ordinaryMatch, restMatch, pauseMatch, localMatch], matches)
    )
  };
}

function buildRetrievedSickLeaveAnswer(
  municipalityName: string,
  role: UserRole,
  matches: ExcerptMatch[]
): AnswerContext {
  const followupMatch = pickMatch(matches, (match) => match.document.id === 'doc-nav-sykefravaer-oppfolging');
  const planMatch = pickMatch(matches, (match) => match.document.id === 'doc-nav-oppfolgingsplan');
  const localMatch = pickMatch(matches, (match) => match.document.id === 'doc-stavanger-bedriftshelsetjeneste');

  return {
    intro:
      'Jeg fant NAV-treff for sykefravaersoppfolging og et Stavanger-treff for lokal stotte. Det gir et mer prosessnaert svar.',
    sections: [
      {
        title: 'Kort svar',
        content:
          'Arbeidsgiver har et tydelig oppfolgingsansvar ved sykefravaer. Oppfolgingsplan skal normalt vaere klar innen 4 uker, dialogmote 1 innen 7 uker og NAV kan innkalle til dialogmote 2 senest innen 26 uker.'
      },
      {
        title: 'Hva som gjelder',
        content: sectionText([
          followupMatch ? `NAV om oppfolging: ${followupMatch.excerpt.text}` : undefined,
          planMatch ? `Oppfolgingsplan: ${planMatch.excerpt.text}` : undefined,
          localMatch ? `Stavanger kommune: ${localMatch.excerpt.text}` : undefined
        ])
      },
      {
        title: 'Hva dette betyr i praksis',
        content: `I ${municipalityName} bor leder raskt avklare ansvar, plan og om bedriftshelsetjenesten skal kobles pa. Rollen din er registrert som ${role}.`
      },
      {
        title: 'Forbehold/unntak',
        content:
          'Ikke del diagnose eller andre helseopplysninger i chatten. Konkrete personalsaker, tilrettelegging og medisinske vurderinger ma handteres med leder, HR og eventuelt BHT.'
      },
      {
        title: 'Neste steg',
        content:
          'Lag eller oppdater oppfolgingsplan, kall inn til dialogmote i tide, og bruk NAVs og kommunens kanaler hvis frister eller roller er uklare.'
      },
      { title: 'Kildegrunnlag', content: buildRetrievedSourceSection(matches) }
    ],
    sourceHighlights: buildSourceHighlights(preferredHighlights([followupMatch, planMatch, localMatch], matches))
  };
}

function buildRetrievedGenericAnswer(
  municipalityName: string,
  role: UserRole,
  matches: ExcerptMatch[]
): AnswerContext {
  if (matches.length === 0 || matches[0].score < 16) {
    return {
      intro:
        'Jeg fant ikke sikre nok dokumenttreff til a gi et konkret svar uten a gjette. Det er bedre enn a havne i feil tema.',
      sections: [
        {
          title: 'Kort svar',
          content:
            'Jeg trenger et mer presist sporsmal for a svare konkret. Nevn gjerne ferie, overtid, hviletid, feriepenger eller sykefravaer.'
        },
        {
          title: 'Hva som gjelder',
          content:
            'KommuneHR prioriterer dokumenttreff foran gjetting. Nar treffene er for svake, skal den heller be om et smalere sporsmal enn a late som svaret er sikkert.'
        },
        {
          title: 'Hva dette betyr i praksis',
          content: `Du far et bedre svar hvis du beskriver regelsporet tydeligere. Rollen din er registrert som ${role} i ${municipalityName}.`
        },
        {
          title: 'Forbehold/unntak',
          content:
            'Hvis saken gjelder oppsigelse, konflikt, trakassering, varsling eller annen sensitiv personalsak, skal den alltid loftes ut av chatten.'
        },
        {
          title: 'Neste steg',
          content:
            'Prov for eksempel: "Hvor mange uker hovedferie kan en ansatt kreve?", "Kan leder palegge overtid i turnus?" eller "Nar ma oppfolgingsplan ved sykefravaer vaere klar?"'
        },
        { title: 'Kildegrunnlag', content: buildRetrievedSourceSection(matches) }
      ],
      sourceHighlights: buildSourceHighlights(matches)
    };
  }

  return {
    intro:
      'Jeg fant dokumenttreff, men temaet er bredt. Derfor oppsummerer jeg hva som er sikkert i kildene og hva som ma snevres inn videre.',
    sections: [
      {
        title: 'Kort svar',
        content: `For ${municipalityName} bor svaret starte med lovens minimum, deretter tariff eller offentlig veiledning, og til slutt lokal praksis.`
      },
      {
        title: 'Hva som gjelder',
        content: matches
          .slice(0, 3)
          .map((match) => `${sourceLabel(match.document.sourceTier)}: ${match.document.title} - ${match.excerpt.text}`)
          .join('\n')
      },
      {
        title: 'Hva dette betyr i praksis',
        content: `Rollen din er registrert som ${role}. Bruk dokumenttreffene nedenfor for a avklare om sporsmalet egentlig handler om ferie, arbeidstid, fravaer eller lokal rutine.`
      },
      {
        title: 'Forbehold/unntak',
        content:
          'Nar sporsmalet spenner over flere regelspor samtidig, er det lett a gi et misvisende svar. KommuneHR prioriterer derfor sikker avgrensning fremfor bred gjetting.'
      },
      {
        title: 'Neste steg',
        content:
          'Still gjerne et mer spisset oppfolgingssporsmal. Jo mer konkret sporsmalet er, desto tydeligere kan svaret skille mellom lov, tariff, lokal praksis og anbefalt handling.'
      },
      { title: 'Kildegrunnlag', content: buildRetrievedSourceSection(matches) }
    ],
    sourceHighlights: buildSourceHighlights(matches)
  };
}

export function generateStavangerAssistantMessage(
  question: string,
  sector: SectorId,
  role: UserRole,
  municipalityName: string,
  contactPoints: AdminConfig['contactPoints'],
  sourcePriority: SourceTier[],
  documents: KnowledgeDocument[]
): ChatMessage {
  const normalizedQuestion = normalize(question);
  const matches = retrieveExcerptMatches(question, sector, sourcePriority, documents);
  const escalation = buildEscalation(question, contactPoints);
  const detectedSensitive = sensitivePattern.test(normalizedQuestion);
  const intent = detectRetrievedIntent(question, matches);

  const context =
    intent === 'summer-holiday'
      ? buildRetrievedHolidayAnswer(question, municipalityName, role, matches)
      : intent === 'holiday-pay'
        ? buildRetrievedHolidayPayAnswer(municipalityName, role, matches)
        : intent === 'holiday-general'
          ? buildRetrievedHolidayAnswer(question, municipalityName, role, matches)
          : intent === 'overtime'
            ? buildRetrievedOvertimeAnswer(municipalityName, sector, role, matches)
            : intent === 'worktime-rest'
              ? buildRetrievedWorktimeAnswer(municipalityName, role, matches)
              : intent === 'sick-leave-followup'
                ? buildRetrievedSickLeaveAnswer(municipalityName, role, matches)
                : buildRetrievedGenericAnswer(municipalityName, role, matches);

  return {
    id: createId(),
    sender: 'assistant',
    text: context.intro,
    createdAt: new Date().toISOString(),
    sections: context.sections,
    sourceHighlights: context.sourceHighlights,
    escalation,
    detectedSensitive
  };
}
