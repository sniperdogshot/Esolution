export const WHATSAPP_NUMBER = "5585981546006";

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface SimResult {
  consumoMensal: number;
  economiaAnual: number;
  economiaMensal: number;
  novaContaMensal: number;
  novaContaAnual: number;
}

export function simulate(valorConta: number): SimResult {
  const consumoMensal = valorConta / 0.9848;
  const consumoAnual = consumoMensal * 12;
  const economiaAnual =
    consumoAnual * (0.35 * 0.9848 + 0.65 * 0.342 + 0.65 * 0.6428 * 0.35);
  const economiaMensal = economiaAnual / 12;
  const novaContaMensal = valorConta - economiaMensal;
  const novaContaAnual = valorConta * 12 - economiaAnual;
  return { consumoMensal, economiaAnual, economiaMensal, novaContaMensal, novaContaAnual };
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (n: number) => brl.format(n).replace(/\u00a0/g, " ");
export const formatKwh = (n: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n);

/** Parses "1.234,56", "738,57" or "738.57" into a number. */
export function parseBRL(input: string): number {
  const s = input.replace(/[^\d.,]/g, "");
  if (!s) return NaN;
  if (s.includes(",")) return Number(s.replace(/\./g, "").replace(",", "."));
  return Number(s);
}
