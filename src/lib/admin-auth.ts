import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { checkPassword, endSession, hasValidSession, startSession } from "./admin-session.server";

/** Bloqueia a server function se não houver sessão de admin válida. */
export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  if (!hasValidSession()) {
    throw new Error("Não autorizado");
  }
  return next();
});

export const loginAdminFn = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) {
      console.warn("[admin] Login recusado: senha incorreta");
      // Atrasa a resposta para dificultar tentativa e erro em massa.
      await new Promise((r) => setTimeout(r, 800));
      return { ok: false as const };
    }
    startSession();
    console.info("[admin] Login feito");
    return { ok: true as const };
  });

export const logoutAdminFn = createServerFn({ method: "POST" }).handler(async () => {
  endSession();
  return { ok: true };
});

export const getAdminSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  return { authed: hasValidSession() };
});
