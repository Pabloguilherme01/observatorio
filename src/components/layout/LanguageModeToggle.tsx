import { Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();
  const items = [
    { id:'summary' as const, label:'Resumo', sub:'essencial', icon:List },
    { id:'simple' as const, label:'Simples', sub:'claro', icon:FileText },
    { id:'technical' as const, label:'Técnico', sub:'detalhes', icon:Code2 },
  ];
  const status = mode === 'technical' ? 'Fontes, método e rastreabilidade' : mode === 'summary' ? 'Só o essencial e ações rápidas' : 'Dados claros, contexto sob demanda';
  return (
    <div className="language-toggle language-toggle-v3" role="group" aria-label="Escolha o nível de detalhe da leitura">
      <div className="language-toggle-label"><Info aria-hidden="true" /><span>Modo de leitura</span></div>
      <div className="language-toggle-options">
        {items.map(({id,label,sub,icon:Icon}) => <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id} className={mode === id ? 'is-active' : ''} title={status}><Icon aria-hidden="true" /><span><strong>{label}</strong><small>{sub}</small></span></button>)}
      </div>
    </div>
  );
}
