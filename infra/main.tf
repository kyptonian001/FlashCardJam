terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  site_dir   = var.site_dir
  site_files = fileset(local.site_dir, "**")

  content_types = {
    "html"  = "text/html; charset=utf-8"
    "js"    = "application/javascript; charset=utf-8"
    "css"   = "text/css; charset=utf-8"
    "json"  = "application/json; charset=utf-8"
    "png"   = "image/png"
    "jpg"   = "image/jpeg"
    "jpeg"  = "image/jpeg"
    "svg"   = "image/svg+xml"
    "ico"   = "image/x-icon"
    "txt"   = "text/plain; charset=utf-8"
    "map"   = "application/json; charset=utf-8"
    "webp"  = "image/webp"
    "woff"  = "font/woff"
    "woff2" = "font/woff2"
  }

  file_ext = {
    for f in local.site_files :
    f => lower(element(reverse(split(".", f)), 0))
  }

  # Cache rules tuned for SPA + Cloudflare:
  # - HTML: no-cache so deploys are immediate
  # - JS/CSS: cache hard (use ?v=... or filename versioning)
  # - data/*.json: cache 1 hour (adjust as you like)
  cache_control = {
    for f in local.site_files :
    f => (
      f == "index.html" || f == "404.html"
      ? "no-cache, max-age=0"
      : can(regex("^data/.*\\.json$", f))
        ? "public, max-age=3600"
        : can(regex("^(app\\.js|style\\.css)$", f))
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600"
    )
  }
}

resource "google_storage_bucket" "site" {
  name     = var.bucket_name
  location = "us-central1" # single-region

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }

  uniform_bucket_level_access = true
  force_destroy               = var.force_destroy

  # Turn OFF soft delete
  soft_delete_policy {
    retention_duration_seconds = 0
  }

  versioning {
    enabled = false
  }
}

# Public read for all objects
resource "google_storage_bucket_iam_binding" "public_read" {
  bucket = google_storage_bucket.site.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers"
  ]
}

# Upload all site files
resource "google_storage_bucket_object" "site_objects" {
  for_each = toset(local.site_files)

  bucket = google_storage_bucket.site.name
  name   = each.value
  source = "${local.site_dir}/${each.value}"

  content_type  = lookup(local.content_types, local.file_ext[each.value], "application/octet-stream")
  cache_control = local.cache_control[each.value]
}
