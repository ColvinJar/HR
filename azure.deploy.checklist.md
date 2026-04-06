# Azure Deploy Checklist

## Før Du Starter

1. Opprett en Entra app registration for KommuneHR.
2. Opprett app roles:
   - `ansatt`
   - `leder`
   - `hr`
3. Opprett en resource group for løsningen.
4. Opprett GitHub secrets:
   - `AZURE_CREDENTIALS`
   - `AZURE_RESOURCE_GROUP`
   - `AZURE_APP_NAME`
   - `AZURE_LOCATION`
   - `ENTRA_TENANT_ID`
   - `ENTRA_CLIENT_ID`

## Infrastruktur

1. Gå gjennom `infra/main.bicep`.
2. Tilpass `infra/main.parameters.json` ved behov.
3. Kjør Bicep-deploy eller bruk GitHub Actions workflowen `Azure Deploy`.

## App Service Authentication

1. Åpne App Service i Azure Portal.
2. Gå til `Authentication`.
3. Legg til `Microsoft` som identity provider.
4. Koble til riktig app registration.
5. Bekreft at brukerflyten sender `x-ms-client-principal` og relaterte headere.

## App Settings

Verifiser:

- `AUTH_PROVIDER=entra-id`
- `HOST=0.0.0.0`
- `PORT=8080`
- `ENTRA_TENANT_ID=<tenant-id>`
- `ENTRA_CLIENT_ID=<client-id>`
- `ENTRA_APP_ROLE_CLAIM=roles`

## Etter Deploy

1. Bekreft at `GET /health` svarer.
2. Bekreft at `GET /api/auth/session` viser `provider: entra-id`.
3. Bekreft at riktig rolle mappes fra Entra-claims.
4. Bekreft at `GET /api/knowledge/ingest/status` returnerer dokumentkilder.
5. Kjør en manuell smoke test av chat, admin og kunnskapsbase.
