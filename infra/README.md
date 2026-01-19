# FlashCardJam -> GCS Static Website (Terraform)

## Prereqs
- Terraform >= 1.5
- gcloud authenticated (`gcloud auth application-default login`) OR set GOOGLE_APPLICATION_CREDENTIALS
- A folder named `src/` that contains:
  - index.html, app.js, style.css
  - data/ (courses.json + decks)
  - 404.html (recommended)

## Structure
Place this repo so you have:
- infra/ (this Terraform)
- FlashCardJam/ (your site)

Example:
.
├── infra
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── src
    ├── index.html
    ├── app.js
    ├── style.css
    ├── 404.html
    └── data
        ├── courses.json
        └── *.json

## Deploy
From the `infra/` directory:

terraform init
terraform apply \
  -var="project_id=YOUR_PROJECT_ID" \
  -var="bucket_name=YOUR_GLOBALLY_UNIQUE_BUCKET_NAME"

## Notes
- JSON files under `data/` are set to `no-cache` to avoid stale decks.
- JS/CSS/HTML cache for 1 hour by default.
