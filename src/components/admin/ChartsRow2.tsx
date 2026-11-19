"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { LeadsPorPeriodo, LeadsAumentoConsumo } from "@/lib/admin-db";

interface ChartsRow2Props {
  periodo: LeadsPorPeriodo[];
  aumento: LeadsAumentoConsumo[];
}

const COLORS = ["#071f19", "#166534", "#22c55e", "#86efac", "#dcfce7"];

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

export function ChartsRow2({ periodo, aumento }: ChartsRow2Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Leads nos Últimos 30 Dias" subtitle="Evolução diária">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={periodo} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="data"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value: number) => [value, "leads"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#071f19"
                strokeWidth={2}
                dot={{ r: 4, fill: "#071f19", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Intenção de Aumentar Consumo" subtitle="Respostas à pergunta de aumento">
        <div className="h-72 flex items-center justify-center">
          <ResponsiveContainer width="80%" height="80%">
            <PieChart>
              <Pie
                data={aumento.length > 0 ? aumento : [{ aumento: "Sem dados", count: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="aumento"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {aumento.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value: number) => [value, "leads"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 justify-center">
          {aumento.map((a, i) => (
            <span key={a.aumento} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {a.aumento}: {a.count}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}