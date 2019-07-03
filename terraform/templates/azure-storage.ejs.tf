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
  value = "https://${module.azure_storage_static_<%= opts.stage %>.primary_web_host}"  
}

<% if (opts.createCDN) { %>
module "azure_cdn_endpoint_<%= opts.stage %>" {
  source = "./azure-cdn-endpoint"
  providers = {
    azurerm = azurerm.<%= opts.stage %>
  }
  resource_group = "<%= opts.resourceGroup %>"
  storage_account = "<%= opts.storageAccount %>"
  origin_hostname = "${module.azure_storage_static_<%= opts.stage %>.primary_web_host}"
}
output "cdn_endpoint" {
  value = "${module.azure_cdn_endpoint_<%= opts.stage %>.cdn_endpoint_url}"
}
<% } %>