import { ArrowRight, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { navigateToCleanSection } from '../../lib/sectionNavigation';
import { copyText } from '../../lib/clipboard';
import { buildCanonicalUrl, urlParamKeys } from '../../lib/urlState';
import { buildExecutiveSummaryModel } from './summary/executiveSummaryModel';
import '../../assets/styles/city-summary.css';

export function ExecutiveSummary() {
  const { mode } = useLanguageMode();
  const { publicFacts } = buildExecutiveSummaryModel();
  const [shareStatus, setShareStatus] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const share = async () => {
    if (shareBusy) return;
    setShareBusy(true);
    const text = publicFacts.map(fact => `${fact.label}: ${fact.value}. ${fact.referenceLabel}. Fonte: ${fact.source}.`).join('\n');
    const url = buildCanonicalUrl({ [urlParamKeys.readingMode]: mode }, 'resumo');
    try {
      if (navigator.share) { await navigator.share({ title:'Observatório de Águas Lindas', text, url }); setShareStatus('Compartilhado'); }
      else setShareStatus(await copyText(text + '\n' + url) ? 'Resumo copiado' : 'Não foi possível copiar automaticamente');
    } catch(error) { if ((error as DOMException)?.name !== 'AbortError') setShareStatus('Não foi possível compartilhar'); }
    finally { setShareBusy(false); }
  };
  return <section id="resumo" className={'city-summary executive-summary executive-summary--'+mode+' mx-auto max-w-7xl px-4 sm:px-6'} aria-labelledby="executive-summary-title">
    <div className="city-summary-heading"><div><span className="civic-eyebrow">Resumo principal</span><h2 id="executive-summary-title">Quatro referências para entender a cidade</h2><p>População, água, orçamento e esgoto. Cada indicador tem seu próprio período e significado.</p></div><button type="button" onClick={() => void share()} aria-label="Compartilhar resumo do observatório" disabled={shareBusy}><Share2 aria-hidden="true" /> {shareBusy ? 'Compartilhando…' : 'Compartilhar'}</button></div>
    {shareStatus && <p role="status">{shareStatus}</p>}
    <div className="city-summary-grid">{publicFacts.map(fact => <button key={fact.id} type="button" className="city-summary-card" aria-label={'Abrir contexto de '+fact.label} onClick={() => navigateToCleanSection(fact.target)}>
      <span>{fact.label}</span><strong>{fact.value}</strong><small>{fact.badge} · {fact.referenceLabel}</small><span className="city-summary-source">{fact.source}</span>
      {mode !== 'summary' && <p>{fact.note}</p>}
      <span className="city-summary-next">Ver contexto <ArrowRight aria-hidden="true" /></span>
    </button>)}</div>
  </section>;
}
