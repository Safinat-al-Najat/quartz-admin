# DOX Framework

## Purpose

- This repository is the admin/control workspace for the Safinat al-Najat Quartz site.
- It contains the standalone GitHub-backed admin dashboard, architecture records, a Cloudflare Worker chatbot proxy, and a vendored/customized Quartz site.
- DOX is the binding AGENTS.md hierarchy for all future edits in this workspace.

## Ownership

- Root owns project-wide workflow, top-level structure, and the `index.html` admin dashboard.
- Durable domain rules live in child `AGENTS.md` files and must be read with this file before editing files in their scope.
- Do not edit generated dependencies, caches, or build outputs unless the task explicitly targets them.

## Local Contracts

- Read this file and every applicable child `AGENTS.md` before editing.
- Keep source materials, workflow records, and durable docs understandable from the nearest owning `AGENTS.md` plus its parents.
- User-facing admin credentials, GitHub tokens, archive passwords, and API keys must not be committed or written into docs.
- `index.html` is a single-file React admin dashboard loaded through browser CDNs and GitHub REST APIs.
- Root docs such as `task_plan.md`, `gemini.md`, `progress.md`, and `findings.md` are durable project records; update them only when their tracked contract or status changes.

## Work Guidance

- Prefer focused changes that preserve the existing static-dashboard and Quartz customization style.
- Keep admin dashboard changes self-contained in `index.html` unless a separate durable asset boundary is intentionally introduced.
- Treat `.tmp/`, `node_modules/`, nested `node_modules/`, `public/`, `.quartz-cache/`, and `.wrangler/` as generated or local working state.
- When changing locked-vault behavior, read `architecture/locked-vault-security.md` and the applicable Quartz DOX chain.

## Verification

- For root admin dashboard changes, use targeted browser or static validation when practical.
- For Quartz changes, run focused tests from `quartz-repo/` first, then broader checks when the blast radius warrants it.
- For Cloudflare Worker changes, verify TypeScript shape and the relevant request path behavior.

## Child DOX Index

- `architecture/AGENTS.md` - durable architecture and security operating records.
- `chatbot-proxy/AGENTS.md` - Cloudflare Worker proxy for public chatbot requests.
- `quartz-repo/AGENTS.md` - customized Quartz source, build pipeline, content, and generated site output.
