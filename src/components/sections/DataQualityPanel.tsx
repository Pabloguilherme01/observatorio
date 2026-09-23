import { CheckCircle2, Database, Link2, TriangleAlert } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';
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
  const tseReady = tseState !== 'not_synced';
  const tseCapturedAt = generated.meta.downloadedAt ? new Date(generated.meta.downloadedAt) : null;
  const resultsSource = d.sources.find(source => source.id === 'tse-resultados-2026');
  const warnings = [
    pollGapPct > 0 ? 'Pesquisa: ' + pollGapPct.toFixed(2).replace('.', ',') + ' p.p. estão fora das categorias publicadas.' : null,
    d.education?.note ? 'Educação: a faixa do Ideb 2025 está marcada como pendente de conferência pontual no INEP.' : null,
    'Orçamento: organizações, unidades e funções são níveis de classificação diferentes e não devem ser somados entre si.',
    'Saúde: 164, 85 e 298 leitos representam referências distintas; não são tratados como uma série contínua de capacidade instalada.',
    'Eleitoral 360°: estado do snapshot de candidaturas = ' + tseState + '; o frontend não interpreta um placeholder como ausência de candidatos.',
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
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
          <div className={`mt-2 text-base font-black ${tseReady ? 'text-emerald-300' : 'text-amber-300'}`}>{tseReady ? 'Sincronizado' : 'Aguardando captura'}</div>
          <p className="mt-1 text-xs text-slate-500">Estado local: {tseState}. Isso não representa ausência de candidaturas na fonte oficial.</p>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            {tseCapturedAt ? `captura ${tseCapturedAt.toLocaleDateString('pt-BR')} ${tseCapturedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'sem horário de captura'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Apuração 2026</div>
          <div className="mt-2 text-base font-black text-white">Fonte oficial preparada</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">A integração de totalização ao vivo permanece separada do snapshot local e deve usar a distribuição oficial do TSE.</p>
          {resultsSource?.url && <a href={resultsSource.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-300 hover:text-sky-200">Documentação técnica do TSE</a>}
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
