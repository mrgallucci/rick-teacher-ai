from __future__ import annotations

import logging
import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("rick-teacher-ai")

app = FastAPI(
    title="Rick Teacher AI Local API",
    version="3.0.0",
    description="Minimal local API for the Rick Teacher AI portfolio project.",
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna").strip()
client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


class TutorMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1800)


class TutorChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    student_name: str = Field(default="Student", max_length=80)
    level: str = Field(default="A1 - Beginner", max_length=40)
    goal: str = Field(default="general English", max_length=120)
    lesson_context: str = Field(default="", max_length=500)
    history: list[TutorMessage] = Field(default_factory=list, max_length=12)


class TutorChatResponse(BaseModel):
    reply: str
    model: str


TUTOR_INSTRUCTIONS = """
You are Rick Teacher AI, an independent English-learning tutor.
The learner is a Brazilian Portuguese speaker at A1 beginner level.

Teaching rules:
- Teach practical beginner English first.
- Use short English examples and explain in Brazilian Portuguese when useful.
- Correct mistakes gently and explain one important point at a time.
- Prefer greetings, introductions, verb to be, numbers, family, food, everyday objects,
  routines, time, directions and basic travel situations.
- Adapt examples to the learner's stated goal and current lesson context.
- End with exactly one short practice question or mini challenge in English.
- Keep normal answers under 180 words unless the learner asks for more detail.
- You receive text only; never claim to have evaluated pronunciation or audio quality.
- Do not imitate or role-play any copyrighted TV or film character. Rick Teacher AI is only the product name.
""".strip()


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "ai_configured": bool(client),
        "model": OPENAI_MODEL,
    }


@app.post("/api/tutor/chat", response_model=TutorChatResponse)
async def tutor_chat(payload: TutorChatRequest) -> TutorChatResponse:
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="LLM não configurado. Adicione OPENAI_API_KEY em backend/.env e reinicie o servidor.",
        )

    context = (
        f"Student: {payload.student_name}. "
        f"Level: {payload.level}. "
        f"Goal: {payload.goal}. "
        f"Current lesson: {payload.lesson_context or 'general beginner practice'}."
    )

    conversation = [
        {"role": item.role, "content": item.content}
        for item in payload.history[-10:]
    ]
    conversation.append(
        {
            "role": "user",
            "content": f"{context}\n\nLearner message: {payload.message}",
        }
    )

    try:
        response = await client.responses.create(
            model=OPENAI_MODEL,
            instructions=TUTOR_INSTRUCTIONS,
            input=conversation,
            max_output_tokens=500,
            store=False,
        )
    except Exception as exc:
        logger.exception("LLM request failed")
        raise HTTPException(
            status_code=502,
            detail="O tutor não conseguiu responder. Confira chave, modelo e saldo da API.",
        ) from exc

    reply = (response.output_text or "").strip()
    if not reply:
        raise HTTPException(status_code=502, detail="O modelo retornou uma resposta vazia.")

    return TutorChatResponse(reply=reply, model=OPENAI_MODEL)


origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:5501,http://localhost:5501",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
