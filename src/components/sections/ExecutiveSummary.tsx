import { Activity, ArrowRight, ExternalLink, Share2, Sparkles, Zap, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { electoral360Snapshot } from '../../data/electoral360';

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ExecutiveSummary() {
  const poll = d.polls[0];
  const groupedUnknown = (poll?.nonePct ?? 0) + (poll?.notSurePct ?? 0);
  const source = d.sources.find(sourceItem => sourceItem.id === 'tse-pesquisas-2026');
  const hasPoll = Boolean(poll);
  
  const electorate = d.electoral;
  const populationPoint = d.populationSeries.find(point => point.year === 2026);
  const population = populationPoint?.value ?? 0;
  const sanitationPct = d.sanitation.publicSewerServicePct;
  const sanitationSource = d.sources.find(sourceItem => sourceItem.id === d.sanitation.sourceId);
  const budget = d.budget.totalBrl;
  const budgetSource = d.sources.find(sourceItem => sourceItem.id === d.budget.sourceId);
  const [shareStatus, setShareStatus] = useState('');
  const [openFact, setOpenFact] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [activeTopic, setActiveTopic] = useState('eleitoral');
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [showMoreSummary, setShowMoreSummary] = useState(false);
  const { mode: languageMode } = useLanguageMode();

  const goToSection = (id: string) => {
    window.history.replaceState(null, '', '#' + id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  };

  const publicFacts = [
    { id: 'eleitorado', label: 'Quem participa', value: electorate.electorate.toLocaleString('pt-BR'), note: 'eleitores no snapshot utilizado pelo observatório.', target: 'eleitorado' },
    { id: 'populacao', label: 'Tamanho da cidade', value: population.toLocaleString('pt-BR'), note: 'habitantes na estimativa de 2026.', target: 'dashboard' },
    { id: 'orcamento', label: 'Orçamento municipal', value: brl(budget), note: 'valor total da LOA 2026 registrada no dataset.', target: 'orcamento' },
    { id: 'candidatos', label: 'Nomes acompanhados', value: electoral360Snapshot.matchedCandidates.length.toLocaleString('pt-BR'), note: 'nomes do recorte eleitoral acompanhado em Águas Lindas.', target: 'eleitoral360' },
  ] as const;

  const quickStats = [
    { label: 'Eleitorado', value: electorate.electorate.toLocaleString('pt-BR'), caption: 'eleitores', detail: languageMode === 'technical' ? 'snapshot TSE · ' + electorate.snapshotDate.split('-').reverse().join('/') : `${electorate.turnout2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% participaram em 2024`, target: 'eleitoral360' },
    { label: 'População', value: population.toLocaleString('pt-BR'), caption: 'habitantes', detail: languageMode === 'technical' ? `estimativa · ${populationPoint?.referenceDate ? formatDate(populationPoint.referenceDate) : 'data não informada'}` : 'estimativa 2026', target: 'dashboard' },
    { label: 'Orçamento', value: brl(budget), caption: 'LOA 2026', detail: languageMode === 'technical' ? (budgetSource?.label ?? 'lei orçamentária') : 'orçamento municipal', target: 'orcamento' },
    { label: 'Esgoto', value: sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', caption: 'serviço público', detail: languageMode === 'technical' ? (sanitationSource?.label ?? 'fonte de saneamento') : 'indicador de saneamento', target: 'dashboard' },
  ] as const;

  const topics = [
    { id: 'eleitoral', label: 'Eleição', target: 'eleitoral360', caption: 'eleitorado, participação e candidaturas' },
    { id: 'cidade', label: 'Cidade', target: 'dashboard', caption: 'população e indicadores' },
    { id: 'servicos', label: 'Serviços', target: 'dashboard', caption: 'saneamento e indicadores' },
    { id: 'recursos', label: 'Recursos', target: 'orcamento', caption: 'orçamento e atualizações' },
  ] as const;

  const revealFact = (id: string, label: string) => {
    const index = publicFacts.findIndex(fact => fact.id === id);
    if (index >= 0) setDiscoveryIndex(index);
    setOpenFact(current => current === id ? null : id);
  };

  const focusNextDiscovery = () => {
    const nextIndex = (discoveryIndex + 1) % publicFacts.length;
    const next = publicFacts[nextIndex];
    setDiscoveryIndex(nextIndex);
    revealFact(next.id, next.label);
  };

  const openTopic = (topic: typeof topics[number]) => {
    setActiveTopic(topic.id);
    setOpenFact(null);
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
      `Nomes acompanhados em Águas Lindas: ${electoral360Snapshot.matchedCandidates.length}.`,
      poll ? `Pesquisa registrada em ${formatDate(poll.collectionDate)}: ${poll.nonePct?.toFixed(2).replace('.', ',') ?? '—'}% “Nenhum” e ${poll.notSurePct?.toFixed(2).replace('.', ',') ?? '—'}% “Não sabe/NR”.` : '',
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
    <section id="resumo" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="executive-summary-title">
      <div className="rounded-[28px] border border-sky-300/15 bg-sky-300/[0.035] p-4 shadow-[0_18px_70px_rgba(0,0,0,.16)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            titleId="executive-summary-title"
            eyebrow={languageMode === 'technical' ? 'Resumo técnico' : languageMode === 'summary' ? 'Resumo' : 'Leia primeiro'}
            title={languageMode === 'technical' ? 'Resumo com rastreabilidade' : languageMode === 'summary' ? 'O essencial agora' : 'O essencial em 1 minuto'}
            description={languageMode === 'technical'
              ? 'Veja valor, data, fonte, método e contexto para conferir o dado.'
              : languageMode === 'summary'
                ? 'Poucos dados para entender rapidamente o cenário, com data e fonte preservadas.'
                : 'Veja o número principal, quando ele foi medido e de onde veio.'}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="summary-mode-pill">{languageMode === 'technical' ? 'Camada técnica' : languageMode === 'summary' ? 'Visão rápida' : 'Leitura simples'}</span>
            <button type="button" onClick={() => { void share(); }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-bold text-slate-300 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-700" aria-label="Compartilhar resumo do observatório" disabled={shareBusy} aria-busy={shareBusy}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> {shareBusy ? 'Compartilhando…' : 'Compartilhar'}
            </button>
            {shareStatus && <span className="text-[11px] font-semibold text-emerald-300" role="status" aria-live="polite">{shareStatus}</span>}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_.65fr]">
          {languageMode === 'summary' && (
            <div className="summary-public-hero">
              <div className="summary-public-copy">
                <span className="summary-public-kicker"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Águas Lindas em foco</span>
                <h3>Veja o essencial. Abra o detalhe quando precisar.</h3>
                <p className="summary-public-lead">Números principais, contexto sob demanda e fonte sempre acessível. Sem ranking de candidatos.</p>
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
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> Ver recorte eleitoral
                  </button>
                </div>
              </div>
              <div className="summary-public-discovery-head">
                <div>
                  <strong>4 dados para começar</strong>
                  <span>Toque para ver a origem ou abrir o contexto completo.</span>
                </div>
                <button type="button" className="summary-public-mini-action" onClick={focusNextDiscovery}>Próximo <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>
              </div>

              <div className="summary-public-facts" aria-label="Descobertas rápidas">
                {publicFacts.map(fact => (
                  <div key={fact.id} className={`summary-public-fact ${openFact === fact.id ? 'is-open' : ''}`}>
                    <button type="button" aria-expanded={openFact === fact.id} aria-controls={`summary-fact-${fact.id}`} onClick={() => revealFact(fact.id, fact.label)}>
                      <span>{fact.label}</span>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {openFact === fact.id && (
                      <div id={`summary-fact-${fact.id}`} className="summary-public-fact-body">
                        <strong>{fact.value}</strong>
                        <p>{fact.note}</p>
                        <button type="button" onClick={() => goToSection(fact.target)}>Abrir contexto <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="summary-more-toggle"
                aria-expanded={showMoreSummary}
                onClick={() => setShowMoreSummary(current => !current)}
              >
                {showMoreSummary ? 'Menos indicadores' : 'Mais indicadores'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMoreSummary ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {showMoreSummary && (
                <div className="summary-public-grid" aria-label="Indicadores adicionais do observatório">
                  {quickStats.slice(0, 4).map(stat => (
                    <button
                      key={stat.label}
                      type="button"
                      className="summary-public-stat summary-public-stat-main"
                      aria-label={`Ver contexto de ${stat.label}`}
                      onClick={() => goToSection(stat.target)}
                    >
                      <span>{stat.label}</span>
                      <strong className="mobile-safe-wrap">{stat.value}</strong>
                      <small>{stat.caption}</small>
                      <em>{stat.detail}</em>
                      <ArrowRight className="summary-public-arrow h-4 w-4" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {languageMode !== 'summary' && <Card className="border-sky-300/15 bg-slate-950/20 light:bg-white">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{hasPoll ? "Pesquisa registrada" : "Pesquisas"}</div>
                {!hasPoll && <p className="mt-3 text-sm text-slate-400">Nenhuma pesquisa está disponível neste snapshot.</p>}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 light:border-slate-200 light:bg-slate-50">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Nenhum</div>
                    <div className="mt-1 text-2xl font-black text-white light:text-slate-900">{poll?.nonePct?.toFixed(2).replace('.', ',') ?? '—'}%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 light:border-slate-200 light:bg-slate-50">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Não sabe/NR</div>
                    <div className="mt-1 text-2xl font-black text-white light:text-slate-900">{poll?.notSurePct?.toFixed(2).replace('.', ',') ?? '—'}%</div>
                  </div>
                </div>

                {languageMode === 'technical' ? (
                  <p className="technical-detail mt-3 max-w-2xl text-sm leading-6 text-slate-300 light:text-slate-600">
                    Soma das duas categorias: <strong className="text-white light:text-slate-900">{groupedUnknown.toFixed(2).replace('.', ',')}%</strong>. Essa combinação não é uma categoria adicional da pesquisa e não deve ser lida como classificação de “indecisos”.
                  </p>
                ) : (
                  <p className="simple-detail mt-3 max-w-2xl text-sm leading-6 text-slate-300 light:text-slate-600">
                    A pesquisa separa essas respostas. Aqui, cada percentual é mostrado como foi registrado.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                  {poll && <>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll.interviews} entrevistas</span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{formatDate(poll.collectionDate)}</span>
                  </>}
                  {languageMode === 'technical' && (
                    <>
                      <span className="technical-detail rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll?.registrationNumber ?? 'Registro não disponível'}</span>
                      <span className="technical-detail rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll?.pollster ?? 'Instituto não informado'}</span>
                      <span className="technical-detail rounded-full border border-amber-400/20 bg-amber-400/[0.04] px-2.5 py-1 text-amber-200 light:border-amber-300/50 light:bg-amber-50 light:text-amber-800">divulgação com cautela</span>
                    </>
                  )}
                </div>

                {source?.url && (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200">
                    {languageMode === 'technical' ? 'Ver catálogo oficial das pesquisas' : 'Conferir fonte oficial'} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </Card>}

          {languageMode !== 'summary' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado</div>
              <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.electorate.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-slate-500">
                {languageMode === 'technical'
                  ? 'snapshot TSE · referência ' + electorate.snapshotDate.split('-').reverse().join('/')
                  : 'eleitores · snapshot TSE'}
              </div>
              {languageMode !== 'technical' && <button type="button" onClick={() => goToSection('eleitorado')} className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-xs font-extrabold text-sky-300">Ver contexto <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>}
            </Card>

          </div>}
        </div>

        {languageMode === 'simple' && (
          <>
            <div className="summary-simple-grid mt-3" aria-label="Resumo dos principais indicadores">
              {quickStats.map(stat => (
                <button key={stat.label} type="button" className="summary-simple-card" onClick={() => goToSection(stat.target)}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small>{stat.caption}</small>
                  <em>{stat.detail}</em>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="summary-simple-tip mt-3">
              <strong className="text-slate-200">Leitura simples</strong>
              <span className="ml-2">Número primeiro; fonte e contexto ficam a um toque.</span>
            </div>
          </>
        )}
            <strong className="text-slate-200">Leitura simples</strong>
            <span className="ml-2">Número primeiro; fonte e contexto quando você abrir.</span>
          </div>
        )}

        {languageMode === 'technical' && (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Card className="summary-evidence">
              <span>Leitura</span>
              <strong>Valor + data + fonte</strong>
              <p className="mt-1">Compare indicadores somente depois de conferir escopo e referência.</p>
            </Card>
            <Card className="summary-evidence">
              <span>Limites</span>
              <strong>Cenário não é fato</strong>
              <p className="mt-1">Simulações e estimativas ficam separadas dos valores observados.</p>
            </Card>
            <Card className="summary-evidence">
              <span>Atualização</span>
              <strong>{formatDate(d.meta.updatedAt)}</strong>
              <p className="mt-1">Cada indicador pode ter sua própria data de referência.</p>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
