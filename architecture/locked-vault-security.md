# Locked Vault Security SOP

## Goal
Locked Quartz content under `content/locked/` must be protected during static build output while staying usable after one successful password entry per browser tab session.

## Inputs
- Plaintext Markdown source files in `quartz-repo/content/locked/**/*.md`.
- Master password from `ARCHIVE_PASSWORD`, with `quartz-repo/archive-config.json` as local fallback only.
- Build-time verification token in `quartz-repo/.quartz-cache/verification.json`.

## Build Rules
- Before `npx quartz build`, every locked Markdown file, including `content/locked/index.md`, is temporarily replaced with an encrypted placeholder.
- Each locked placeholder must contain `#encrypted-container[data-payload]`.
- Each locked output page must contain `#password-gate-container[data-verify]` with a non-empty verification token.
- Locked-page Obsidian image embeds must resolve to real files under `content/`. If an embed cannot be resolved, the build must fail with the note path and missing asset name instead of emitting broken image URLs.
- Vault attachment folders, including `PNGS/`, must be present under `content/` so Quartz's asset emitter copies them into `public/`.
- Register each Quartz asset/static emitter only once. Duplicate `Plugin.Assets()` or `Plugin.Static()` registrations can copy the same files concurrently and fail on Windows with `EBUSY`.
- After the build, plaintext files must be restored from `.quartz-cache/backups`.
- Locked plaintext must not appear in `public/static/contentIndex.json`.

## Runtime Rules
- A successful password entry stores the derived AES key in `sessionStorage.archive_session_key`.
- Any later `/locked` page in the same tab must import the stored key and decrypt automatically.
- The stored key is cleared only when verification fails, not when one page payload is missing or corrupt.
- If a valid session exists on a locked page without an encrypted payload, the gate must be removed instead of showing a dead password form.

## Title Rules
- Quartz owns the visible page title through `h1.article-title`.
- Decrypted payload HTML must not add a second equivalent leading `h1` when an article title is already present.
- Runtime title updates may update `h1.article-title` and `document.title`, but must not duplicate headings in the page body.
