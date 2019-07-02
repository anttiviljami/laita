terraform {
  <% if (config.terraformBackend === 's3') { %>
  backend "s3" {
    bucket = "<%= config.terraformS3bucket %>"
    region = "<%= config.terraformS3region %>"
    key = "terraform.tfstate"
  }
  <% } %>
}
