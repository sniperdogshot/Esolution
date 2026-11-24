import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FileDown, RotateCcw } from "lucide-react";

import { PropostaDocumento } from "@/components/admin/PropostaDocumento";
import {
  calcularEconomia,
  numero,
  potenciaKwp,
  propostaPadrao,
  reais,
  type Proposta,
} from "@/lib/proposta";

// Vindo da página de Leads: /admin/propostas?conta=450 (valor da conta de luz do lead)
type Busca = { cliente?: string | undefined; conta?: number | undefined };

export const Route = createFileRoute("/admin/propostas")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    const conta = Number(s["conta"]);
    return {
      cliente: typeof s["cliente"] === "string" ? s["cliente"] : undefined,
      conta: Number.isFinite(conta) && conta > 0 ? conta : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Propostas | Esolution Admin" }] }),
  component: PropostasPage,
});

const RASCUNHO = "esolution-proposta-rascunho";
// Mesmo fator do simulador do site: R$ por kWh na conta da Enel.
const REAIS_POR_KWH_NA_CONTA = 0.9848;

function lerRascunho(): Proposta | null {
  try {
    const raw = localStorage.getItem(RASCUNHO);
    return raw ? { ...propostaPadrao(), ...(JSON.parse(raw) as Partial<Proposta>) } : null;
  } catch {
    return null;
  }
}

function PropostasPage() {
  const busca = Route.useSearch();
  const [p, setP] = useState<Proposta>(propostaPadrao);
  const [carregado, setCarregado] = useState(false);

  // Carrega o rascunho salvo neste navegador; dados vindos de um lead têm prioridade.
  useEffect(() => {
    const base = lerRascunho() ?? propostaPadrao();
    const vindoDoLead = busca.cliente || busca.conta;
    setP({
      ...base,
      ...(vindoDoLead ? { cliente: busca.cliente ?? "", revisao: "01" } : {}),
      ...(busca.conta
        ? { geracaoMensal: Math.round(busca.conta / REAIS_POR_KWH_NA_CONTA / 10) * 10 }
        : {}),
    });
    setCarregado(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(RASCUNHO, JSON.stringify(p));
    } catch {
      /* navegador sem armazenamento: só não guarda o rascunho */
    }
  }, [p, carregado]);

  const set = <K extends keyof Proposta>(k: K, v: Proposta[K]) =>
    setP((old) => ({ ...old, [k]: v }));
  const eco = calcularEconomia(p);

  // A folha A4 tem 794px; na tela ela encolhe para caber na coluna (na impressão volta a 100%).
  const previaRef = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  useEffect(() => {
    const el = previaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const largura = entry?.contentRect.width ?? 794;
      setEscala(Math.min(1, (largura - 32) / 794));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baixarPdf = () => {
    const tituloAntes = document.title;
    // O Chrome usa o título da página como nome do arquivo PDF.
    document.title = `Proposta ${p.cliente || "cliente"} - Rev ${p.revisao}`;
    window.print();
    document.title = tituloAntes;
  };

  const limpar = () => {
    if (!window.confirm("Apagar tudo o que foi preenchido e voltar ao modelo?")) return;
    setP(propostaPadrao());
  };

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposta comercial</h1>
          <p className="mt-1 max-w-2xl text-gray-500">
            Preencha os dados do cliente e do sistema. O documento ao lado é atualizado na hora e a
            tabela de economia é calculada sozinha. Depois clique em <strong>Baixar PDF</strong> e
            escolha “Salvar como PDF”.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={limpar}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Recomeçar
          </button>
          <button
            onClick={baixarPdf}
            disabled={!p.cliente.trim()}
            title={p.cliente.trim() ? undefined : "Preencha o nome do cliente"}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Baixar PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr] print:block">
        {/* Formulário */}
        <div className="space-y-4 print:hidden">
          <Grupo titulo="Cliente">
            <Campo label="Nome do cliente *">
              <input
                className={inputCls}
                value={p.cliente}
                onChange={(e) => set("cliente", e.target.value)}
                placeholder="Ex.: Rita Bona"
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Cidade da proposta">
                <input
                  className={inputCls}
                  value={p.local}
                  onChange={(e) => set("local", e.target.value)}
                />
              </Campo>
              <Campo label="Data">
                <input
                  type="date"
                  className={inputCls}
                  value={p.data}
                  onChange={(e) => set("data", e.target.value)}
                />
              </Campo>
            </div>
            <Campo
              label="Revisão"
              dica="Aumente quando mandar uma versão nova para o mesmo cliente."
            >
              <input
                className={inputCls}
                value={p.revisao}
                onChange={(e) => set("revisao", e.target.value)}
              />
            </Campo>
          </Grupo>

          <Grupo titulo="Sistema">
            <Num
              label="Geração média por mês (kWh)"
              dica={
                busca.conta
                  ? `Calculado pela conta de ${reais(busca.conta)} do lead. Ajuste se precisar.`
                  : "Quanto o cliente consome por mês, em média."
              }
              valor={p.geracaoMensal}
              onChange={(v) => set("geracaoMensal", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Num
                label="Qtd. de painéis"
                valor={p.qtdPaineis}
                onChange={(v) => set("qtdPaineis", v)}
              />
              <Num
                label="Potência do painel (W)"
                valor={p.potenciaPainelW}
                onChange={(v) => set("potenciaPainelW", v)}
              />
            </div>
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
              Potência do sistema: <strong>{numero(potenciaKwp(p), 2)} kWp</strong>
            </p>
            <Campo label="Modelo do painel">
              <input
                className={inputCls}
                value={p.modeloPainel}
                onChange={(e) => set("modeloPainel", e.target.value)}
              />
            </Campo>
            <Campo label="Inversor">
              <input
                className={inputCls}
                value={p.inversor}
                onChange={(e) => set("inversor", e.target.value)}
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Num
                label="Garantia painel (anos)"
                valor={p.garantiaPainelAnos}
                onChange={(v) => set("garantiaPainelAnos", v)}
              />
              <Num
                label="Garantia inversor (anos)"
                valor={p.garantiaInversorAnos}
                onChange={(v) => set("garantiaInversorAnos", v)}
              />
            </div>
            <Campo label="Outros itens (um por linha)">
              <textarea
                rows={5}
                className={inputCls}
                value={p.outrosItens}
                onChange={(e) => set("outrosItens", e.target.value)}
              />
            </Campo>
          </Grupo>

          <Grupo titulo="Valores">
            <Num
              label="Valor à vista (R$)"
              passo={0.01}
              valor={p.valorAVista}
              onChange={(v) => set("valorAVista", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Num
                label="Total no cartão (R$)"
                passo={0.01}
                valor={p.valorCartao}
                onChange={(v) => set("valorCartao", v)}
              />
              <Num
                label="Parcelas"
                valor={p.parcelasCartao}
                onChange={(v) => set("parcelasCartao", v)}
              />
            </div>
          </Grupo>

          <Grupo titulo="Economia (premissas)">
            <div className="grid grid-cols-2 gap-3">
              <Num
                label="Tarifa cheia (R$/kWh)"
                passo={0.01}
                valor={p.tarifaCheia}
                onChange={(v) => set("tarifaCheia", v)}
              />
              <Num
                label="Fio B (R$/kWh)"
                passo={0.01}
                valor={p.fioB}
                onChange={(v) => set("fioB", v)}
              />
            </div>
            <Num
              label="Fio B pago a partir de 2029 (%)"
              dica="Pela Lei 14.300 o cliente paga 60% do Fio B em 2026, 75% em 2027 e 90% em 2028. Depois disso a ANEEL ainda vai definir."
              valor={p.fioBDepois2028}
              onChange={(v) => set("fioBDepois2028", v)}
            />
            <p className="text-xs text-gray-500">
              Economia por kWh no 1º ano:{" "}
              <strong>R$ {numero(eco.linhas[0]?.tarifa ?? 0, 2)}</strong> (tarifa cheia menos a
              parte do Fio B paga).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Num
                label="Reajuste ao ano (%)"
                passo={0.01}
                valor={p.reajusteAnual}
                onChange={(v) => set("reajusteAnual", v)}
              />
              <Num
                label="Perda de geração ao ano (%)"
                passo={0.01}
                valor={p.perdaAnual}
                onChange={(v) => set("perdaAnual", v)}
              />
              <Num
                label="Troca do inversor (ano)"
                valor={p.trocaInversorAno}
                onChange={(v) => set("trocaInversorAno", v)}
              />
              <Num
                label="Custo da troca (R$)"
                passo={0.01}
                valor={p.trocaInversorValor}
                onChange={(v) => set("trocaInversorValor", v)}
              />
            </div>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Economia em {p.anos} anos: <strong>{reais(eco.economiaTotal)}</strong>
              <br />
              Payback:{" "}
              <strong>
                {eco.paybackMeses === null
                  ? `acima de ${p.anos} anos`
                  : `${eco.paybackMeses} meses`}
              </strong>
            </div>
          </Grupo>

          <Grupo titulo="Assinatura e validade">
            <Num
              label="Validade (dias)"
              valor={p.validadeDias}
              onChange={(v) => set("validadeDias", v)}
            />
            <Campo label="Responsável">
              <input
                className={inputCls}
                value={p.responsavel}
                onChange={(e) => set("responsavel", e.target.value)}
              />
            </Campo>
            <Campo label="Cargo">
              <input
                className={inputCls}
                value={p.cargo}
                onChange={(e) => set("cargo", e.target.value)}
              />
            </Campo>
            <Campo label="Registro profissional">
              <input
                className={inputCls}
                value={p.registro}
                onChange={(e) => set("registro", e.target.value)}
              />
            </Campo>
          </Grupo>
        </div>

        {/* Prévia (é exatamente o que vai para o PDF) */}
        <div
          ref={previaRef}
          className="min-w-0 rounded-xl bg-gray-200 py-6 print:rounded-none print:bg-transparent print:p-0"
        >
          {/* Só no navegador: o documento depende do rascunho salvo aqui. */}
          {carregado ? (
            <div
              className="[zoom:var(--escala)] print:[zoom:1]"
              style={{ "--escala": escala } as CSSProperties}
            >
              <PropostaDocumento p={p} />
            </div>
          ) : (
            <p className="py-20 text-center text-sm text-gray-500">Carregando documento...</p>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500";

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <legend className="px-1 text-sm font-bold text-gray-900">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function Campo({
  label,
  dica,
  children,
}: {
  label: string;
  dica?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
      {children}
      {dica && <span className="mt-1 block text-xs text-gray-500">{dica}</span>}
    </label>
  );
}

function Num({
  label,
  dica,
  valor,
  passo = 1,
  onChange,
}: {
  label: string;
  dica?: string | undefined;
  valor: number;
  passo?: number;
  onChange: (v: number) => void;
}) {
  return (
    <Campo label={label} dica={dica}>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={passo}
        className={inputCls}
        value={Number.isFinite(valor) ? valor : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </Campo>
  );
}
