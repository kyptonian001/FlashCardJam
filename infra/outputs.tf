output "bucket_name" {
  value = google_storage_bucket.site.name
}

output "public_base_url" {
  value = "https://storage.googleapis.com/${google_storage_bucket.site.name}/"
}

output "website_url" {
  value = "http://storage.googleapis.com/${google_storage_bucket.site.name}/index.html"
}
