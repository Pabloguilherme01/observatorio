import { ExternalLink, Radio, RefreshCw, ShieldCheck } from 'lucide-react';
import { useResultsFeed } from '../../hooks/useResultsFeed';

const RESULTS_DOCS_URL = 'https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados';
const formatVotes = (value: number) => value.toLocaleString('pt-BR');

export function ResultsLiveBanner() {
  const { data, checking, phase } = useResultsFeed();

  if (phase === 'pre_open') return null;

  if (!data || data.state === 'pending') {
    const ended = phase === 'ended_unavailable';
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-live="polite">
        <div className="mb-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <strong className="block text-sm text-slate-100">{ended ? 'Feed oficial não capturado localmente' : 'Resultados oficiais · aguardando arquivo TSE'}</strong>
              <span className="text-xs leading-5 text-slate-500">
                {ended ? 'A janela prevista terminou sem um feed oficial validado neste observatório.' : 'Nenhum resultado é inferido ou preenchido manualmente; o painel só acende quando o arquivo oficial passa pela validação local.'}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const label = phase === 'complete' ? 'FEED COMPLETO · TSE'
    : phase === 'archived_partial' ? 'RESULTADO PARCIAL ARQUIVADO · TSE'
      : phase === 'stale' ? 'CAPTURA DESATUALIZADA · TSE'
        : 'AO VIVO · Apuração TSE';
  const verified = data.integrity?.files.filter(file => file.signatureStatus === 'verified').length ?? 0;
  const integrity = data.integrity?.allVerified
    ? `${verified}/${data.integrity.files.length} assinaturas JWS verificadas com chave oficial TSE`
    : 'sem prova criptográfica publicada';

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-live="polite" aria-label="Resultados oficiais do TSE">
      <div className="mb-4 rounded-2xl border border-sky-400/15 bg-sky-400/[0.035] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Radio className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
            <div>
              <strong className="block text-sm text-slate-100">{label}</strong>
              <p className="text-xs leading-5 text-slate-400">
                {data.municipalityName} · turno {data.turn} · capturado em {new Date(data.capturedAt).toLocaleString('pt-BR')} · {integrity}
              </p>
              {(phase === 'stale' || phase === 'archived_partial') && (
                <p className="mt-1 text-xs text-amber-200">Snapshot preservado; estes números não são uma atualização ao vivo.</p>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {checking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            atualização silenciosa
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.entries.map(entry => {
            const counted = entry.sectionsCounted;
            const total = entry.sectionsTotal;
            const percentage = total && counted != null ? Math.min(100, Math.round(counted / total * 100)) : null;
            const sorted = [...entry.items].sort((a, b) => b.votes - a.votes);
            return (
              <div key={entry.sourceFile} className="rounded-xl border border-white/10 p-3">
                <h3 className="text-sm font-bold text-slate-100">{entry.cargo}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {percentage == null ? 'Seções apuradas não informadas' : `${formatVotes(counted!)} de ${formatVotes(total!)} seções · ${percentage}%`}
                  {entry.validVotes != null ? ` · ${formatVotes(entry.validVotes)} votos válidos` : ''}
                </p>
                {sorted.length ? (
                  <ol className="mt-3 space-y-1 text-xs text-slate-300">
                    {sorted.slice(0, 5).map(item => (
                      <li key={item.candidateId} className="flex justify-between gap-3">
                        <span>{item.candidate}{item.party ? ` · ${item.party}` : ''}</span>
                        <strong className="shrink-0">{formatVotes(item.votes)} votos</strong>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-2 text-xs text-slate-500">Sem candidatos no arquivo recebido.</p>}
                {sorted.length > 5 && <p className="mt-2 text-[10px] text-slate-500">Exibindo 5 de {sorted.length} registros.</p>}
              </div>
            );
          })}
        </div>
        <a href={RESULTS_DOCS_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-slate-300">
          Conferir documentação do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
