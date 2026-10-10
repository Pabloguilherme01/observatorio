import { useState } from 'react';
import '../../assets/styles/data-correction.css';

export function DataCorrectionPanel({ correctionUrl }: { readonly correctionUrl: string }) {
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const reviewUrl = new URL(correctionUrl);
  reviewUrl.searchParams.set('body', [
    reviewUrl.searchParams.get('body'),
    '', '## Correção sugerida', description.trim(),
    evidence.trim() ? `\n## Evidência\n${evidence.trim()}` : '',
  ].filter(Boolean).join('\n'));

  return <details className="data-correction">
    <summary>Encontrou um erro?</summary>
    <div className="data-correction-fields">
      <p>O indicador, o valor, a referência e o link deste contexto já acompanham sua sugestão. Você poderá revisar tudo no GitHub antes de publicar.</p>
      <label htmlFor="correction-description">O que precisa ser corrigido?</label>
      <textarea id="correction-description" value={description} onChange={event => setDescription(event.target.value)} rows={3} maxLength={2000} />
      <label htmlFor="correction-evidence">Fonte ou evidência (opcional)</label>
      <textarea id="correction-evidence" value={evidence} onChange={event => setEvidence(event.target.value)} rows={2} maxLength={1000} />
      {description.trim() ? <a href={reviewUrl.toString()} target="_blank" rel="noopener noreferrer">Revisar sugestão no GitHub</a> : <p>Descreva a correção para preparar a sugestão.</p>}
    </div>
  </details>;
}
