import { useMemo, useState } from 'react';
import { CheckCircle2, Database, ExternalLink, FileText, History, Search, ShieldAlert, UserRound } from 'lucide-react';
import { electoral360Diff, electoral360Modules, electoral360Snapshot } from '../../data/electoral360';
import { observatorioData as d } from '../../data/observatorioData';
import { dispatchInspect } from '../DataInspector';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const stateLabel: Record<string,string> = { first_capture:'Primeiro snapshot',synced:'Sincronizado',unchanged:'Sem alterações',changed:'Dados alterados',stale:'Desatualizado',failed:'Falha na sincronização',not_synced:'Ainda não sincronizado' };

export function Electoral360() {
  const [query,setQuery]=useState(''), [selectedName,setSelectedName]=useState('');
  const captured=electoral360Modules.filter(m=>m.status==='captured').length, cataloged=electoral360Modules.filter(m=>m.status==='cataloged').length;
  const snapshotWarning = ['not_synced','stale','failed'].includes(String(electoral360Diff.state));
  const candidateSource=d.sources.find(s=>s.id==='tse-candidatos-2026');
  const candidates=useMemo(()=>{const n=query.trim().toLocaleLowerCase('pt-BR');if(!n)return electoral360Snapshot.matchedCandidates;return electoral360Snapshot.matchedCandidates.filter(c=>[c.name,c.party,c.office,c.status,c.ballotNumber].join(' ').toLocaleLowerCase('pt-BR').includes(n));},[query]);
  const fallback=d.candidates.find(c=>c.name===selectedName);
  const profileCandidate=electoral360Snapshot.matchedCandidates.find(c=>c.name===selectedName);

  return <section id="eleitoral360" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="electoral360-title">
    <SectionHeader titleId="electoral360-title" eyebrow="Eleitoral 360°" title="Da fotografia ao perfil documental" description="Identidade, situação, registros, módulos e histórico ficam separados de qualquer interpretação eleitoral." />
    <div className="grid gap-4 sm:grid-cols-4">
      <Card><CheckCircle2 className="h-5 w-5 text-emerald-300"/><div className="mt-3 text-3xl font-black text-white">{captured}</div><div className="text-xs text-slate-500">módulos capturados</div></Card>
      <Card><Database className="h-5 w-5 text-sky-300"/><div className="mt-3 text-3xl font-black text-white">{cataloged}</div><div className="text-xs text-slate-500">módulos catalogados</div></Card>
      <Card><History className="h-5 w-5 text-violet-300"/><div className="mt-3 text-sm font-black text-white">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}</div><div className="mt-1 text-xs text-slate-500">{electoral360Diff.added} novos · {electoral360Diff.changed} alterados · {electoral360Diff.removed} removidos</div></Card>
      <Card><UserRound className="h-5 w-5 text-amber-300"/><div className="mt-3 text-3xl font-black text-white">{electoral360Snapshot.matchedCandidates.length}</div><div className="text-xs text-slate-500">correspondências capturadas</div></Card>
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card>
        <div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-black text-white">Perfil documental</h3><p className="mt-1 text-xs leading-5 text-slate-500">Quando o snapshot TSE estiver sincronizado, este perfil passa a usar a captura validada. Até lá, os registros locais da edição permanecem identificados como recorte editorial e não representam o universo completo de candidaturas.</p></div><FileText className="h-5 w-5 text-sky-300"/></div>
        <div className="mb-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-xs leading-5 text-slate-500">Recorte local: estes registros são usados enquanto o snapshot oficial do TSE permanece <strong className="text-amber-200">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state).toLowerCase()}</strong>. Isso não equivale à lista completa de candidaturas.</div><div className="mt-4 flex flex-wrap gap-2">{d.candidates.map(candidate=><button key={candidate.name} type="button" onClick={()=>setSelectedName(candidate.name)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${candidate.name===selectedName?'border-sky-300/40 bg-sky-300/10 text-sky-200':'border-white/10 text-slate-400'}`}>{candidate.name}</button>)}</div>
        {!fallback ? <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">Selecione um registro para abrir o perfil documental. Nenhum nome é pré-selecionado.</div> : <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info label="Identidade" value={fallback.name} />
          <Info label="Situação" value={profileCandidate?.status ?? fallback.status} />
          <Info label="Partido" value={profileCandidate?.party ?? fallback.party ?? 'Não informado'} />
          <Info label="Número" value={String(profileCandidate?.ballotNumber ?? fallback.ballotNumber ?? 'Não informado')} />
          <Info label="Ocupação" value={fallback.occupation ?? 'Não informado'} />
          <Info label="Escolaridade" value={fallback.education ?? 'Não informado'} />
          <Info label="Bens declarados" value={fallback.declaredAssetsBrl ? fallback.declaredAssetsBrl.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : 'Não informado'} />
          <Info label="Snapshot" value={fallback.snapshotDate} />
        </div>}
        {fallback && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{['Bens','Contas','Redes','Pesquisas','Processos','Propostas','Histórico','Alterações'].map(tab=><button key={tab} type="button" onClick={()=>dispatchInspect({label:`${fallback?.name ?? 'Candidato'} · ${tab}`,value:'Módulo documental',status:'catalogado',note:'Este módulo está no mapa de dados do Eleitoral 360°. A ausência de captura local não é interpretada como ausência do registro.'})} className="rounded-xl border border-white/8 p-3 text-left text-xs font-bold text-slate-400 hover:border-sky-300/20"><span className="block text-slate-600">Abrir</span>{tab}</button>)}</div>
      </Card>

      <div className="space-y-4">
        <Card><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><ShieldAlert className={`h-4 w-4 ${snapshotWarning ? 'text-amber-300' : 'text-emerald-300'}`}/> Estado do snapshot</div><div className="mt-3 text-lg font-black text-white">{stateLabel[String(electoral360Diff.state)] ?? String(electoral360Diff.state)}</div><p className="mt-2 text-xs leading-5 text-slate-500">Ausência de captura local não equivale a ausência de candidaturas.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">{electoral360Snapshot.localWatchlist.length} nomes monitorados</span><span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">identidade por SQ_CANDIDATO</span></div></Card>
        <Card><div className="text-xs font-bold uppercase tracking-wide text-slate-500">Recorte operacional</div><p className="mt-2 text-xs leading-5 text-slate-500">A watchlist é um recorte para cruzamento com o universo de Goiás; não representa o universo completo.</p><div className="mt-4 flex flex-wrap gap-2">{electoral360Snapshot.localWatchlist.map(name=><span key={name} className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-slate-400">{name}</span>)}</div></Card>
      </div>
    </div>

    <Card className="mt-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-black text-white">Candidaturas capturadas</h3><p className="mt-1 text-xs text-slate-500">Pesquisa por identidade, nome, partido, cargo ou situação.</p></div><label className="flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-400"><Search className="h-4 w-4"/><span className="sr-only">Buscar candidatura</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." className="w-full bg-transparent outline-none placeholder:text-slate-600 sm:w-48"/></label></div>
      {electoral360Snapshot.matchedCandidates.length===0 ? <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">O snapshot TSE ainda não foi sincronizado. A camada de perfil acima usa apenas o recorte local já presente na edição.</div> : <div className="mt-5 grid gap-3 md:grid-cols-2">{candidates.map(c=><article key={c.sqCandidate} className="rounded-2xl border border-white/8 p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-black text-white">{c.name}</h4><p className="mt-1 text-xs text-slate-500">{c.party} · {c.office} · nº {c.ballotNumber}</p></div><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500">{c.status}</span></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/8 p-3"><span className="text-slate-500">SQ_CANDIDATO</span><strong className="mt-1 block text-white">{c.sqCandidate}</strong></div><div className="rounded-xl border border-white/8 p-3"><span className="text-slate-500">Snapshot</span><strong className="mt-1 block text-white">{c.snapshotDate}</strong></div></div></article>)}</div>}
      {candidateSource?.url && <a href={candidateSource.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">Ver catálogo oficial do TSE <ExternalLink className="h-3.5 w-3.5"/></a>}
    </Card>
  </section>;
}
function Info({label,value}:{readonly label:string;readonly value:string}){return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3"><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</div><div className="mt-1 text-sm font-semibold text-white">{value}</div></div>}
