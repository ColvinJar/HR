# KommuneHR

KommuneHR er en responsiv webapp/PWA for norske kommuner. Løsningen består av en React-frontend og en TypeScript-backend som leverer chat, kunnskapskort, admin-konfigurasjon, en SSO-klar rollemodell og en RAG-klar dokumentmodell med tydelig kildehierarki.

## Teknologistack

- React + TypeScript + Vite
- Fastify + TypeScript for backend/API
- React Router for navigasjon
- Zustand for lett delt state
- Vite PWA for app-lignende webopplevelse
- Vitest + Testing Library for enhet/UI/API-tester
- Playwright for sentrale ende-til-ende-tester

## Arkitektur

- `src/pages`: sideflater som dashboard, chat, kunnskapsbase, sektorer, maler og admin
- `src/components`: gjenbrukbare UI-byggesteiner og layout
- `src/features/chat`: frontendnær chatlogikk og tester
- `src/data`: tema, sektorer, maler og adminstandarder
- `src/services`: API-abstraksjon mot backend
- `src/store`: global appstate for rolle, sektor, konfigurasjon og sesjon
- `server`: Fastify-backend med ruter for health, auth, config, assistant og knowledge
- `shared`: delte kontrakter og svarlogikk på tvers av frontend og backend
- `knowledge-sources`: lokale JSON-kilder som ingesteres til dokumentmodellen ved oppstart eller reload
- `tests/e2e`: sentrale brukerreiser i Playwright

## Informasjonsmodell

Løsningen modellerer blant annet:

- roller: `ansatt`, `leder`, `hr`
- sektorer: helse og velferd, oppvekst og utdanning, bygg og byutvikling, teknisk/drift, sentraladministrasjon
- tema: ferie, arbeidstid, fravær, rekruttering, onboarding, arbeidsmiljø, lederstøtte
- kilder: lokal rutine, tariff, Lovdata, Arbeidstilsynet og andre offentlige kilder
- chatmeldinger med strukturerte svarseksjoner og eskaleringsråd
- dokumenter med tema, sektor, tilgangsroller, sensitivitet og utdrag for senere retrieval/RAG
- autentisert sesjon med rolle og provider, klar for senere Entra ID eller annen SSO

## Dokumentstyrt Chat

Chatten er nå mer dokumentstyrt enn den første regelmotoren. Backend søker i utdrag fra `knowledge-sources`, velger relevante treff per spørsmål og viser hvilke dokumentutdrag som faktisk ble brukt i svaret. Stavanger-oppsettet inneholder foreløpig kilder fra Stavanger kommune, Lovdata, KS, Arbeidstilsynet og NAV for ferie, feriepenger, arbeidstid, overtid, hviletid og sykefraværsoppfølging.

Dette er fortsatt ikke en fri LLM-chat. Den bruker deterministisk retrieval og kuraterte svarmønstre for å gi mer konkrete og tryggere svar, og er klargjort for senere semantisk søk, vektorindeks og modellgenerering.

## Sikkerhet og personvern

- Chatten advarer mot deling av sensitive personopplysninger
- Høyrisikosaker som oppsigelse, konflikt, trakassering, varsling og tilrettelegging eskaleres tydelig i UI
- Svarlogikken skiller mellom lov, tariff, lokal praksis og anbefalt praksis
- Appen lagrer ikke chatthistorikk permanent i MVP
- Backend normaliserer dokumentmetadata i stedet for at klienten snakker direkte med dokumentkilder
- Rollevalg går via backend-sesjon i stedet for bare lokal UI-state

## Kom i gang

Forutsetter Node.js 20+ og npm.

```bash
npm install
npm run dev:full
```

Separate utviklingskommandoer:

```bash
npm run dev:web
npm run dev:api
```

Bygg frontend og backend:

```bash
npm run build
```

Kjør backend etter build:

```bash
npm run start:api
```

I produksjon kan samme Fastify-prosess også servere bygget frontend fra `dist`.

Kjør frontend-preview separat:

```bash
npm run preview
```

## Testing

```bash
npm run test
npm run build
npm run test:e2e
```

Testene dekker blant annet:

- spørsmål om ferie
- arbeidstid/overtid
- sektorvalg for helse og velferd
- eskalering ved sensitiv personalsak
- oppdatering av HR-kontakt i admin
- rollebytte via backend-sesjon
- ingest-status for dokumentkilder
- backend-endepunkt for config, auth og knowledge

## API-endepunkter

- `GET /health`
- `GET /api/auth/session`
- `POST /api/auth/switch-role`
- `GET /api/config`
- `PUT /api/config`
- `POST /api/assistant/ask`
- `GET /api/knowledge/cards`
- `GET /api/knowledge/documents`
- `GET /api/knowledge/ingest/status`
- `POST /api/knowledge/ingest/reload`

## Azure App Service

Prosjektet er nå klargjort for Azure App Service med:

- Entra-klar auth-provider i backend
- `web.config` for App Service/IISNode
- `.env.example` for miljøvariabler
- `azure.appservice.md` med konkret oppsett
- `azure.deploy.checklist.md` med utrullingspunkter
- `.github/workflows/ci.yml` for test/build
- `.github/workflows/azure-deploy.yml` for infrastruktur og deploy
- `infra/main.bicep` for App Service-oppsett
- `infra/app-roles.json` med ferdige Entra app roles
- `infra/bootstrap-azure.sh` for rask CLI-bootstrap
- `infra/bootstrap-azure.ps1` for rask Windows/PowerShell-bootstrap

Anbefalt App Settings:

- `AUTH_PROVIDER=entra-id`
- `HOST=0.0.0.0`
- `PORT=8080`
- `ENTRA_TENANT_ID=<tenant-id>`
- `ENTRA_CLIENT_ID=<client-id>`
- `ENTRA_APP_ROLE_CLAIM=roles`

## Det Som Er Implementert Nå

1. Backend har en RAG-klar dokumentmodell med kildeprioritet, tema, sektor, tilgangsroller, sensitivitet og utdrag.
2. Frontenden henter kunnskapskort, sesjon og konfigurasjon via API.
3. Chatten går via backend, slik at modellkall eller retrieval senere kan legges inn bak samme endepunkt.
4. Rollemodellen ligger i en backend-sesjon med mock-provider, slik at Entra ID eller annen SSO kan kobles på senere uten å endre klientkontrakten.
5. Dokumenter lastes fra `knowledge-sources/*.json` ved oppstart og kan reloades via API.

## Videreutvikling

Neste anbefalte steg:

1. Erstatt mock-session med Entra ID eller annen kommunal identitetsløsning.
2. Bygg ekte dokumentingest fra interne systemer og kontrollerte offentlige kilder.
3. Legg til indeksering, retrieval og avsnittsnære kildehenvisninger.
4. Innfør rollebasert tilgang på adminfunksjoner og revisjonsspor.
5. Flytt konfigurasjon og dokumentmetadata til database eller sikkert dokumentregister.

## Sikker Integrasjon Med Lovdata Og Interne Dokumenter

Anbefalt modell videre:

1. Hold interne dokumenter i et lukket dokumentlager eller et kontrollert API bak autentisering og autorisasjon.
2. La backend hente og normalisere dokumentmetadata i stedet for at klienten snakker direkte med kildene.
3. Lag dokumentprofiler med kilde, gyldighetsområde, sist oppdatert, sektor, sensitivitet og prioritet.
4. Bruk retrieval med eksplisitt kildefiltrering: interne rutiner først, deretter avtaleverk, deretter Lovdata og praktiske offentlige veiledere.
5. Logg kun metadata om forespørsler og unngå vedvarende lagring av sensitiv fritekst med mindre det er klart behov og hjemmel.
6. Legg inn manuell kvalitetssikring og godkjenningsflyt for kommunespesifikke svarmaler og kunnskapsartikler.

## Antakelser I Denne MVP-en

- Prosjektmappen var tom ved oppstart, så appen er satt opp fra bunnen.
- Chatmotoren er en dokumentstyrt MVP med retrieval fra lokale JSON-kilder og kuraterte svarmønstre, klar for senere LLM- eller RAG-integrasjon.
- Dokumentingest er JSON-basert i denne fasen. Neste steg er ekte dokumenthenting, indeksering, kildeversjonering og autorisasjon.
- Rollemodellen bruker en mock-session i backend. Neste steg er å erstatte denne med Entra ID eller tilsvarende identitetsleverandør.
