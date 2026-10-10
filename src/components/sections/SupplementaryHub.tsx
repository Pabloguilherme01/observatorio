import { navigateToCleanSection } from '../../lib/sectionNavigation';

const links = [
  { id:'resultados', title:'Registros eleitorais', text:'Consulte resultados por turno, eleitorado e o recorte de candidaturas.' },
  { id:'aprendizado-guiado', title:'Aprender a ler os dados', text:'Siga uma trilha para entender valor, período, contexto e fonte.' },
  { id:'quiz', title:'Praticar conhecimentos cívicos', text:'Abra o quiz educativo quando quiser testar o que aprendeu.' },
] as const;

export function SupplementaryHub() {
  return <section id="acervo" className="city-supplementary mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="supplementary-title">
    <span className="civic-eyebrow">Para continuar a consulta</span>
    <h2 id="supplementary-title">Registros e aprendizado</h2>
    <p>Abra estes conteúdos quando precisar. Eles complementam os dados e serviços da cidade.</p>
    <div className="city-supplementary-grid">{links.map(link => <a key={link.id} href={'#'+link.id} onClick={event => { event.preventDefault(); navigateToCleanSection(link.id); }}><strong>{link.title}</strong><span>{link.text}</span></a>)}</div>
  </section>;
}
