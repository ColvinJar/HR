#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 5 ]]; then
  echo "Usage: ./infra/bootstrap-azure.sh <subscription-id> <resource-group> <location> <app-name> <github-repo>"
  exit 1
fi

SUBSCRIPTION_ID="$1"
RESOURCE_GROUP="$2"
LOCATION="$3"
APP_NAME="$4"
GITHUB_REPO="$5"

APP_REG_NAME="KommuneHR"
GITHUB_SP_NAME="kommunehr-github-deploy"

echo "Setting Azure subscription..."
az account set --subscription "$SUBSCRIPTION_ID"

echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" >/dev/null

echo "Creating or locating Entra app registration..."
APP_CLIENT_ID="$(az ad app list --display-name "$APP_REG_NAME" --query "[0].appId" -o tsv)"
if [[ -z "$APP_CLIENT_ID" ]]; then
  APP_CLIENT_ID="$(az ad app create --display-name "$APP_REG_NAME" --query appId -o tsv)"
fi

APP_OBJECT_ID="$(az ad app list --display-name "$APP_REG_NAME" --query "[0].id" -o tsv)"
TENANT_ID="$(az account show --query tenantId -o tsv)"

echo "Applying app roles..."
az rest \
  --method PATCH \
  --uri "https://graph.microsoft.com/v1.0/applications/$APP_OBJECT_ID" \
  --headers "Content-Type=application/json" \
  --body "{ \"appRoles\": $(cat infra/app-roles.json) }" >/dev/null

echo "Creating service principal for application..."
az ad sp create --id "$APP_CLIENT_ID" >/dev/null || true

echo "Deploying infrastructure..."
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infra/main.bicep \
  --parameters @infra/main.parameters.json \
  appName="$APP_NAME" \
  location="$LOCATION" \
  entraTenantId="$TENANT_ID" \
  entraClientId="$APP_CLIENT_ID" >/dev/null

echo "Creating GitHub deploy service principal..."
AZURE_CREDENTIALS_JSON="$(az ad sp create-for-rbac \
  --name "$GITHUB_SP_NAME" \
  --role Contributor \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  --sdk-auth)"

echo
echo "Done. Save these values as GitHub secrets for $GITHUB_REPO:"
echo "AZURE_CREDENTIALS=$AZURE_CREDENTIALS_JSON"
echo "AZURE_RESOURCE_GROUP=$RESOURCE_GROUP"
echo "AZURE_APP_NAME=$APP_NAME"
echo "AZURE_LOCATION=$LOCATION"
echo "ENTRA_TENANT_ID=$TENANT_ID"
echo "ENTRA_CLIENT_ID=$APP_CLIENT_ID"
echo
echo "Next steps:"
echo "1. Configure App Service Authentication with Microsoft provider in Azure Portal."
echo "2. Assign users/groups to app roles in Enterprise Applications."
echo "3. Run the GitHub Actions workflow 'Azure Deploy'."
