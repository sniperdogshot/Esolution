import { describe, expect, it } from "vitest";
import { formatBRL, formatKwh, parseBRL, simulate, waLink } from "./simulator";

describe("simulator", () => {
  describe("simulate", () => {
    it("calculates correctly for typical value", () => {
      const r = simulate(738.57);
      expect(r.economiaAnual).toBeCloseTo(6418.69, 2);
      expect(r.economiaMensal).toBeCloseTo(534.89, 2);
      expect(r.novaContaMensal).toBeCloseTo(203.68, 2);
      expect(r.novaContaAnual).toBeCloseTo(2444.15, 2);
      expect(r.consumoMensal).toBeCloseTo(750, 0);
    });

    it("handles zero input", () => {
      const r = simulate(0);
      expect(r.economiaAnual).toBe(0);
      expect(r.economiaMensal).toBe(0);
      expect(r.novaContaMensal).toBe(0);
      expect(r.novaContaAnual).toBe(0);
      expect(r.consumoMensal).toBe(0);
    });

    it("handles large numbers", () => {
      const r = simulate(100000);
      expect(r.economiaAnual).toBeGreaterThan(0);
      expect(r.novaContaMensal).toBeLessThan(100000);
      expect(r.consumoMensal).toBeCloseTo(101543.46, 2);
    });

    it("handles small numbers", () => {
      const r = simulate(10);
      expect(r.economiaAnual).toBeGreaterThan(0);
      expect(r.novaContaMensal).toBeLessThan(10);
    });

    it("handles decimal input", () => {
      const r = simulate(100.5);
      expect(r.economiaMensal).toBeGreaterThan(0);
      expect(r.novaContaMensal).toBeLessThan(100.5);
    });

    it("returns all required fields", () => {
      const r = simulate(500);
      expect(r).toHaveProperty("consumoMensal");
      expect(r).toHaveProperty("economiaAnual");
      expect(r).toHaveProperty("economiaMensal");
      expect(r).toHaveProperty("novaContaMensal");
      expect(r).toHaveProperty("novaContaAnual");
    });
  });

  describe("parseBRL", () => {
    it("parses Brazilian format with dots and comma", () => {
      expect(parseBRL("1.234,56")).toBe(1234.56);
    });

    it("parses simple comma decimal", () => {
      expect(parseBRL("738,57")).toBe(738.57);
    });

    it("parses dot decimal (US format)", () => {
      expect(parseBRL("738.57")).toBe(738.57);
    });

    it("parses integer without decimals", () => {
      expect(parseBRL("1000")).toBe(1000);
    });

    it("parses integer with dot treated as decimal (no comma)", () => {
      expect(parseBRL("1.000")).toBe(1);
    });

    it("parses large numbers with thousand separators", () => {
      expect(parseBRL("1.234.567,89")).toBe(1234567.89);
    });

    it("handles empty string", () => {
      expect(parseBRL("")).toBeNaN();
    });

    it("handles whitespace only", () => {
      expect(parseBRL("   ")).toBeNaN();
    });

    it("handles only currency symbol", () => {
      expect(parseBRL("R$")).toBeNaN();
    });

    it("handles invalid input with letters", () => {
      expect(parseBRL("abc")).toBeNaN();
    });

    it("handles mixed invalid input - strips non-numeric", () => {
      expect(parseBRL("1.234,abc")).toBe(1234);
    });

    it("handles multiple commas - returns NaN", () => {
      expect(parseBRL("1,234,56")).toBeNaN();
    });

    it("handles multiple dots with comma", () => {
      expect(parseBRL("1.234.567,89")).toBe(1234567.89);
    });

    it("handles negative numbers - minus sign stripped", () => {
      expect(parseBRL("-1.234,56")).toBe(1234.56);
    });

    it("handles negative with comma - minus sign stripped", () => {
      expect(parseBRL("-738,57")).toBe(738.57);
    });

    it("strips currency symbols and spaces", () => {
      expect(parseBRL("R$ 1.234,56")).toBe(1234.56);
      expect(parseBRL("  738,57  ")).toBe(738.57);
    });
  });

  describe("formatBRL", () => {
    it("formats integer as BRL", () => {
      expect(formatBRL(1000)).toBe("R$ 1.000,00");
    });

    it("formats decimal as BRL", () => {
      expect(formatBRL(1234.56)).toBe("R$ 1.234,56");
    });

    it("formats zero as BRL", () => {
      expect(formatBRL(0)).toBe("R$ 0,00");
    });

    it("formats large numbers", () => {
      expect(formatBRL(1000000)).toBe("R$ 1.000.000,00");
    });

    it("formats small decimals", () => {
      expect(formatBRL(0.5)).toBe("R$ 0,50");
    });

    it("formats negative numbers", () => {
      expect(formatBRL(-1000)).toBe("-R$ 1.000,00");
    });

    it("handles very large numbers", () => {
      expect(formatBRL(999999999.99)).toBe("R$ 999.999.999,99");
    });
  });

  describe("formatKwh", () => {
    it("formats integer kWh", () => {
      expect(formatKwh(750)).toBe("750");
    });

    it("rounds decimal kWh", () => {
      expect(formatKwh(750.4)).toBe("750");
      expect(formatKwh(750.5)).toBe("751");
      expect(formatKwh(750.9)).toBe("751");
    });

    it("formats zero", () => {
      expect(formatKwh(0)).toBe("0");
    });

    it("formats large numbers", () => {
      expect(formatKwh(1000000)).toBe("1.000.000");
    });

    it("formats small decimals", () => {
      expect(formatKwh(0.5)).toBe("1");
      expect(formatKwh(0.4)).toBe("0");
    });

    it("formats negative numbers", () => {
      expect(formatKwh(-750)).toBe("-750");
    });
  });

  describe("waLink", () => {
    it("generates correct WhatsApp link", () => {
      const link = waLink("Olá, gostaria de simular");
      expect(link).toBe("https://wa.me/5585921035492?text=Ol%C3%A1%2C%20gostaria%20de%20simular");
    });

    it("encodes special characters", () => {
      const link = waLink("Teste & teste");
      expect(link).toContain("Teste%20%26%20teste");
    });

    it("encodes spaces as %20", () => {
      const link = waLink("hello world");
      expect(link).toContain("hello%20world");
    });

    it("handles empty message", () => {
      const link = waLink("");
      expect(link).toBe("https://wa.me/5585921035492?text=");
    });

    it("handles message with accents", () => {
      const link = waLink("Simulação de energia");
      expect(link).toContain("Simula%C3%A7%C3%A3o%20de%20energia");
    });

    it("handles message with emoji", () => {
      const link = waLink("Olá 😊");
      expect(link).toContain("Ol%C3%A1%20%F0%9F%98%8A");
    });
  });
});
