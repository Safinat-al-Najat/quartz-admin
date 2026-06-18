# Chatbot Proxy DOX

## Purpose

- Owns the Cloudflare Worker that proxies public chat requests to Mistral with site-grounded context.

## Ownership

- `index.ts` contains CORS handling, request validation, prompt construction, conversation-history trimming, and streaming response proxying.
- `wrangler.toml` owns Worker deployment configuration.

## Local Contracts

- Accept only configured site origins and localhost development origins.
- Keep the API surface limited to `POST /api/chat` plus CORS preflight.
- Never log, document, or commit `MISTRAL_API_KEY` values.
- Preserve the assistant rule that answers should be grounded in provided context, with brief clearly framed general background only when context is missing or partial.

## Work Guidance

- Keep request validation explicit and response errors readable.
- Preserve streaming behavior unless the task explicitly changes client/server protocol.

## Verification

- Validate changed request paths with local or Worker-compatible smoke checks when practical.
- Re-read `architecture/chatbot-public-assistant.md` before changing assistant prompt behavior.

## Child DOX Index

- No child DOX files.
