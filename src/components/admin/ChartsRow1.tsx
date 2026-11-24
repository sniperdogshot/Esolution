"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { LeadsPorEtapa, LeadsPorCidade } from "@/lib/admin-db";

interface ChartsRow1Props {
  etapas: LeadsPorEtapa[];
  cidades: LeadsPorCidade[];
}

const COLORS = ["#071f19", "#166534", "#22c55e", "#86efac", "#dcfce7"];
const ETAPA_COLORS: Record<string, string> = {
  conta: "#f59e0b",
  aumento_consumo: "#3b82f6",
  equipamento: "#8b5cf6",
  cidade: "#ec4899",
  finalizado: "#22c55e",
  encerrado: "#6b7280",
  inicio: "#9ca3af",
};

/** Nome amigável de cada etapa do bot (o banco guarda a chave). */
const ETAPA_LABELS: Record<string, string> = {
  inicio: "Início",
  conta: "Aguardando valor da conta",
  aumento_consumo: "Pergunta de aumento",
  equipamento: "Informando equipamento",
  cidade: "Informando cidade",
  finalizado: "Finalizado",
  encerrado: "Encerrado",
};

const etapaLabel = (e: string) => ETAPA_LABELS[e] ?? e;

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

export function ChartsRow1({ etapas, cidades }: ChartsRow1Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        title="Em que pergunta cada lead está"
        subtitle="Onde os leads pararam na conversa com o robô agora"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={etapas}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="etapa"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={etapaLabel}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value, "leads"]}
                labelFormatter={etapaLabel}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#071f19" maxBarSize={40}>
                {etapas.map((e, i) => (
                  <Cell key={i} fill={ETAPA_COLORS[e.etapa] || COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {etapas.map((e) => (
            <span key={e.etapa} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: ETAPA_COLORS[e.etapa] || "#9ca3af" }}
              />
              {etapaLabel(e.etapa)}: {e.count}
            </span>
          ))}
        </div>
      </Card>

      <Card title="Cidades dos leads" subtitle="As 10 cidades com mais pedidos de orçamento">
        {cidades.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-gray-400">
            Nenhum lead informou a cidade ainda.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cidades}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="cidade"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value, "leads"]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#166534" maxBarSize={40}>
                  {cidades.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
