from fastapi import FastAPI, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from collections import deque
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import hmac
import json
import logging
import os
import re

import requests
from dotenv import load_dotenv

from database import engine, SessionLocal, Base
from models import Atendimento

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("esolution-bot")

app = FastAPI(title="Esolution WhatsApp Bot")

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")
APP_SECRET = os.getenv("APP_SECRET")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
NOTIFY_PHONE = os.getenv("NOTIFY_PHONE")
GRAPH_API_VERSION = os.getenv("GRAPH_API_VERSION", "v23.0")
ENABLE_TEST_ROUTE = os.getenv("ENABLE_TEST_ROUTE") == "1"

# Depois desse prazo, um lead já atendido que volta a escrever recomeça o fluxo
DIAS_PARA_REINICIAR = 30

# IDs das últimas mensagens tratadas (a Meta reenvia o webhook quando acha que falhou)
mensagens_vistas = deque(maxlen=1000)

Base.metadata.create_all(bind=engine)


SAUDACAO = (
    "Esolution Engenharia\n\n"
    "Olá, tudo bem? 👋 "
    "Aqui é a Esolution Engenharia ☀️\n\n"
    "Recebemos sua solicitação de orçamento "
    "de energia solar.\n\n"
    "Qual é o valor médio da sua conta de luz?"
)


def obter_atendimento(db: Session, telefone: str):
    return (
        db.query(Atendimento)
        .filter(Atendimento.telefone == telefone)
        .first()
    )


def criar_atendimento(db: Session, telefone: str):

    atendimento = Atendimento(
        telefone=telefone,
        etapa="conta"
    )

    db.add(atendimento)
    db.commit()
    db.refresh(atendimento)

    return atendimento


def extrair_valor(mensagem: str):
    """Lê um valor em reais de textos como 'R$ 1.200,50', '450.50' ou '500 reais'."""

    encontrado = re.search(r"\d[\d.,]*", mensagem)

    if not encontrado:
        return None

    numero = encontrado.group().rstrip(".,")

    if "." in numero and "," in numero:

        # O separador que aparece por último é o decimal
        if numero.rfind(",") > numero.rfind("."):
            numero = numero.replace(".", "").replace(",", ".")
        else:
            numero = numero.replace(",", "")

    elif "." in numero or "," in numero:

        separador = "," if "," in numero else "."
        partes = numero.split(separador)

        # '1.200' é milhar; '450.50' e '450,5' são decimais
        if len(partes) > 2 or len(partes[-1]) == 3:
            numero = "".join(partes)
        else:
            numero = ".".join(partes)

    try:
        valor = Decimal(numero)
    except InvalidOperation:
        return None

    if valor <= 0 or valor > 9_999_999:
        return None

    return valor


def atendimento_expirou(atendimento: Atendimento):

    if not atendimento.atualizado_em:
        return False

    agora = datetime.now(timezone.utc).replace(tzinfo=None)

    return agora - atendimento.atualizado_em > timedelta(days=DIAS_PARA_REINICIAR)


def processar_mensagem(
    db: Session,
    telefone: str,
    mensagem: str
):
    """Devolve (resposta, lead). resposta é None quando o bot deve ficar em silêncio;
    lead é o atendimento quando ele acabou de ser finalizado."""

    mensagem = mensagem.strip()

    atendimento = obter_atendimento(
        db,
        telefone
    )

    # ============================================
    # PRIMEIRO CONTATO
    # ============================================

    if not atendimento:

        criar_atendimento(
            db,
            telefone
        )

        return SAUDACAO, None


    # ============================================
    # ETAPA 1 - VALOR DA CONTA
    # ============================================

    if atendimento.etapa == "conta":

        valor = extrair_valor(mensagem)

        if valor is None:

            return (
                "Não consegui identificar o valor "
                "da sua conta. 😊\n\n"
                "Pode me informar aproximadamente "
                "quanto você paga por mês?\n\n"
                "Exemplo: R$ 500"
            ), None

        atendimento.valor_conta = valor

        atendimento.etapa = "aumento_consumo"

        db.commit()

        return (
            "Entendi! 👍\n\n"
            "Você tem intenção de aumentar o "
            "consumo de energia?\n\n"
            "Responda *sim* ou *não*."
        ), None


    # ============================================
    # ETAPA 2 - AUMENTO DE CONSUMO
    # ============================================

    if atendimento.etapa == "aumento_consumo":

        resposta = mensagem.lower().strip(" .!?,")

        primeira_palavra = resposta.split()[0].strip(".!?,") if resposta else ""

        if resposta == "com certeza" or primeira_palavra in [
            "sim",
            "s",
            "quero",
            "pretendo",
            "claro"
        ]:

            atendimento.aumento_consumo = "sim"

            atendimento.etapa = "equipamento"

            db.commit()

            return (
                "Perfeito! 👍\n\n"
                "O que você pretende instalar "
                "ou adicionar ao seu consumo?\n\n"
                "Por exemplo: piscina, ar-condicionado, "
                "carregador de carro elétrico, etc."
            ), None


        if primeira_palavra in [
            "não",
            "nao",
            "n"
        ]:

            atendimento.aumento_consumo = "não"

            atendimento.etapa = "cidade"

            db.commit()

            return (
                "Certo! 👍\n\n"
                "Me confirma, qual é a cidade "
                "da instalação?"
            ), None


        return (
            "Só preciso confirmar uma informação. 😊\n\n"
            "Você tem intenção de aumentar o "
            "consumo de energia?\n\n"
            "Responda *sim* ou *não*."
        ), None


    # ============================================
    # ETAPA 3 - EQUIPAMENTO
    # ============================================

    if atendimento.etapa == "equipamento":

        atendimento.equipamento = mensagem

        atendimento.etapa = "cidade"

        db.commit()

        return (
            "Entendi! 👍\n\n"
            "Agora me confirma, qual é a cidade "
            "da instalação?"
        ), None


    # ============================================
    # ETAPA 4 - CIDADE
    # ============================================

    if atendimento.etapa == "cidade":

        atendimento.cidade = mensagem[:100]

        atendimento.etapa = "finalizado"

        db.commit()

        return (
            "Perfeito! ☀️\n\n"
            "Obrigado pelas informações.\n\n"
            "Vou chamar o especialista responsável "
            "para dar continuidade e combinar a "
            "visita técnica com você, tá?"
        ), atendimento


    # ============================================
    # ATENDIMENTO FINALIZADO
    # ============================================

    if atendimento.etapa in ["finalizado", "encerrado"]:

        # Cliente antigo voltando depois de muito tempo: recomeça
        if atendimento_expirou(atendimento):

            atendimento.valor_conta = None
            atendimento.aumento_consumo = None
            atendimento.equipamento = None
            atendimento.cidade = None
            atendimento.etapa = "conta"

            db.commit()

            return SAUDACAO, None

        # Avisa uma vez e depois fica em silêncio, para não atrapalhar o especialista
        if atendimento.etapa == "finalizado":

            atendimento.etapa = "encerrado"

            db.commit()

            return (
                "Seu atendimento já foi registrado. ☀️\n\n"
                "O especialista responsável dará "
                "continuidade ao seu atendimento."
            ), None

        return None, None


    return (
        "Olá! 👋\n\n"
        "Vamos continuar seu atendimento."
    ), None


# ================================================
# ENVIO PELA API DO WHATSAPP
# ================================================

def enviar_mensagem(telefone: str, texto: str):

    if not WHATSAPP_TOKEN or not PHONE_NUMBER_ID:

        logger.error(
            "WHATSAPP_TOKEN ou PHONE_NUMBER_ID não configurados: "
            "a resposta não foi enviada."
        )

        return False

    try:

        resposta = requests.post(
            f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages",
            headers={"Authorization": f"Bearer {WHATSAPP_TOKEN}"},
            json={
                "messaging_product": "whatsapp",
                "to": telefone,
                "type": "text",
                "text": {"body": texto}
            },
            timeout=10
        )

    except requests.RequestException as e:

        logger.error("Falha de rede ao enviar mensagem: %s", e)

        return False

    if not resposta.ok:

        logger.error(
            "A API do WhatsApp recusou o envio (%s): %s",
            resposta.status_code,
            resposta.text[:500]
        )

        return False

    return True


def notificar_especialista(atendimento: Atendimento):

    if not NOTIFY_PHONE:
        return

    aumento = atendimento.aumento_consumo or "-"

    if atendimento.equipamento:
        aumento += f" ({atendimento.equipamento})"

    enviar_mensagem(
        NOTIFY_PHONE,
        "Novo lead pelo WhatsApp ☀️\n\n"
        f"Telefone: +{atendimento.telefone}\n"
        f"Conta de luz: R$ {atendimento.valor_conta}\n"
        f"Vai aumentar o consumo: {aumento}\n"
        f"Cidade: {atendimento.cidade}"
    )


def assinatura_valida(corpo: bytes, assinatura):

    if not APP_SECRET or not assinatura:
        return False

    esperada = "sha256=" + hmac.new(
        APP_SECRET.encode(),
        corpo,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(esperada, assinatura)


def tratar_webhook(data: dict):

    for entry in data.get("entry", []):

        for change in entry.get("changes", []):

            for message in change.get("value", {}).get("messages", []):

                try:

                    tratar_mensagem(message)

                except Exception:

                    logger.exception("Erro ao processar mensagem do webhook")


def tratar_mensagem(message: dict):

    mensagem_id = message.get("id")

    if mensagem_id in mensagens_vistas:
        return

    mensagens_vistas.append(mensagem_id)

    tipo = message.get("type")

    if tipo != "text":

        logger.info("Mensagem ignorada, tipo não suportado: %s", tipo)

        return

    telefone = message["from"]

    db = SessionLocal()

    try:

        resposta, lead = processar_mensagem(
            db,
            telefone,
            message["text"]["body"]
        )

        if resposta:
            enviar_mensagem(telefone, resposta)

        if lead:
            notificar_especialista(lead)

    finally:

        db.close()


# ================================================
# HOME
# ================================================

@app.get("/")
def home():

    return {
        "status": "online",
        "message": "Esolution WhatsApp Bot está funcionando!"
    }


# ================================================
# ROTA DE TESTE (só com ENABLE_TEST_ROUTE=1; não envia nada pelo WhatsApp)
# ================================================

if ENABLE_TEST_ROUTE:

    @app.get("/testar")
    def testar_bot(
        mensagem: str,
        telefone: str = "teste"
    ):

        db = SessionLocal()

        try:

            resposta, _ = processar_mensagem(
                db,
                telefone,
                mensagem
            )

            return {
                "telefone": telefone,
                "mensagem": mensagem,
                "resposta": resposta
            }

        finally:

            db.close()


# ================================================
# WEBHOOK META - VERIFICAÇÃO
# ================================================

@app.get("/webhook")
async def verify_webhook(
    request: Request
):

    params = request.query_params

    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if (
        mode == "subscribe"
        and VERIFY_TOKEN
        and token
        and hmac.compare_digest(token.encode(), VERIFY_TOKEN.encode())
    ):

        return PlainTextResponse(
            challenge
        )

    return PlainTextResponse(
        "Token inválido",
        status_code=403
    )


# ================================================
# WEBHOOK META - RECEBIMENTO
# ================================================

@app.post("/webhook")
async def receive_webhook(request: Request):

    corpo = await request.body()

    if not assinatura_valida(
        corpo,
        request.headers.get("X-Hub-Signature-256")
    ):

        logger.warning("Webhook recusado: assinatura ausente ou inválida")

        return PlainTextResponse(
            "Assinatura inválida",
            status_code=403
        )

    try:

        data = json.loads(corpo)

    except ValueError:

        return PlainTextResponse(
            "JSON inválido",
            status_code=400
        )

    # Sempre 200 daqui em diante: erros internos ficam no log e a Meta não reenvia em loop
    await run_in_threadpool(tratar_webhook, data)

    return {"status": "ok"}
