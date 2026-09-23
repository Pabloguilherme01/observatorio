import { BookOpen, CalendarClock, Database, ExternalLink, Landmark, ShieldAlert } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PublicDataPulse() {
  const education = d.education;
  const latestBudgetUpdate = [...d.budgetUpdates].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <section id="dados" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="dados-title">
      <SectionHeader
        titleId="dados-title"
        eyebrow="Dados públicos"
        title="O que entrou no observatório"
        description="Novos dados oficiais entram como registros identificados por fonte, período e natureza. O painel separa fato publicado de interpretação."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-black text-white">Educação 2025</h3>
              <p className="text-xs text-slate-400">Base de Dados Educacionais de Goiás</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/[0.03] p-3">
              <strong className="block text-lg text-white">{education?.basicEducationEnrollments2025.toLocaleString('pt-BR')}</strong>
              <span className="text-[10px] text-slate-500">educação básica</span>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-3">
              <strong className="block text-lg text-white">{education?.municipalBasicEducationEnrollments2025.toLocaleString('pt-BR')}</strong>
              <span className="text-[10px] text-slate-500">rede municipal</span>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-3">
              <strong className="block text-lg text-white">{education?.technicalEptEnrollments2025.toLocaleString('pt-BR')}</strong>
              <span className="text-[10px] text-slate-500">EPT técnica</span>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-200">Ideb 2025 · referência secundária</span>
              <strong className="text-lg text-white">{education?.ideb2025Range?.map(value => value.toFixed(1).replace('.', ',')).join('–')}</strong>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Faixa registrada no levantamento de origem com referência ao QEdu. O Inep confirma a publicação dos resultados municipais de 2025, mas o ponto municipal oficial ainda não foi materializado neste snapshot; por isso esta faixa não é apresentada como nota municipal oficial.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-amber-300" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-black text-white">Alteração orçamentária</h3>
              <p className="text-xs text-slate-400">Registro legislativo mais recente no dataset</p>
            </div>
          </div>
          {latestBudgetUpdate && (
            <>
              <div className="mt-5 text-2xl font-black text-white">{brl(latestBudgetUpdate.amountBrl)}</div>
              <div className="mt-1 text-sm font-bold text-slate-200">{latestBudgetUpdate.title}</div>
              <div className="mt-1 text-xs text-slate-500">{latestBudgetUpdate.law} · {latestBudgetUpdate.date.split('-').reverse().join('/')}</div>
              <p className="mt-4 text-xs leading-5 text-slate-400">{latestBudgetUpdate.description}</p>
              <a href={d.sources.find(s => s.id === latestBudgetUpdate.sourceId)?.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-300 hover:text-sky-200">
                Abrir lei oficial <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-black text-white">Bases eleitorais disponíveis</h3>
              <p className="text-xs text-slate-400">Catálogos oficiais para próximas capturas</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <a href="https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-white/8 p-3 hover:bg-white/[0.03]">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
              <span><strong className="block text-sm text-white">PesqEle 2026</strong><span className="text-xs text-slate-500">Pesquisas, contratantes, pagantes e questionários · atualização diária</span></span>
            </a>
            <a href="https://dadosabertos.tse.jus.br/dataset/denuncias-eleitorais" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-white/8 p-3 hover:bg-white/[0.03]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              <span><strong className="block text-sm text-white">Pardal 2026</strong><span className="text-xs text-slate-500">Denúncias registradas · atualização diária · denúncia não é comprovação</span></span>
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
}
