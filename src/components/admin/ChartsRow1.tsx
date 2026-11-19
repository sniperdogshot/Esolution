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

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
      <Card title="Leads por Etapa do Funil" subtitle="Distribuição atual dos leads">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={etapas} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="etapa"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value: number) => [value, "leads"]}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                fill="#071f19"
              >
                {etapas.map((_, i) => (
                  <Cell key={i} fill={ETAPA_COLORS[etapas[i]?.etapa] || COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {etapas.map((e) => (
            <span key={e.etapa} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: ETAPA_COLORS[e.etapa] || "#9ca3af" }} />
              {e.etapa}: {e.count}
            </span>
          ))}
        </div>
      </Card>

      <Card title="Leads por Cidade (Top 10)" subtitle="Onde estão os leads">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cidades} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="cidade"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                width={100}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value: number) => [value, "leads"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#166534">
                {cidades.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}