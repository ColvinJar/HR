# Azure App Service Oppsett

## Målbilde

- Frontend bygges til `dist`
- Backend bygges til `dist-server`
- Fastify serverer både API og ferdig bygget frontend i samme prosess
- Microsoft Entra ID håndteres via App Service Authentication / Easy Auth

## Anbefalte App Settings

- `AUTH_PROVIDER=entra-id`
- `HOST=0.0.0.0`
- `PORT=8080`
- `ENTRA_TENANT_ID=<tenant-id>`
- `ENTRA_CLIENT_ID=<app-registration-client-id>`
- `ENTRA_APP_ROLE_CLAIM=roles`

## Easy Auth / Entra

1. Aktiver `Authentication` i App Service.
2. Velg `Microsoft` som identity provider.
3. Koble mot riktig Entra app registration.
4. Sørg for at App Service sender `x-ms-client-principal`-headeren videre til Node-appen.
5. Legg inn app roles som matcher KommuneHR-rollene:
   - `ansatt`
   - `leder`
   - `hr`

## Deployflyt

1. Kjør `npm install`
2. Kjør `npm run build`
3. Deploy hele prosjektet med `dist`, `dist-server`, `web.config`, `package.json` og `node_modules` eller bruk bygg på server
4. Start kommando: `sh -c 'cd /home/site/wwwroot; node dist-server/server/index.js'`

## Drift

- Bruk `GET /health` som health probe
- Bruk `GET /api/auth/session` for å verifisere Entra-header parsing
- Bruk `GET /api/knowledge/ingest/status` for å bekrefte at dokumenter er lastet
