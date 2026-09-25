import { useMemo, useState } from 'react';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const events = [
  { date: '2026-05-06', label: 'Fechamento cadastral', description: 'Prazo para solicitar título, transferir domicílio ou revisar dados cadastrais.', sourceId: 'tse-calendario-2026' },
  { date: '2026-07-20', label: 'Início das convenções', description: 'Começa o período oficial para convenções partidárias e escolha formal de candidaturas.', sourceId: 'tse-calendario-2026' },
  { date: '2026-08-05', label: 'Fim das convenções', description: 'Data-limite para realização das convenções partidárias.', sourceId: 'tse-calendario-2026' },
  { date: '2026-08-15', label: 'Registro de candidaturas', description: 'Prazo final para partidos, federações e coligações apresentarem pedidos de registro.', sourceId: 'tse-calendario-2026' },
  { date: '2026-08-16', label: 'Propaganda eleitoral', description: 'Início da propaganda eleitoral geral nas ruas e na internet.', sourceId: 'tse-calendario-2026' },
  { date: '2026-09-01', label: 'Consulta ao local de votação', description: 'A partir desta data, o local de votação pode ser consultado pelo e-Título e pelos portais da Justiça Eleitoral.', sourceId: 'tse-eleicoes-2026' },
  { date: '2026-09-09', label: 'Início do envio das contas parciais', description: 'Começa o período de envio da prestação de contas parcial.', sourceId: 'tse-contas-2026' },
  { date: '2026-09-13', label: 'Fim do envio das contas parciais', description: 'Data-limite para envio da prestação de contas parcial.', sourceId: 'tse-contas-2026' },
  { date: '2026-09-14', label: 'Prazo de substituição de candidaturas', description: 'Data-limite geral para pedidos de substituição de candidatas e candidatos, ressalvadas as hipóteses previstas em lei.', sourceId: 'tse-calendario-2026' },
  { date: '2026-09-15', label: 'Publicação das contas parciais', description: 'Dados da prestação parcial passam a ser disponibilizados na internet.', sourceId: 'tse-contas-2026' },
  { date: '2026-09-19', label: 'Regra de prisão para candidaturas', description: 'A partir desta data, candidatas e candidatos não podem ser presos ou detidos, salvo as exceções legais.', sourceId: 'tse-calendario-2026' },
  { date: '2026-09-29', label: 'Proteção do eleitorado', description: 'Começa o período em que eleitoras e eleitores não podem ser presos ou detidos, salvo as exceções legais, até 6 de outubro.', sourceId: 'tse-calendario-2026' },
  { date: '2026-09-30', label: 'Fim da geração de mídias', description: 'O TRE-GO informa a conclusão prevista da geração de mídias e avanço da preparação das urnas para a votação.', sourceId: 'tre-go-geracao-midias-2026' },
  { date: '2026-10-04', label: '1º turno', description: 'Dia da votação do primeiro turno das Eleições Gerais de 2026.', sourceId: 'tse-calendario-2026' },
  { date: '2026-10-05', label: 'Início da prestação de contas final', description: 'Começa o prazo geral para entrega da prestação de contas final das campanhas, conforme o calendário do TRE-GO.', sourceId: 'tre-go-contas-2026' },
  { date: '2026-10-25', label: '2º turno eventual', description: 'Data prevista para eventual segundo turno nas disputas majoritárias.', sourceId: 'tse-calendario-2026' },
];

const month = (date: string) => new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(date + 'T12:00:00')).replace('.', '');
const day = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(new Date(date + 'T12:00:00'));

const nextEventIndex = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const index = events.findIndex(event => new Date(event.date + 'T12:00:00') >= today);
  return index >= 0 ? index : events.length - 1;
};

const daysUntil = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date + 'T12:00:00');
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86400000));
};

export function ElectionTimeline() {
  const [selected, setSelected] = useState(() => events[nextEventIndex()]);
  const source = useMemo(() => d.sources.find(item => item.id === selected.sourceId), [selected.sourceId]);
  const remaining = daysUntil(selected.date);
  const isFuture = remaining > 0;
  return (
    <section id="linha-do-tempo" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="timeline-title">
      <SectionHeader titleId="timeline-title" eyebrow="Calendário" title="A eleição como linha do tempo" description="Eventos oficiais navegáveis, com destaque automático para o próximo marco a partir da data atual. O painel não interpreta o impacto político dos eventos." />
      <Card>
        <div className="mb-5 rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] p-4" aria-live="polite">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300">Próximo marco</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <strong className="text-xl font-black text-white">{selected.label}</strong>
            <span className="text-sm font-semibold text-slate-400">{day(selected.date)}/{selected.date.slice(5, 7)}/{selected.date.slice(0, 4)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{isFuture ? `Faltam ${remaining} dia${remaining === 1 ? '' : 's'}.` : 'Este marco já está em andamento ou já ocorreu.'}</p>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[760px] items-start">
            {events.map((event, index) => (
              <button key={event.date} type="button" onClick={() => setSelected(event)} aria-pressed={selected.date === event.date} className="group relative flex min-w-[112px] flex-1 flex-col items-center text-center">
                <span className={`grid h-11 w-11 place-items-center rounded-full border transition ${selected.date === event.date ? 'border-sky-300 bg-sky-300/15 text-sky-200' : 'border-white/10 bg-white/[0.02] text-slate-500'}`}>
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </span>
                {index < events.length - 1 && <span className="absolute left-1/2 top-[21px] h-px w-full bg-white/10" aria-hidden="true" />}
                <span className="relative mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{month(event.date)}</span>
                <span className="relative text-sm font-black text-white">{day(event.date)}</span>
                <span className="relative mt-1 max-w-[100px] text-[10px] leading-4 text-slate-600">{event.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-sky-300/80">{selected.date}</div>
            <h3 className="mt-2 text-xl font-black text-white">{selected.label}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{selected.description}</p>
          </div>
          {source?.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-sky-300"><ExternalLink className="h-3.5 w-3.5" /> {source.nature === 'official' ? 'Fonte oficial' : 'Ver fonte'}</a>}
        </div>
      </Card>
    </section>
  );
}
