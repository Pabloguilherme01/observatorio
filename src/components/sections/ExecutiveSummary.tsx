import { Activity, CalendarClock, CircleHelp, ExternalLink, Share2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';
import { useLanguageMode } from '../../context/LanguageModeContext';

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ExecutiveSummary() {
  const poll = d.polls[0];
  const groupedUnknown = (poll.nonePct ?? 0) + (poll.notSurePct ?? 0);
  const monthlyPerPerson = d.transport.routes.find(route => route.id === 'brasilia')!.fareBrl
    * d.transport.defaultTripsPerDay
    * d.transport.defaultWorkDaysPerMonth;
  const source = d.sources.find(sourceItem => sourceItem.id === 'tse-pesquisas-2026');
  
  const electorate = d.electoral;
  const [shareStatus, setShareStatus] = useState('');
  const { mode: languageMode } = useLanguageMode();

  const share = async () => {
    const text = languageMode === 'simple'
      ? [
        'Observatório Eleitoral Águas Lindas 2026',
        `Pesquisa de ${formatDate(poll.collectionDate)}: ${poll.nonePct?.toFixed(2).replace('.', ',')}% “Nenhum” e ${poll.notSurePct?.toFixed(2).replace('.', ',')}% “Não sabe/NR”.`,
        `Transporte: ${brl(monthlyPerPerson)} por pessoa/mês no cenário usado pelo Observatório.`,
      ].join(' ')
      : [
        'Observatório Eleitoral Águas Lindas 2026',
        `Pesquisa registrada em ${formatDate(poll.collectionDate)}: ${poll.nonePct?.toFixed(2).replace('.', ',')}% “Nenhum” e ${poll.notSurePct?.toFixed(2).replace('.', ',')}% “Não sabe/NR”.`,
        `Mobilidade: ${brl(monthlyPerPerson)} por pessoa/mês no cenário de 22 dias e 2 trechos/dia para Brasília.`,
      ].join(' ');

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
      }
    } catch {}
  };

  return (
    <section id="resumo" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="executive-summary-title">
      <div className="rounded-[28px] border border-sky-300/15 bg-sky-300/[0.035] p-4 shadow-[0_18px_70px_rgba(0,0,0,.16)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            titleId="executive-summary-title"
            eyebrow={languageMode === 'simple' ? 'Leia primeiro' : 'Resumo técnico'}
            title={languageMode === 'simple' ? 'O essencial em 1 minuto' : 'Resumo com rastreabilidade'}
            description={languageMode === 'simple'
              ? 'Número, data e fonte. O resto fica escondido até você pedir.'
              : 'Valor, data, metodologia e origem ficam visíveis para conferência.'}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="summary-mode-pill">{languageMode === 'simple' ? 'Leitura simples' : 'Camada técnica'}</span>
            <button type="button" onClick={share} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-bold text-slate-300 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-700" aria-label="Compartilhar resumo do observatório">
              <Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar
            </button>
            {shareStatus && <span className="text-[11px] font-semibold text-emerald-300" role="status" aria-live="polite">{shareStatus}</span>}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_.65fr]">
          <Card className="border-sky-300/15 bg-slate-950/20 light:bg-white">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Pesquisa registrada</div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 light:border-slate-200 light:bg-slate-50">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Nenhum</div>
                    <div className="mt-1 text-2xl font-black text-white light:text-slate-900">{poll.nonePct?.toFixed(2).replace('.', ',')}%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 light:border-slate-200 light:bg-slate-50">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Não sabe/NR</div>
                    <div className="mt-1 text-2xl font-black text-white light:text-slate-900">{poll.notSurePct?.toFixed(2).replace('.', ',')}%</div>
                  </div>
                </div>

                {languageMode === 'simple' ? (
                  <p className="simple-detail mt-3 max-w-2xl text-sm leading-6 text-slate-300 light:text-slate-600">
                    São respostas diferentes. Veja a fonte antes de comparar.
                  </p>
                ) : (
                  <p className="technical-detail mt-3 max-w-2xl text-sm leading-6 text-slate-300 light:text-slate-600">
                    Soma das duas categorias: <strong className="text-white light:text-slate-900">{groupedUnknown.toFixed(2).replace('.', ',')}%</strong>. Essa combinação não é uma categoria adicional da pesquisa e não deve ser lida como classificação de “indecisos”.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll.interviews} entrevistas</span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{formatDate(poll.collectionDate)}</span>
                  {languageMode === 'technical' && (
                    <>
                      <span className="technical-detail rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll.registrationNumber}</span>
                      <span className="technical-detail rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll.pollster}</span>
                      <span className="technical-detail rounded-full border border-amber-400/20 bg-amber-400/[0.04] px-2.5 py-1 text-amber-200 light:border-amber-300/50 light:bg-amber-50 light:text-amber-800">divulgação com cautela</span>
                    </>
                  )}
                </div>

                {source?.url && (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200">
                    {languageMode === 'simple' ? 'Conferir fonte oficial' : 'Ver catálogo oficial das pesquisas'} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado</div>
              <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.electorate.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-slate-500">
                {languageMode === 'simple'
                  ? 'eleitores'
                  : 'snapshot TSE · referência ' + electorate.snapshotDate.split('-').reverse().join('/')}
              </div>
            </Card>

            {languageMode === 'technical' && (
              <Card className="p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Mobilidade</div>
                <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{brl(monthlyPerPerson)}</div>
                <div className="text-xs text-slate-500">por pessoa/mês · cenário de referência</div>
              </Card>
            )}
          </div>
        </div>

        {languageMode === 'technical' && (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Card className="summary-evidence">
              <span>Como ler</span>
              <strong>Data + fonte</strong>
              <p className="mt-1">Use a data e a origem antes de comparar indicadores.</p>
            </Card>
            <Card className="summary-evidence">
              <span>Simulações</span>
              <strong>Cenário ≠ fato</strong>
              <p className="mt-1">Resultados calculados ficam separados dos dados observados.</p>
            </Card>
            <Card className="summary-evidence">
              <span>Atualização</span>
              <strong>{formatDate(d.meta.updatedAt)}</strong>
              <p className="mt-1">Cada indicador pode ter uma data de referência diferente.</p>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
