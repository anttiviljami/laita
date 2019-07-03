provider "azurerm" {
  alias = "<%= opts.stage %>"
  version = "~> 1.31"
}

module "azure_storage_static_<%= opts.stage %>" {
  source = "./azure-storage-static"
  providers = {
    azurerm = azurerm.<%= opts.stage %>
  }
  resource_group = "<%= opts.resourceGroup %>"
  storage_account = "<%= opts.storageAccount %>"
}

output "primary_web_endpoint" {
  value = "${module.azure_storage_static_<%= opts.stage %>.primary_web_endpoint}"  
}