import { describe, expect, it } from "vitest";
import { formatBRL, formatKwh, parseBRL, simulate } from "./simulator";

describe("simulador", () => {
  const r = simulate(738.57);
  it("economia no 1º ano", () => expect(formatBRL(r.economiaAnual)).toBe("R$ 6.418,69"));
  it("economia por mês", () => expect(formatBRL(r.economiaMensal)).toBe("R$ 534,89"));
  it("nova conta mensal", () => expect(formatBRL(r.novaContaMensal)).toBe("R$ 203,68"));
  it("nova conta no ano", () => expect(formatBRL(r.novaContaAnual)).toBe("R$ 2.444,15"));
  it("consumo kWh/mês", () => expect(formatKwh(r.consumoMensal)).toBe("750"));
  it("aceita vírgula", () => expect(parseBRL("1.234,56")).toBe(1234.56));
});
