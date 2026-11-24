import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start/server", () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

import { checkPassword, createSessionToken, isValidSessionToken } from "./admin-session.server";

describe("sessão do admin", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "senha-certa");
    vi.stubEnv("ADMIN_SESSION_SECRET", "segredo-de-teste");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("aceita o token que ele mesmo gerou", () => {
    expect(isValidSessionToken(createSessionToken())).toBe(true);
  });

  it("recusa token vazio, malformado ou o antigo cookie 'true'", () => {
    expect(isValidSessionToken(undefined)).toBe(false);
    expect(isValidSessionToken("")).toBe(false);
    expect(isValidSessionToken("true")).toBe(false);
    expect(isValidSessionToken("abc.def")).toBe(false);
  });

  it("recusa token com validade alterada", () => {
    const [, sig] = createSessionToken().split(".");
    const forjado = `${Date.now() + 10 * 365 * 864e5}.${sig}`;
    expect(isValidSessionToken(forjado)).toBe(false);
  });

  it("recusa token expirado", () => {
    const antigo = createSessionToken(Date.now() - 8 * 864e5);
    expect(isValidSessionToken(antigo)).toBe(false);
  });

  it("recusa token assinado com outro segredo", () => {
    const token = createSessionToken();
    vi.stubEnv("ADMIN_SESSION_SECRET", "outro-segredo");
    expect(isValidSessionToken(token)).toBe(false);
  });

  it("confere a senha", () => {
    expect(checkPassword("senha-certa")).toBe(true);
    expect(checkPassword("senha-errada")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });
});
