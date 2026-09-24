import { CheckCircle2, ExternalLink, RotateCcw, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

type Question = {
  readonly difficulty: Difficulty;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answer: string;
  readonly explanation: string;
  readonly anchor: string;
  readonly sourceLabel: string;
};

const QUESTIONS: readonly Question[] = [
  { difficulty:'Fácil', category:'Fontes', prompt:'A estimativa municipal do IBGE para 2026 tem como referência qual data?', options:['1º de julho de 2026','1º de janeiro de 2026','22 de setembro de 2026','4 de outubro de 2026'], answer:'1º de julho de 2026', explanation:'A fonte do Observatório registra a estimativa municipal de 2026 com referência em 1º de julho de 2026.', anchor:'fontes', sourceLabel:'IBGE · população' },
  { difficulty:'Fácil', category:'Eleições', prompt:'Em que data ocorre o primeiro turno das Eleições Gerais de 2026?', options:['4 de outubro de 2026','25 de outubro de 2026','6 de maio de 2026','1º de novembro de 2026'], answer:'4 de outubro de 2026', explanation:'O calendário oficial do TSE fixa o primeiro turno em 4 de outubro de 2026.', anchor:'linha-do-tempo', sourceLabel:'Calendário TSE' },
  { difficulty:'Fácil', category:'Dados', prompt:'O que melhor descreve um snapshot de dados?', options:['Um recorte registrado em determinada data','Uma previsão do resultado futuro','Um dado sem fonte para uso rápido','Uma média obrigatória de vários anos'], answer:'Um recorte registrado em determinada data', explanation:'Snapshot é uma fotografia da base no momento da captura.', anchor:'dados', sourceLabel:'Dados e atualizações' },
  { difficulty:'Fácil', category:'Orçamento', prompt:'O que a LOA representa no Observatório?', options:['Planejamento orçamentário do exercício','Gasto efetivamente realizado em cada programa','Resultado de uma pesquisa eleitoral','Estimativa populacional'], answer:'Planejamento orçamentário do exercício', explanation:'A LOA estima receitas e fixa despesas para o exercício; não equivale automaticamente ao gasto realizado.', anchor:'orcamento', sourceLabel:'Orçamento' },
  { difficulty:'Fácil', category:'Eleições', prompt:'O DivulgaCandContas do TSE reúne informações sobre:', options:['Candidaturas e contas eleitorais','Somente pesquisas de opinião','Somente resultados municipais','Apenas propaganda em redes sociais'], answer:'Candidaturas e contas eleitorais', explanation:'O TSE descreve o sistema como uma base sobre candidaturas, contas eleitorais e partidos.', anchor:'fontes', sourceLabel:'TSE · DivulgaCandContas' },
  { difficulty:'Médio', category:'Eleições', prompt:'Qual é a ordem correta dos dois primeiros cargos na votação de 2026?', options:['Deputado federal e deputado estadual/distrital','Deputado estadual/distrital e deputado federal','Senador e deputado federal','Presidente e governador'], answer:'Deputado federal e deputado estadual/distrital', explanation:'A sequência informada pelo TSE começa com deputado federal e depois deputado estadual ou distrital.', anchor:'linha-do-tempo', sourceLabel:'TSE · ordem de votação' },
  { difficulty:'Médio', category:'Eleitorado', prompt:'O conjunto Eleitorado 2026 do TSE inclui, entre outros, dados de:', options:['Perfil do eleitorado, seção e local de votação','Somente patrimônio de candidatos','Somente orçamento municipal','Somente pesquisas eleitorais'], answer:'Perfil do eleitorado, seção e local de votação', explanation:'O catálogo de dados abertos do TSE descreve esses grupos no conjunto Eleitorado 2026.', anchor:'eleitorado', sourceLabel:'TSE · Eleitorado 2026' },
  { difficulty:'Médio', category:'Candidatos', prompt:'O conjunto Candidatos 2026 do TSE reúne quais tipos de recursos?', options:['Candidatos, bens, redes sociais, fotos e propostas','Somente nomes e números','Somente resultados oficiais','Somente pesquisas registradas'], answer:'Candidatos, bens, redes sociais, fotos e propostas', explanation:'O catálogo oficial lista candidatos, bens, redes sociais, fotos, histórico e propostas, além de outros recursos.', anchor:'candidaturas', sourceLabel:'TSE · Candidatos 2026' },
  { difficulty:'Médio', category:'Qualidade', prompt:'Se uma informação municipal não foi confirmada pela fonte disponível, o Observatório deve:', options:['Sinalizar a lacuna e não tratá-la como confirmada','Preencher com uma estimativa sem aviso','Inferir pelo nome de uma pessoa','Copiar o primeiro resultado de busca'], answer:'Sinalizar a lacuna e não tratá-la como confirmada', explanation:'Ausência de confirmação é uma limitação da evidência; ela não deve ser convertida em certeza.', anchor:'qualidade', sourceLabel:'Qualidade dos dados' },
  { difficulty:'Médio', category:'Transporte', prompt:'O custo mensal exibido pelo calculador de transporte é:', options:['Um cálculo derivado das premissas informadas','Uma cobrança oficial individual','Uma tarifa nacional única','Um resultado eleitoral'], answer:'Um cálculo derivado das premissas informadas', explanation:'O resultado depende das premissas inseridas, como tarifa, frequência e dias.', anchor:'transporte', sourceLabel:'Calculador de transporte' },
  { difficulty:'Difícil', category:'Fontes', prompt:'Por que um indicador precisa ser lido junto com sua data de referência?', options:['Porque o valor pode representar outro período ou fotografia da base','Porque a data muda automaticamente o valor','Porque toda fonte precisa ter dados diários','Porque números sem data são sempre falsos'], answer:'Porque o valor pode representar outro período ou fotografia da base', explanation:'A data define o recorte temporal e evita comparar fotografias de períodos diferentes como se fossem iguais.', anchor:'fontes', sourceLabel:'Mapa de evidências' },
  { difficulty:'Difícil', category:'Pesquisa', prompt:'Uma pesquisa eleitoral registrada deve ser interpretada como:', options:['Um levantamento com amostra, metodologia e data próprias','O resultado oficial da eleição','Uma probabilidade automática de vitória','Uma contagem de votos já apurados'], answer:'Um levantamento com amostra, metodologia e data próprias', explanation:'Pesquisa e resultado oficial são categorias diferentes e devem ser lidos com sua ficha técnica.', anchor:'politica', sourceLabel:'Pesquisas eleitorais' },
  { difficulty:'Difícil', category:'Comparação', prompt:'Antes de comparar dois percentuais, o que precisa ser conferido?', options:['Período, universo, denominador e metodologia','Somente qual número é maior','A cor usada nos gráficos','A quantidade de casas decimais'], answer:'Período, universo, denominador e metodologia', explanation:'Percentuais podem parecer comparáveis e não serem quando escopo ou método diferem.', anchor:'principios', sourceLabel:'Princípios' },
  { difficulty:'Difícil', category:'Evidências', prompt:'O que fortalece uma cadeia de evidências?', options:['Fonte identificada, data, natureza do dado e link de conferência','Somente um gráfico bonito','Um número sem referência','Uma afirmação repetida em várias páginas'], answer:'Fonte identificada, data, natureza do dado e link de conferência', explanation:'Esses elementos permitem rastrear e conferir como a informação chegou ao Observatório.', anchor:'evidencias', sourceLabel:'Cadeia de evidências' },
  { difficulty:'Difícil', category:'Atualização', prompt:'O catálogo oficial de Candidatos 2026 deve ser tratado como:', options:['Base pública que pode ser atualizada e consultada na fonte original','Resultado eleitoral definitivo','Lista imutável desde janeiro','Pesquisa de intenção de voto'], answer:'Base pública que pode ser atualizada e consultada na fonte original', explanation:'O TSE publica o conjunto de dados e seus recursos; o Observatório preserva a data do próprio snapshot.', anchor:'dados', sourceLabel:'TSE · Candidatos 2026' },
];

function shuffledOptions(question: Question, index: number): readonly string[] {
  const offset = index % question.options.length;
  return question.options.map((_, position) => question.options[(position + offset) % question.options.length]);
}

export function QuickQuiz() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [category, setCategory] = useState('Todas');
  const options = useMemo(() => shuffledOptions(QUESTIONS[step] ?? QUESTIONS[0], step), [step]);

  const question = QUESTIONS[step];
  const progress = finished ? 100 : Math.round(((step + 1) / QUESTIONS.length) * 100);

  function answer(value: string) {
    if (selected) return;
    setSelected(value);
    if (value === question.answer) setScore(current => current + 1);
  }

  function next() {
    if (!selected) return;
    if (step === available.length - 1) setFinished(true);
    else {
      setStep(current => current + 1);
      setSelected(null);
    }
  }

  function chooseCategory(next: string) {
    setCategory(next); setStep(0); setScore(0); setSelected(null); setFinished(false);
  }

  function restart() {
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  async function share() {
    const text = `Completei o Quiz atualizado: ${score}/${available.length} acertos.`;
    if (navigator.share) await navigator.share({ title:'Quiz do Observatório', text, url:location.href });
    else if (navigator.clipboard) await navigator.clipboard.writeText(text + ' ' + location.href);
  }

  return (
    <section id="quiz" aria-labelledby="quiz-title" className="quiz-premium">
      <div className="quiz-premium-head">
        <div>
          <span className="quiz-eyebrow">Interativo · 15 perguntas</span>
          <h2 id="quiz-title">Quiz do Observatório</h2>
          <p>Questões baseadas nas fontes e no funcionamento do próprio Observatório.</p>
        </div>
        {!finished && <span className="quiz-counter">{step + 1}/{QUESTIONS.length}</span>}
      </div>

      <div className="quiz-categories" role="tablist" aria-label="Categorias do quiz">{categories.map(item => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? 'is-active' : ''} onClick={() => chooseCategory(item)}>{item}</button>)}</div>
      <div className="quiz-progress" aria-label={`Progresso: ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {finished ? (
        <div className="quiz-result">
          <div className="quiz-result-icon"><CheckCircle2 aria-hidden="true" /></div>
          <span className="quiz-eyebrow">Quiz concluído</span>
          <strong>{score}/{QUESTIONS.length}</strong>
          <p>{score >= 10 ? 'Você demonstrou domínio das regras centrais de leitura do Observatório.' : score >= 7 ? 'Você já domina boa parte da leitura. Use as fontes para aprofundar os pontos restantes.' : 'Vale revisar fontes, datas, denominadores e metodologia antes de avançar.'}</p>
          <div className="quiz-actions">
            <button type="button" onClick={restart}><RotateCcw aria-hidden="true" /> Refazer</button>
            <button type="button" onClick={share} className="secondary"><Share2 aria-hidden="true" /> Compartilhar</button>
          </div>
        </div>
      ) : (
        <div className="quiz-question">
          <div className="quiz-meta"><span>{question.difficulty}</span><span>{question.category}</span><span>{question.sourceLabel}</span></div>
          <h3>{question.prompt}</h3>
          <div className="quiz-options">
            {options.map(option => {
              const isSelected = selected === option;
              const isCorrect = selected && option === question.answer;
              return (
                <button key={option} type="button" onClick={() => answer(option)} className={`quiz-option ${isSelected ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''}`} disabled={Boolean(selected)}>
                  <span className="quiz-option-dot" aria-hidden="true" />
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
          {selected && <div className={`quiz-feedback ${selected === question.answer ? 'correct' : 'wrong'}`} role="status">
            <strong>{selected === question.answer ? 'Resposta correta' : 'Revise este ponto'}</strong>
            <p>{question.explanation}</p>
            <a href={`#${question.anchor}`}>Abrir {question.sourceLabel} <ExternalLink aria-hidden="true" /></a>
          </div>}
          <div className="quiz-footer">
            <span>{selected ? 'Resposta registrada' : 'Escolha uma alternativa'}</span>
            <button type="button" onClick={next} disabled={!selected}>Próxima <ExternalLink aria-hidden="true" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
