import { CheckCircle2, Database, Link2, TriangleAlert } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';
import { SIMULATION_CONTEXT } from '../../data/resultsConfig';
import generated from '../../data/generated/tse2026-candidates.json';

export function DataQualityPanel() {
  const derived = d.indicators.filter(i => i.status === 'derived').length;
  const current = d.indicators.filter(i => i.status === 'current').length;
  const historical = d.indicators.filter(i => i.status === 'historical').length;
  const officialSources = d.sources.filter(source => source.nature === 'official').length;
  const secondarySources = d.sources.filter(source => source.nature === 'secondary').length;
  const poll = d.polls[0];
  const pollNamedPct = poll.results.reduce((sum, result) => sum + result.percentage, 0);
  const pollCoveredPct = pollNamedPct + (poll.nonePct ?? 0) + (poll.notSurePct ?? 0);
  const pollGapPct = Math.max(0, 100 - pollCoveredPct);
  const tseState = generated.meta.state;
  const tsePresentation = {
    first_capture: { label: 'Capturado', tone: 'text-emerald-300' },
    synced: { label: 'Sincronizado', tone: 'text-emerald-300' },
    unchanged: { label: 'Sem alterações', tone: 'text-emerald-300' },
    changed: { label: 'Alterado', tone: 'text-amber-300' },
    stale: { label: 'Desatualizado', tone: 'text-amber-300' },
    failed: { label: 'Falha na sincronização', tone: 'text-rose-300' },
    not_synced: { label: 'Aguardando captura', tone: 'text-amber-300' },
  } as const;
  const tseStatus = tsePresentation[tseState as keyof typeof tsePresentation] ?? { label: 'Estado desconhecido', tone: 'text-slate-300' };
  const tseCapturedAt = generated.meta.downloadedAt ? new Date(generated.meta.downloadedAt) : null;
  const resultsSource = d.sources.find(source => source.id === 'tse-resultados-2026');
  const warnings = [
    pollGapPct > 0 ? 'Pesquisa: ' + pollGapPct.toFixed(2).replace('.', ',') + ' p.p. estão fora das categorias publicadas.' : null,
    d.education?.note ? 'Educação: a faixa do Ideb 2025 está marcada como pendente de conferência pontual no INEP.' : null,
    'Orçamento: organizações, unidades e funções são níveis de classificação diferentes e não devem ser somados entre si.',
    'Saúde: 164, 85 e 298 leitos representam referências distintas; não são tratados como uma série contínua de capacidade instalada.',
    'Candidaturas: estado do snapshot TSE = ' + tseState + '; os componentes usam a mesma captura oficial para evitar divergência com um recorte hard-coded.',
  ].filter(Boolean) as string[];

  return (
    <section id="qualidade" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="quality-title">
      <SectionHeader
        titleId="quality-title"
        eyebrow="Qualidade"
        title="Proveniência antes de interpretação"
        description="O observatório separa dado atual, snapshot, histórico e cálculo derivado. A data abaixo é a última atualização do conjunto local, não uma promessa de atualização automática das fontes."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{current}</div>
          <div className="text-xs text-slate-500">indicadores atuais</div>
        </Card>
        <Card>
          <Database className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{derived}</div>
          <div className="text-xs text-slate-500">cálculos derivados</div>
        </Card>
        <Card>
          <TriangleAlert className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white">{historical}</div>
          <div className="text-xs text-slate-500">indicadores históricos</div>
        </Card>
      </div>
      <div className="mt-4 rounded-3xl border border-amber-400/15 bg-amber-400/[0.04] p-5 light:border-amber-300/50 light:bg-amber-50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200 light:text-amber-700">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          Alertas de integridade
        </div>
        <div className="mt-3 space-y-2">
          {warnings.map(warning => <p key={warning} className="text-xs leading-5 text-slate-400 light:text-slate-600">{warning}</p>)}
        </div>
      </div>
      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Referência e atualização das fontes</div>
        <h3 className="mt-1 text-lg font-black text-white light:text-slate-900">Data da fonte, captura local e estado da camada</h3>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">A data da fonte é diferente da última captura local. Quando a captura não é registrada por esta camada, isso aparece explicitamente em vez de sugerir atualização em tempo real.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Eleitorado 2026', 'tse-eleitorado-2026'],
            ['Candidaturas', 'tse-candidatos-2026'],
            ['Pesquisas', 'tse-pesquisas-2026'],
            ['Orçamento', 'loa-2026'],
            ['Saúde / HEAL', 'healgo'],
            ['População', 'ibge-estimativas-2026'],
          ].map(([label, sourceId]) => {
            const source = d.sources.find(item => item.id === sourceId);
            const date = source?.referenceDate ?? source?.publishedAt;
            const localCapture = sourceId === 'tse-candidatos-2026' && generated.meta.downloadedAt ? formatDate(generated.meta.downloadedAt) : 'não registrada nesta camada';
            return (
              <a key={sourceId} href={source?.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-sky-300/20 light:border-slate-200 light:bg-white">
                <div className="text-xs font-bold text-slate-400">{label}</div>
                <div className="mt-2 text-sm font-black text-white light:text-slate-900">{date ? formatDate(date) : 'sem data registrada'}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-600">{source?.nature ?? 'fonte não encontrada'}</div>
                <div className="mt-2 text-[10px] font-semibold text-slate-500">Captura local: {localCapture}</div>
              </a>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Link2 className="h-4 w-4 text-sky-300" aria-hidden="true" /> Fontes</div>
          <div className="mt-2 text-2xl font-black text-white">{d.sources.length}</div>
          <p className="mt-1 text-xs text-slate-500">{officialSources} oficiais · {secondarySources} secundárias</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Última atualização do dataset</div>
          <div className="mt-2 text-2xl font-black text-white">{formatDate(d.meta.updatedAt)}</div>
          <p className="mt-1 text-xs text-slate-500">Verifique a ficha de cada fonte para o respectivo ano-base.</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Snapshot TSE</div>
          <div className={`mt-2 text-base font-black ${tseStatus.tone}`}>{tseStatus.label}</div>
          <p className="mt-1 text-xs text-slate-500">Estado local: {tseState}. Isso não representa ausência de candidaturas na fonte oficial.</p>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            {tseCapturedAt ? `captura ${tseCapturedAt.toLocaleDateString('pt-BR')} ${tseCapturedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'sem horário de captura'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Pipeline de resultados</div>
          <div className="mt-2 text-base font-black text-white">Integridade dos resultados</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">A ingestão verifica o arquivo oficial antes de publicá-lo. JSON/JWS, contexto municipal e assinatura são tratados separadamente; a prova criptográfica só aparece como verificada quando todos os arquivos passam.</p>
          {resultsSource?.url && <a href={resultsSource.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-300 hover:text-sky-200">Documentação técnica do TSE</a>}
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Simulado oficial TSE</div>
          <div className="mt-2 text-base font-black text-white">22–24/09 · 9h–12h e 14h–17h</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Validação técnica isolada da produção. O ambiente de simulado usa pleito 17801 e códigos próprios; nenhum dado simulado entra no feed oficial.</p>
          <a href={SIMULATION_CONTEXT.docsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-300 hover:text-sky-200">Ver documentação dos simulados TSE</a>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Regra editorial</div>
          <div className="mt-2 text-base font-black text-white">Sem ranking automático</div>
          <p className="mt-1 text-xs text-slate-500">Comparações documentais não são convertidas em recomendação eleitoral.</p>
        </Card>
      </div>
    </section>
  );
}
