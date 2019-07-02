provider "aws" {
  region = "<%= opts.region %>"
  alias = "<%= opts.stage %>"
}

module "s3_website_<%= opts.stage %>" {
  source = "./static-s3-website"
  bucket_name = "<%= opts.bucketName %>"
  providers = {
    aws = aws.<%= opts.stage %>
  }
}
output "s3_endpoint_<%= opts.stage %>" {
  value = "http://${module.s3_website_default.website_endpoint}"
}

<% if (opts.createCloudFront) { %>
module "cloudfront_distribution_<%= opts.stage %>" {
  source = "./cloudfront-distribution"
  website_endpoint = "${module.s3_website_default.website_endpoint}"
  providers = {
    aws = aws.<%= opts.stage %>
  }
}
output "cloudfront_endpoint_<%= opts.stage %>" {
  value = "${module.cloudfront_distribution_<%= opts.stage %>.endpoint_url}"
}
<% } %>