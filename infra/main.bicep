@description('Name of the App Service app')
param appName string

@description('Azure region')
param location string = resourceGroup().location

@description('App Service plan name')
param appServicePlanName string = '${appName}-plan'

@description('SKU for the App Service plan')
param skuName string = 'B1'

@description('Microsoft Entra tenant ID')
param entraTenantId string

@description('Microsoft Entra app registration client ID')
param entraClientId string

@description('Authentication provider mode')
@allowed([
  'mock'
  'entra-id'
])
param authProvider string = 'entra-id'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: skuName
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'sh -c "cd /home/site/wwwroot && node dist-server/server/index.js"'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      healthCheckPath: '/health'
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'HOST'
          value: '0.0.0.0'
        }
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'AUTH_PROVIDER'
          value: authProvider
        }
        {
          name: 'ENTRA_TENANT_ID'
          value: entraTenantId
        }
        {
          name: 'ENTRA_CLIENT_ID'
          value: entraClientId
        }
        {
          name: 'ENTRA_APP_ROLE_CLAIM'
          value: 'roles'
        }
      ]
    }
  }
}

output webAppName string = webApp.name
output defaultHostName string = webApp.properties.defaultHostName
