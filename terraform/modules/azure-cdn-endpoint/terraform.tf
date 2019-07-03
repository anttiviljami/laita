variable "resource_group" {}
variable "storage_account" {} 
variable "origin_hostname" {}
variable "cdn_profile_sku" { default = "Standard_Verizon" }

data "azurerm_resource_group" "main" {
  name = "${var.resource_group}"
}

resource "azurerm_cdn_profile" "static" {
  name = "${var.storage_account}cdn"
  location = "${data.azurerm_resource_group.main.location}"
  resource_group_name = "${data.azurerm_resource_group.main.name}"
  sku = "Standard_Verizon"
}

resource "azurerm_cdn_endpoint" "static" {
  name = "${var.storage_account}cdn"
  profile_name = "${azurerm_cdn_profile.static.name}"
  location = "${data.azurerm_resource_group.main.location}"
  resource_group_name = "${data.azurerm_resource_group.main.name}"
  origin {
    name = "static"
    host_name = "${var.origin_hostname}"
  }
  # TODO: AzureRM doesn't support adding custom domains yet (facepalm)
  # issue here: https://github.com/terraform-providers/terraform-provider-azurerm/issues/398
}

output "cdn_endpoint_url" {
  value = "https://${azurerm_cdn_endpoint.static.name}.azureedge.net"
}