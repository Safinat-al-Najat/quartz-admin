# Task Plan - Quartz Page Locking & Encryption System

## Phase Checklists

### Chatbot Public Assistant Fix (2026-05-26)
- [x] Document chatbot behavior rules in `architecture/chatbot-public-assistant.md`
- [x] Add regression tests for typo-tolerant context retrieval and Markdown bold rendering
- [x] Update worker model and assistant prompt to be less rigid while remaining grounded
- [x] Update client retrieval/parser helpers
- [x] Run focused tests and compile checks

### Chatbot + Admin Follow-Up Fixes (2026-05-26)
- [x] Verify live worker prompt deployment state
- [x] Add image-aware context extraction and image rendering in chat bubbles
- [x] Make no-context answers conversational instead of hard-refusal shaped
- [x] Make admin password changes affect production builds
- [x] Verify locally and deploy worker if credentials allow

### Phase 1: Blueprint (Research & Alignment)
- [x] Scan codebase and analyze existing component configurations (`quartz.layout.ts`, `package.json`)
- [x] Define JSON Data schemas in `gemini.md`
- [x] Prepare Implementation Plan and get approval
- [ ] Answer discovery questions (or resolve them in implementation plan)

### Phase 2: Link (Connectivity Verification)
- [ ] Verify local project build and compile flow (`npx quartz build`)
- [ ] Verify cryptography module functions in local node script
- [ ] Setup `.env` file with `ARCHIVE_PASSWORD` for local testing

### Phase 3: Architect (Implementation)
- [ ] Create Build Pipeline script: `quartz-repo/encrypt-archive.js`
  - [ ] Support scan & intercept of `locked: true` pages
  - [ ] Implement Markdown compiler using existing remark/unified packages
  - [ ] Implement AES-256-GCM encryption & secure placeholder writing
  - [ ] Implement Restoration mode (`--restore` flag) using `.bak` files
- [ ] Configure `package.json` build scripts to automate pre-build encryption and post-build restoration
- [ ] Implement custom Quartz 4 components:
  - [ ] `quartz/components/PasswordGate.tsx` (renders glassmorphic modal on locked pages)
  - [ ] `quartz/components/scripts/passwordGate.inline.ts` (submits key, decrypts GCM payload, stores key in sessionStorage)
  - [ ] `quartz/components/styles/passwordGate.scss` (glassmorphic blur, modern typography, animations)
- [ ] Integrate PasswordGate component in layout:
  - [ ] Export in `quartz/components/index.ts`
  - [ ] Register in `quartz.layout.ts` under global layout components
- [x] Repair locked folder unlock behavior:
  - [x] Ensure `/locked/` output always has encrypted payload and verification token
  - [x] Auto-decrypt child locked pages from `sessionStorage.archive_session_key`
  - [x] Remove duplicate decrypted titles from locked folder/file bodies
  - [x] Add generated-output regression tests for payload, verification token, and content-index leakage

### Phase 4: Stylize (Refinement & UI Tuning)
- [ ] Modify Admin Panel `index.html` to add "Archive Security" section:
  - [ ] Add sidebar page tab and view container
  - [ ] Add Master Password editor interface (reads/writes `archive-config.json` via GitHub API)
  - [ ] Add File list view (recursive Git Trees API fetch of content notes)
  - [ ] Add Toggle switches next to files to add/strip `locked: true` frontmatter
- [ ] Refine styling:
  - [ ] CSS styling in `passwordGate.scss` using HSL green theme
  - [ ] Shaking animation for incorrect password entry
  - [ ] Glassmorphic inputs and backdrops

### Phase 5: Trigger (Verification & Launch)
- [x] Run local build and verify compilation matches constraints
- [x] Validate search index leak protection: ensure compiled `static/contentIndex.json` contains no sensitive plaintext from locked notes
- [ ] Verify deployment instructions
