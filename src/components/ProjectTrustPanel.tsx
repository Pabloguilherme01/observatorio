import { CheckCircle2, ExternalLink, GitPullRequest, ShieldCheck, Database, CalendarClock, Server, GitCommitHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import { EDITION } from '../config/version';
import { formatDate } from '../utils/formatters';
import { useLanguageMode } from '../context/LanguageModeContext';

const correctionUrl = 'https://github.com/Pabloguilherme01/observatorio/issues/new?title=Corre%C3%A7%C3%A3o%20de%20dado%20ou%20fonte&labels=correcao';

export function ProjectTrustPanel() {
  const official = d.sources.filter(source => source.nature === 'official').length;
  const { mode } = useLanguageMode();
  const [publication, setPublication] = useState({ status: 'loading', commitShort: '', buildGeneratedAt: '', contract: '', capturedAt: '', ageHours: null as number | null });

  useEffect(() => {
    if (mode !== 'technical') {
      setPublication({ status: 'loading', commitShort: '', buildGeneratedAt: '', contract: '', capturedAt: '', ageHours: null });
      return;
    }
    const controller = new AbortController();
    fetch('/observatorio/api/v1/health.json', { signal: controller.signal, cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('healthcheck HTTP ' + response.status);
        return response.json();
      })
      .then(payload => setPublication({
        status: payload?.status === 'ok' ? 'ok' : payload?.status === 'degraded' ? 'degraded' : 'error',
        commitShort: payload?.publication?.commitShort ?? '',
        buildGeneratedAt: payload?.buildGeneratedAt ?? '',
        contract: payload?.publication?.contract ?? '',
        capturedAt: payload?.freshness?.tseCandidates?.capturedAt ?? '',
        ageHours: typeof payload?.freshness?.tseCandidates?.ageHours === 'number' ? payload.freshness.tseCandidates.ageHours : null,
      }))
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPublication({ status: 'error', commitShort: '', buildGeneratedAt: '', contract: '', capturedAt: '', ageHours: null });
      });
    return () => controller.abort();
  }, [mode]);
  return (
    <section id="principios" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="principles-title">\n      <div id="fontes" className="trust-shell scroll-mt-24">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Origem, método e confiança
            </div>
            <h2 id="principles-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Confiança começa pela origem</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{mode !== 'technical' ? 'Cada número pode ser rastreado até sua origem. Consulte a fonte, a data e o contexto antes de formar sua leitura.' : 'A camada técnica expõe fonte, data, natureza, método e limitações para que cada etapa possa ser conferida.'}</p>
          </div>
          {mode === 'technical' && <div className="freshness-pill"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 light:text-slate-700">Edição / atualização</span><strong className="mt-1 block text-sm text-slate-900 light:text-slate-900">{EDITION} · {formatDate(d.meta.updatedAt)}</strong></div>}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="trust-card"><CheckCircle2 className="h-4 w-4 text-emerald-300" /><strong>Comece pelo valor</strong><p>Identifique se o número vem diretamente da fonte ou de um cálculo derivado.</p></div>
          <div className="trust-card"><CheckCircle2 className="h-4 w-4 text-emerald-300" /><strong>Vá até a origem</strong><p>Abra a referência para conferir instituição, data e contexto do dado.</p></div>
          <div className="trust-card"><CheckCircle2 className="h-4 w-4 text-emerald-300" /><strong>Leia os limites</strong><p>Datas, recortes e períodos diferentes permanecem identificados para evitar comparações indevidas.</p></div>
          <div className="trust-card"><GitPullRequest className="h-4 w-4 text-sky-300" /><strong>Encontrou um erro?</strong><p>Informe o dado e a fonte para que a correção possa ser verificada.</p><a href={correctionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-sky-300">Propor correção <ExternalLink className="h-3.5 w-3.5" /></a></div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="trust-card"><Database className="h-4 w-4 text-sky-300" /><strong>Origem antes da interpretação</strong><p>Dados atuais, históricos, capturas e cálculos derivados permanecem separados e identificados.</p></div>
          <div className="trust-card"><CalendarClock className="h-4 w-4 text-sky-300" /><strong>Data da fonte e captura</strong><p>A data de atualização do sistema é diferente da data de referência da fonte.</p></div>
        </div>

        <div className="mt-5 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] px-4 py-3 text-xs leading-5 text-slate-400"><strong className="text-slate-300">Validação oficial:</strong> para conferir dados eleitorais diretamente na fonte, consulte o <a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-200 hover:text-white light:text-sky-700 light:hover:text-sky-900">Portal de Dados Abertos do TSE</a>.</div>

        <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500"><strong className="text-slate-300">Nota de neutralidade:</strong> este painel é uma iniciativa cívica independente. Não declara vínculo, patrocínio ou associação com candidaturas, partidos ou federações e não recomenda escolhas eleitorais. Os dados são apresentados com fonte, data, natureza e limitações quando disponíveis.</div>

        {mode === 'technical' && <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="trust-card">
              <Server className="h-4 w-4 text-sky-300" />
              <strong>Publicação pública</strong>
              <p>{publication.status === 'ok' ? 'O endpoint público respondeu e a publicação está íntegra segundo o healthcheck.' : publication.status === 'degraded' ? 'O endpoint público respondeu, mas a captura TSE está fora da janela recomendada.' : publication.status === 'error' ? 'A verificação pública não pôde ser concluída neste momento.' : 'Verificando o estado publicado…'}</p>
              {publication.capturedAt && <small className="mt-1 block text-slate-500">Captura TSE: {new Date(publication.capturedAt).toLocaleString('pt-BR')}{publication.ageHours !== null ? ` · ${publication.ageHours.toFixed(1)}h atrás` : ''}.</small>}
            </div>
            <div className="trust-card">
              <GitCommitHorizontal className="h-4 w-4 text-violet-300" />
              <strong>Paridade de publicação</strong>
              <p>{publication.commitShort ? <>Commit publicado: <code className="font-bold text-slate-300">{publication.commitShort}</code>{publication.contract ? ' · ' + publication.contract : ''}.</> : 'O commit público será exibido aqui quando o healthcheck responder.'}</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500">
            <strong className="text-slate-300">Conferência independente:</strong> o painel diferencia o estado informado pelo aplicativo do estado efetivamente respondido pela publicação pública. Isso evita confundir uma execução de CI/CD concluída com disponibilidade real para o público.
            {publication.buildGeneratedAt && <span className="ml-1">Último build público: {new Date(publication.buildGeneratedAt).toLocaleString('pt-BR')}.</span>}
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500">
            <strong className="text-slate-300">Compromisso editorial:</strong> o observatório não produz ranking automático, recomendação eleitoral ou previsão de resultado.
          </div>
        </>}

      </div>
    </section>
  );
}
