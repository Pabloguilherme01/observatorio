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
          <div className="mt-1 text-xs text-slate-500">{contasData.totalCandidatosComContas} candidatos com contas no snapshot local.</div>
        </div>

        {contasData.contas.length ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
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
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
            A captura oficial de prestação de contas ainda não foi materializada neste snapshot. O pipeline já está preparado para ingeri-la sem preencher a interface com dados simulados.
          </div>
        )}

        <a href={contasData.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-xs font-bold text-sky-300">
          Fonte oficial do TSE
        </a>
      </Card>
    </section>
  );
}
