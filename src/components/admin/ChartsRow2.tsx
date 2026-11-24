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

// "2026-11-17" -> "17/11". Sem new Date(): ele leria a data como UTC e mostraria o dia anterior no Brasil.
function formatDia(v: string): string {
  const [, m, d] = String(v).split("-");
  return d && m ? `${d}/${m}` : String(v);
}

export function ChartsRow2({ periodo, aumento }: ChartsRow2Props) {
  const aumentoTotal = aumento.reduce((s, a) => s + a.count, 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        title="Novos leads por dia"
        subtitle="Quantas pessoas chamaram no WhatsApp em cada dia (últimos 30 dias)"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={periodo} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="data"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={formatDia}
              />
              <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value, "leads"]}
                labelFormatter={formatDia}
              />
              <Line
                type="linear"
                dataKey="count"
                stroke="#071f19"
                strokeWidth={2}
                dot={{ r: 2, fill: "#071f19" }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        title="Vão aumentar o consumo de energia?"
        subtitle="Quem vai aumentar precisa de um sistema maior"
      >
        {aumentoTotal === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-gray-400">
            Sem respostas ainda.
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aumento}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={aumento.length > 1 ? 2 : 0}
                  stroke="none"
                  dataKey="count"
                  nameKey="aumento"
                >
                  {aumento.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
        )}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 justify-center">
          {aumento.map((a, i) => (
            <span key={a.aumento} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {a.aumento}: {a.count} ({Math.round((a.count / aumentoTotal) * 100)}%)
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
