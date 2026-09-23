import rawPesquisasData from '../../../generated/tse2026-pesquisas.json';
import { TSEPesquisasFileSchema } from '../../schemas/tse-enriched.schema';
import { ShareDataButton } from '../ShareDataButton';
import { Card } from '../ui/Card';

const pesquisasData = TSEPesquisasFileSchema.parse(rawPesquisasData);

export function RadarPesquisas() {
  const url = typeof window === 'undefined'
    ? 'https://pabloguilherme01.github.io/observatorio/#pesquisas'
    : window.location.origin + window.location.pathname + '#pesquisas';

  return (
    <section id="pesquisas" className="mt-4 scroll-mt-24" aria-labelledby="pesquisas-title">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Pesquisas eleitorais</div>
            <h3 id="pesquisas-title" className="mt-1 text-lg font-black text-white">Radar documental</h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Registro, instituto, contratante, amostra, metodologia e documentos originais. Sem médias ou agregações.</p>
          </div>
          <ShareDataButton title="Radar de pesquisas 2026" text="Radar documental de pesquisas eleitorais no Observatório." url={url} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          <span className="rounded-full border border-white/8 px-2.5 py-1">Estado: {pesquisasData.estado}</span>
          <span className="rounded-full border border-white/8 px-2.5 py-1">{pesquisasData.totalPesquisas} associações no recorte</span>
        </div>

        {pesquisasData.pesquisas.length ? (
          <div className="mt-4 space-y-3">
            {pesquisasData.pesquisas.map(pesquisa => (
              <article key={pesquisa.idPesquisa} className="rounded-2xl border border-white/8 p-4">
                <strong className="text-sm text-white">{pesquisa.idPesquisa}</strong>
                <p className="mt-1 text-xs text-slate-400">{pesquisa.instituto} · {pesquisa.municipio}/{pesquisa.uf}</p>
                <p className="mt-2 text-xs text-slate-500">Amostra {pesquisa.amostra}{pesquisa.margemErro !== undefined ? ` · margem ${pesquisa.margemErro}%` : ' · margem: não informada no CSV principal'}{pesquisa.nivelConfianca !== undefined ? ` · confiança ${pesquisa.nivelConfianca}%` : ' · confiança: não informada no CSV principal'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pesquisa.questionarioUrl && <a href={pesquisa.questionarioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-300">Questionário</a>}
                  {pesquisa.notaFiscalUrl && <a href={pesquisa.notaFiscalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-300">Nota fiscal</a>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
            O primeiro snapshot oficial foi materializado. O CSV principal do TSE contém registros, mas nenhum deles correspondeu ao recorte nominal configurado nesta captura; por isso a interface não inventa pesquisas locais.
          </div>
        )}

        <a href={pesquisasData.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-xs font-bold text-sky-300">Fonte oficial do TSE</a>
      </Card>
    </section>
  );
}
