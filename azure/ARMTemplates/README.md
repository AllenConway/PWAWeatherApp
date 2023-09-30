# PWA Weather App Azure Deployments using Azure Dev Ops and ARM Templates

The contents in this folder provide the following:
- Azure DevOps Build and Release Pipleine
- Azure ARM Templates to provision resources needed to deploy the code within this repo to an Azure App Service

The goal of the IaC files here is to be idempotent in execution and be able to destroy/provision as many times 
as needed consistently. This allows the PWAWeatherApp to be redeployed to new enviornments or subscriptions if required.

Prerequisites:
1. An Azure Subscription
2. A service principal or account with autorization in ADO to run the pipeline
3. Update parameters and variables within files for uniqueness (i.e. Subscription, AppService name, etc.)
4. Create an ADO pipeline pointing to an existing YAML file -> azure-build-and-release-pipeline.yml in the repo (or fork if coming from OSS world)

Alternative Considerations: Using Terraform IaC is a preffered method to ARM templates in favor of some of the following factors:
- More intuitive syntax
- Cloud provider agnostic (ARM is Azure provider only)
- State management for provisioning efficiency
- Industry standard approach

However if there is a familarity with ARM and usage in Azure, this process still provides a solid end-to-end solution
for deployment to PaaS resources in the cloud.    

Current Azure DevOps Project: https://allenconway.visualstudio.com/PWAWeatherApp

## File Breakdown

### azure-appservice.json

Purpose: ARM Template with defintition to provision the following:
- Azure App Service
  - Depolyment slots: Develop, QA, Staging, Production
- Azure App Service Plan
- Application Insights

### azure-appservice.parameters.json

Purpose: Provides parameter values for using at runtime for azure-appservice.json
ToDo: If deploying this independently, ensure parameter values within this file are unique to your deployment

### Pipelines/azure-build-and-release-pipeline.yml

Purpose: This single YAML file will do both the build and release stages. This does _not_ require a separate
'Release' created in Azure DevOps like the older metholodlogy or when using Classic Pipleines. 
This pipeline will do the following:
- Build the Angular app from this repo
- Create an output artifact (.zip)
- Use the Azure CLI to create resource groups at the subscription level prior to deploying the ARM template resources to them
- Deploy the Azure ARM Templates
- Execute the ARM Templates in Azure to provision the resources
- Deploy the built PWAWeatherApp to Azure using the resources provisioned above
  - Develop
  - QA
  - Staging
  - Production

Note: There is a separate step to create the resource groups via an AzureCLI step prior to the ARM Template execution. This is because
the ARM templates use a Resource based template and Resource Groups are created at the Subscription level and would require
a Subscription based template. There are supposdly some ways to either used a linked template, or attempting to create the resource groups
prior to the AppService, Plan, and AppInsights, it's not straight forward and any issues cause the ARM template execution to fail
if the resource groups aren't 100% creaed and available prior to creating additional resources. My initial attempts were not successful.
Therefore the easiest way to handle this was in a separate step leveraging the CLI to create the 2 required resource groups 1st.
See for more information: https://samcogan.com/deploying-resource-groups-with-arm-templates/

Current multi-stage build and release pipeline purposely does not have any permission gates requiring approval
prior to moving to the next stage. This can be modified if needed. 

ToDo: If deploying this independently, ensure variable values within this file are unique to your deployment.
Improvement would be to place repetitive release stages into parameratized file and reference as a template instead. 

### Pipelines/azure-build-pipeline.yml

Purpose: This is an _optional_ alternative that creates a pipeline that will *only* build the
PWAWeatherApp and create an output artifact. This is currently not in use, and only herre as
an exercise if wanting to see how Classic Release pipelines work in conjuntion with a YAML build pipleine.
The disabled 'PWAWeatherApp Release Pipeline (Classic)' in ADO is wired up to this only for showing a legacy example.

This pipeline will do the following:
    - Build the Angular app from this repo
    - Create an output artifact (.zip)

Requirement: If using this pipeline, you would need to create a separate Release pipeline
in Azure DevOps that uses the artifact from this build.

## Expected Outcome

On successful build of this pipeline, the application should be up and running at the following URL:
https://pwaweatherapp.azurewebsites.net
