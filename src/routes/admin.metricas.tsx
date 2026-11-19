import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Suspense, lazy, useState } from "react";
import { Users, DollarSign, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { getDashboardDataFn } from "../../lib/admin-server";
import type { DashboardData } from "../../lib/admin-server";
import { cn } from "@/lib/utils";

// ============================================
// LAZY LOAD DOS GRÁFICOS (carrega só quando necessário)
// ============================================

const ChartsRow1 = lazy(() => import("@/components/admin/ChartsRow1").then(m => ({ default: m.ChartsRow1 })));
const ChartsRow2 = lazy(() => import("@/components/admin/ChartsRow2").then(m => ({ default: m.ChartsRow2 })));
const PeriodCards = lazy(() => import("@/components/admin/PeriodCards").then(m => ({ default: m.PeriodCards })));

export const Route = createFileRoute("/admin/metricas")({
  component: MetricasPage,
});

function MetricasPage() {
  // ============================================
  // SINGLE QUERY - BUSCA TUDO DE UMA VEZ
  // ============================================
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard-full"],
    queryFn: () => getDashboardDataFn(),
    staleTime: 60_000,        // 1 min cache
    gcTime: 5 * 60_000,       // 5 min garbage collection
    refetchOnWindowFocus: false,  // não refaz ao focar janela
  });

  const isLoading = dashboardQuery.isLoading;
  const data = dashboardQuery.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={4} />
        <SkeletonCharts rows={2} />
        <SkeletonCards count={2} />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Nenhum dado encontrado</div>;
  }

  const { metricas, leadsPorEtapa, leadsPorCidade, leadsPorPeriodo, leadsAumento, leadsRecentes } = data;
  const taxaConversao = metricas?.totalLeads ? ((metricas.leadsFinalizados / metricas.totalLeads) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header com refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas do WhatsApp Bot</h1>
          <p className="text-gray-500 mt-1">Visão geral dos leads capturados via WhatsApp</p>
        </div>
        <button
          onClick={() => dashboardQuery.refetch()}
          disabled={dashboardQuery.isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", dashboardQuery.isFetching && "animate-spin")} />
          {dashboardQuery.isFetching ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* KPI Cards - renderiza imediatamente (dados leves) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Leads"
          value={metricas?.totalLeads ?? 0}
          icon={Users}
          color="bg-blue-50 text-blue-600"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Finalizados"
          value={metricas?.leadsFinalizados ?? 0}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
          iconColor="text-green-600"
          subtitle={`${taxaConversao}% conversão`}
        />
        <KPICard
          title="Em Andamento"
          value={metricas?.leadsEmAndamento ?? 0}
          icon={Clock}
          color="bg-yellow-50 text-yellow-600"
          iconColor="text-yellow-600"
        />
        <KPICard
          title="Valor Médio Conta"
          value={metricas?.valorMedioConta ? `R$ ${metricas.valorMedioConta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
          icon={DollarSign}
          color="bg-purple-50 text-purple-600"
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts - LAZY LOADED (carregam depois dos KPIs) */}
      <Suspense fallback={<SkeletonCharts rows={2} />}>
        <ChartsRow1
          etapas={leadsPorEtapa || []}
          cidades={leadsPorCidade || []}
        />
        <ChartsRow2
          periodo={leadsPorPeriodo || []}
          aumento={leadsAumento || []}
        />
      </Suspense>

      {/* Period Cards - também lazy */}
      <Suspense fallback={<SkeletonCards count={2} />}>
        <PeriodCards
          leads7dias={metricas?.leadsUltimos7Dias ?? 0}
          leads30dias={metricas?.leadsUltimos30Dias ?? 0}
        />
      </Suspense>
    </div>
  );
}

// ============================================
// SKELETONS PARA LOADING SUAVE
// ============================================

function SkeletonCards({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function SkeletonCharts({ rows }: { rows: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: rows * 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-72 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// KPI CARD (componente leve, sem lazy)
// ============================================

function KPICard({
  title,
  value,
  icon: Icon,
  color,
  iconColor,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className={cn("w-6 h-6", iconColor)} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}