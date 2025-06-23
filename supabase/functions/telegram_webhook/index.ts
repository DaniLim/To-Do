import { serve } from "https://deno.land/x/supabase_functions/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

serve(async (req) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_TOKEN, GEMINI_API_KEY } = Deno.env.toObject();

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

  const update = await req.json();
  const text = update?.message?.text;
  const chatId = update?.message?.chat?.id;

  if (text) {
    await supabase.from('tasks').insert({ title: text });
  }

  if (chatId) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: '✅ Added!' })
    });
  }

  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
});
