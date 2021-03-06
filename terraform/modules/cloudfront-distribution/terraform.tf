variable "website_endpoint" { type = "string" }
variable "acm_certificate_arn" { default = "" }
variable "price_class" { default = "PriceClass_100" }
variable "aliases" {
  type = list(string)
  default = []
}

resource "aws_cloudfront_distribution" "static" {
  enabled = true
  retain_on_delete = true
  is_ipv6_enabled = true

  price_class = "${var.price_class}"

  origin {
    domain_name = "${var.website_endpoint}"
    origin_id = "static_0"
    custom_origin_config {
      http_port = "80"
      https_port = "443"
      origin_ssl_protocols = ["TLSv1", "TLSv1.1", "TLSv1.2"]
      origin_protocol_policy = "http-only"
    }
  }

  aliases = var.aliases
  viewer_certificate {
    acm_certificate_arn = var.acm_certificate_arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1"
    cloudfront_default_certificate = var.acm_certificate_arn == "" ? true : false
  }

  default_root_object = "index.html"

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = [ "GET", "HEAD", "OPTIONS" ]
    cached_methods = [ "GET", "HEAD" ]
    target_origin_id = "static_0"
    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
    min_ttl = 0
    default_ttl = 360
    max_ttl = 86400
    compress = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

output "endpoint_url" {
  value = "https://${aws_cloudfront_distribution.static.domain_name}"
}
