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
    let contextChunks: {
      title: string;
      slug: string;
      content: string;
      images?: { alt: string; url: string }[];
    }[];
    let conversationHistory: { role: "user" | "assistant"; content: string }[] = [];

    try {
      const body = await request.json() as any;
      question = body.question;
      contextChunks = body.contextChunks;
      conversationHistory = Array.isArray(body.conversationHistory)
        ? body.conversationHistory
            .filter((turn: any) =>
              (turn?.role === "user" || turn?.role === "assistant") &&
              typeof turn?.content === "string" &&
              turn.content.trim().length > 0
            )
            .slice(-10)
            .map((turn: any) => ({
              role: turn.role,
              content: turn.content.trim().slice(0, 4000),
            }))
        : [];

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
      .map((c, i) => {
        const imageList = (c.images || [])
          .map((img) => `- ![${img.alt || "Image"}](${img.url})`)
          .join("\n");
        return `[Source ${i + 1}]: Title: "${c.title}" (Link: /${c.slug})\nContent:\n${c.content}${
          imageList ? `\n\nImages available from this source:\n${imageList}` : ""
        }`;
      })
      .join("\n\n---\n\n");

    const systemPrompt = `You are a helpful research assistant for the static site / digital garden "Safinat al-Najat".
Answer using the provided context chunks as your primary source of truth. Be direct, readable, and conversational.
The user may misspell names or terms. If the retrieved context appears relevant despite spelling differences, infer the likely intended term and answer normally.
Do not invent details about the site's notes. If you use general background knowledge for broad Islamic or historical questions, keep it brief and clearly frame it as general background, then steer the user toward specific site notes for more detail.

If the context only partially answers the question, answer the supported part first, then briefly say what the notes do not make clear.
If the context is empty or unrelated, do not use a rigid refusal. Give a short helpful answer when the question is broadly about Islam, Islamic history, rulings, Quranic topics, or the site's likely research areas. Then add that you could not find a matching note and suggest a more specific topic, person, event, or title.

If an image from the source is relevant, include it using only the exact Markdown image syntax supplied in "Images available from this source". Never invent image URLs, alt text placeholders, or "replace this URL" image markdown.
Format with simple Markdown when helpful: short paragraphs, bullets, **bold** labels, and images. Keep answers concise unless the user asks for detail.
Use the recent conversation history to understand same-session follow-ups, especially when the user answers a question you just asked. If the latest user message conflicts with older history, follow the latest message.

Context:
${contextString}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    if (
      messages[messages.length - 1]?.role !== "user" ||
      messages[messages.length - 1]?.content !== question
    ) {
      messages.push({ role: "user", content: question });
    }

    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.MISTRAL_MODEL || "mistral-small-latest",
          messages,
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
