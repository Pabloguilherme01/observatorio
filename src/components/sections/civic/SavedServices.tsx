import { useEffect, useState } from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';
import { allMunicipalServices, type PublicServiceResource } from '../../../data/publicServices';

const KEY = 'observatorio-citizen-services-v1';
function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(value) ? [...new Set(value.filter((title): title is string => typeof title === 'string' && allMunicipalServices.some(service => service.title === title)))] : [];
  } catch { return []; }
}

export function useSavedServices() {
  const [saved, setSaved] = useState(readSaved);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const restore = (event: StorageEvent) => { if (event.key === KEY || event.key === null) setSaved(readSaved()); };
    window.addEventListener('storage', restore);
    return () => window.removeEventListener('storage', restore);
  }, []);
  function toggle(service: PublicServiceResource) {
    const removing = saved.includes(service.title);
    const next = removing ? saved.filter(title => title !== service.title) : [...saved, service.title];
    setSaved(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setNotice(`${service.title}: ${removing ? 'retirado dos' : 'adicionado aos'} seus serviços.`);
    } catch { setNotice('O navegador não permitiu guardar a seleção. Ela ficará disponível apenas nesta visita.'); }
  }
  return { saved, notice, toggle };
}

export function SavedServices({ saved, notice, onToggle }: {
  readonly saved: readonly string[];
  readonly notice: string;
  readonly onToggle: (service: PublicServiceResource) => void;
}) {
  const services = allMunicipalServices.filter(service => saved.includes(service.title));
  return (
    <div className="citizen-saved" aria-labelledby="saved-services-title">
      <div className="citizen-saved-heading"><Bookmark aria-hidden="true" /><h3 id="saved-services-title">Meus serviços <span>({services.length})</span></h3></div>
      <p>Guarde os canais que você usa para encontrá-los novamente. A seleção fica somente neste navegador, sem cadastro.</p>
      {services.length === 0 ? <p className="citizen-saved-empty">Use “Salvar serviço” nos cartões abaixo para montar seus atalhos.</p> : (
        <ul className="citizen-saved-list">{services.map(service => <li key={service.title}>
          <a href={service.href} target="_blank" rel="noopener noreferrer" aria-label={`${service.title} — canal oficial em nova aba`}>{service.title}<ExternalLink aria-hidden="true" /></a>
          <button type="button" onClick={() => onToggle(service)} aria-label={`Remover serviço salvo: ${service.title}`}>Remover</button>
        </li>)}</ul>
      )}
      <p role="status" aria-live="polite" className="citizen-save-status">{notice}</p>
      <details className="citizen-preparation">
        <summary>Antes de acessar um serviço</summary>
        <p>Esta lista ajuda a preparar a consulta; os requisitos de cada atendimento são definidos pelo órgão responsável.</p>
        {['Conferir no canal oficial os horários e a forma de atendimento.', 'Conferir quais documentos e requisitos o órgão solicita.', 'Guardar o protocolo fornecido pelo órgão para acompanhar o pedido.'].map(item => <label key={item}><input type="checkbox" /> <span>{item}</span></label>)}
        <p>Evite compartilhar documentos pessoais em links de consulta ou em mensagens públicas.</p>
      </details>
    </div>
  );
}
