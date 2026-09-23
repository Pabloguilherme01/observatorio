import rawContasData from '../../../generated/tse2026-contas.json';
import { TSEContasFileSchema } from '../../schemas/tse-enriched.schema';
import { ShareDataButton } from '../ShareDataButton';
import { Card } from '../ui/Card';

const contasData = TSEContasFileSchema.parse(rawContasData);

export function Contas360() {
  const anchor = 'contas';
  const url = typeof window === 'undefined'
    ? 'https://pabloguilherme01.github.io/observatorio/#contas'
    : window.location.origin + window.location.pathname + '#' + anchor;

  return (
    <section id={anchor} className="mt-4 scroll-mt-24" aria-labelledby="contas-title">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Prestação de contas</div>
            <h3 id="contas-title" className="mt-1 text-lg font-black text-white">Contas eleitorais 2026</h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Tabela documental baseada no snapshot oficial. Nenhuma ordenação por valor é aplicada.</p>
          </div>
          <ShareDataButton title="Contas eleitorais 2026" text="Prestação de contas eleitorais 2026 no Observatório." url={url} />
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado da captura</div>
          <div className="mt-2 text-sm font-black text-white">{contasData.estado}</div>
          <div className="mt-1 text-xs text-slate-500">{contasData.totalCandidatosComContas} registros de contas associados ao recorte nominal no snapshot local.</div>
        </div>

        {contasData.contas.length ? (
          <>
            <div className="mt-4 space-y-2 md:hidden">
              {contasData.contas.map(conta => (
                <details key={conta.candidatoId} className="rounded-2xl border border-white/8 bg-white/[0.02]">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0">
                      <strong className="block truncate text-sm text-white">{conta.nomeCandidato}</strong>
                      <span className="mt-1 block text-[12px] text-slate-500">{conta.receitas.qtdDoadores} receitas · {conta.despesas.qtdFornecedores} despesas</span>
                    </span>
                    <span className="shrink-0 text-sm font-black text-sky-200">{conta.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </summary>
                  <div className="grid gap-2 border-t border-white/8 p-4 sm:grid-cols-3">
                    <Metric label="Receitas" value={conta.receitas.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Metric label="Despesas" value={conta.despesas.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Metric label="Saldo" value={conta.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-white/8 md:block">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-3 font-bold">Candidato</th>
                    <th scope="col" className="px-3 py-3 font-bold">Receitas</th>
                    <th scope="col" className="px-3 py-3 font-bold">Despesas</th>
                    <th scope="col" className="px-3 py-3 font-bold">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {contasData.contas.map(conta => (
                    <tr key={conta.candidatoId} className="border-t border-white/8">
                      <td className="px-3 py-3 text-white">{conta.nomeCandidato}</td>
                      <td className="px-3 py-3 text-slate-300">{conta.receitas.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="px-3 py-3 text-slate-300">{conta.despesas.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="px-3 py-3 text-slate-300">{conta.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
            A captura oficial de prestação de contas foi materializada para este primeiro snapshot. Não há registros de movimentação associados aos nomes monitorados nesta captura; o zero é resultado do filtro documental, não um zero atribuído ao universo completo de candidaturas.
          </div>
        )}

        <a href={contasData.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-xs font-bold text-sky-300">
          Fonte oficial do TSE
        </a>
      </Card>
    </section>
  );
}


function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3"><div className="text-[11px] uppercase tracking-wide text-slate-600">{label}</div><div className="mt-1 text-sm font-bold text-white">{value}</div></div>;
}
