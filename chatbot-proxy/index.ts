export interface Env {
  MISTRAL_API_KEY: string;
  MISTRAL_MODEL?: string;
}

const ALLOWED_ORIGINS = [
  "https://safinat-al-najat.github.io",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow localhost (with optional port)
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get("Origin");

    // Handle CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      if (isOriginAllowed(origin)) {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": origin!,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      }
      return new Response("CORS Not Allowed", { status: 403 });
    }

    // Only allow POST request for chat API
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/api/chat") {
      return new Response("Not Found", { status: 404 });
    }

    if (!isOriginAllowed(origin)) {
      return new Response("Forbidden: CORS origin not allowed", { status: 403 });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": origin!,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Parse payload
    let question: string;
    let contextChunks: { title: string; slug: string; content: string }[];

    try {
      const body = await request.json() as any;
      question = body.question;
      contextChunks = body.contextChunks;

      if (!question || !Array.isArray(contextChunks)) {
        return new Response("Bad Request: 'question' and 'contextChunks' array are required", {
          status: 400,
          headers: corsHeaders,
        });
      }
    } catch (err: any) {
      return new Response(`Bad Request: Invalid JSON: ${err.message}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!env.MISTRAL_API_KEY) {
      return new Response("Internal Server Error: Missing Mistral API Key configuration", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // System prompt keeps answers grounded while allowing natural partial answers.
    const contextString = contextChunks
      .map((c, i) => `[Source ${i + 1}]: Title: "${c.title}" (Link: /${c.slug})\nContent:\n${c.content}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are a helpful research assistant for the static site / digital garden "Safinat al-Najat".
Answer using the provided context chunks as your source of truth. Be direct, readable, and a little conversational.
The user may misspell names or terms. If the retrieved context appears relevant despite spelling differences, infer the likely intended term and answer normally.
Do not invent facts that are not supported by the context. Do not use outside knowledge for factual claims.

If the context only partially answers the question, answer the supported part first, then briefly say what the notes do not make clear.
If the context is empty or unrelated, say: "I could not find that in the site notes. Try asking with a topic, person, or title from the notes."

Format with simple Markdown when helpful: short paragraphs, bullets, and **bold** labels. Keep answers concise unless the user asks for detail.

Context:
${contextString}`;

    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.MISTRAL_MODEL || "mistral-small-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(errorText, {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      // Return stream directly to client
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });

    } catch (err: any) {
      return new Response(`Error contacting Mistral AI: ${err.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
