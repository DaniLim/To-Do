// index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // 1. Validate Telegram webhook secret
  const TELEGRAM_SECRET = Deno.env.get("TELEGRAM_SECRET_TOKEN");
  const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!TELEGRAM_SECRET || incomingSecret !== TELEGRAM_SECRET) {
    console.warn("Unauthorized request, bad or missing secret:", incomingSecret);
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

    // 4. Insert new task if text is present
    if (text) {
      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert({ title: text });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
      } else {
        console.log("Inserted task:", data);
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
            text: "✅ Added!",
          }),
        }
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
