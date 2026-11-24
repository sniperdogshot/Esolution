import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { getLeadsRecentesFn } from "@/lib/admin-server";
import type { LeadRecente } from "@/lib/admin-db";
import { ArrowRight, Users, TrendingUp, Target, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type EtapaFunil = { etapa: string; count: number };

function countAt(funil: EtapaFunil[], i: number): number {
  return funil[i]?.count ?? 0;
}

export const Route = createFileRoute("/admin/conversao")({
  component: ConversaoPage,
});

function ConversaoPage() {
  const query = useQuery({
    queryKey: ["admin-leads-conversao"],
    queryFn: () => getLeadsRecentesFn(),
    staleTime: 30_000,
  });

  const leads = query.data?.leads ?? [];

  // Funil de conversão
  const funil = [
    { etapa: "Iniciaram", count: leads.length },
    {
      etapa: "Informaram Conta",
      count: leads.filter((l) =>
        ["aumento_consumo", "equipamento", "cidade", "finalizado", "encerrado"].includes(l.etapa),
      ).length,
    },
    {
      etapa: "Responderam Aumento",
      count: leads.filter((l) =>
        ["equipamento", "cidade", "finalizado", "encerrado"].includes(l.etapa),
      ).length,
    },
    {
      etapa: "Informaram Equip/Cidade",
      count: leads.filter((l) => ["cidade", "finalizado", "encerrado"].includes(l.etapa)).length,
    },
    {
      etapa: "Finalizados",
      count: leads.filter((l) => ["finalizado", "encerrado"].includes(l.etapa)).length,
    },
  ];

  // Taxas de conversão entre etapas
  const taxas = funil.slice(1).map((f, i) => {
    const anterior = countAt(funil, i);
    return anterior > 0 ? ((f.count / anterior) * 100).toFixed(1) : "0";
  });

  // Leads com intenção de aumento
  const comAumento = leads.filter((l) => l.aumento_consumo === "sim").length;
  const semAumento = leads.filter(
    (l) => l.aumento_consumo === "não" || l.aumento_consumo === "nao",
  ).length;
  const naoInformado = leads.filter(
    (l) => !l.aumento_consumo || l.aumento_consumo === "não informado",
  ).length;

  const COLORS = ["#071f19", "#166534", "#22c55e", "#86efac", "#dcfce7"];

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="font-medium">Erro ao carregar os leads</p>
        <p className="text-sm mt-1">{query.error?.message || "Erro desconhecido"}</p>
        <button
          onClick={() => query.refetch()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análise de Conversão</h1>
          <p className="text-gray-500 mt-1">
            Quantos leads passam de cada pergunta do robô para a próxima. Onde a porcentagem cai
            muito, é ali que as pessoas desistem da conversa.
          </p>
        </div>
      </div>

      {/* KPIs Top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Leads (começaram a conversa)"
          value={countAt(funil, 0)}
          icon={Users}
          color="bg-blue-50 text-blue-600"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Responderam tudo"
          value={countAt(funil, 4)}
          icon={Target}
          color="bg-green-50 text-green-600"
          iconColor="text-green-600"
        />
        <KPICard
          title="Taxa de conversão"
          value={`${countAt(funil, 0) > 0 ? ((countAt(funil, 4) / countAt(funil, 0)) * 100).toFixed(1) : 0}%`}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600"
          iconColor="text-purple-600"
        />
        <KPICard
          title="Vão aumentar o consumo"
          value={comAumento}
          icon={ArrowRight}
          color="bg-orange-50 text-orange-600"
          iconColor="text-orange-600"
          subtitle={`${leads.length > 0 ? ((comAumento / leads.length) * 100).toFixed(1) : 0}% dos leads`}
        />
      </div>

      {/* Funil Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Funil de Conversão" subtitle="Quantidade de leads em cada etapa">
          <div className="space-y-4">
            {funil.map((f, i) => {
              const maxCount = countAt(funil, 0);
              const width = maxCount > 0 ? (f.count / maxCount) * 100 : 0;
              const taxa = i > 0 ? (taxas[i - 1] ?? "0") : null;

              return (
                <div key={f.etapa} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{f.etapa}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">{f.count}</span>
                      {taxa !== null && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            parseFloat(taxa) >= 50
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700",
                          )}
                        >
                          {taxa}% da anterior
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${width}%`, backgroundColor: COLORS[i] }}
                    >
                      {width > 15 && (
                        <span className="text-white text-xs font-medium">{f.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Intenção de Aumentar Consumo" subtitle="Distribuição das respostas">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="80%" height="80%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Sim", value: comAumento, color: "#22c55e" },
                    { name: "Não", value: semAumento, color: "#ef4444" },
                    { name: "Não informado", value: naoInformado, color: "#9ca3af" },
                  ].filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {[
                    { name: "Sim", color: "#22c55e" },
                    { name: "Não", color: "#ef4444" },
                    { name: "Não informado", color: "#9ca3af" },
                  ].map((c, i) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value, "leads"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-500" /> Sim: {comAumento}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500" /> Não: {semAumento}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-400" /> Não informado: {naoInformado}
            </span>
          </div>
        </Card>
      </div>

      {/* Detalhamento por etapa */}
      <Card title="Detalhamento por Etapa" subtitle="Volume e conversão entre cada passo">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Etapa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  % do Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  % da Etapa Anterior
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Abandono
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {funil.map((f, i) => {
                const totalPerc =
                  countAt(funil, 0) > 0 ? ((f.count / countAt(funil, 0)) * 100).toFixed(1) : "0";
                const anteriorPerc = i > 0 ? (taxas[i - 1] ?? "0") : "—";
                const abandono =
                  i > 0 && countAt(funil, i - 1) > 0
                    ? (((countAt(funil, i - 1) - f.count) / countAt(funil, i - 1)) * 100).toFixed(1)
                    : "—";

                return (
                  <tr key={f.etapa} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{f.etapa}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{f.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-sm font-medium",
                          parseFloat(totalPerc) >= 50
                            ? "bg-green-100 text-green-700"
                            : parseFloat(totalPerc) >= 20
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {totalPerc}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {anteriorPerc !== "—" ? (
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-sm font-medium",
                            parseFloat(anteriorPerc) >= 50
                              ? "bg-green-100 text-green-700"
                              : parseFloat(anteriorPerc) >= 30
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700",
                          )}
                        >
                          {anteriorPerc}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {abandono !== "—" ? (
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-sm font-medium",
                            parseFloat(abandono) <= 20
                              ? "bg-green-100 text-green-700"
                              : parseFloat(abandono) <= 40
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700",
                          )}
                        >
                          {abandono}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card title="Insights Automáticos" subtitle="Pontos de atenção baseados nos dados">
        <InsightsList leads={leads} funil={funil} taxas={taxas} />
      </Card>
    </div>
  );
}

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

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function InsightsList({
  leads,
  funil,
  taxas,
}: {
  leads: LeadRecente[];
  funil: EtapaFunil[];
  taxas: string[];
}) {
  const insights: string[] = [];

  // Taxa geral baixa
  const taxaGeral = countAt(funil, 0) > 0 ? (countAt(funil, 4) / countAt(funil, 0)) * 100 : 0;
  if (taxaGeral < 20 && countAt(funil, 0) > 10) {
    insights.push(
      `Taxa de conversão geral baixa (${taxaGeral.toFixed(1)}%). Muitos leads não completam o fluxo.`,
    );
  }

  // Queda maior entre etapas
  const maiorQueda = taxas.reduce(
    (max, t, i) => (parseFloat(t) < parseFloat(max.val) ? { val: t, idx: i } : max),
    { val: "100", idx: -1 },
  );
  if (maiorQueda.idx >= 0 && parseFloat(maiorQueda.val) < 40) {
    insights.push(
      `Maior abandono: "${funil[maiorQueda.idx + 1]?.etapa}" (${maiorQueda.val}% continuam). Revisar abordagem nessa etapa.`,
    );
  }

  // Poucos com intenção de aumento
  const comAumento = leads.filter((l) => l.aumento_consumo === "sim").length;
  const pctAumento = leads.length > 0 ? (comAumento / leads.length) * 100 : 0;
  if (pctAumento < 30 && leads.length > 10) {
    insights.push(
      `Apenas ${pctAumento.toFixed(1)}% querem aumentar consumo. Oportunidade: educar sobre benefícios de expansão.`,
    );
  }

  // Leads sem cidade
  const semCidade = leads.filter(
    (l) => !l.cidade && ["finalizado", "encerrado"].includes(l.etapa),
  ).length;
  if (semCidade > 0) {
    insights.push(
      `${semCidade} leads finalizados sem cidade informada. Dificulta agendamento de visita técnica.`,
    );
  }

  // Valor médio alto/baixo
  const comValor = leads.filter((l) => l.valor_conta && l.valor_conta > 0);
  if (comValor.length > 5) {
    const media = comValor.reduce((s, l) => s + Number(l.valor_conta), 0) / comValor.length;
    if (media > 800) {
      insights.push(
        `Valor médio da conta alto (R$ ${media.toFixed(0)}). Leads qualificados para sistemas maiores.`,
      );
    } else if (media < 200) {
      insights.push(
        `Valor médio da conta baixo (R$ ${media.toFixed(0)}). Verificar se público-alvo está correto.`,
      );
    }
  }

  if (insights.length === 0) {
    insights.push("Dados insuficientes para gerar insights automáticos. Continue coletando leads!");
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
            {i + 1}
          </span>
          <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
        </div>
      ))}
    </div>
  );
}
