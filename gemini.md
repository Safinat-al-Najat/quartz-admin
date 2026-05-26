# Project Constitution & Map: Quartz Page Locking & Encryption System

This is the Project Constitution for the Quartz 4 Client-Side AES-256 Page Locking & Encryption System.

## 1. Project Information & North Star
- **North Star**: Build a 100% free, database-less, secure, and beautiful client-side AES-256 page encryption and locking system for the Quartz static site using a single site-wide password, with complete protection against search index leaks.
- **Source of Truth**: Plaintext note content in the git repository (never committed in encrypted state; encrypted only during build pipeline and restored post-build).
- **Delivery Payload**: AES-GCM encrypted ciphertext HTML embedded within a secure container layout in compiled pages, decrypted natively in-browser.

## 2. JSON Data Schemas

### Master Password Config (`quartz-repo/archive-config.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "password": {
      "type": "string",
      "description": "Plaintext master password used for AES-256-GCM encryption of locked notes"
    }
  },
  "required": ["password"]
}
```

### Encrypted Page Payload Schema (Embedded HTML Data Attribute)
```json
{
  "iv": "hex-encoded-initialization-vector-12-bytes",
  "combined": "base64-encoded-ciphertext-and-auth-tag"
}
```
Stored as: `iv:combined` (e.g. `e0f760...:dGhpcyBpcyBjb2...`) in the `data-payload` attribute of the container.

## 3. Invariant Rules & Constraints
- **Search Index Leak Trap**: Absolutely no plaintext of locked pages must exist in `content/` during the execution of `npx quartz build`. All locked pages must be replaced with the encrypted HTML container *before* compilation begins.
- **Master Key Security**: The master password should be loaded from `process.env.ARCHIVE_PASSWORD` as the primary source of truth (suitable for GitHub Secrets). A local `archive-config.json` inside the git repository acts as a fallback for local testing.
- **No Multiple Password Prompts**: Successful password verification must store the password securely in `sessionStorage` and automatically unlock any subsequent locked notes instantly.
- **Locked Root Is Protected**: The locked folder gateway (`content/locked/index.md`) is encrypted like every other locked note. Generated `/locked/` output must contain both `#encrypted-container[data-payload]` and `#password-gate-container[data-verify]`.
- **Single Visible Title**: Locked pages must render one visible page title. Decrypted payload HTML must not duplicate Quartz's `h1.article-title`.
- **Double-Encrypt Prevention**: The pre-build pipeline must create `.bak` backup files for locked pages. If a `.bak` file already exists, it must not encrypt the file again (preventing data loss if a build crashes midway).
- **Framework Limits**: No React state hooks (e.g., useState, useEffect) on the frontend. Use pure DOM manipulation in the `.inline.ts` file, attached to the Quartz component's `afterDOMLoaded` hook.

## 4. State Tracking & Maintenance Log
- **Phase**: Blueprint (Phase 1)
- **Status**: Planning (Awaiting user review and blueprint approval)
- **Last Updated**: 2026-05-25

## 5. Public Chatbot Schema
```json
{
  "question": "string",
  "contextChunks": [
    {
      "title": "string",
      "slug": "string",
      "content": "string",
      "images": [
        {
          "alt": "string",
          "url": "string"
        }
      ]
    }
  ]
}
```

Invariant: the public assistant must stay grounded in retrieved site notes, but retrieval and response style should tolerate minor spelling mismatches and partial context instead of refusing rigidly.

## 6. Archive Password Source Rule
Admin dashboard password changes update `archive-config.json` in the Quartz repository. The Quartz build must therefore read `archive-config.json` first and use `ARCHIVE_PASSWORD` only as a fallback, otherwise the admin panel can appear to save successfully while production keeps using an older GitHub Actions secret.
