param(
  [Parameter(Mandatory = $true)]
  [string]$SubscriptionId,

  [Parameter(Mandatory = $true)]
  [string]$ResourceGroup,

  [Parameter(Mandatory = $true)]
  [string]$Location,

  [Parameter(Mandatory = $true)]
  [string]$AppName,

  [Parameter(Mandatory = $true)]
  [string]$GitHubRepo
)

$ErrorActionPreference = 'Stop'

$AppRegName = 'KommuneHR'
$GitHubSpName = 'kommunehr-github-deploy'

Write-Host 'Setting Azure subscription...'
az account set --subscription $SubscriptionId
if ($LASTEXITCODE -ne 0) {
  throw "Azure subscription '$SubscriptionId' could not be selected. Use a real SubscriptionId from 'az account list --output table'."
}

Write-Host 'Creating resource group...'
az group create --name $ResourceGroup --location $Location | Out-Null

Write-Host 'Creating or locating Entra app registration...'
$appClientId = az ad app list --display-name $AppRegName --query "[0].appId" -o tsv
if (-not $appClientId) {
  $appClientId = az ad app create --display-name $AppRegName --query appId -o tsv
}

$appObjectId = az ad app list --display-name $AppRegName --query "[0].id" -o tsv
$tenantId = az account show --query tenantId -o tsv

Write-Host 'Applying app roles...'
$appRolesJson = Get-Content -Raw -Path (Join-Path $PSScriptRoot 'app-roles.json')
$payloadPath = Join-Path $env:TEMP 'kommunehr-app-roles-payload.json'
$body = "{`"appRoles`":$appRolesJson}"
Set-Content -Path $payloadPath -Value $body -Encoding utf8
az rest `
  --method PATCH `
  --uri "https://graph.microsoft.com/v1.0/applications/$appObjectId" `
  --headers "Content-Type=application/json" `
  --body "@$payloadPath" | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw 'Failed to apply Entra app roles.'
}

Write-Host 'Creating service principal for application...'
try {
  az ad sp create --id $appClientId | Out-Null
} catch {
  Write-Host 'Service principal already exists or could not be created again. Continuing.'
}

Write-Host 'Deploying infrastructure...'
az deployment group create `
  --resource-group $ResourceGroup `
  --template-file (Join-Path $PSScriptRoot 'main.bicep') `
  --parameters "@$PSScriptRoot\main.parameters.json" `
  --parameters appName=$AppName location=$Location entraTenantId=$tenantId entraClientId=$appClientId | Out-Null

Write-Host 'Creating GitHub deploy service principal...'
$azureCredentialsJson = az ad sp create-for-rbac `
  --name $GitHubSpName `
  --role Contributor `
  --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup" `
  --sdk-auth

Write-Host ''
Write-Host "Done. Save these values as GitHub secrets for ${GitHubRepo}:"
Write-Host "AZURE_CREDENTIALS=$azureCredentialsJson"
Write-Host "AZURE_RESOURCE_GROUP=$ResourceGroup"
Write-Host "AZURE_APP_NAME=$AppName"
Write-Host "AZURE_LOCATION=$Location"
Write-Host "ENTRA_TENANT_ID=$tenantId"
Write-Host "ENTRA_CLIENT_ID=$appClientId"
Write-Host ''
Write-Host 'Next steps:'
Write-Host '1. Configure App Service Authentication with Microsoft provider in Azure Portal.'
Write-Host '2. Assign users/groups to app roles in Enterprise Applications.'
Write-Host "3. Run the GitHub Actions workflow 'Azure Deploy'."
