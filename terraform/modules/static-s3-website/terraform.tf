variable "bucket_name" {}

resource "aws_s3_bucket" "static" {
  bucket = "${var.bucket_name}"
  acl = "public-read"
  website {
    index_document = "index.html"
    error_document = "index.html"
  }
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": ["arn:aws:s3:::${var.bucket_name}/*"]
    }
  ]
}
EOF
}

output "website_endpoint" {
  value = "${aws_s3_bucket.static.website_endpoint}"
}
