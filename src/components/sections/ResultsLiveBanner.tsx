import { ExternalLink, Radio, RefreshCw, ShieldCheck } from 'lucide-react';
import { useResultsFeed } from '../../hooks/useResultsFeed';

const RESULTS_DOCS_URL = 'https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados';

export function ResultsLiveBanner() {
  const { data, checking, phase } = useResultsFeed();

  if (phase === 'pre_open') return null;

  if (!data || data.state === 'pending' || phase === 'stale') {
    const ended = phase === 'ended_unavailable';
    const stale = phase === 'stale';
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-live="polite">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <strong className="block text-sm text-slate-100">{stale ? 'Resultados oficiais · feed desatualizado' : ended ? 'Feed oficial não capturado localmente' : 'Resultados oficiais · aguardando arquivo TSE'}</strong>
              <span className="text-xs leading-5 text-slate-500">
                {stale
                  ? `O último arquivo recebido foi capturado em ${data?.capturedAt ? new Date(data.capturedAt).toLocaleString('pt-BR') : 'horário desconhecido'}. O observatório mantém os dados sem rotulá-los como ao vivo até nova captura válida.`
                  : ended
                    ? 'A janela prevista terminou sem um feed oficial validado neste observatório.'
                    : 'Nenhum resultado é inferido ou preenchido manualmente; o painel só acende quando o arquivo oficial passa pela validação local.'}
              </span>
            </div>
          </div>
          <a href={RESULTS_DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-300 hover:bg-white/5">
            documentação TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>
    );
  }

  const label = data.state === 'live' ? 'AO VIVO · Apuração TSE' : 'RESULTADO · TSE';
  const detail = data.items.length
    ? `${data.items.length} registros recebidos`
    : 'Nenhum registro municipal no feed atual';
  const integrity = data.integrity?.jwsVerified === true && data.integrity?.signatureStatus === 'verified' && data.integrity?.verificationMethod === 'jws-node-crypto'
    ? 'assinatura JWS verificada com chave configurada'
    : data.integrity?.signatureStatus === 'not_verified'
      ? 'assinatura não verificada'
      : data.integrity?.signatureStatus === 'unavailable'
        ? 'assinatura não disponível'
        : 'contrato local validado';

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-live="polite">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-sky-400/15 bg-sky-400/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
          <div>
            <strong className="block text-sm text-slate-100">{label}</strong>
            <span className="text-xs text-slate-500">
              {data.municipalityName} · {data.cargo} · turno {data.turn} · {detail} · capturado em {new Date(data.capturedAt).toLocaleString('pt-BR')} · {integrity}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {checking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
          atualização silenciosa
        </span>
      </div>
    </section>
  );
}
