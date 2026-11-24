import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getLeadsRecentesFn } from "@/lib/admin-server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const [search, setSearch] = useState("");
  const [filterEtapa, setFilterEtapa] = useState("");

  const query = useQuery({
    queryKey: ["admin-leads-recentes"],
    queryFn: () => getLeadsRecentesFn(),
    staleTime: 30_000,
  });

  const leads = query.data?.leads ?? [];
  const etapasUnicas = [...new Set(leads.map((l) => l.etapa))];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.telefone?.includes(search) ||
      lead.cidade?.toLowerCase().includes(search.toLowerCase()) ||
      lead.equipamento?.toLowerCase().includes(search.toLowerCase());
    const matchesEtapa = !filterEtapa || lead.etapa === filterEtapa;
    return matchesSearch && matchesEtapa;
  });

  const getEtapaBadge = (etapa: string) => {
    const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      conta: {
        color: "bg-amber-100 text-amber-800",
        label: "Conta",
        icon: <DollarSign className="w-3 h-3" />,
      },
      aumento_consumo: {
        color: "bg-blue-100 text-blue-800",
        label: "Aumento",
        icon: <AlertCircle className="w-3 h-3" />,
      },
      equipamento: {
        color: "bg-violet-100 text-violet-800",
        label: "Equip.",
        icon: <AlertCircle className="w-3 h-3" />,
      },
      cidade: {
        color: "bg-pink-100 text-pink-800",
        label: "Cidade",
        icon: <MapPin className="w-3 h-3" />,
      },
      finalizado: {
        color: "bg-green-100 text-green-800",
        label: "Finalizado",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      encerrado: {
        color: "bg-gray-100 text-gray-800",
        label: "Encerrado",
        icon: <Clock className="w-3 h-3" />,
      },
      inicio: {
        color: "bg-slate-100 text-slate-800",
        label: "Início",
        icon: <Clock className="w-3 h-3" />,
      },
    };
    return (
      config[etapa] || {
        color: "bg-gray-100 text-gray-800",
        label: etapa,
        icon: <Clock className="w-3 h-3" />,
      }
    );
  };

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
      {query.data?.mock && (
        <div
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Dados de exemplo: <code>DATABASE_URL</code> não está configurada neste ambiente.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Recentes</h1>
          <p className="text-gray-500 mt-1">
            {leads.length} {leads.length === 1 ? "lead capturado" : "leads capturados"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por telefone, cidade, equipamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white text-gray-900"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterEtapa}
              onChange={(e) => setFilterEtapa(e.target.value)}
              className="pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white text-gray-900 appearance-none"
            >
              <option value="">Todas as etapas</option>
              {etapasUnicas.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {getEtapaBadge(etapa).label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Etapa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Valor Conta
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aumento / Equip.
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const badge = getEtapaBadge(lead.etapa);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a
                            href={`https://wa.me/${lead.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-gray-900 underline-offset-2 hover:text-green-700 hover:underline"
                            title="Abrir conversa no WhatsApp"
                          >
                            {lead.telefone}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            badge.color,
                          )}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.valor_conta ? (
                          <span className="text-sm text-gray-900">
                            R${" "}
                            {Number(lead.valor_conta).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.cidade ? (
                          <span className="flex items-center gap-1.5 text-sm text-gray-900">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {lead.cidade}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {lead.aumento_consumo === "sim" && lead.equipamento
                            ? `Sim - ${lead.equipamento}`
                            : lead.aumento_consumo
                              ? lead.aumento_consumo
                              : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.criado_em
                          ? format(new Date(lead.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to="/admin/propostas"
                          search={{ conta: lead.valor_conta ?? undefined }}
                          className="rounded-md border border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                          title="Abrir uma proposta já com a conta de luz deste lead"
                        >
                          Proposta
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
