import { ArrowRight, Share2, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';
import { useLanguageMode } from '../../context/LanguageModeContext';
import '../../assets/styles/summary-polish.css';

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ExecutiveSummary() {
  
  const electorate = d.electoral;
  const populationPoint = d.populationSeries.find(point => point.year === 2026);
  const population = populationPoint?.value ?? 0;
  const sanitationPct = d.sanitation.publicSewerServicePct;
  const sanitationSource = d.sources.find(sourceItem => sourceItem.id === d.sanitation.sourceId);
  const budget = d.budget.totalBrl;
  const budgetPerCapita = population > 0 ? budget / population : 0;
  const budgetSource = d.sources.find(sourceItem => sourceItem.id === d.budget.sourceId);
  const [shareStatus, setShareStatus] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [activeTopic, setActiveTopic] = useState('eleitoral');
  const { mode: languageMode } = useLanguageMode();

  const goToSection = (id: string) => {
    window.history.replaceState(null, '', '#' + id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  };

  const publicFacts = [
    { id: 'populacao', label: 'População', value: population.toLocaleString('pt-BR') + ' hab.', note: 'Estimativa IBGE · referência ' + (populationPoint?.referenceDate ? formatDate(populationPoint.referenceDate) : '2026'), source: 'IBGE · estimativa 2026', badge: 'Fonte pública', target: 'dashboard' },
    { id: 'eleitorado', label: 'Eleitorado', value: electorate.electorate.toLocaleString('pt-BR') + ' eleitores', note: 'Snapshot TSE · referência ' + electorate.snapshotDate.split('-').reverse().join('/'), source: 'TSE · snapshot 2026', badge: 'Fonte pública', target: 'eleitorado' },
    { id: 'orcamento-per-capita', label: 'Orçamento planejado por habitante', value: brl(budgetPerCapita) + '/ano', note: 'LOA 2026 · razão de planejamento, não gasto realizado.', source: 'Cálculo · LOA 2026 ÷ IBGE 2026', badge: 'Derivado', target: 'orcamento' },
    { id: 'saneamento', label: 'Atendimento de esgoto', value: sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', note: 'SINISA 2024 · cobertura do serviço público; não representa coleta ou tratamento.', source: sanitationSource?.label ?? 'Fonte de saneamento', badge: 'Fonte pública', target: 'saude' },
  ] as const;

  const topics = [
    { id: 'eleitoral', label: 'Eleição', target: 'eleitoral360', caption: 'eleitorado, participação e candidaturas' },
    { id: 'cidade', label: 'Cidade', target: 'dashboard', caption: 'população e indicadores' },
    { id: 'servicos', label: 'Serviços', target: 'acao', caption: 'saúde, saneamento e canais públicos' },
    { id: 'recursos', label: 'Recursos', target: 'orcamento', caption: 'orçamento e atualizações' },
  ] as const;

  const openTopic = (topic: typeof topics[number]) => {
    setActiveTopic(topic.id);
    goToSection(topic.target);
  };


  const share = async () => {
    if (shareBusy) return;
    setShareBusy(true);
    const text = [
      'Observatório Eleitoral — Águas Lindas de Goiás 2026',
      `Eleitorado: ${electorate.electorate.toLocaleString('pt-BR')} eleitores.`,
      `População estimada: ${population.toLocaleString('pt-BR')} habitantes${populationPoint?.referenceDate ? ` (referência ${formatDate(populationPoint.referenceDate)})` : ''}.`,
      `Orçamento LOA 2026: ${brl(budget)}${budgetSource?.referenceDate ? ` (referência ${formatDate(budgetSource.referenceDate)})` : ''}.`,
      `Serviço público de esgoto: ${sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%.`,
      `Orçamento por habitante: ${brl(budgetPerCapita)} por ano (LOA 2026 ÷ população estimada).`,
    ].filter(Boolean).join(' ');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Observatório Eleitoral — Águas Lindas 2026', text, url: window.location.href });
        setShareStatus('Compartilhado');
        window.setTimeout(() => setShareStatus(''), 1800);
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text + ' ' + window.location.href);
        setShareStatus('Link copiado');
        window.setTimeout(() => setShareStatus(''), 1800);
        return;
      }
      setShareStatus('Compartilhamento indisponível neste navegador');
      window.setTimeout(() => setShareStatus(''), 2400);
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
            eyebrow={languageMode === 'technical' ? 'Resumo técnico' : languageMode === 'summary' ? 'Resumo' : 'Leia primeiro'}
            title={languageMode === 'technical' ? 'Visão essencial com evidências' : languageMode === 'summary' ? 'O que merece sua atenção agora' : 'Entenda o cenário em poucos minutos'}
            description={languageMode === 'technical'
              ? 'Cada indicador vem acompanhado de referência, origem e limites para uma leitura verificável.'
              : languageMode === 'summary'
                ? 'Uma visão enxuta para captar o cenário. Quando algo chamar sua atenção, o contexto está a um toque.'
                : 'Indicadores organizados para transformar números dispersos em uma leitura clara e contextualizada.'}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="summary-mode-pill">{languageMode === 'technical' ? 'Rastreável' : languageMode === 'summary' ? 'Visão rápida' : 'Leitura simples'}</span>
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
                <h3>Quatro sinais para começar</h3>
                <p className="summary-public-lead">Uma leitura rápida dos principais indicadores, com referência e fonte sempre ao alcance.</p>
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
                <small>Fonte e referência em cada cartão</small>
              </div>

              <div className="summary-public-facts" aria-label="Cartões de contexto rápido">
                {publicFacts.map(fact => (
                  <button key={fact.id} type="button" className="summary-public-fact is-static text-left" onClick={() => goToSection(fact.target)} aria-label={`Abrir contexto de ${fact.label}`}>
                    <span className="block">{fact.label}</span>
                    <strong className="mt-1 block mobile-safe-wrap">{fact.value}</strong>
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
                  <small>{fact.badge}</small>
                  <em>{fact.note}</em>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="summary-simple-tip mt-3">
              <strong className="text-slate-200">Leitura simples</strong>
              <span className="ml-2">Comece pelo indicador e avance para fonte e contexto quando quiser compreender melhor.</span>
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
                  <span className="summary-technical-kpi-source">{fact.source}</span>
                  <span className="summary-technical-kpi-note">{fact.note}</span>
                  <span className="summary-technical-kpi-cta"><ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> Conferir contexto</span>
                </button>
              ))}
            </div>

            <div className="summary-technical-audit" aria-label="Regras de leitura técnica">
              <Card className="summary-evidence">
                <span>Leitura</span>
                <strong>Valor + data + fonte</strong>
                <p>Compare com segurança: confira escopo, período e referência de cada indicador.</p>
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
