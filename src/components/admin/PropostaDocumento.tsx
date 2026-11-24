import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { LOGO } from "@/lib/constants";
import {
  calcularEconomia,
  dataCurta,
  dataPorExtenso,
  EMPRESA,
  geracaoPorMes,
  ITENS_INCLUSOS,
  numero,
  potenciaKwp,
  REAJUSTE_MEDIO,
  REAJUSTES_ENEL,
  reais,
  type Proposta,
} from "@/lib/proposta";

const VERDE = "#071f19";

/** Uma folha A4. Na impressão, cada folha vira uma página do PDF. */
function Pagina({ numero: n, children }: { numero: number; children: ReactNode }) {
  return (
    <section className="proposta-pagina relative mx-auto mb-8 flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white text-[11pt] leading-relaxed text-gray-900 shadow-lg print:mb-0 print:shadow-none">
      <header
        className="flex items-center gap-4 px-[14mm] py-4 text-white"
        style={{ backgroundColor: VERDE }}
      >
        <img src={LOGO} alt="Esolution" className="h-10 w-auto" />
        <div className="ml-auto text-right text-[8.5pt] leading-snug">
          <p className="font-bold">{EMPRESA.razao}</p>
          <p>CNPJ {EMPRESA.cnpj}</p>
          <p>{EMPRESA.endereco}</p>
        </div>
      </header>
      <div className="flex-1 px-[16mm] py-[10mm]">{children}</div>
      <footer className="px-[14mm] pb-4 text-right text-[8pt] text-gray-400">{n}</footer>
    </section>
  );
}

function Titulo({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-5 border-b-2 border-[#30be5a] pb-1 text-[12pt] font-extrabold uppercase tracking-wide text-[#071f19] first:mt-0">
      {children}
    </h2>
  );
}

export function PropostaDocumento({ p }: { p: Proposta }) {
  const kwp = potenciaKwp(p);
  const meses = geracaoPorMes(p.geracaoMensal);
  const eco = calcularEconomia(p);
  const outros = p.outrosItens
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const parcela = p.parcelasCartao > 0 ? p.valorCartao / p.parcelasCartao : 0;

  return (
    <div id="proposta-documento">
      {/* 1. Capa */}
      <Pagina numero={1}>
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-[22pt] font-extrabold text-[#071f19]">PROPOSTA TÉCNICA COMERCIAL</p>
          <p className="mt-1 text-[13pt] text-gray-500">(Rev. {p.revisao || "01"})</p>
          <div className="my-10 h-1 w-24 rounded bg-[#30be5a]" />
          <p className="text-[15pt] font-bold tracking-wide">GERAÇÃO DISTRIBUÍDA</p>
          <p className="mt-2 text-[30pt] font-extrabold text-[#00a88f]">{numero(kwp, 2)} kWp</p>
          <p className="mt-14 text-[14pt]">
            <span className="font-semibold text-gray-500">CLIENTE:</span>{" "}
            <span className="font-bold">{p.cliente || "Nome do cliente"}</span>
          </p>
          <p className="mt-auto text-[11pt] text-gray-600">
            {p.local}, {dataCurta(p.data)}
          </p>
        </div>
      </Pagina>

      {/* 2. Como funciona */}
      <Pagina numero={2}>
        <Titulo>Entenda como funciona um sistema de geração fotovoltaica</Titulo>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Os painéis solares captam a energia do sol e convertem em energia elétrica.</li>
          <li>
            O inversor converte a corrente contínua, gerada pelos painéis solares, em corrente
            alternada, para possibilitar o uso da energia pelos nossos aparelhos domésticos.
          </li>
          <li>
            O medidor bidirecional faz a medição tanto da energia que foi gerada pelo sistema solar
            (energia injetada na rede), como de toda a energia consumida pela unidade consumidora.
          </li>
        </ul>
        <Titulo>Breve histórico</Titulo>
        <p className="text-justify">
          Inicialmente os sistemas de geração fotovoltaica em unidades consumidoras residenciais
          eram projetados para locais que não eram atendidos pelo sistema elétrico convencional.
          Basicamente teria que se gerar energia suficiente para o consumo diurno e o excedente, que
          seria consumido no período noturno, teria que ser acumulado em baterias, que são caras,
          possuem baixa vida útil, além da necessidade de constantes manutenções.
        </p>
        <p className="mt-2 text-justify">
          A partir de 2012, a resolução ANEEL 482 introduziu o Sistema de Compensação de Energia
          Elétrica (SCEE), que permite que a energia gerada em excesso seja injetada na rede da
          distribuidora, gerando “créditos” de energia (kWh) para compensar consumos posteriores. Ou
          seja, podemos gerar durante o dia a energia que iremos consumir à noite, sem necessidade
          de baterias.
        </p>
        <Titulo>Crescimento exponencial</Titulo>
        <p className="text-justify">
          Em 2015 a participação da energia solar (geração distribuída) na matriz elétrica nacional
          era de apenas 0,01%, correspondente a 20 MW. Em agosto de 2025 atingimos a marca de 63,7
          GW (63.700 MW), cerca de 24,5% da nossa matriz elétrica. Atualmente o Brasil conta com
          mais de 3 milhões de sistemas conectados à rede e mais de 5 milhões de unidades
          consumidoras utilizando os créditos da energia gerada.
        </p>
        <p className="mt-2 text-justify">
          O aumento da demanda mundial possibilitou a produção em larga escala dos materiais,
          reduzindo os custos e o prazo de retorno do investimento. Além dos benefícios financeiros,
          você ainda contribui para a construção de um planeta mais limpo e sustentável.
        </p>
      </Pagina>

      {/* 3. Sistema dimensionado */}
      <Pagina numero={3}>
        <Titulo>Sistema dimensionado</Titulo>
        <p>
          Levando em consideração a informação do cliente, dimensionamos um sistema para atender uma
          produção média mensal estimada de <strong>{numero(p.geracaoMensal)} kWh</strong>.
        </p>
        <p className="mb-2 mt-8 text-center font-bold">Estimativa de energia gerada mensalmente</p>
        <p className="mb-2 text-center text-[9pt] text-gray-500">
          Média de {numero(p.geracaoMensal)} kWh/mês · Previsão anual de{" "}
          {numero(p.geracaoMensal * 12)} kWh
        </p>
        <div className="flex justify-center">
          <BarChart width={620} height={300} data={meses} margin={{ top: 24, right: 8, left: 8 }}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#374151" }} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} width={48} />
            <Bar dataKey="kwh" fill="#00a88f" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="kwh"
                position="top"
                fontSize={9}
                fill="#374151"
                formatter={(v: number) => numero(v, 1)}
              />
            </Bar>
          </BarChart>
        </div>
      </Pagina>

      {/* 4. Equipamentos e valor */}
      <Pagina numero={4}>
        <p>
          Para garantir essa geração de energia, propomos um sistema de geração fotovoltaica para
          autoconsumo com as seguintes características:
        </p>
        <ul className="ml-5 mt-3 list-[circle] space-y-1.5">
          <li>
            1x {p.inversor} – Garantia de {p.garantiaInversorAnos} anos.
          </li>
          <li>
            {p.qtdPaineis}x {p.modeloPainel} – Garantia de {p.garantiaPainelAnos} anos.
          </li>
          {outros.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Titulo>Itens inclusos na proposta</Titulo>
        <ul className="ml-5 list-disc space-y-1">
          {ITENS_INCLUSOS.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="mt-3 text-[9.5pt] text-gray-600">
          OBS: Não incluso melhoria ou atualização dos quadros de proteção da residência, caso
          necessário.
        </p>
        <Titulo>Valor do sistema</Titulo>
        <div className="rounded-lg border-2 border-[#30be5a] p-5 text-center">
          <p className="text-[18pt] font-extrabold text-[#071f19]">
            {reais(p.valorAVista)} <span className="text-[12pt] font-semibold">à vista</span>
          </p>
          {p.valorCartao > 0 && p.parcelasCartao > 0 && (
            <>
              <p className="my-1 text-gray-500">ou</p>
              <p className="text-[13pt] font-bold">
                {reais(p.valorCartao)} em {p.parcelasCartao}x no cartão
                <span className="font-normal text-gray-600"> ({reais(parcela)} por mês)</span>
              </p>
            </>
          )}
        </div>
        <p className="mt-2 text-[9.5pt] text-gray-600">
          Obs: Emissão de nota fiscal somente dos materiais.
        </p>
      </Pagina>

      {/* 5. Economia e payback */}
      <Pagina numero={5}>
        <Titulo>Economia e payback</Titulo>
        <div className="mb-3 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-[#071f19] p-3 text-white">
            <p className="text-[8.5pt] uppercase tracking-wide opacity-80">
              Economia estimada em {p.anos} anos
            </p>
            <p className="text-[15pt] font-extrabold">{reais(eco.economiaTotal)}</p>
          </div>
          <div className="rounded-lg bg-[#30be5a] p-3 text-[#071f19]">
            <p className="text-[8.5pt] uppercase tracking-wide">Payback (retorno)</p>
            <p className="text-[15pt] font-extrabold">
              {eco.paybackMeses === null ? `acima de ${p.anos} anos` : `${eco.paybackMeses} meses`}
            </p>
          </div>
        </div>
        <table className="w-full border-collapse text-right text-[8pt] tabular-nums">
          <thead>
            <tr className="bg-[#071f19] text-white">
              <th className="px-1.5 py-1 text-center">Ano</th>
              <th className="px-1.5 py-1">Geração (kWh)</th>
              <th className="px-1.5 py-1">Tarifa (R$/kWh)</th>
              <th className="px-1.5 py-1">Economia anual</th>
              <th className="px-1.5 py-1">Investimento</th>
              <th className="px-1.5 py-1">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {eco.linhas.map((l) => (
              <tr key={l.ano} className="odd:bg-gray-50">
                <td className="px-1.5 py-[2px] text-center">{l.ano}</td>
                <td className="px-1.5 py-[2px]">{numero(l.geracao)}</td>
                <td className="px-1.5 py-[2px]">{numero(l.tarifa, 2)}</td>
                <td className="px-1.5 py-[2px]">{reais(l.economia)}</td>
                <td className="px-1.5 py-[2px]">{l.investimento ? reais(l.investimento) : ""}</td>
                <td
                  className={`px-1.5 py-[2px] font-semibold ${l.saldo < 0 ? "text-red-700" : "text-green-800"}`}
                >
                  {reais(l.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-3 space-y-0.5 text-[8pt] text-gray-600">
          <li>• Considerado reajuste tarifário médio anual de {numero(p.reajusteAnual, 2)}%.</li>
          <li>
            • Considerada perda de geração de {numero(p.perdaAnual, 2)}% ao ano (degradação dos
            painéis).
          </li>
          {p.trocaInversorAno > 0 && (
            <li>• Prevista a substituição do inversor no ano {p.trocaInversorAno}.</li>
          )}
          <li>• Não considerada capitalização do investimento inicial, nem da economia obtida.</li>
          <li>
            • Considerado o pagamento do percentual do Fio B (TUSD) conforme Lei 14.300/2022: 60% em
            2026, 75% em 2027, 90% em 2028 e {numero(p.fioBDepois2028)}% a partir de 2029. A coluna
            Tarifa é o valor que deixa de ser pago por kWh gerado.
          </li>
        </ul>
      </Pagina>

      {/* 6. Reajustes e validade */}
      <Pagina numero={6}>
        <Titulo>Reajuste da tarifa de energia no Ceará nos últimos anos</Titulo>
        <table className="mx-auto w-64 border-collapse text-[10pt] tabular-nums">
          <thead>
            <tr className="bg-[#071f19] text-white">
              <th className="px-3 py-1 text-left">Ano</th>
              <th className="px-3 py-1 text-right">Reajuste</th>
            </tr>
          </thead>
          <tbody>
            {REAJUSTES_ENEL.map(([ano, v]) => (
              <tr key={ano} className="odd:bg-gray-50">
                <td className="px-3 py-0.5">{ano}</td>
                <td className="px-3 py-0.5 text-right">{numero(v, 2)}%</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="border-t px-3 py-1">Média</td>
              <td className="border-t px-3 py-1 text-right">{numero(REAJUSTE_MEDIO, 2)}%</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-center text-[8pt] text-gray-500">
          Fonte: enel.com.br/pt-ceara/Tarifas_Enel.html
        </p>
        <Titulo>Validade da proposta</Titulo>
        <p>
          A presente proposta tem validade de {p.validadeDias} dias corridos contados a partir da
          data de envio.
        </p>
        <p className="mt-10">
          {p.local}, {dataPorExtenso(p.data)}.
        </p>
        <div className="mt-16 w-72 border-t border-gray-700 pt-2">
          <p className="font-bold">{p.responsavel}</p>
          <p className="text-[10pt]">{p.cargo}</p>
          <p className="text-[10pt]">{p.registro}</p>
        </div>
      </Pagina>
    </div>
  );
}
