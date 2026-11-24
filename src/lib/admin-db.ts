import pg from "pg";

const { Pool, types } = pg;
type Pool = InstanceType<typeof Pool>;

// O bot grava TIMESTAMP sem fuso, em UTC. Por padrão o pg leria como hora local do servidor.
types.setTypeParser(types.builtins.TIMESTAMP, (v) => new Date(v.replace(" ", "T") + "Z"));
// DATE fica como texto "YYYY-MM-DD", sem virar meia-noite local.
types.setTypeParser(types.builtins.DATE, (v) => v);

// ============================================
// TIPOS
// ============================================

export interface MetricasGerais {
  totalLeads: number;
  leadsFinalizados: number;
  leadsEmAndamento: number;
  valorMedioConta: number | null;
  leadsUltimos7Dias: number;
  leadsUltimos30Dias: number;
}

export interface LeadsPorEtapa {
  etapa: string;
  count: number;
}

export interface LeadsPorCidade {
  cidade: string;
  count: number;
}

export interface LeadsPorPeriodo {
  data: string; // YYYY-MM-DD
  count: number;
}

export interface LeadsAumentoConsumo {
  aumento: string; // 'sim' | 'não'
  count: number;
}

export interface LeadRecente {
  id: number;
  telefone: string;
  valor_conta: number | null;
  etapa: string;
  cidade: string | null;
  aumento_consumo: string | null;
  equipamento: string | null;
  criado_em: string;
}

// ============================================
// DADOS MOCK PARA DESENVOLVIMENTO
// ============================================

const MOCK_LEADS: LeadRecente[] = [
  {
    id: 1,
    telefone: "85999990001",
    valor_conta: 450.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Ar condicionado 12000 BTUs",
    criado_em: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    id: 2,
    telefone: "85999990002",
    valor_conta: 320.5,
    etapa: "finalizado",
    cidade: "Eusébio",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 5 * 864e5).toISOString(),
  },
  {
    id: 3,
    telefone: "85999990003",
    valor_conta: 680.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Geladeira Frost Free",
    criado_em: new Date(Date.now() - 10 * 864e5).toISOString(),
  },
  {
    id: 4,
    telefone: "85999990004",
    valor_conta: 275.0,
    etapa: "encerrado",
    cidade: "Maracanaú",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 15 * 864e5).toISOString(),
  },
  {
    id: 5,
    telefone: "85999990005",
    valor_conta: 510.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Máquina de lavar 11kg",
    criado_em: new Date(Date.now() - 20 * 864e5).toISOString(),
  },
  {
    id: 6,
    telefone: "85999990006",
    valor_conta: 380.0,
    etapa: "conta",
    cidade: "Fortaleza",
    aumento_consumo: null,
    equipamento: null,
    criado_em: new Date(Date.now() - 1 * 864e5).toISOString(),
  },
  {
    id: 7,
    telefone: "85999990007",
    valor_conta: 420.0,
    etapa: "aumento_consumo",
    cidade: "Caucaia",
    aumento_consumo: "sim",
    equipamento: null,
    criado_em: new Date(Date.now() - 3 * 864e5).toISOString(),
  },
  {
    id: 8,
    telefone: "85999990008",
    valor_conta: 290.0,
    etapa: "equipamento",
    cidade: "Fortaleza",
    aumento_consumo: "não",
    equipamento: "Micro-ondas",
    criado_em: new Date(Date.now() - 4 * 864e5).toISOString(),
  },
  {
    id: 9,
    telefone: "85999990009",
    valor_conta: 550.0,
    etapa: "cidade",
    cidade: "Eusébio",
    aumento_consumo: "sim",
    equipamento: "Ar condicionado 9000 BTUs",
    criado_em: new Date(Date.now() - 6 * 864e5).toISOString(),
  },
  {
    id: 10,
    telefone: "85999990010",
    valor_conta: 310.0,
    etapa: "conta",
    cidade: "Fortaleza",
    aumento_consumo: null,
    equipamento: null,
    criado_em: new Date(Date.now() - 7 * 864e5).toISOString(),
  },
  {
    id: 11,
    telefone: "85999990011",
    valor_conta: null,
    etapa: "inicio",
    cidade: null,
    aumento_consumo: null,
    equipamento: null,
    criado_em: new Date(Date.now() - 3600e3).toISOString(),
  },
  {
    id: 12,
    telefone: "85999990012",
    valor_conta: null,
    etapa: "inicio",
    cidade: null,
    aumento_consumo: null,
    equipamento: null,
    criado_em: new Date(Date.now() - 3 * 3600e3).toISOString(),
  },
  {
    id: 13,
    telefone: "85999990013",
    valor_conta: null,
    etapa: "inicio",
    cidade: null,
    aumento_consumo: null,
    equipamento: null,
    criado_em: new Date(Date.now() - 864e5).toISOString(),
  },
  {
    id: 14,
    telefone: "85999990014",
    valor_conta: 400.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Freezer",
    criado_em: new Date(Date.now() - 8 * 864e5).toISOString(),
  },
  {
    id: 15,
    telefone: "85999990015",
    valor_conta: 250.0,
    etapa: "finalizado",
    cidade: "Maracanaú",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 9 * 864e5).toISOString(),
  },
  {
    id: 16,
    telefone: "85999990016",
    valor_conta: 600.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Lava-louças",
    criado_em: new Date(Date.now() - 11 * 864e5).toISOString(),
  },
  {
    id: 17,
    telefone: "85999990017",
    valor_conta: 330.0,
    etapa: "encerrado",
    cidade: "Caucaia",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 12 * 864e5).toISOString(),
  },
  {
    id: 18,
    telefone: "85999990018",
    valor_conta: 480.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Ar condicionado 18000 BTUs",
    criado_em: new Date(Date.now() - 14 * 864e5).toISOString(),
  },
  {
    id: 19,
    telefone: "85999990019",
    valor_conta: 290.0,
    etapa: "finalizado",
    cidade: "Eusébio",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 18 * 864e5).toISOString(),
  },
  {
    id: 20,
    telefone: "85999990020",
    valor_conta: 410.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Adega",
    criado_em: new Date(Date.now() - 22 * 864e5).toISOString(),
  },
  {
    id: 21,
    telefone: "85999990021",
    valor_conta: 370.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 25 * 864e5).toISOString(),
  },
  {
    id: 22,
    telefone: "85999990022",
    valor_conta: 520.0,
    etapa: "finalizado",
    cidade: "Maracanaú",
    aumento_consumo: "sim",
    equipamento: "Cervejeira",
    criado_em: new Date(Date.now() - 28 * 864e5).toISOString(),
  },
  {
    id: 23,
    telefone: "85999990023",
    valor_conta: 300.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 3 * 864e5).toISOString(),
  },
  {
    id: 24,
    telefone: "85999990024",
    valor_conta: 280.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Ventilador",
    criado_em: new Date(Date.now() - 4 * 864e5).toISOString(),
  },
  {
    id: 25,
    telefone: "85999990025",
    valor_conta: 350.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 5 * 864e5).toISOString(),
  },
  {
    id: 26,
    telefone: "85999990026",
    valor_conta: 420.0,
    etapa: "finalizado",
    cidade: "Eusébio",
    aumento_consumo: "sim",
    equipamento: "Purificador",
    criado_em: new Date(Date.now() - 6 * 864e5).toISOString(),
  },
  {
    id: 27,
    telefone: "85999990027",
    valor_conta: 310.0,
    etapa: "finalizado",
    cidade: "Caucaia",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 7 * 864e5).toISOString(),
  },
  {
    id: 28,
    telefone: "85999990028",
    valor_conta: 390.0,
    etapa: "finalizado",
    cidade: "Maracanaú",
    aumento_consumo: "sim",
    equipamento: "Cooktop",
    criado_em: new Date(Date.now() - 8 * 864e5).toISOString(),
  },
  {
    id: 29,
    telefone: "85999990029",
    valor_conta: 260.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "não",
    equipamento: null,
    criado_em: new Date(Date.now() - 9 * 864e5).toISOString(),
  },
  {
    id: 30,
    telefone: "85999990030",
    valor_conta: 340.0,
    etapa: "finalizado",
    cidade: "Fortaleza",
    aumento_consumo: "sim",
    equipamento: "Forno",
    criado_em: new Date(Date.now() - 10 * 864e5).toISOString(),
  },
];

// ============================================
// POOL DE CONEXÃO
// ============================================
// Sem DATABASE_URL o painel usa os dados de exemplo acima, só fora de produção.
// Com DATABASE_URL, erros do banco aparecem na tela em vez de virarem dados falsos.

let pool: Pool | null = null;

function shouldUseMock(): boolean {
  if (process.env["DATABASE_URL"]) return false;
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("DATABASE_URL não configurada no servidor");
  }
  return true;
}

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env["DATABASE_URL"] as string;
  const host = new URL(connectionString).hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "postgres";
  pool = new Pool({
    connectionString,
    // Supabase exige SSL; o Postgres local do docker-compose não tem.
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 5,
  });
  pool.on("error", (err) => console.error("[admin-db] Erro no pool:", err.message));
  return pool;
}

async function withMockFallback<T>(dbFn: (p: Pool) => Promise<T>, mockFn: () => T): Promise<T> {
  if (shouldUseMock()) return mockFn();
  return dbFn(getPool());
}

export async function getMetricasGerais(): Promise<MetricasGerais> {
  return withMockFallback(
    async (p) => {
      const result = await p.query(`
      SELECT
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE etapa IN ('finalizado', 'encerrado')) as leads_finalizados,
        COUNT(*) FILTER (WHERE etapa NOT IN ('finalizado', 'encerrado')) as leads_em_andamento,
        AVG(valor_conta) FILTER (WHERE valor_conta IS NOT NULL) as valor_medio_conta,
        COUNT(*) FILTER (WHERE criado_em >= NOW() - INTERVAL '7 days') as leads_7dias,
        COUNT(*) FILTER (WHERE criado_em >= NOW() - INTERVAL '30 days') as leads_30dias
      FROM atendimentos
    `);
      const r = result.rows[0];
      return {
        totalLeads: parseInt(r.total_leads),
        leadsFinalizados: parseInt(r.leads_finalizados),
        leadsEmAndamento: parseInt(r.leads_em_andamento),
        valorMedioConta: r.valor_medio_conta ? parseFloat(r.valor_medio_conta) : null,
        leadsUltimos7Dias: parseInt(r.leads_7dias),
        leadsUltimos30Dias: parseInt(r.leads_30dias),
      };
    },
    () => {
      const finalizados = MOCK_LEADS.filter((l) =>
        ["finalizado", "encerrado"].includes(l.etapa),
      ).length;
      const emAndamento = MOCK_LEADS.filter(
        (l) => !["finalizado", "encerrado"].includes(l.etapa),
      ).length;
      const comValor = MOCK_LEADS.filter((l) => l.valor_conta !== null);
      const valorMedio =
        comValor.length > 0
          ? comValor.reduce((s, l) => s + (l.valor_conta || 0), 0) / comValor.length
          : null;
      const agora = Date.now();
      const leads7dias = MOCK_LEADS.filter(
        (l) => new Date(l.criado_em).getTime() >= agora - 7 * 864e5,
      ).length;
      const leads30dias = MOCK_LEADS.filter(
        (l) => new Date(l.criado_em).getTime() >= agora - 30 * 864e5,
      ).length;

      return {
        totalLeads: MOCK_LEADS.length,
        leadsFinalizados: finalizados,
        leadsEmAndamento: emAndamento,
        valorMedioConta: valorMedio,
        leadsUltimos7Dias: leads7dias,
        leadsUltimos30Dias: leads30dias,
      };
    },
  );
}

export async function getLeadsPorEtapa(): Promise<LeadsPorEtapa[]> {
  return withMockFallback(
    async (p) => {
      const result = await p.query(`
      SELECT etapa, COUNT(*) as count
      FROM atendimentos
      GROUP BY etapa
      ORDER BY count DESC
    `);
      return result.rows.map((r) => ({ etapa: r.etapa, count: parseInt(r.count) }));
    },
    () => {
      const counts: Record<string, number> = {};
      for (const lead of MOCK_LEADS) {
        counts[lead.etapa] = (counts[lead.etapa] || 0) + 1;
      }
      return Object.entries(counts)
        .map(([etapa, count]) => ({ etapa, count }))
        .sort((a, b) => b.count - a.count);
    },
  );
}

export async function getLeadsPorCidade(limit = 10): Promise<LeadsPorCidade[]> {
  return withMockFallback(
    async (p) => {
      const result = await p.query(
        `
      SELECT cidade, COUNT(*) as count
      FROM atendimentos
      WHERE cidade IS NOT NULL
      GROUP BY cidade
      ORDER BY count DESC
      LIMIT $1
    `,
        [limit],
      );
      return result.rows.map((r) => ({ cidade: r.cidade, count: parseInt(r.count) }));
    },
    () => {
      const counts: Record<string, number> = {};
      for (const lead of MOCK_LEADS) {
        if (lead.cidade) {
          counts[lead.cidade] = (counts[lead.cidade] || 0) + 1;
        }
      }
      return Object.entries(counts)
        .map(([cidade, count]) => ({ cidade, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },
  );
}

export async function getLeadsPorPeriodo(dias = 30): Promise<LeadsPorPeriodo[]> {
  return withMockFallback(
    async (p) => {
      const result = await p.query(
        `
      SELECT DATE(criado_em) as data, COUNT(*) as count
      FROM atendimentos
      WHERE criado_em >= NOW() - make_interval(days => $1)
      GROUP BY DATE(criado_em)
      ORDER BY data ASC
    `,
        [Math.trunc(dias)],
      );
      return fillDays(
        dias,
        Object.fromEntries(result.rows.map((r) => [toIsoDate(r.data), parseInt(r.count)])),
      );
    },
    () => {
      const agora = Date.now();
      const cutoff = agora - dias * 864e5;
      const counts: Record<string, number> = {};

      for (const lead of MOCK_LEADS) {
        const leadTime = new Date(lead.criado_em).getTime();
        if (leadTime >= cutoff) {
          const data = toIsoDate(new Date(lead.criado_em));
          counts[data] = (counts[data] || 0) + 1;
        }
      }

      return fillDays(dias, counts);
    },
  );
}

export async function getLeadsAumentoConsumo(): Promise<LeadsAumentoConsumo[]> {
  return withMockFallback(
    async (p) => {
      const result = await p.query(`
      SELECT COALESCE(aumento_consumo, 'não informado') as aumento, COUNT(*) as count
      FROM atendimentos
      GROUP BY aumento
    `);
      return result.rows.map((r) => ({ aumento: r.aumento, count: parseInt(r.count) }));
    },
    () => {
      const counts: Record<string, number> = {};
      for (const lead of MOCK_LEADS) {
        const key = lead.aumento_consumo || "não informado";
        counts[key] = (counts[key] || 0) + 1;
      }
      return Object.entries(counts)
        .map(([aumento, count]) => ({ aumento, count }))
        .sort((a, b) => b.count - a.count);
    },
  );
}

export async function getLeadsRecentes(limit = 20): Promise<LeadRecente[]> {
  return withMockFallback(
    async (p) => {
      const result = await p.query(
        `
      SELECT id, telefone, valor_conta, etapa, cidade, aumento_consumo, equipamento, criado_em
      FROM atendimentos
      ORDER BY criado_em DESC
      LIMIT $1
    `,
        [limit],
      );
      return result.rows.map((r) => ({
        ...r,
        valor_conta: r.valor_conta === null ? null : Number(r.valor_conta),
        criado_em: r.criado_em instanceof Date ? r.criado_em.toISOString() : String(r.criado_em),
      }));
    },
    () => {
      return [...MOCK_LEADS]
        .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
        .slice(0, limit);
    },
  );
}

/** true quando o painel está mostrando os dados de exemplo. */
export function isUsingMock(): boolean {
  return !process.env["DATABASE_URL"] && process.env["NODE_ENV"] !== "production";
}

/** Lista os últimos `dias` dias (inclusive hoje), com 0 nos dias sem leads. */
function fillDays(dias: number, counts: Record<string, number>): LeadsPorPeriodo[] {
  const result: LeadsPorPeriodo[] = [];
  const now = Date.now();
  for (let i = dias - 1; i >= 0; i--) {
    const date = toIsoDate(new Date(now - i * 864e5));
    result.push({ data: date, count: counts[date] || 0 });
  }
  return result;
}

// O pg devolve DATE como objeto Date (meia-noite local); o gráfico espera "YYYY-MM-DD".
function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value);
}
