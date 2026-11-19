"use client";

import { cn } from "@/lib/utils";

interface PeriodCardsProps {
  leads7dias: number;
  leads30dias: number;
}

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

export function PeriodCards({ leads7dias, leads30dias }: PeriodCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Leads - Últimos 7 dias" subtitle={`${leads7dias} leads`}>
        <div className="text-4xl font-bold text-green-600">{leads7dias}</div>
      </Card>
      <Card title="Leads - Últimos 30 dias" subtitle={`${leads30dias} leads`}>
        <div className="text-4xl font-bold text-blue-600">{leads30dias}</div>
      </Card>
    </div>
  );
}