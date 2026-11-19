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
  .validator(() => {})
  .handler(async (): Promise<DashboardData> => {
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

    return {
      metricas,
      leadsPorEtapa,
      leadsPorCidade,
      leadsPorPeriodo,
      leadsAumento,
      leadsRecentes,
    };
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