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

resource webAppAuth 'Microsoft.Web/sites/config@2022-09-01' = {
  name: '${webApp.name}/authsettingsV2'
  properties: {
    platform: {
      enabled: true
      runtimeVersion: '~1'
    }
    globalValidation: {
      requireAuthentication: false
      unauthenticatedClientAction: 'AllowAnonymous'
      excludedPaths: [
        '/health'
      ]
    }
    httpSettings: {
      requireHttps: true
      routes: {
        apiPrefix: '/.auth'
      }
      forwardProxy: {
        convention: 'NoProxy'
      }
    }
    identityProviders: {
      azureActiveDirectory: {
        enabled: true
        registration: {
          clientId: entraClientId
          clientSecretSettingName: 'MICROSOFT_PROVIDER_AUTHENTICATION_SECRET'
          openIdIssuer: 'https://sts.windows.net/${entraTenantId}/v2.0'
        }
        login: {
          disableWWWAuthenticate: false
        }
        validation: {
          allowedAudiences: []
          defaultAuthorizationPolicy: {
            allowedApplications: []
            allowedPrincipals: {}
          }
          jwtClaimChecks: {}
        }
      }
      apple: {
        enabled: false
      }
      facebook: {
        enabled: false
      }
      gitHub: {
        enabled: false
      }
      google: {
        enabled: false
      }
      legacyMicrosoftAccount: {
        enabled: false
      }
      twitter: {
        enabled: false
      }
    }
    login: {
      preserveUrlFragmentsForLogins: false
      tokenStore: {
        enabled: true
        tokenRefreshExtensionHours: 72.0
        fileSystem: {}
        azureBlobStorage: {}
      }
      cookieExpiration: {
        convention: 'FixedTime'
        timeToExpiration: '08:00:00'
      }
      nonce: {
        validateNonce: true
        nonceExpirationInterval: '00:05:00'
      }
      routes: {}
    }
    clearInboundClaimsMapping: false
  }
}

output webAppName string = webApp.name
output defaultHostName string = webApp.properties.defaultHostName
