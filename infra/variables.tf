variable "project_id" {
  type        = string
  description = "GCP project id"
}

variable "region" {
  type        = string
  description = "Provider region (bucket uses bucket_location)"
  default     = "us-central1"
}

variable "bucket_name" {
  type        = string
  description = "Globally-unique bucket name (e.g., flashcardjam-yourname-prod)"
}

variable "bucket_location" {
  type        = string
  description = "Bucket location/region (e.g., US, us-central1)"
  default     = "US"
}

variable "site_dir" {
  type        = string
  description = "Path to the site directory relative to this infra folder"
  default     = "../src"
}

variable "force_destroy" {
  type        = bool
  description = "If true, Terraform can delete the bucket even if it contains objects"
  default     = true
}
