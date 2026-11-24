import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Users, DollarSign, TrendingUp, Clock, RefreshCw, HelpCircle } from "lucide-react";
import { formatBRL } from "@/lib/simulator";
import { getDashboardDataFn } from "@/lib/admin-server";
import { cn } from "@/lib/utils";

// ============================================
// LAZY LOAD DOS GRÁFICOS (carrega só quando necessário)
// ============================================

const ChartsRow1 = lazy(() =>
  import("@/components/admin/ChartsRow1").then((m) => ({ default: m.ChartsRow1 })),
);
const ChartsRow2 = lazy(() =>
  import("@/components/admin/ChartsRow2").then((m) => ({ default: m.ChartsRow2 })),
);
const PeriodCards = lazy(() =>
  import("@/components/admin/PeriodCards").then((m) => ({ default: m.PeriodCards })),
);

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
    staleTime: 60_000, // 1 min cache
    gcTime: 5 * 60_000, // 5 min garbage collection
    refetchOnWindowFocus: false, // não refaz ao focar janela
    retry: 1,
  });

  const isLoading = dashboardQuery.isLoading;
  const isError = dashboardQuery.isError;
  const error = dashboardQuery.error;
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

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="font-medium">Erro ao carregar dados</p>
        <p className="text-sm mt-1">{error?.message || "Erro desconhecido"}</p>
        <button
          onClick={() => dashboardQuery.refetch()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Nenhum dado encontrado</div>;
  }

  const { metricas, leadsPorEtapa, leadsPorCidade, leadsPorPeriodo, leadsAumento } = data;
  const taxaConversao = metricas?.totalLeads
    ? ((metricas.leadsFinalizados / metricas.totalLeads) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {data.mock && (
        <div
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Dados de exemplo: <code>DATABASE_URL</code> não está configurada neste ambiente.
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas do WhatsApp</h1>
          <p className="text-gray-500 mt-1">
            Quantas pessoas pediram orçamento pelo WhatsApp e até onde foram na conversa com o robô.
          </p>
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

      <ComoLer />

      {/* Números principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Leads (contatos)"
          value={metricas?.totalLeads ?? 0}
          icon={Users}
          color="bg-blue-50 text-blue-600"
          iconColor="text-blue-600"
          description="Pessoas diferentes que mandaram mensagem no WhatsApp pedindo orçamento."
        />
        <KPICard
          title="Responderam tudo"
          value={metricas?.leadsFinalizados ?? 0}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
          iconColor="text-green-600"
          subtitle={`${taxaConversao}% dos leads (taxa de conversão)`}
          description="Completaram as perguntas do robô. Estão prontos para o especialista ligar."
        />
        <KPICard
          title="Pararam no meio"
          value={metricas?.leadsEmAndamento ?? 0}
          icon={Clock}
          color="bg-yellow-50 text-yellow-600"
          iconColor="text-yellow-600"
          description="Começaram a conversa mas ainda não responderam tudo. Vale chamar no WhatsApp."
        />
        <KPICard
          title="Conta de luz média"
          value={metricas?.valorMedioConta ? formatBRL(metricas.valorMedioConta) : "—"}
          icon={DollarSign}
          color="bg-purple-50 text-purple-600"
          iconColor="text-purple-600"
          description="Média do valor da conta que os leads informaram. Indica o tamanho dos sistemas."
        />
      </div>

      {/* Charts - LAZY LOADED (carregam depois dos KPIs) */}
      <Suspense fallback={<SkeletonCharts rows={2} />}>
        <ChartsRow1 etapas={leadsPorEtapa || []} cidades={leadsPorCidade || []} />
        <ChartsRow2 periodo={leadsPorPeriodo || []} aumento={leadsAumento || []} />
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
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse"
        >
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
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse"
        >
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
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
  subtitle?: string;
  description?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm font-medium text-green-700">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-xl shrink-0", color)}>
          <Icon className={cn("w-6 h-6", iconColor)} aria-hidden="true" />
        </div>
      </div>
      {description && <p className="mt-3 text-xs leading-relaxed text-gray-500">{description}</p>}
    </div>
  );
}

// ============================================
// GLOSSÁRIO
// ============================================

const ETAPAS_EXPLICADAS: [string, string][] = [
  ["Início", "mandou a primeira mensagem"],
  ["Aguardando valor da conta", "o robô perguntou quanto ele paga de luz"],
  ["Pergunta de aumento", "o robô perguntou se ele vai aumentar o consumo"],
  ["Informando equipamento", "contando o que pretende instalar (ar, piscina...)"],
  ["Informando cidade", "falta só dizer a cidade"],
  ["Finalizado / Encerrado", "respondeu tudo; o especialista assume a conversa"],
];

function ComoLer() {
  return (
    <details className="group rounded-xl border border-green-200 bg-green-50/60 p-4 text-sm text-gray-700 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-green-800">
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        Como ler este painel
        <span className="ml-auto text-xs font-normal text-green-700 group-open:hidden">
          clique para abrir
        </span>
      </summary>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p>
            <strong>Lead</strong> é cada pessoa que mandou mensagem no WhatsApp da Esolution. O robô
            responde sozinho e faz 4 perguntas: valor da conta de luz, se vai aumentar o consumo, o
            que vai instalar e a cidade.
          </p>
          <p>
            <strong>Conversão</strong> é a porcentagem de leads que responderam todas as perguntas.
            Não é venda fechada: é o lead pronto para o especialista ligar e marcar a visita.
          </p>
          <p>
            Exemplo: 10 leads e 4 responderam tudo = <strong>40% de conversão</strong>.
          </p>
        </div>
        <div>
          <p className="mb-1 font-semibold">Etapas da conversa (em que pergunta o lead parou)</p>
          <ul className="space-y-1">
            {ETAPAS_EXPLICADAS.map(([nome, desc]) => (
              <li key={nome}>
                <strong>{nome}</strong>: {desc}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
