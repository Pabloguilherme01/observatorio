import { ArrowRight, Share2, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { copyText } from '../../lib/clipboard';
import { navigateToCleanSection } from '../../lib/sectionNavigation';
import '../../assets/styles/summary-polish.css';

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusLabel(status?: string) {
  if (status === 'derived') return 'Derivado';
  if (status === 'current') return 'Atual';
  if (status === 'snapshot') return 'Recorte';
  if (status === 'historical') return 'Histórico';
  if (status === 'planned') return 'Planejado';
  return 'Fonte pública';
}

export function ExecutiveSummary() {
  
  const electorate = d.electoral;
  const populationPoint = [...d.populationSeries]
    .filter(point => point.kind === 'estimate')
    .sort((a, b) => b.year - a.year)[0] ?? d.populationSeries[d.populationSeries.length - 1];
  const population = populationPoint?.value ?? 0;
  const populationIndicator = populationPoint
    ? d.indicators.find(item => item.id === `population-${populationPoint.year}`)
    : undefined;
  const populationSource = d.sources.find(sourceItem => sourceItem.id === (populationIndicator?.sourceId ?? populationPoint?.sourceId));
  const sanitationPct = d.sanitation.publicSewerServicePct;
  const sanitationIndicator = d.indicators
    .filter(item => item.id.startsWith('public-sewer-service-') && item.sourceId === d.sanitation.sourceId)
    .sort((a, b) => (b.referenceDate ?? '').localeCompare(a.referenceDate ?? ''))[0];
  const sanitationSource = d.sources.find(sourceItem => sourceItem.id === (sanitationIndicator?.sourceId ?? d.sanitation.sourceId));
  const budget = d.budget.totalBrl;
  const budgetPerCapitaIndicator = d.indicators.find(item => item.id === `budget-per-capita-${d.budget.year}`);
  const budgetPerCapita = Number(budgetPerCapitaIndicator?.value ?? (population > 0 ? budget / population : 0));
  const budgetSource = d.sources.find(sourceItem => sourceItem.id === d.budget.sourceId);
  const [shareStatus, setShareStatus] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [activeTopic, setActiveTopic] = useState('eleitoral');
  const { mode: languageMode } = useLanguageMode();

  const goToSection = (id: string) => {
    navigateToCleanSection(id);
  };

  const publicFacts = [
    {
      id: 'populacao',
      label: 'População estimada',
      value: population.toLocaleString('pt-BR') + ' hab.',
      note: populationIndicator?.note ?? 'Estimativa populacional; confira a data de referência antes de comparar com censos.',
      source: populationSource?.label ?? 'IBGE',
      badge: statusLabel(populationIndicator?.status),
      status: populationIndicator?.status ?? 'current',
      referenceDate: populationIndicator?.referenceDate ?? populationPoint?.referenceDate,
      target: 'dashboard',
    },
    {
      id: 'eleitorado',
      label: 'Eleitorado',
      value: electorate.electorate.toLocaleString('pt-BR') + ' eleitores',
      note: 'Registro do eleitorado no recorte indicado; não representa comparecimento nem população total.',
      source: d.sources.find(sourceItem => sourceItem.id === electorate.sourceId)?.label ?? 'TSE',
      badge: 'Recorte',
      status: 'snapshot',
      referenceDate: electorate.snapshotDate,
      target: 'eleitorado',
    },
    {
      id: 'orcamento-per-capita',
      label: 'Orçamento planejado por habitante',
      value: brl(budgetPerCapita) + '/ano',
      note: budgetPerCapitaIndicator?.note ?? 'Razão de planejamento; não representa gasto executado por pessoa.',
      source: d.sources.find(sourceItem => sourceItem.id === budgetPerCapitaIndicator?.sourceId)?.label ?? budgetSource?.label ?? 'LOA municipal',
      badge: statusLabel(budgetPerCapitaIndicator?.status),
      status: budgetPerCapitaIndicator?.status ?? 'derived',
      referenceDate: budgetPerCapitaIndicator?.referenceDate ?? budgetSource?.referenceDate,
      target: 'orcamento',
    },
    {
      id: 'saneamento',
      label: 'Atendimento de esgoto · serviço público',
      value: sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%',
      note: sanitationIndicator?.note ?? 'Cobertura do serviço público; não representa automaticamente coleta ou tratamento.',
      source: sanitationSource?.label ?? 'Fonte de saneamento',
      badge: statusLabel(sanitationIndicator?.status),
      status: sanitationIndicator?.status ?? 'historical',
      referenceDate: sanitationIndicator?.referenceDate,
      target: 'saude',
    },
  ] as const;

  const topics = [
    { id: 'eleitoral', label: 'Eleitoral', target: 'eleitoral360', caption: 'eleitorado, participação e candidaturas' },
    { id: 'cidade', label: 'Cidade', target: 'dashboard', caption: 'população e indicadores municipais' },
    { id: 'servicos', label: 'Serviços públicos', target: 'acao', caption: 'saúde, saneamento e canais oficiais' },
    { id: 'recursos', label: 'Orçamento', target: 'orcamento', caption: 'planejamento, funções e alterações' },
  ] as const;

  const openTopic = (topic: typeof topics[number]) => {
    setActiveTopic(topic.id);
    goToSection(topic.target);
  };


  const share = async () => {
    if (shareBusy) return;
    setShareBusy(true);
    const text = [
      d.meta.name,
      `Eleitorado: ${electorate.electorate.toLocaleString('pt-BR')} eleitores.`,
      `População estimada: ${population.toLocaleString('pt-BR')} habitantes${populationPoint?.referenceDate ? ` (referência ${formatDate(populationPoint.referenceDate)})` : ''}.`,
      `Orçamento LOA ${d.budget.year}: ${brl(budget)}${budgetSource?.referenceDate ? ` (referência ${formatDate(budgetSource.referenceDate)})` : ''}.`,
      `Serviço público de esgoto: ${sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%.`,
      `Orçamento por habitante: ${brl(budgetPerCapita)} por ano${budgetPerCapitaIndicator?.referenceDate ? ` (referência ${formatDate(budgetPerCapitaIndicator.referenceDate)})` : ''}.`,
    ].filter(Boolean).join(' ');

    try {
      if (navigator.share) {
        await navigator.share({ title: d.meta.name, text, url: window.location.href });
        setShareStatus('Compartilhado');
        window.setTimeout(() => setShareStatus(''), 1800);
        return;
      }
      const copied = await copyText(text + ' ' + window.location.href);
      setShareStatus(copied ? 'Link copiado' : 'Não foi possível copiar automaticamente');
      window.setTimeout(() => setShareStatus(''), copied ? 1800 : 2400);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareStatus('Não foi possível compartilhar');
      window.setTimeout(() => setShareStatus(''), 2400);
    } finally {
      setShareBusy(false);
    }
  };

  return (
    <section id="resumo" className={'executive-summary executive-summary--' + languageMode + ' mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10'} aria-labelledby="executive-summary-title">
      <div className="summary-shell rounded-[28px] border border-sky-300/15 bg-sky-300/[0.035] p-4 shadow-[0_18px_70px_rgba(0,0,0,.16)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            titleId="executive-summary-title"
            eyebrow={languageMode === 'technical' ? 'Fontes e detalhes' : languageMode === 'summary' ? 'Resumo principal' : 'Entenda os números'}
            title={languageMode === 'technical' ? 'Dados preparados para conferência' : languageMode === 'summary' ? 'O essencial da cidade em quatro indicadores' : 'Entenda o que cada número representa'}
            description={languageMode === 'technical'
              ? 'Cada indicador vem acompanhado de referência, origem e limites para uma leitura verificável.'
              : languageMode === 'summary'
                ? 'Uma leitura rápida dos principais dados públicos, com referência e origem preservadas para consulta.'
                : 'Cada cartão explica o valor, a natureza do dado e o cuidado necessário antes de comparar períodos ou fontes.'}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="summary-mode-pill">{languageMode === 'technical' ? 'Detalhado' : languageMode === 'summary' ? 'Resumo' : 'Explicado'}</span>
            <button type="button" onClick={() => { void share(); }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-bold text-slate-300 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-700" aria-label="Compartilhar resumo do observatório" disabled={shareBusy} aria-busy={shareBusy}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> {shareBusy ? 'Compartilhando…' : 'Compartilhar'}
            </button>
            {shareStatus && <span className="text-[11px] font-semibold text-emerald-300" role="status" aria-live="polite">{shareStatus}</span>}
          </div>
        </div>

        <div className="summary-mode-content grid gap-3">
          {languageMode === 'summary' && (
            <div className="summary-public-hero">
              <div className="summary-public-copy">
                <span className="summary-public-kicker"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Visão rápida</span>
                <h3>Quatro números para começar</h3>
                <p className="summary-public-lead">População, eleitorado, orçamento planejado e saneamento resumem áreas diferentes da cidade. Data, natureza e fonte permanecem visíveis para evitar comparações indevidas.</p>
                <div className="summary-public-topics" aria-label="Explorar por assunto">
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      type="button"
                      className={`summary-public-topic ${activeTopic === topic.id ? 'is-active' : ''}`}
                      aria-pressed={activeTopic === topic.id}
                      onClick={() => openTopic(topic)}
                    >
                      <strong>{topic.label}</strong>
                      <span>{topic.caption}</span>
                    </button>
                  ))}
                </div>
                <div className="summary-public-actions" aria-label="Ações rápidas do resumo">
                  <button type="button" onClick={() => { goToSection('descubra'); }} className="summary-public-action">
                    <Zap className="h-3.5 w-3.5" aria-hidden="true" /> Explorar assuntos
                  </button>
                  <button type="button" onClick={() => { goToSection('eleitoral360'); }} className="summary-public-action">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> Explorar recorte eleitoral
                  </button>
                </div>
              </div>
              <div className="summary-public-discovery-head">
                <span>Indicadores em destaque</span>
                <small>Valor, referência e origem em cada cartão</small>
              </div>

              <div className="summary-public-facts" aria-label="Cartões de contexto rápido">
                {publicFacts.map(fact => (
                  <button key={fact.id} type="button" className="summary-public-fact is-static text-left" onClick={() => goToSection(fact.target)} aria-label={`Abrir contexto de ${fact.label}`}>
                    <span className="block">{fact.label}</span>
                    <strong className="mt-1 block mobile-safe-wrap">{fact.value}</strong>
                    <div className="dashboard-card-meta mt-2">
                      <span className="dashboard-meta-chip" data-kind={fact.status}>{fact.badge}</span>
                      {fact.referenceDate && <span className="dashboard-meta-chip">ref. {formatDate(fact.referenceDate)}</span>}
                    </div>
                    <span className="summary-public-source">{fact.source}</span>
                    <em className="summary-public-note">{fact.note}</em>
                    <ArrowRight className="summary-public-arrow mt-2 h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {languageMode === 'simple' && (
          <>
            <div className="summary-simple-grid mt-3" aria-label="Resumo dos principais indicadores">
              {publicFacts.map(fact => (
                <button key={fact.id} type="button" className="summary-simple-card" onClick={() => goToSection(fact.target)}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                  <div className="dashboard-card-meta">
                    <span className="dashboard-meta-chip" data-kind={fact.status}>{fact.badge}</span>
                    {fact.referenceDate && <span className="dashboard-meta-chip">ref. {formatDate(fact.referenceDate)}</span>}
                  </div>
                  <em>{fact.note}</em>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="summary-simple-tip mt-3">
              <strong className="text-slate-200">Leitura guiada</strong>
              <span className="ml-2">Comece pelo valor, confira a data e veja se ele é atual, histórico, planejado ou derivado. Abra a fonte quando precisar verificar definição e escopo.</span>
            </div>
          </>
        )}

        {languageMode === 'technical' && (
          <div className="summary-technical-wrap mt-3">
            <div className="summary-technical-kpis" aria-label="Indicadores com rastreabilidade">
              {publicFacts.map(fact => (
                <button
                  key={fact.id}
                  type="button"
                  className="summary-technical-kpi"
                  onClick={() => goToSection(fact.target)}
                  aria-label={`Abrir a seção de ${fact.label}`}
                >
                  <span className="summary-technical-kpi-label">{fact.label}</span>
                  <strong>{fact.value}</strong>
                  <div className="dashboard-card-meta">
                    <span className="dashboard-meta-chip" data-kind={fact.status}>{fact.badge}</span>
                    {fact.referenceDate && <span className="dashboard-meta-chip">ref. {formatDate(fact.referenceDate)}</span>}
                  </div>
                  <span className="summary-technical-kpi-source">{fact.source}</span>
                  <span className="summary-technical-kpi-note">{fact.note}</span>
                  <span className="summary-technical-kpi-cta"><ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> Conferir contexto</span>
                </button>
              ))}
            </div>

            <div className="summary-technical-audit" aria-label="Cuidados para interpretar os dados">
              <Card className="summary-evidence">
                <span>Regra de leitura</span>
                <strong>Valor + data + fonte</strong>
                <p>Antes de comparar, confira escopo, período e referência de cada indicador.</p>
              </Card>
              <Card className="summary-evidence">
                <span>Limites</span>
                <strong>Estimativa não é medição</strong>
                <p>Estimativas, simulações e cálculos derivados permanecem identificados para evitar comparações indevidas.</p>
              </Card>
              <Card className="summary-evidence">
                <span>Atualização</span>
                <strong>{formatDate(d.meta.updatedAt)}</strong>
                <p>A data do painel não substitui a data específica de cada indicador.</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
