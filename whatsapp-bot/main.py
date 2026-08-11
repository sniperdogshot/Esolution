
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Esolution WhatsApp Bot")

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "esolution_bot_2026")


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Esolution WhatsApp Bot está funcionando!"
    }


@app.get("/webhook")
async def verify_webhook(request: Request):
    params = request.query_params

    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return PlainTextResponse(challenge)

    return PlainTextResponse("Token inválido", status_code=403)


@app.post("/webhook")
async def receive_webhook(request: Request):
    data = await request.json()

    print("Mensagem recebida:")
    print(data)

    return {
        "status": "received"
    }

