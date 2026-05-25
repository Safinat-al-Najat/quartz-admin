# Findings & Research - Quartz Page Locking & Encryption

## Discoveries & Codebase Analysis

### 1. Unified Markdown Processing
- We can parse Markdown and compile it to HTML using standard packages already present in `quartz-repo/node_modules`:
  - `unified` (ESM module)
  - `remark-parse` (converts Markdown text to MD AST)
  - `remark-rehype` (converts MD AST to HTML AST)
  - `hast-util-to-html` (converts HTML AST to HTML string)
- This allows our pre-build script `encrypt-archive.js` to compile the plaintext body of a note to standard HTML before encrypting it. The client only needs to decrypt the payload and insert the HTML directly, avoiding any need to parse Markdown inside the browser.

### 2. Web Crypto API Decryption
- Modern browsers support AES-GCM decryption natively using the Web Crypto API (`window.crypto.subtle`).
- We can hash the master password using SHA-256 to derive a 256-bit key:
  ```javascript
  const keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["decrypt"]);
  ```
- To perform decryption, we split the combined ciphertext payload string (`IV_HEX:COMBINED_BASE64`):
  - Extract the 12-byte IV buffer from `IV_HEX`.
  - Extract the combined ciphertext + 16-byte auth tag buffer from `COMBINED_BASE64`.
  - Decrypt using `crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuffer }, cryptoKey, combinedBuffer)`.

### 3. Quartz Navigation Lifecycle
- Quartz uses SPA-style page routing via `spa.inline.ts` which fires a `"nav"` document event:
  ```javascript
  document.addEventListener("nav", () => { ... })
  ```
- Any DOM initialization and event registration in `passwordGate.inline.ts` must execute inside the `"nav"` event listener. If a page transition occurs, we must automatically check `sessionStorage` and decrypt the content in place without forcing the user to re-enter the password.

### 4. Admin Panel Integration
- The Admin Panel (`index.html`) is a standalone local React app. It uses the GitHub API to list, read, and write repository files.
- It can read and write `quartz-repo/archive-config.json` via the GitHub API.
- It can recursively scan the notes repository (`safinat-al-najat.github.io`) using the Git Trees API (`GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`) to get all files in one request, and check/toggle the `locked: true` frontmatter.

## Technical Constraints & API Limits
- **GitHub API Rate Limits**: Since the admin panel is a client-side app, it is subject to GitHub API rate limits. Fetching all notes in one tree request is efficient. We will batch fetch note contents to check frontmatter states to avoid hitting rate limits.
- **Node.js ESM vs CJS**: Quartz 4 is an ESM project (`"type": "module"` in `package.json`). Therefore, `encrypt-archive.js` should be written as an ES module or a standard JS script using `import` statements.
