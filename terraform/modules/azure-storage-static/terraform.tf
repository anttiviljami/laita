variable "resource_group" {}
variable "storage_account" {}
variable "storage_account_tier" { default = "Standard" }
variable "storage_account_replication_type" { default = "LRS" }

data "azurerm_resource_group" "main" {
  name = "${var.resource_group}"
}

resource "azurerm_storage_account" "static" {
  name = "${var.storage_account}"
  resource_group_name = "${data.azurerm_resource_group.main.name}"

  location = "${data.azurerm_resource_group.main.location}"
  account_kind = "StorageV2"
  account_tier = "${var.storage_account_tier}"
  account_replication_type = "${var.storage_account_replication_type}"

  # TODO: get rid of this once ARM supports enabling static websites
  provisioner "local-exec" {
    command = "az storage blob service-properties update --account-name ${azurerm_storage_account.static.name} --static-website --index-document index.html --404-document 404.html"
  }
}

output "primary_web_host" {
  value = "${azurerm_storage_account.static.primary_web_host}"
}

#resource "azurerm_storage_container" "static" {
#  name = "$web"
#  resource_group_name = "${data.azurerm_resource_group.main.name}"
#  storage_account_name = "${azurerm_storage_account.static.name}"
#  container_access_type = "blob"
#}
