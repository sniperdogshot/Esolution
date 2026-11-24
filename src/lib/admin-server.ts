import { createServerFn } from "@tanstack/react-start";

import { requireAdmin } from "./admin-auth";
import {
  getLeadsAumentoConsumo,
  getLeadsPorCidade,
  getLeadsPorEtapa,
  getLeadsPorPeriodo,
  getLeadsRecentes,
  getMetricasGerais,
  isUsingMock,
} from "./admin-db";
import type {
  LeadRecente,
  LeadsAumentoConsumo,
  LeadsPorCidade,
  LeadsPorEtapa,
  LeadsPorPeriodo,
  MetricasGerais,
} from "./admin-db";

export interface DashboardData {
  metricas: MetricasGerais;
  leadsPorEtapa: LeadsPorEtapa[];
  leadsPorCidade: LeadsPorCidade[];
  leadsPorPeriodo: LeadsPorPeriodo[];
  leadsAumento: LeadsAumentoConsumo[];
  leadsRecentes: LeadRecente[];
  /** true quando os números são de exemplo (sem banco configurado em desenvolvimento). */
  mock: boolean;
}

/** Tudo que o painel de métricas precisa, numa chamada só. Exige sessão de admin. */
export const getDashboardDataFn = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async (): Promise<DashboardData> => {
    const [metricas, leadsPorEtapa, leadsPorCidade, leadsPorPeriodo, leadsAumento, leadsRecentes] =
      await Promise.all([
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
      mock: isUsingMock(),
    };
  });

/** Lista de leads para a página de Leads. Exige sessão de admin. */
export const getLeadsRecentesFn = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    return { leads: await getLeadsRecentes(2000), mock: isUsingMock() };
  });
