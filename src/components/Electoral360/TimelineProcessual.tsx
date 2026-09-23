import rawProcessualData from '../../../generated/tse2026-processual.json';
import { TSEProcessualFileSchema } from '../../schemas/tse-enriched.schema';
import { ShareDataButton } from '../ShareDataButton';
import { Card } from '../ui/Card';

const processualData = TSEProcessualFileSchema.parse(rawProcessualData);

export function TimelineProcessual() {
  const url = typeof window === 'undefined'
    ? 'https://pabloguilherme01.github.io/observatorio/#processual'
    : window.location.origin + window.location.pathname + '#processual';

  return (
    <section id="processual" className="mt-4 scroll-mt-24" aria-labelledby="processual-title">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Processual 2026</div>
            <h3 id="processual-title" className="mt-1 text-lg font-black text-white">Timeline documental</h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Processo → movimentação → decisão → recurso, sempre com referência ao documento original.</p>
          </div>
          <ShareDataButton title="Radar processual 2026" text="Timeline documental processual no Observatório." url={url} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          <span className="rounded-full border border-white/8 px-2.5 py-1">Estado: {processualData.estado}</span>
          <span className="rounded-full border border-white/8 px-2.5 py-1">{processualData.totalProcessos} processos</span>
        </div>

        {processualData.processos.length ? (
          <div className="mt-5 space-y-6">
            {processualData.processos.map(processo => (
              <article key={processo.numeroProcesso} className="border-l border-white/10 pl-4">
                <div className="text-xs font-black text-white">{processo.numeroProcesso}</div>
                <div className="mt-1 text-xs text-slate-400">{processo.classe} · {processo.assunto}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{processo.escopo}</div>
                <div className="mt-3 space-y-3">
                  {processo.timeline.map(evento => (
                    <div key={evento.data + evento.tipo} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600">{evento.data} · {evento.tipo}</div>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{evento.descricao}</p>
                      {evento.documentoUrl && <a href={evento.documentoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center text-[11px] font-bold text-sky-300">Documento</a>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={processo.pjeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-300">Abrir PJe TSE</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
            A captura processual ainda não foi materializada neste snapshot. Nenhum processo é inferido ou preenchido manualmente.
          </div>
        )}

        <a href={processualData.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-xs font-bold text-sky-300">Fonte oficial do TSE</a>
      </Card>
    </section>
  );
}
