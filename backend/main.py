from fastapi import FastAPI, Request
from google.generativeai import GenerativeModel
from supabase import create_client
from telegram import Update
from telegram.ext import Application, ContextTypes, MessageHandler, filters

import os

app = FastAPI()

SPBASE_URL = os.getenv("SPBASE_URL")
SPBASE_SERVICE_ROLE_KEY = os.getenv("SPBASE_SERVICE_ROLE_KEY")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

supabase = create_client(SPBASE_URL, SPBASE_SERVICE_ROLE_KEY)
model = GenerativeModel("gemini-pro")

bot_app = Application.builder().token(TELEGRAM_TOKEN).build()

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    prompt = update.message.text
    # TODO: call Gemini with MCP tools and parse response
    # Placeholder insert
    supabase.table("tasks").insert({"title": prompt}).execute()
    await update.message.reply_text("✅ Added!")

bot_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

@app.post("/webhook")
async def telegram_webhook(request: Request):
    update = Update.de_json(await request.json(), bot_app.bot)
    await bot_app.initialize()
    await bot_app.process_update(update)
    return {"status": "ok"}
