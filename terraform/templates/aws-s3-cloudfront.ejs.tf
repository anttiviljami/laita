provider "aws" { region = "<%= opts.region %>" }

module "s3_website_<%= opts.stage %>" {
  source = "./static-s3-website"
  bucket_name = "<%= opts.bucketName %>"
}
output "s3_endpoint_<%= opts.stage %>" {
  value = "http://${module.s3_website_default.website_endpoint}"
}

<% if (opts.createCloudFront) { %>
module "cloudfront_distribution_<%= opts.stage %>" {
  source = "./cloudfront-distribution"
  website_endpoint = "${module.s3_website_default.website_endpoint}"
}
output "cloudfront_endpoint_<%= opts.stage %>" {
  value = "${module.cloudfront_distribution_<%= opts.stage %>.endpoint_url}"
}
<% } %>