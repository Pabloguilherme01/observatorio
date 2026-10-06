import { CheckCircle2, History, UserRound } from 'lucide-react';
import { electoral360Snapshot } from '../../../data/electoral360';
import { observatorioData as d } from '../../../data/observatorioData';
import { Card } from '../../ui/Card';

export function ElectoralOverviewPanel() {
  const electorate = d.electoral;
  const hasLocalCandidateSnapshot = electoral360Snapshot.matchedCandidates.length > 0;
  const complementaryStats = electoral360Snapshot.complementaryStats;
  const ageTotal = electorate.ageGroups.reduce((sum, group) => sum + group.voters, 0);
  const genderTotalPct = (electorate.womenPct ?? 0) + (electorate.menPct ?? 0);
  const ballotHistory = [
    electorate.electorate2018 != null ? { year: 2018, value: electorate.electorate2018 } : null,
    electorate.electorate2022 != null ? { year: 2022, value: electorate.electorate2022 } : null,
    electorate.electorate2024 != null ? { year: 2024, value: electorate.electorate2024 } : null,
    { year: 2026, value: electorate.electorate },
  ].filter(Boolean) as { year: number; value: number }[];

  return (
    <>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado atual</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.electorate.toLocaleString('pt-BR')}</div><div className="text-xs text-slate-500">snapshot · {electorate.snapshotDate}</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Participação 2024</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.turnout2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.validVotes2024Count.toLocaleString('pt-BR')} votos válidos</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Abstenção 2024</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.abstention2024Pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">{electorate.abstention2024Count.toLocaleString('pt-BR')} eleitores</div></Card>
        <Card><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Cadastro por gênero</div><div className="mt-2 text-2xl font-black text-white light:text-slate-900">{genderTotalPct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</div><div className="text-xs text-slate-500">mulheres + homens · cadastro</div></Card>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Como o eleitorado mudou</div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ballotHistory.map(point => (
              <div key={point.year} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">{point.year}</span>
                <strong className="mt-1 block text-lg text-white light:text-slate-900">{point.value.toLocaleString('pt-BR')}</strong>
                <span className="text-[9px] text-slate-500">{point.year === 2026 ? 'snapshot atual' : 'histórico'}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">Série apresentada como contagem de eleitorado em cada base de referência; não representa votos obtidos por candidaturas.</p>
        </Card>

        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Quem compõe o eleitorado</div>
          <div className="mt-4 space-y-3">
            {electorate.ageGroups.map(group => (
              <div key={group.id}>
                <div className="flex justify-between gap-3 text-xs"><span className="text-slate-400">{group.label}</span><strong className="text-white light:text-slate-900">{group.sharePct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-sky-300" style={{ width: `${Math.min(100, group.sharePct)}%` }} /></div>
                <div className="mt-1 text-[10px] text-slate-600">{group.voters.toLocaleString('pt-BR')} eleitores</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 p-3"><span className="text-[10px] text-slate-600">Mulheres</span><strong className="mt-1 block text-white light:text-slate-900">{(electorate.womenPct ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</strong></div>
            <div className="rounded-xl border border-white/8 p-3"><span className="text-[10px] text-slate-600">Homens</span><strong className="mt-1 block text-white light:text-slate-900">{(electorate.menPct ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</strong></div>
          </div>
          <p className="mt-3 text-[10px] text-slate-600">Soma das faixas etárias capturadas: {ageTotal.toLocaleString('pt-BR')} eleitores.</p>
        </Card>
      </div>

      {complementaryStats && (
        <details className="mb-4 rounded-3xl border border-white/8 bg-white/[0.015] p-4">
          <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Complementos do universo estadual</summary>
          <div className="mt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Mais contexto eleitoral</div>
                <div className="mt-1 text-sm font-semibold text-white light:text-slate-900">Base complementar consultada</div>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">Informações complementares para conferir os dados públicos do recorte. A base estadual não informa o município da candidatura.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center sm:w-64">
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white light:text-slate-900">{complementaryStats.byGender.FEMININO ?? 0}</strong><span className="text-[9px] text-slate-600">feminino</span></div>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><strong className="block text-base text-white light:text-slate-900">{complementaryStats.byGender.MASCULINO ?? 0}</strong><span className="text-[9px] text-slate-600">masculino</span></div>
              </div>
            </div>
          </div>
        </details>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white light:text-slate-900">Dados públicos disponíveis</div>
          <div className="text-xs text-slate-500">recorte eleitoral acompanhado</div>
        </Card>
        <Card>
          <History className="h-5 w-5 text-violet-300" aria-hidden="true" />
          <div className="mt-3 text-sm font-black text-white light:text-slate-900">{hasLocalCandidateSnapshot ? 'Snapshot disponível' : 'Atualização pendente'}</div>
          <div className="mt-1 text-xs text-slate-500">identificação pública disponível</div>
        </Card>
        <Card>
          <UserRound className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{electoral360Snapshot.matchedCandidates.length}</div>
          <div className="text-xs text-slate-500">nomes acompanhados</div>
        </Card>
      </div>
    </>
  );
}
