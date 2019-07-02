provider "aws" { region = "<%= opts.region %>" }

resource "aws_s3_bucket" "static_<%= opts.stage %>" {
  bucket = "<%= opts.bucketName %>"
  website {
    index_document = "index.html"
    error_document = "index.html"
  }
  acl = "public-read"
  policy = <<EOF
{ 
  "Version": "2012-10-17",
  "Statement": [
    { 
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": ["arn:aws:s3:::<%= opts.bucketName %>/*"]
    }
  ]
}
EOF
}

output "Bucket Website Endpoint (<%= opts.stage %>)" {
  value = "http://${aws_s3_bucket.static_<%= opts.stage %>.website_endpoint}"  
}