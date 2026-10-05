import { Database, ExternalLink, History, ShieldCheck } from 'lucide-react';
import { useResultsFeed } from '../../hooks/useResultsFeed';
import { observatorioData as d } from '../../data/observatorioData';

const RESULTS_DOCS_URL = 'https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados';
const formatVotes = (value: number) => value.toLocaleString('pt-BR');
const formatCapturedAt = (value: string) => new Date(value).toLocaleString('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: d.meta.timezone,
});

export function ResultsLiveBanner() {
  const { data, checking, phase } = useResultsFeed();

  if (phase === 'pre_open') return null;

  if (!data || data.state === 'pending') {
    const ended = phase === 'ended_unavailable';
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-live="polite">
        <div className="mb-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4 light:border-amber-300/50 light:bg-amber-50">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <strong className="block text-sm text-slate-100 light:text-amber-900">
                {ended ? 'Resultado oficial ainda não disponível' : 'Resultados oficiais · aguardando arquivo TSE'}
              </strong>
              <span className="text-xs leading-5 text-slate-500 light:text-slate-600">
                {ended
                  ? 'A janela de apuração terminou. O resultado só aparece aqui quando existe um arquivo oficial validado.'
                  : 'Os números só aparecem depois que o arquivo oficial é validado.'}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const archived = phase === 'complete' || phase === 'archived_partial';
  const title = phase === 'complete'
    ? `Resultado oficial · ${data.turn === 2 ? '2º' : '1º'} turno conferido`
    : phase === 'archived_partial'
      ? 'Resultado oficial · último registro conferido'
      : phase === 'stale'
        ? 'Resultado oficial · último registro preservado'
        : 'Resultado oficial · atualização';

  const integrity = data.integrity?.allVerified
    ? `Fonte oficial e assinatura digital conferidas pelo TSE`
    : 'verificação técnica incompleta; confira a fonte oficial';

  return (
    <section id="resultados" className="mx-auto max-w-7xl px-4 sm:px-6" aria-live="polite" aria-label="Resultados oficiais do TSE">
      <div className="mb-4 rounded-2xl border border-sky-400/15 bg-sky-400/[0.035] p-4 light:border-sky-200 light:bg-sky-50/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {archived
              ? <History className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
              : <Database className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />}
            <div>
              <strong className="block text-sm text-slate-100 light:text-slate-900">{title}</strong>
              <p className="text-xs leading-5 text-slate-400 light:text-slate-600">
                {data.municipalityName} · turno {data.turn} · conferido em {formatCapturedAt(data.capturedAt)} · {integrity}
              </p>
              {archived && (
                <p className="mt-1 text-xs text-sky-200 light:text-sky-800">
                  Este resultado fica disponível como registro histórico. Se houver nova apuração, ela será apresentada separadamente para não misturar turnos.
                </p>
              )}
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {checking ? 'verificando' : archived ? 'resultado conferido' : 'atualização'}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.entries.map(entry => {
            const counted = entry.sectionsCounted;
            const total = entry.sectionsTotal;
            const percentage = total && counted != null
              ? counted >= total
                ? 100
                : Math.min(99.9, Math.floor((counted / total * 100) * 10) / 10)
              : null;
            const sorted = [...entry.items].sort((a, b) => b.votes - a.votes);
            const listedVotes = entry.items.reduce((sum, item) => sum + item.votes, 0);
            const hasNominalAggregateDifference = entry.validVotes != null && listedVotes !== entry.validVotes;
            return (
              <div key={entry.sourceFile} className="results-public-card rounded-xl border border-white/10 p-3 light:border-slate-200 light:bg-white">
                <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">{entry.cargo}</h3>
                <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                  {percentage == null ? 'Seções apuradas não informadas' : `${formatVotes(counted!)} de ${formatVotes(total!)} seções · ${percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                  {entry.validVotes != null ? ` · ${formatVotes(entry.validVotes)} votos válidos` : ''}
                </p>
                {sorted.length ? (
                  <ol className="mt-3 space-y-1 text-xs text-slate-300 light:text-slate-700">
                    {sorted.slice(0, 5).map(item => (
                      <li key={item.candidateId} className="flex justify-between gap-3">
                        <span>{item.candidate}{item.party ? ` · ${item.party}` : ''}</span>
                        <strong className="shrink-0">{formatVotes(item.votes)} votos</strong>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-2 text-xs text-slate-500">Sem candidatos no arquivo recebido.</p>}
                {sorted.length > 5 && <p className="mt-2 text-[10px] text-slate-500">Exibindo 5 de {sorted.length} registros.</p>}
                {hasNominalAggregateDifference && (
                  <p className="mt-2 text-[10px] leading-4 text-amber-300 light:text-amber-800">
                    O total de votos válidos é o agregado oficial do TSE. Os registros nominais recebidos neste cargo não devem ser somados para recomputar esse total.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <a href={RESULTS_DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-slate-300 light:text-slate-700">
            Como o TSE publica os resultados <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a href="#fontes" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-slate-300 light:text-slate-700">
            Ver cadeia de fontes
          </a>
        </div>
      </div>
    </section>
  );
}
