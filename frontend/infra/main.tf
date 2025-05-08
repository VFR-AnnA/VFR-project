terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.CF_API_TOKEN
}

resource "cloudflare_r2_bucket" "vfr" {
  account_id = var.account_id
  name       = var.r2_bucket_name
  location   = "EU"
}

output "bucket_url" {
  value = cloudflare_r2_bucket.vfr.url
}