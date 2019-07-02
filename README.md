# Laita
[![Build Status](https://travis-ci.org/anttiviljami/laita.svg?branch=master)](https://travis-ci.org/anttiviljami/laita)
[![Dependencies](https://david-dm.org/anttiviljami/laita.svg)](https://david-dm.org/anttiviljami/laita)
[![npm version](https://img.shields.io/npm/v/laita.svg)](https://www.npmjs.com/package/laita)
[![License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/anttiviljami/laita/blob/master/LICENSE)
[![Sponsored](https://img.shields.io/badge/chilicorn-sponsored-brightgreen.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAA4AAAAPCAMAAADjyg5GAAABqlBMVEUAAAAzmTM3pEn%2FSTGhVSY4ZD43STdOXk5lSGAyhz41iz8xkz2HUCWFFhTFFRUzZDvbIB00Zzoyfj9zlHY0ZzmMfY0ydT0zjj92l3qjeR3dNSkoZp4ykEAzjT8ylUBlgj0yiT0ymECkwKjWqAyjuqcghpUykD%2BUQCKoQyAHb%2BgylkAyl0EynkEzmkA0mUA3mj86oUg7oUo8n0k%2FS%2Bw%2Fo0xBnE5BpU9Br0ZKo1ZLmFZOjEhesGljuzllqW50tH14aS14qm17mX9%2Bx4GAgUCEx02JySqOvpSXvI%2BYvp2orqmpzeGrQh%2Bsr6yssa2ttK6v0bKxMBy01bm4zLu5yry7yb29x77BzMPCxsLEzMXFxsXGx8fI3PLJ08vKysrKy8rL2s3MzczOH8LR0dHW19bX19fZ2dna2trc3Nzd3d3d3t3f39%2FgtZTg4ODi4uLj4%2BPlGxLl5eXm5ubnRzPn5%2Bfo6Ojp6enqfmzq6urr6%2Bvt7e3t7u3uDwvugwbu7u7v6Obv8fDz8%2FP09PT2igP29vb4%2BPj6y376%2Bu%2F7%2Bfv9%2Ff39%2Fv3%2BkAH%2FAwf%2FtwD%2F9wCyh1KfAAAAKXRSTlMABQ4VGykqLjVCTVNgdXuHj5Kaq62vt77ExNPX2%2Bju8vX6%2Bvr7%2FP7%2B%2FiiUMfUAAADTSURBVAjXBcFRTsIwHAfgX%2FtvOyjdYDUsRkFjTIwkPvjiOTyX9%2FAIJt7BF570BopEdHOOstHS%2BX0s439RGwnfuB5gSFOZAgDqjQOBivtGkCc7j%2B2e8XNzefWSu%2BsZUD1QfoTq0y6mZsUSvIkRoGYnHu6Yc63pDCjiSNE2kYLdCUAWVmK4zsxzO%2BQQFxNs5b479NHXopkbWX9U3PAwWAVSY%2FpZf1udQ7rfUpQ1CzurDPpwo16Ff2cMWjuFHX9qCV0Y0Ok4Jvh63IABUNnktl%2B6sgP%2BARIxSrT%2FMhLlAAAAAElFTkSuQmCC)](http://spiceprogram.org/oss-sponsorship)

A CLI utility to easily deploy static websites to the cloud

Supported targets:

- [x] AWS S3 + Cloudfront
- [ ] Azure Storage
- [ ] AWS Amplify
- [ ] Netlify
- [ ] Heroku
- [ ] Github

## Requirements

- Node.js
- Terraform

## Install

```
npm install -g laita
```

## Quick start

```
laita config # follow interactive prompts to create .laitarc config
laita provision # provision selected cloud infra using terraform
laita deploy # deploy the static website to the provisioned infra
```

## Configuration

Laita uses a `.laitarc` file to store its configuration.

You can generate configurations interactively using the `laita config` command.

The `.laitarc` file contents look like this:

```yml
default:
  source: public/
  target: aws-s3-cloudfront
  region: eu-west-1
  bucketName: laita-static-default-2094db20
  createCloudFront: true
  domains:
  - mydomain.com
  - www.mydomain.com
  acmCertificateARN: arn:aws:acm:us-east-1:921809084865:certificate/c0b7309b-39cc-4925-9df3-bcedf78b92f8
```

## Example

Configuration with `laita config`

```
$ laita config
? Static files directory? public/
? Choose method aws-s3-cloudfront
? AWS Region? eu-west-1
? S3 bucket name? laita-static-default-2094db20
? Create CloudFront distribution? (needed to use custom domains) Yes
? Add a domain name? (leave empty to continue) my.example-website.com
? Add another domain name? (leave empty to continue)
? Add ACM certificate? (needed to use custom domains) Yes
? ACM Certificate ARN? 	arn:aws:acm:us-east-1:921809084865:certificate/c0b7309b-39cc-4925-9df3-bcedf78b92f8
? Store terraform state remotely? s3
? Terraform bucket name laita-terraform-d40cb707
? Terraform bucket region eu-west-1
? Create bucket now? Yes
----> Running "aws s3api create-bucket --bucket laita-terraform-d40cb707 --region eu-west-1 --create-bucket-configuration LocationConstraint=eu-west-1"...
Config written to .laitarc
```

Provisioning with `laita provision`

```
$ laita provision
Provisioning AWS S3 + Cloudfront resources... (stage: default)
----> Running "terraform init"...
Initializing modules...
- cloudfront_distribution_default in cloudfront-distribution

Initializing the backend...

Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.

Initializing provider plugins...

Terraform has been successfully initialized!

...

Plan: 2 to add, 0 to change, 0 to destroy.

------------------------------------------------------------------------

? Apply changes? Yes
----> Running "terraform apply -auto-approve -target module.s3_website_default -target module.cloudfront_distribution_default"...

module.s3_website_default.aws_s3_bucket.static: Creating...
module.s3_website_default.aws_s3_bucket.static: Creation complete after 7s [id=laita-static-default-2094db20]
module.cloudfront_distribution_default.aws_cloudfront_distribution.static: Creating...
...
module.cloudfront_distribution_default.aws_cloudfront_distribution.static: Creation complete after 28m42s [id=EW9JZP1F0BO3L]
module.cloudfront_distribution_default.aws_cloudfront_distribution.static: Creation complete after 28m42s [id=EW9JZP1F0BO3L]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

cloudfront_endpoint_default = https://d3ib5k4yxe7qbv.cloudfront.net
s3_endpoint_default = http://laita-static-default-2094db20.s3-website-eu-west-1.amazonaws.com
```

Deployment with `laita deploy`

```
$ laita deploy
Deploying site to S3... (stage: default)
----> Running "aws s3 sync --delete public/ s3://laita-static-default-2094db20"...
upload: public/bundle.css to s3://laita-static-default-2094db20/bundle.css
upload: public/index.html to s3://laita-static-default-2094db20/index.html
upload: public/global.css to s3://laita-static-default-2094db20/global.css
upload: public/favicon.png to s3://laita-static-default-2094db20/favicon.png
upload: public/.DS_Store to s3://laita-static-default-2094db20/.DS_Store
upload: public/bundle.css.map to s3://laita-static-default-2094db20/bundle.css.map
upload: public/bundle.js to s3://laita-static-default-2094db20/bundle.js
upload: public/images/anttiviljami.jpg to s3://laita-static-default-2094db20/images/anttiviljami.jpg
upload: public/bundle.js.map to s3://laita-static-default-2094db20/bundle.js.map
```

