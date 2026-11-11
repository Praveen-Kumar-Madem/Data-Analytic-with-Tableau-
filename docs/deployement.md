# Deployment

## How this app deploys

The frontend and the backend deploy together from this workspace. The client talks to
the host through the SDK, so there is **no API base URL to configure** and no
`localhost` address is baked into the production build.

### Publishing

1. Open the app in the editor and use the **Publish** control.
2. The published URL is issued by the platform. *This app is not published yet, so no
   live URL exists — publish it to get one.*
3. After publish, load the dashboard. If it renders the KPI cards, the backend is
   reachable and the health of the stack is confirmed.

### Custom domain

Connect a domain from the app dashboard's **Domains** page. Set a redirect from the
built-in domain if you want a single canonical address.

### Access

Authentication, roles and invitations are managed from the dashboard's **App Users**
and **Authentication** pages. Email/password and the social providers are all
supported out of the box.

## Configuration

There is no `.env` file to deploy. Runtime configuration lives in the platform:

| Concern | Where it lives |
| --- | --- |
| Secrets and environment variables | Dashboard → **Secrets** |
| Row-level security | `base44/entities/*.jsonc` (`rls` key) |
| Cleaning and segment defaults | `base44/shared/analytics.ts` + per-dataset overrides |

`.env.example` in this repository documents the variable names a self-hosted port of
this project would need. It contains placeholders only — never real credentials.

## Local development

```bash
npm install          # install frontend dependencies
npm run dev          # start the Vite dev server
npm run build        # production build
npm run lint         # eslint
```

Backend functions redeploy automatically when their files change, so no separate
server process is needed in development.

## Operational checks

| Symptom | Where to look |
| --- | --- |
| A chart is empty | Dataset status on the dashboard, then the data-cleaning report |
| The dashboard shows an empty state | No dataset is selected, or the selected dataset is not `ready` |
| An upload fails | File type (`csv`, `xlsx`, `xls`) and the 15 MB size limit |
| Excel import fails | The workbook must have a tabular first sheet; export it as CSV and retry |
| Segment counts look surprising | Settings → segmentation thresholds → *Recalculate analysis* |
| A stale number after changing rules | Re-run the pipeline; the results are stored per run |
| Backend errors | Dashboard → **Logs**, function logs for `runPipeline` / `ingestRows` |

## Data retention and deletion

Transaction rows, customer RFM records and export history stay in the workspace until
the dataset is deleted. Delete a dataset from **Settings** to remove its transactions,
customer records and export history immediately; the source file in private storage can
be replaced by re-uploading.

## What is intentionally not shipped

The original brief asked for Docker, Docker Compose, a Python virtual environment and a
PostgreSQL/SQLite instance. None of those can run in this environment, so no container
or database configuration is included that could not actually be executed here. The
analytics, the pipeline and the exports are fully implemented and running.