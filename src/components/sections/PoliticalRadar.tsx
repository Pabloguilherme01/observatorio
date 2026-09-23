import { useEffect, useState } from 'react';
import { AlertTriangle, FileSearch, ShieldCheck } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SectionHeader } from '../ui/SectionHeader';

const RADAR_STORAGE_KEY = 'observatorio-political-radar-selection-v37';

export function PoliticalRadar() {
  const poll = d.polls[0];
  const candidateOptions = [...new Set(poll.results.map(result => result.label))];

  const [selectedCandidate, setSelectedCandidate] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = window.localStorage.getItem(RADAR_STORAGE_KEY);
      return stored && candidateOptions.includes(stored) ? stored : '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (!selectedCandidate) return;
    try {
      window.localStorage.setItem(RADAR_STORAGE_KEY, selectedCandidate);
    } catch {
      // Storage unavailable; UI remains fully functional.
    }
  }, [selectedCandidate]);

  const selectedResult = poll.results.find(result => result.label === selectedCandidate);

  return <section id="politica" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="politica-title">
    <SectionHeader titleId="politica-title" eyebrow="Eleições 2026" title="Pesquisa, contas e integridade em um mesmo radar" description="As informações políticas são apresentadas como registros e comparações documentais; o componente não produz recomendação eleitoral." />
    <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Pesquisa registrada</div>
            <h3 className="mt-2 text-xl font-black text-white">{poll.pollster}</h3>
            <p className="mt-1 text-xs text-slate-500">{poll.collectionDate} · {poll.interviews} entrevistas · pesquisa {poll.method === 'spontaneous' ? 'espontânea' : poll.method}</p>
          </div>
          <Badge tone="warning">Registro: {poll.registrationNumber}</Badge>
        </div>

        <div className="mt-5 grid gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Foco do radar
            <select
              className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-sky-300/40 sm:min-w-[220px]"
              value={selectedCandidate}
              onChange={event => setSelectedCandidate(event.target.value)}
              aria-label="Selecionar nome da pesquisa para destacar no radar"
            >
              <option value="">Nenhum foco selecionado</option>
              {candidateOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="rounded-xl border border-sky-400/10 bg-sky-400/[0.03] px-4 py-3 text-right">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500">{selectedCandidate ? 'Valor destacado' : 'Foco neutro'}</span>
            <strong className="text-lg font-black text-sky-300">{selectedResult ? selectedResult.percentage.toFixed(2).replace('.', ',') + '%' : 'Selecione um nome'}</strong>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-xs text-slate-500">Contratante: <strong className="text-slate-300">{poll.contractor ?? 'não informado'}</strong><br />Margem exibida abaixo: cálculo teórico para a amostra, não margem oficial declarada.</div>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300">Recorte temporal:</strong> este painel contém um único snapshot de pesquisa, com coleta em {poll.collectionDate}. Não há série temporal suficiente neste conjunto para afirmar tendência de alta ou queda entre pesquisas.
        </div>

        <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4 text-xs leading-5 text-slate-400">
          <strong className="text-amber-200">Situação da divulgação:</strong> há decisão judicial datada de 17/09/2026, com reprodução pública localizada em 20/09/2026, sobre publicações que reproduziram esta pesquisa. O texto público localizado confirma a indisponibilização de publicações específicas e admite nova divulgação desde que as informações exigidas sejam apresentadas de forma clara e legível. Este cartão trata os percentuais como <strong className="text-slate-200">snapshot histórico</strong>, não como atualização de setembro.
          <a href="https://www.jusbrasil.com.br/jurisprudencia/tre-go/7355108574/inteiro-teor-7355108583" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex font-bold text-sky-300 hover:text-sky-200">Ver inteiro teor reproduzido publicamente</a>
        </div>

        <div className="mt-4 space-y-2">
          {poll.results.map(r => (
            <button key={r.label} type="button" onClick={() => setSelectedCandidate(r.label)} className="block w-full rounded-xl px-2 py-1 text-left transition hover:bg-white/[0.03]" aria-pressed={selectedCandidate === r.label} aria-label={'Destacar ' + r.label}>
              <div className="flex items-center gap-3">
                <div className="w-32 shrink-0 text-xs text-slate-400">{r.label}</div>
                <div className="h-2 flex-1 rounded-full bg-white/5">
                  <div className={'h-full rounded-full transition-all ' + (selectedCandidate === r.label ? 'bg-sky-300' : 'bg-sky-300/50')} style={{ width: `${Math.min(100, r.percentage * 2)}%` }} />
                </div>
                <div className="w-14 text-right text-xs font-bold text-white">{r.percentage.toFixed(2).replace('.', ',')}%</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl border border-white/8 p-3"><strong className="block text-white">{poll.nonePct?.toFixed(2).replace('.', ',')}%</strong><span className="text-slate-500">Nenhum</span></div>
          <div className="rounded-2xl border border-white/8 p-3"><strong className="block text-white">{poll.notSurePct?.toFixed(2).replace('.', ',')}%</strong><span className="text-slate-500">NS/NR</span></div>
          <div className="rounded-2xl border border-white/8 p-3"><strong className="block text-white">{poll.unclassifiedPct?.toFixed(2).replace('.', ',')}%</strong><span className="text-slate-500">Não classificado</span></div>
          <div className="rounded-2xl border border-white/8 p-3"><strong className="block text-white">±{poll.theoreticalMarginErrorPct?.toFixed(1).replace('.', ',')} pp</strong><span className="text-slate-500">teórico</span></div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">As respostas publicadas no snapshot somam 92,25%; os 7,75 pontos restantes ficam explicitamente como “não classificados” para evitar completar a distribuição por inferência.</p>
      </Card>

      <Card>
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Checklist IA / 72h</div>
        <div className="mt-4 space-y-3">
          <div className="flex gap-3 rounded-2xl border border-white/8 p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /><div><strong className="block text-white">Rotulagem</strong><p className="mt-1 text-xs leading-5 text-slate-400">Conteúdo sintético usado em propaganda deve identificar explicitamente a manipulação e a tecnologia utilizada.</p></div></div>
          <div className="flex gap-3 rounded-2xl border border-white/8 p-4"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><strong className="block text-white">Janela especial · 2026</strong><p className="mt-1 text-xs leading-5 text-slate-400">Para o 1º turno, a janela indicada pelo TSE vai de 01/10 às 08h até 05/10 às 17h. Para eventual 2º turno, de 22/10 às 08h até 26/10 às 17h. A regra alcança novos conteúdos sintéticos com imagem, voz ou manifestação de candidato ou pessoa pública nos termos da norma eleitoral.</p><a href="https://www.tse.jus.br/legislacao/compilada/res/2026/resolucao-no-23-755-de-2-de-marco-de-2026" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex font-bold text-sky-300 hover:text-sky-200">Ver Resolução TSE nº 23.755/2026</a></div></div>
          <div className="flex gap-3 rounded-2xl border border-white/8 p-4"><FileSearch className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" /><div><strong className="block text-white">Prestação de contas</strong><p className="mt-1 text-xs leading-5 text-slate-400">A consulta oficial permite acompanhar bens, arrecadação, despesas e movimentação financeira. O snapshot parcial cobre fatos até 08/09/2026.</p></div></div>
        </div>
      </Card>
    </div>
  </section>;
}
