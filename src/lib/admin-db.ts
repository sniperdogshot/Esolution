import { Pool } from "pg";

// Pool singleton (reutiliza conexões)
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL não configurada no ambiente do servidor");
    }
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }, // Supabase requer SSL
      max: 5,
    });
  }
  return pool;
}

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

export async function getMetricasGerais(): Promise<MetricasGerais> {
  const p = getPool();
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
}

export async function getLeadsPorEtapa(): Promise<LeadsPorEtapa[]> {
  const p = getPool();
  const result = await p.query(`
    SELECT etapa, COUNT(*) as count
    FROM atendimentos
    GROUP BY etapa
    ORDER BY count DESC
  `);
  return result.rows.map(r => ({ etapa: r.etapa, count: parseInt(r.count) }));
}

export async function getLeadsPorCidade(limit = 10): Promise<LeadsPorCidade[]> {
  const p = getPool();
  const result = await p.query(`
    SELECT cidade, COUNT(*) as count
    FROM atendimentos
    WHERE cidade IS NOT NULL
    GROUP BY cidade
    ORDER BY count DESC
    LIMIT $1
  `, [limit]);
  return result.rows.map(r => ({ cidade: r.cidade, count: parseInt(r.count) }));
}

export async function getLeadsPorPeriodo(dias = 30): Promise<LeadsPorPeriodo[]> {
  const p = getPool();
  const result = await p.query(`
    SELECT DATE(criado_em) as data, COUNT(*) as count
    FROM atendimentos
    WHERE criado_em >= NOW() - INTERVAL '${dias} days'
    GROUP BY DATE(criado_em)
    ORDER BY data ASC
  `);
  return result.rows.map(r => ({ data: r.data, count: parseInt(r.count) }));
}

export async function getLeadsAumentoConsumo(): Promise<LeadsAumentoConsumo[]> {
  const p = getPool();
  const result = await p.query(`
    SELECT COALESCE(aumento_consumo, 'não informado') as aumento, COUNT(*) as count
    FROM atendimentos
    GROUP BY aumento
  `);
  return result.rows.map(r => ({ aumento: r.aumento, count: parseInt(r.count) }));
}

export async function getLeadsRecentes(limit = 20) {
  const p = getPool();
  const result = await p.query(`
    SELECT id, telefone, valor_conta, etapa, cidade, aumento_consumo, equipamento, criado_em
    FROM atendimentos
    ORDER BY criado_em DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
}