# Cloudflare R2 + Worker Setup

This document provides instructions for setting up Cloudflare R2 and Workers for edge hosting of 3D models.

## Prerequisites

- Cloudflare account with R2 and Workers enabled
- Terraform CLI installed
- Wrangler CLI installed

## Terraform Configuration

The Terraform configuration is located in the `infra/` directory. It creates a Cloudflare R2 bucket for storing 3D models.

### Setup

1. Navigate to the `infra/` directory:

```bash
cd infra
```

2. Update the `terraform.tfvars` file with your Cloudflare API token and account ID:

```hcl
CF_API_TOKEN = "YOUR_CLOUDFLARE_API_TOKEN"
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"
```

3. Initialize Terraform:

```bash
terraform init
```

4. Apply the Terraform configuration:

```bash
terraform apply -auto-approve
```

5. Note the `bucket_url` output for later use.

## Cloudflare Worker

The Cloudflare Worker is located in the `workers/` directory. It generates signed URLs for accessing the 3D models in the R2 bucket.

### Setup

1. Navigate to the `workers/` directory:

```bash
cd ../workers
```

2. Install Wrangler:

```bash
npm install -D wrangler
```

3. Deploy the Worker:

```bash
npx wrangler deploy
```

4. Note the Worker URL for later use.

## Upload Assets

Upload all your .glb files to the R2 bucket using `aws s3 cp` or the Cloudflare UI.

## Update Asset URLs

In the VFRViewer component, replace the asset URLs with the URL of your Cloudflare Worker endpoint followed by the asset key:

```javascript
<Model url="https://your-worker-endpoint.workers.dev/mannequin.glb" />
```

## Benchmark Edge Latency

Run Lighthouse to measure the TTFVF (Time To First Visual Frame):

```bash
lighthouse --preset=experimental https://your-worker-endpoint.workers.dev/index.html --output=csv --output-path=docs/perf/run_edge.csv
```

The goal is to achieve a TTFVF of less than 600 ms.