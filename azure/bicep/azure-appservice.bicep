param subscriptionId string
param name string
param location string
param hostingPlanName string
param serverFarmResourceGroup string
param analyticsResourceGroup string
param alwaysOn bool
param ftpsState string
param sku string
param skuCode string
param workerSizeId string
param numberOfWorkers string
param linuxFxVersion string
param startupCommand string

var logAnalyticsWorkspaceName = 'DefaultWorkspace-${subscriptionId}-EUS'

// Create Log Analytics workspace in different resource group using module (equivalent to ARM nested deployment)
module logAnalyticsWorkspace 'modules/logAnalytics.bicep' = {
  name: 'newWorkspaceTemplate'
  scope: resourceGroup(subscriptionId, analyticsResourceGroup)
  params: {
    workspaceName: logAnalyticsWorkspaceName
    location: location
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'PWAWeatherApp'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.outputs.workspaceId
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: hostingPlanName
  location: location
  kind: 'linux'
  sku: {
    tier: sku
    name: skuCode
    capacity: int(numberOfWorkers)
  }
  properties: {
    reserved: true
    zoneRedundant: false
    targetWorkerCount: int(numberOfWorkers)
    targetWorkerSizeId: int(workerSizeId)
  }
}

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: name
  location: location
  tags: {
    Slot: 'Production'
    Technology: 'Angular'
    Stack: 'Javascript/TypeScript'
  }
  properties: {
    siteConfig: {
      appSettings: [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'XDT_MicrosoftApplicationInsights_Mode'
          value: 'default'
        }
      ]
      linuxFxVersion: linuxFxVersion
      alwaysOn: alwaysOn
      ftpsState: ftpsState
      appCommandLine: startupCommand
    }
    serverFarmId: resourceId(serverFarmResourceGroup, 'Microsoft.Web/serverfarms', hostingPlanName)
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
  }
}

resource slotDevelop 'Microsoft.Web/sites/slots@2023-01-01' = {
  name: 'develop'
  parent: webApp
  location: location
  tags: {
    Slot: 'Develop'
    Technology: 'Angular'
    Stack: 'Javascript/TypeScript'
  }
  properties: {
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
  }
}

resource slotQA 'Microsoft.Web/sites/slots@2023-01-01' = {
  name: 'qa'
  parent: webApp
  location: location
  tags: {
    Slot: 'QA'
    Technology: 'Angular'
    Stack: 'Javascript/TypeScript'
  }
  properties: {
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
  }
}

resource slotStaging 'Microsoft.Web/sites/slots@2023-01-01' = {
  name: 'staging'
  parent: webApp
  location: location
  tags: {
    Slot: 'Staging'
    Technology: 'Angular'
    Stack: 'Javascript/TypeScript'
  }
  properties: {
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
  }
}
