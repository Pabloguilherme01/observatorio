import { Database, FileCheck2, Fingerprint, Link2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import generated from '../../data/generated/tse2026-candidates.json';
import { RESULTS_WINDOW } from '../../data/resultsConfig';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function EvidenceChain() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const resultsPhase = now < new Date(RESULTS_WINDOW.start).getTime()
    ? 'pre_open'
    : now > new Date(RESULTS_WINDOW.end).getTime()
      ? 'ended_unavailable'
      : 'open_waiting';
  const candidateSource = d.sources.find(source => source.id === 'tse-candidatos-2026');
  const editorialSource = d.sources.find(source => source.id === 'recorte-editorial-candidatos-2026');
  const candidateState = generated.meta.state;
  const candidateCaptured = Boolean(generated.meta.downloadedAt);
  const candidateHash = generated.meta.sourceFileSha256;
  const resultSource = d.sources.find(source => source.id === 'tse-resultados-2026');
  const resultPhase = {
    pre_open: { label: 'Pré-eleição', detail: 'A janela de resultados ainda não abriu.' },
    open_waiting: { label: 'Janela aberta', detail: 'O estado detalhado do feed oficial aparece no painel de resultados; esta camada não faz uma segunda consulta à rede.' },
    ended_unavailable: { label: 'Janela encerrada', detail: 'A janela operacional terminou; o estado do último feed continua indicado no painel de resultados.' },
  } as const;
  const currentResultPhase = resultPhase[resultsPhase as keyof typeof resultPhase];

  return (
    <section id="evidencias" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="evidence-title">
      <SectionHeader
        titleId="evidence-title"
        eyebrow="Evidências"
        title="Cadeia de proveniência"
        description="Esta camada responde quatro perguntas: qual é a fonte, houve captura local, existe prova de integridade e qual é a limitação do recorte?"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <Database className="h-4 w-4 text-sky-300" aria-hidden="true" /> Candidatos
          </div>
          <h3 className="mt-3 text-lg font-black text-white light:text-slate-900">Fonte oficial separada do recorte</h3>
          <div className="mt-4 space-y-2 text-xs leading-5 text-slate-400 light:text-slate-600">
            <div><strong className="text-slate-200 light:text-slate-800">Fonte:</strong> {candidateSource?.label ?? 'TSE — Candidatos 2026'}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Captura local:</strong> {candidateCaptured ? 'realizada' : 'ainda não realizada'}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Estado:</strong> {candidateState}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Cobertura:</strong> watchlist de {generated.watchlist.length} nomes, não universo completo.</div>
            <div><strong className="text-slate-200 light:text-slate-800">Recorte mostrado:</strong> {d.candidates.length} registro{d.candidates.length === 1 ? '' : 's'} editorial{d.candidates.length === 1 ? '' : 'is'}.</div>
          </div>
          <a href={editorialSource?.url ?? candidateSource?.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-300">
            Abrir fonte de referência <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <Fingerprint className="h-4 w-4 text-sky-300" aria-hidden="true" /> Integridade
          </div>
          <h3 className="mt-3 text-lg font-black text-white light:text-slate-900">Prova material da captura</h3>
          <div className="mt-4 space-y-2 text-xs leading-5 text-slate-400 light:text-slate-600">
            <div><strong className="text-slate-200 light:text-slate-800">SHA-256 da fonte:</strong> {candidateHash ? <code className="break-all">{candidateHash}</code> : 'não registrado — nenhuma captura local validada'}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Workflow:</strong> {generated.meta.workflowRunId ?? 'não capturado'}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Commit:</strong> {'gitCommit' in generated.meta && generated.meta.gitCommit ? generated.meta.gitCommit : 'não capturado'}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Registros da fonte lidos:</strong> {generated.meta.sourceRows.toLocaleString('pt-BR')}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Registros acompanhados:</strong> {generated.meta.matchedRows.toLocaleString('pt-BR')}</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-sky-300" aria-hidden="true" /> Resultados
          </div>
          <h3 className="mt-3 text-lg font-black text-white light:text-slate-900">Publicação condicionada à validação</h3>
          <div className="mt-4 space-y-2 text-xs leading-5 text-slate-400 light:text-slate-600">
            <div><strong className="text-slate-200 light:text-slate-800">Fonte:</strong> {resultSource?.institution ?? 'Tribunal Superior Eleitoral'}</div>
            <div><strong className="text-slate-200 light:text-slate-800">Município:</strong> Águas Lindas de Goiás · código 93343</div>
            <div><strong className="text-slate-200 light:text-slate-800">Integridade:</strong> JSON/JWS e contexto municipal são validados antes da publicação.</div>
            <div><strong className="text-slate-200 light:text-slate-800">Estado atual:</strong> {currentResultPhase.label} — {currentResultPhase.detail}</div>
          </div>
          <a href={resultSource?.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-300">
            Documentação técnica TSE <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </Card>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4 text-xs leading-5 text-slate-400 light:border-amber-300/50 light:bg-amber-50 light:text-slate-600">
        <strong className="text-amber-200 light:text-amber-800">Regra de interpretação:</strong> uma fonte oficial não transforma automaticamente um recorte local em snapshot oficial. A etiqueta “oficial” descreve a origem da fonte; “captura local validada” exige evidência material registrada nesta aplicação.
      </div>
    </section>
  );
}
