# Architecture DOX

## Purpose

- Owns durable design notes, SOPs, and security contracts for this workspace.

## Ownership

- `chatbot-public-assistant.md` documents public assistant behavior and grounding rules.
- `locked-vault-security.md` documents locked archive build/runtime invariants.

## Local Contracts

- Keep architecture docs operational and current; do not store diary entries here.
- Security and privacy invariants in this folder must be reflected in implementation changes that touch the same behavior.

## Work Guidance

- Prefer concise sections with explicit goals, inputs, rules, and verification expectations.
- Remove stale or contradictory statements when implementation contracts change.

## Verification

- When implementation changes affect an architecture doc, verify the matching tests or build checks before marking the doc current.

## Child DOX Index

- No child DOX files.
