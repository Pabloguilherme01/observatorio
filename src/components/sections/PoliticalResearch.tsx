import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { observatorioData as d } from '../../data/observatorioData';
import { formatCurrency } from '../../utils/formatters';

export function PoliticalResearch() {
  return (
    <section id="candidaturas" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="research-title">
      <SectionHeader
        titleId="research-title"
        eyebrow="Pesquisa documental"
        title="Candidaturas: registro, patrimônio e situação"
        description="Snapshot descritivo; a aplicação não produz avaliação, ranking ou recomendação."
      />
      <h2 id="research-title" className="sr-only">Candidaturas e registros documentais</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {d.candidates.map(candidate => (
          <Card key={candidate.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white">{candidate.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{candidate.party} · {candidate.ballotNumber}</p>
              </div>
              <Badge tone="info">{candidate.status}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Ocupação</span>
                <strong className="mt-1 block text-white">{candidate.occupation ?? '—'}</strong>
              </div>
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Escolaridade</span>
                <strong className="mt-1 block text-white">{candidate.education ?? '—'}</strong>
              </div>
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Bens declarados</span>
                <strong className="mt-1 block text-white">{candidate.declaredAssetsBrl != null ? formatCurrency(candidate.declaredAssetsBrl) : '—'}</strong>
              </div>
              <div className="rounded-2xl border border-white/8 p-3">
                <span className="text-slate-500">Snapshot</span>
                <strong className="mt-1 block text-white">{candidate.snapshotDate}</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
