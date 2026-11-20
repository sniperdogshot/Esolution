import { createServerFn } from "@tanstack/react-start";
import {
  getMetricasGerais,
  getLeadsPorEtapa,
  getLeadsPorCidade,
  getLeadsPorPeriodo,
  getLeadsAumentoConsumo,
  getLeadsRecentes,
} from "./admin-db";
import type {
  MetricasGerais,
  LeadsPorEtapa,
  LeadsPorCidade,
  LeadsPorPeriodo,
  LeadsAumentoConsumo,
} from "./admin-db";

// DEBUG: Log when this module loads
console.log("[admin-server.ts] Module loaded, registering server functions");

// ============================================
// TIPOS COMBINADOS
// ============================================

export interface DashboardData {
  metricas: MetricasGerais;
  leadsPorEtapa: LeadsPorEtapa[];
  leadsPorCidade: LeadsPorCidade[];
  leadsPorPeriodo: LeadsPorPeriodo[];
  leadsAumento: LeadsAumentoConsumo[];
  leadsRecentes: Awaited<ReturnType<typeof getLeadsRecentes>>;
}

// ============================================
// SERVER FUNCTION ÚNICA - BUSCA TUDO DE UMA VEZ
// ============================================

export const getDashboardDataFn = createServerFn({ method: "GET" })
  .validator(() => {
    console.log("[getDashboardDataFn] Validator called");
  })
  .handler(async (): Promise<DashboardData> => {
    console.log("[getDashboardDataFn] Handler called");
    try {
      // Executa todas as queries em paralelo no servidor (uma única conexão)
      const [
        metricas,
        leadsPorEtapa,
        leadsPorCidade,
        leadsPorPeriodo,
        leadsAumento,
        leadsRecentes,
      ] = await Promise.all([
        getMetricasGerais(),
        getLeadsPorEtapa(),
        getLeadsPorCidade(10),
        getLeadsPorPeriodo(30),
        getLeadsAumentoConsumo(),
        getLeadsRecentes(20),
      ]);

      const result = {
        metricas,
        leadsPorEtapa,
        leadsPorCidade,
        leadsPorPeriodo,
        leadsAumento,
        leadsRecentes,
      };
      console.log("[getDashboardDataFn] Success:", {
        totalLeads: metricas.totalLeads,
        etapaCount: leadsPorEtapa.length,
        cidadeCount: leadsPorCidade.length
      });
      return result;
    } catch (err) {
      console.error("[getDashboardDataFn] ERROR:", err);
      throw err;
    }
  });

// ============================================
// FUNÇÕES INDIVIDUAIS (mantidas para compatibilidade)
// ============================================

export const getMetricasGeraisFn = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async (): Promise<MetricasGerais> => {
    return getMetricasGerais();
  });

export const getLeadsPorEtapaFn = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async (): Promise<LeadsPorEtapa[]> => {
    return getLeadsPorEtapa();
  });

export const getLeadsPorCidadeFn = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async (): Promise<LeadsPorCidade[]> => {
    return getLeadsPorCidade();
  });

export const getLeadsPorPeriodoFn = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async (): Promise<LeadsPorPeriodo[]> => {
    return getLeadsPorPeriodo(30);
  });

export const getLeadsAumentoConsumoFn = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async (): Promise<LeadsAumentoConsumo[]> => {
    return getLeadsAumentoConsumo();
  });

export const getLeadsRecentesFn = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async () => {
    return getLeadsRecentes(20);
  });

// TEST ENDPOINT - para debug
export const testServerFn = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async () => {
    console.log("[testServerFn] Handler called");
    return { ok: true, message: "Server function working!", timestamp: new Date().toISOString() };
  });