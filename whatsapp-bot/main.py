from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from decimal import Decimal
import os

from dotenv import load_dotenv

from database import engine, SessionLocal, Base
from models import Atendimento

load_dotenv()

app = FastAPI(title="Esolution WhatsApp Bot")

VERIFY_TOKEN = os.getenv(
    "VERIFY_TOKEN",
    "esolution_bot_2026"
)

Base.metadata.create_all(bind=engine)


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


def processar_mensagem(
    db: Session,
    telefone: str,
    mensagem: str
):

    mensagem = mensagem.strip()

    atendimento = obter_atendimento(
        db,
        telefone
    )

    # ============================================
    # PRIMEIRO CONTATO
    # ============================================

    if not atendimento:

        atendimento = criar_atendimento(
            db,
            telefone
        )

        return (
            "Esolution Engenharia\n\n"
            "Olá, tudo bem? 👋 "
            "Aqui é a Esolution Engenharia ☀️\n\n"
            "Recebemos sua solicitação de orçamento "
            "de energia solar.\n\n"
            "Qual é o valor médio da sua conta de luz?"
        )


    # ============================================
    # ETAPA 1 - VALOR DA CONTA
    # ============================================

    if atendimento.etapa == "conta":

        valor = (
            mensagem
            .replace("R$", "")
            .replace("r$", "")
            .replace(".", "")
            .replace(",", ".")
            .strip()
        )

        try:

            atendimento.valor_conta = Decimal(valor)

        except:

            return (
                "Não consegui identificar o valor "
                "da sua conta. 😊\n\n"
                "Pode me informar aproximadamente "
                "quanto você paga por mês?\n\n"
                "Exemplo: R$ 500"
            )

        atendimento.etapa = "aumento_consumo"

        db.commit()

        return (
            "Entendi! 👍\n\n"
            "Você tem intenção de aumentar o "
            "consumo de energia?\n\n"
            "Responda *sim* ou *não*."
        )


    # ============================================
    # ETAPA 2 - AUMENTO DE CONSUMO
    # ============================================

    if atendimento.etapa == "aumento_consumo":

        resposta = mensagem.lower()

        if resposta in [
            "sim",
            "s",
            "quero",
            "pretendo",
            "com certeza"
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
            )


        if resposta in [
            "não",
            "nao",
            "n",
            "não sei",
            "nao sei"
        ]:

            atendimento.aumento_consumo = "não"

            atendimento.etapa = "cidade"

            db.commit()

            return (
                "Certo! 👍\n\n"
                "Me confirma, qual é a cidade "
                "da instalação?"
            )


        return (
            "Só preciso confirmar uma informação. 😊\n\n"
            "Você tem intenção de aumentar o "
            "consumo de energia?\n\n"
            "Responda *sim* ou *não*."
        )


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
        )


    # ============================================
    # ETAPA 4 - CIDADE
    # ============================================

    if atendimento.etapa == "cidade":

        atendimento.cidade = mensagem

        atendimento.etapa = "finalizado"

        db.commit()

        return (
            "Perfeito! ☀️\n\n"
            "Obrigado pelas informações.\n\n"
            "Vou chamar o especialista responsável "
            "para dar continuidade e combinar a "
            "visita técnica com você, tá?"
        )


    # ============================================
    # ATENDIMENTO FINALIZADO
    # ============================================

    if atendimento.etapa == "finalizado":

        return (
            "Seu atendimento já foi registrado. ☀️\n\n"
            "O especialista responsável dará "
            "continuidade ao seu atendimento."
        )


    return (
        "Olá! 👋\n\n"
        "Vamos continuar seu atendimento."
    )


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
# ROTA DE TESTE
# ================================================

@app.get("/testar")
def testar_bot(
    mensagem: str,
    telefone: str = "teste"
):

    db = SessionLocal()

    try:

        resposta = processar_mensagem(
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
        and token == VERIFY_TOKEN
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
async def receive_webhook(
    request: Request
):

    data = await request.json()

    print("\nMensagem recebida:")
    print(data)

    return {
        "status": "received"
    }