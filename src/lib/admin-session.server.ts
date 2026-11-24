// Sessão do painel admin. Só roda no servidor.
//
// O cookie guarda "<expira-em-ms>.<assinatura HMAC>". Ele é HttpOnly (o JavaScript da página
// não lê nem cria) e assinado com ADMIN_SESSION_SECRET, então não dá para forjar no navegador.
import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

export const SESSION_COOKIE = "esolution_admin";
const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60; // 7 dias

function getSecret(): string {
  // Sem ADMIN_SESSION_SECRET, deriva da senha: trocar a senha derruba todas as sessões.
  const secret = process.env["ADMIN_SESSION_SECRET"] || process.env["ADMIN_PASSWORD"];
  if (!secret) throw new Error("ADMIN_PASSWORD não configurada");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function createSessionToken(now = Date.now()): string {
  const expires = String(now + SESSION_MAX_AGE_S * 1000);
  return `${expires}.${sign(expires)}`;
}

export function isValidSessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) <= now) return false;
  return safeEqual(signature, sign(expires));
}

export function checkPassword(password: string): boolean {
  const valid = process.env["ADMIN_PASSWORD"];
  if (!valid) throw new Error("ADMIN_PASSWORD não configurada");
  // Compara os hashes para o tempo não depender do tamanho/conteúdo da senha.
  const h = (s: string) => createHmac("sha256", "admin-pw").update(s).digest("base64url");
  return safeEqual(h(password), h(valid));
}

export function startSession() {
  setCookie(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export function endSession() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export function hasValidSession(): boolean {
  return isValidSessionToken(getCookie(SESSION_COOKIE));
}
