# Public Chatbot Assistant SOP

## Goal
The public chatbot should answer questions about Safinat al-Najat notes in a grounded but conversational way. It must use site context as the source of truth, tolerate minor spelling mismatches in user questions, and render readable HTML from common Markdown output.

## Input Schema
```json
{
  "question": "string",
  "contextChunks": [
    {
      "title": "string",
      "slug": "string",
      "content": "string"
    }
  ]
}
```

## Output Schema
The proxy streams Mistral chat-completion SSE chunks directly to the browser. The browser incrementally converts supported Markdown to safe HTML.

## Behavioral Rules
- Use `mistral-small-latest` unless an environment override intentionally changes `MISTRAL_MODEL`.
- Answer directly when the provided context clearly supports the answer.
- Treat minor spelling mistakes, pluralization, and close word forms as likely matches during local retrieval.
- If context is partial, say what the notes appear to cover and name the limitation instead of using a rigid exact refusal.
- If no relevant context is supplied, give a short site-scoped fallback and invite a more specific query.
- Do not invent facts that are not supported by the retrieved site notes.
- Render bold Markdown as `<strong>` and strip stray unmatched `**` markers so users never see raw formatting tokens.
