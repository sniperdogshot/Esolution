// Proposta técnica comercial: dados do formulário, valores padrão e cálculo de economia/payback.
// Os padrões reproduzem a proposta modelo (Rita Bona, Rev. 02, maio/2026).

export interface Proposta {
  // Cliente
  cliente: string;
  local: string; // cidade onde a proposta é emitida
  data: string; // YYYY-MM-DD
  revisao: string;
  // Sistema
  geracaoMensal: number; // kWh/mês estimados
  qtdPaineis: number;
  potenciaPainelW: number;
  modeloPainel: string;
  garantiaPainelAnos: number;
  inversor: string;
  garantiaInversorAnos: number;
  outrosItens: string; // um por linha
  // Valores
  valorAVista: number;
  valorCartao: number;
  parcelasCartao: number;
  // Premissas da economia
  tarifaCheia: number; // R$/kWh da conta, com impostos, no ano da proposta
  fioB: number; // R$/kWh do Fio B (parte da TUSD que deixa de ser compensada, Lei 14.300)
  fioBDepois2028: number; // % do Fio B pago a partir de 2029 (a lei deixa para a ANEEL definir)
  reajusteAnual: number; // %
  perdaAnual: number; // % de geração perdida por ano (degradação dos painéis)
  anos: number;
  trocaInversorAno: number;
  trocaInversorValor: number;
  // Assinatura e validade
  validadeDias: number;
  responsavel: string;
  cargo: string;
  registro: string;
}

export const EMPRESA = {
  razao: "ESOLUTION - ENGENHARIA E SOLUÇÕES EIRELI",
  cnpj: "38.203.842/0001-13",
  endereco: "Rua Zildênia, 1166 – Sala 05 – Coaçu – Eusébio-CE",
};

export const ITENS_INCLUSOS = [
  "Dimensionamento do sistema;",
  "Desenvolvimento do projeto e solicitação de pedido de geração distribuída à Concessionária;",
  "Fornecimento de todos os materiais necessários;",
  "Instalação do sistema fotovoltaico;",
  "Ativação do sistema, comissionamento e testes;",
  "Agendamento de vistoria junto à concessionária.",
];

/** Reajuste da tarifa da Enel Ceará (fonte: enel.com.br/pt-ceara/Tarifas_Enel.html). */
export const REAJUSTES_ENEL: [number, number][] = [
  [2016, 12.97],
  [2017, 0.15],
  [2018, 4.96],
  [2019, 8.29],
  [2020, 3.94],
  [2021, 8.95],
  [2022, 21.84],
  [2023, 3.06],
  [2024, -2.81],
  [2025, -2.1],
  [2026, 4.67],
];
export const REAJUSTE_MEDIO =
  Math.round((REAJUSTES_ENEL.reduce((s, [, v]) => s + v, 0) / REAJUSTES_ENEL.length) * 100) / 100;

/** Variação da geração ao longo do ano no Ceará (média = 1). Tirada da proposta modelo. */
const SAZONALIDADE_BRUTA = [
  1.017, 0.919, 0.9, 0.96, 0.98, 1.0, 1.017, 1.03, 1.06, 1.04, 1.04, 0.98,
];
const MEDIA_SAZ = SAZONALIDADE_BRUTA.reduce((s, v) => s + v, 0) / 12;
export const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function geracaoPorMes(geracaoMensal: number) {
  return MESES.map((mes, i) => ({
    mes,
    kwh: Math.round(((geracaoMensal * (SAZONALIDADE_BRUTA[i] ?? 1)) / MEDIA_SAZ) * 10) / 10,
  }));
}

export function hojeISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function propostaPadrao(): Proposta {
  return {
    cliente: "",
    local: "Fortaleza",
    data: hojeISO(),
    revisao: "01",
    geracaoMensal: 2000,
    qtdPaineis: 21,
    potenciaPainelW: 710,
    modeloPainel: "PAINÉIS DAH 710W BIFACIAL N-TYPE TOPCON - TIER 1",
    garantiaPainelAnos: 25,
    inversor: "INVERSOR SOLPLANET 15KW 380V AFCI (ASW15K-LT-G2-PRO)",
    garantiaInversorAnos: 10,
    outrosItens: [
      "Estruturas de fixação",
      "Quadros de proteção CC e CA",
      "Conectores MC4",
      "Cabos solares de 4mm²",
      "Aterramento dos painéis",
    ].join("\n"),
    valorAVista: 29800,
    valorCartao: 34270,
    parcelasCartao: 10,
    // Reproduzem a planilha da proposta modelo (0,57 → 0,50 → 0,43 R$/kWh nos 3 primeiros anos).
    tarifaCheia: 0.94,
    fioB: 0.61,
    fioBDepois2028: 90,
    reajusteAnual: REAJUSTE_MEDIO,
    perdaAnual: 0.6,
    anos: 25,
    trocaInversorAno: 15,
    trocaInversorValor: 8940,
    validadeDias: 15,
    responsavel: "Juliano Bastos",
    cargo: "Diretor Técnico – Eng. Eletricista",
    registro: "CREA: RNP 0600046338",
  };
}

export const potenciaKwp = (p: Pick<Proposta, "qtdPaineis" | "potenciaPainelW">) =>
  (p.qtdPaineis * p.potenciaPainelW) / 1000;

/** % do Fio B que o sistema paga em cada ano (Lei 14.300/2022, art. 27, para quem conectou a partir de 2023). */
export function fioBPagoNoAno(ano: number, depoisDe2028: number): number {
  const regra: Record<number, number> = {
    2023: 15,
    2024: 30,
    2025: 45,
    2026: 60,
    2027: 75,
    2028: 90,
  };
  if (ano < 2023) return 0;
  return regra[ano] ?? depoisDe2028;
}

function anoInicial(p: Pick<Proposta, "data">): number {
  const y = Number(p.data.slice(0, 4));
  return Number.isFinite(y) && y > 2000 ? y : new Date().getFullYear();
}

export interface LinhaEconomia {
  ano: number;
  geracao: number; // kWh no ano
  tarifa: number; // R$/kWh que o cliente deixa de pagar (tarifa cheia − Fio B pago)
  fioBPct: number; // % do Fio B pago nesse ano
  economia: number; // R$ no ano
  investimento: number; // R$ gasto no ano (compra no ano 0, troca do inversor depois)
  saldo: number; // acumulado: economia - investimentos
}

export interface ResultadoEconomia {
  linhas: LinhaEconomia[];
  economiaTotal: number; // saldo no último ano
  paybackMeses: number | null; // null se não se paga no período
}

/**
 * Economia ano a ano. O ano 0 são os primeiros 12 meses de uso.
 * - geração cai `perdaAnual`% ao ano (degradação dos painéis);
 * - tarifa cheia e Fio B sobem `reajusteAnual`% ao ano;
 * - o cliente paga uma parte crescente do Fio B (Lei 14.300), que reduz a economia;
 * - sem juros/capitalização (como na proposta modelo).
 */
export function calcularEconomia(p: Proposta): ResultadoEconomia {
  const linhas: LinhaEconomia[] = [];
  const anual0 = p.geracaoMensal * 12;
  let saldo = 0;
  let paybackMeses: number | null = null;

  for (let ano = 0; ano <= p.anos; ano++) {
    const geracao = Math.round(anual0 * Math.pow(1 - p.perdaAnual / 100, ano));
    const fator = Math.pow(1 + p.reajusteAnual / 100, ano);
    const fioBPct = fioBPagoNoAno(anoInicial(p) + ano, p.fioBDepois2028);
    const tarifa = Math.max(0, (p.tarifaCheia - (p.fioB * fioBPct) / 100) * fator);
    const economia = geracao * tarifa;
    const investimento =
      (ano === 0 ? p.valorAVista : 0) +
      (p.trocaInversorAno > 0 && ano === p.trocaInversorAno ? p.trocaInversorValor : 0);
    // O investimento sai no começo do ano; a economia entra ao longo dos 12 meses.
    const inicioDoAno = saldo - investimento;
    saldo = inicioDoAno + economia;
    if (paybackMeses === null && inicioDoAno < 0 && saldo >= 0 && economia > 0) {
      paybackMeses = ano * 12 + Math.ceil((-inicioDoAno / economia) * 12);
    }
    linhas.push({ ano, geracao, tarifa, fioBPct, economia, investimento, saldo });
  }
  if (paybackMeses === null && p.valorAVista <= 0) paybackMeses = 0;
  return { linhas, economiaTotal: saldo, paybackMeses };
}

// Formatação pt-BR
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const reais = (n: number) => brl.format(n).replace(/\u00a0/g, " ");
export const numero = (n: number, casas = 0) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(n);

export function dataPorExtenso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return `${d} de ${meses[m - 1]} de ${y}`;
}

export function dataCurta(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}
