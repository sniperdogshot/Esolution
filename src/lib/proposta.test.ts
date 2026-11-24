import { describe, expect, it } from "vitest";

import {
  calcularEconomia,
  fioBPagoNoAno,
  dataPorExtenso,
  geracaoPorMes,
  potenciaKwp,
  propostaPadrao,
  REAJUSTE_MEDIO,
} from "./proposta";

describe("proposta", () => {
  it("usa os valores da proposta modelo", () => {
    const p = propostaPadrao();
    expect(potenciaKwp(p)).toBeCloseTo(14.91, 2);
    expect(REAJUSTE_MEDIO).toBe(5.81);
  });

  it("distribui a geração nos meses com média igual à informada", () => {
    const meses = geracaoPorMes(2000);
    expect(meses).toHaveLength(12);
    const media = meses.reduce((s, m) => s + m.kwh, 0) / 12;
    expect(media).toBeCloseTo(2000, 0);
  });

  it("reproduz as tarifas da planilha modelo nos 3 primeiros anos (Fio B subindo)", () => {
    const r = calcularEconomia({ ...propostaPadrao(), data: "2026-05-25" });
    // planilha: 0,57 → 0,50 → 0,43 R$/kWh
    expect(r.linhas[0]!.tarifa).toBeCloseTo(0.57, 1);
    expect(r.linhas[1]!.tarifa).toBeCloseTo(0.5, 1);
    expect(r.linhas[2]!.tarifa).toBeCloseTo(0.43, 1);
    expect(r.linhas[0]!.geracao).toBe(24000);
    expect(r.linhas[0]!.saldo).toBeCloseTo(r.linhas[0]!.economia - 29800, 6);
    expect(r.linhas).toHaveLength(26);
  });

  it("chega perto da economia total e do payback da planilha modelo", () => {
    const r = calcularEconomia({ ...propostaPadrao(), data: "2026-05-25" });
    // planilha: R$ 458.675,60 e 28 meses (ela arredonda a tarifa a cada ano)
    expect(r.economiaTotal).toBeGreaterThan(458_675 * 0.97);
    expect(r.economiaTotal).toBeLessThan(458_675 * 1.03);
    expect(r.paybackMeses).toBeGreaterThanOrEqual(27);
    expect(r.paybackMeses).toBeLessThanOrEqual(30);
  });

  it("segue a regra do Fio B da Lei 14.300", () => {
    expect(fioBPagoNoAno(2022, 90)).toBe(0);
    expect(fioBPagoNoAno(2026, 90)).toBe(60);
    expect(fioBPagoNoAno(2028, 90)).toBe(90);
    expect(fioBPagoNoAno(2031, 100)).toBe(100);
  });

  it("desconta a troca do inversor no ano 15", () => {
    const r = calcularEconomia(propostaPadrao());
    expect(r.linhas[15]!.investimento).toBe(8940);
    expect(r.linhas[14]!.investimento).toBe(0);
  });

  it("calcula o payback em meses", () => {
    const p = {
      ...propostaPadrao(),
      perdaAnual: 0,
      reajusteAnual: 0,
      tarifaCheia: 1,
      fioB: 0,
      geracaoMensal: 1000,
      valorAVista: 18000,
    };
    // economia de R$ 12.000/ano: paga R$ 18.000 em 18 meses
    expect(calcularEconomia(p).paybackMeses).toBe(18);
  });

  it("devolve payback nulo quando não se paga no período", () => {
    const p = { ...propostaPadrao(), valorAVista: 10_000_000 };
    expect(calcularEconomia(p).paybackMeses).toBeNull();
  });

  it("escreve a data por extenso", () => {
    expect(dataPorExtenso("2026-05-25")).toBe("25 de maio de 2026");
  });
});
