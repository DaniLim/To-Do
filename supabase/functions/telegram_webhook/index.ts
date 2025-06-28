// index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Gemini request payload based on docs/mcp_spec.yaml
const GEMINI_FUNCTION_DECLARATIONS = [
  {
    name: "add_task",
    description: "Add a task or calendar item",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        list: { type: "string" },
        due: { type: "string", format: "date-time", nullable: true },
        important: { type: "boolean" },
        repeat: {
          type: "string",
          enum: ["daily", "weekly", "monthly", "yearly", "custom"],
          nullable: true,
        },
      },
      required: ["title"],
    },
  },
];

async function parseWithGemini(
  apiKey: string,
  text: string,
): Promise<Record<string, unknown> | null> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text }] }],
    tools: [{ function_declarations: GEMINI_FUNCTION_DECLARATIONS }],
    tool_config: { function_calling_config: { mode: "AUTO" } },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  const call =
    json?.candidates?.[0]?.content?.parts?.[0]?.functionCall || null;
  if (!call || call.name !== "add_task") return null;
  try {
    const args = typeof call.args === "string"
      ? JSON.parse(call.args)
      : call.args;
    return args ?? null;
  } catch (err) {
    console.error("Failed to parse Gemini args:", err);
    return null;
  }
}

serve(async (req) => {
  // 1. Validate Telegram webhook secret
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_SECRET_TOKEN");
const incoming = req.headers.get("x-telegram-bot-api-secret-token");
if (!WEBHOOK_SECRET || incoming !== WEBHOOK_SECRET) {
  console.warn("Unauthorized request, got:", incoming);
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

  // 2. Parse env vars and initialize clients
  const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_TOKEN");
  const SPBASE_URL = Deno.env.get("SPBASE_URL");
  const SPBASE_SERVICE_ROLE_KEY = Deno.env.get("SPBASE_SERVICE_ROLE_KEY");

  if (!TELEGRAM_TOKEN || !SPBASE_URL || !SPBASE_SERVICE_ROLE_KEY) {
    console.error("Missing one or more required env vars");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SPBASE_URL, SPBASE_SERVICE_ROLE_KEY);

  try {
    // 3. Parse incoming Telegram update
    const update = await req.json();
    const text = update?.message?.text;
    const chatId = update?.message?.chat?.id;

    // 4. Parse text via Gemini and insert task
    let insertedTitle = text || "";
    if (text) {
      try {
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
        const parsed = GEMINI_API_KEY
          ? await parseWithGemini(GEMINI_API_KEY, text)
          : null;
        if (parsed) {
          insertedTitle = String(parsed.title || text);
          let listId = null;
          if (parsed.list) {
            const { data: existing } = await supabase
              .from("task_lists")
              .select("id")
              .eq("name", parsed.list)
              .maybeSingle();
            if (existing) {
              listId = existing.id;
            } else {
              const { data: newList } = await supabase
                .from("task_lists")
                .insert({ name: parsed.list })
                .select()
                .single();
              listId = newList.id;
            }
          }
          await supabase.from("tasks").insert({
            list_id: listId,
            title: insertedTitle,
            due_at: parsed.due || null,
            important: parsed.important ?? false,
            repeat: parsed.repeat || null,
          });
        } else {
          await supabase.from("tasks").insert({ title: text });
        }
      } catch (gerr) {
        console.error("Gemini parse error:", gerr);
        await supabase.from("tasks").insert({ title: text });
      }
    }

    // 5. Acknowledge back to the user
    if (chatId) {
      const telegramRes = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ Added: ${insertedTitle}`,
          }),
        },
      );

      if (!telegramRes.ok) {
        const errText = await telegramRes.text();
        console.error("Telegram API error:", errText);
      }
    }

    // 6. Return success JSON
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error in handler:", err);
    return new Response(
      JSON.stringify({ status: "error", message: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
