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
  { difficulty:'Fácil', prompt:'Ao abrir um indicador público, qual é a primeira dupla de informações que ajuda a interpretar o número?', options:['Fonte e data de referência','Cor e tamanho do gráfico','Título e animação'], answer:'Fonte e data de referência', explanation:'A origem e a data permitem saber quem publicou o dado e qual recorte temporal ele representa.', anchor:'fontes', sourceLabel:'Fontes e metodologia' },
  { difficulty:'Fácil', prompt:'O que uma LOA representa?', options:['Planejamento orçamentário do exercício','Gasto já realizado em todos os programas','Resultado de uma pesquisa eleitoral'], answer:'Planejamento orçamentário do exercício', explanation:'A Lei Orçamentária Anual estima receitas e fixa despesas para o exercício. Ela não equivale automaticamente ao gasto realizado.', anchor:'orcamento', sourceLabel:'Orçamento' },
  { difficulty:'Fácil', prompt:'O que é um snapshot de dados?', options:['Um recorte registrado em determinada data','Uma previsão do que acontecerá','Um resultado eleitoral definitivo'], answer:'Um recorte registrado em determinada data', explanation:'Snapshot é uma fotografia da base no momento da captura.', anchor:'dados', sourceLabel:'Dados e atualizações' },
  { difficulty:'Fácil', prompt:'Por que um cálculo derivado precisa mostrar suas premissas?', options:['Para permitir conferência e reprodução','Para parecer mais técnico','Para substituir a fonte original'], answer:'Para permitir conferência e reprodução', explanation:'Premissas e fórmula permitem que outra pessoa confira como o resultado foi obtido.', anchor:'qualidade', sourceLabel:'Qualidade dos dados' },
  { difficulty:'Médio', prompt:'Por que dois percentuais podem não ser diretamente comparáveis?', options:['Porque podem usar períodos ou denominadores diferentes','Porque percentuais nunca podem ser comparados','Porque o maior percentual sempre é mais relevante'], answer:'Porque podem usar períodos ou denominadores diferentes', explanation:'A comparação depende de período, universo, denominador e metodologia compatíveis.', anchor:'principios', sourceLabel:'Princípios' },
  { difficulty:'Médio', prompt:'O que diferencia abstenção de voto branco?', options:['Abstenção é não comparecer; branco é um voto registrado sem escolha de candidatura','São exatamente a mesma coisa','Abstenção é voto anulado'], answer:'Abstenção é não comparecer; branco é um voto registrado sem escolha de candidatura', explanation:'Abstenção ocorre quando o eleitor não comparece. Voto branco ocorre dentro da votação.', anchor:'eleitorado', sourceLabel:'Eleitorado' },
  { difficulty:'Médio', prompt:'O que uma fonte oficial do TSE permite conferir?', options:['Registros eleitorais publicados pela Justiça Eleitoral','Uma previsão de quem vencerá','A opinião dos eleitores'], answer:'Registros eleitorais publicados pela Justiça Eleitoral', explanation:'O TSE disponibiliza dados oficiais de candidaturas, contas e outros registros eleitorais.', anchor:'fontes', sourceLabel:'TSE' },
  { difficulty:'Médio', prompt:'Por que o Observatório separa recorte estadual de vínculo local?', options:['Porque uma candidatura estadual não prova, sozinha, uma base municipal','Para criar um ranking de candidatos','Para eliminar candidaturas sem justificativa'], answer:'Porque uma candidatura estadual não prova, sozinha, uma base municipal', explanation:'O projeto trata evidência documental local separadamente para não transformar inferência em fato.', anchor:'politica', sourceLabel:'Candidaturas' },
  { difficulty:'Médio', prompt:'O custo mensal de transporte calculado pelo Observatório é que tipo de informação?', options:['Um cálculo derivado das premissas informadas','Uma despesa oficial individual do cidadão','Um resultado eleitoral'], answer:'Um cálculo derivado das premissas informadas', explanation:'O valor depende de tarifa, frequência, dias e outras premissas escolhidas no calculador.', anchor:'transporte', sourceLabel:'Transporte' },
  { difficulty:'Difícil', prompt:'O que torna uma cadeia de evidências mais auditável?', options:['Fonte identificada, data, natureza do dado e link de conferência','Somente um gráfico visual','Um número sem referência para facilitar a leitura'], answer:'Fonte identificada, data, natureza do dado e link de conferência', explanation:'Esses elementos permitem rastrear o caminho entre a informação publicada e sua apresentação no Observatório.', anchor:'evidencias', sourceLabel:'Evidências' },
  { difficulty:'Difícil', prompt:'Uma pesquisa eleitoral deve ser lida como:', options:['Um levantamento com amostra, metodologia e data próprias','O resultado oficial da eleição','Uma probabilidade calculada automaticamente pelo Observatório'], answer:'Um levantamento com amostra, metodologia e data próprias', explanation:'Pesquisa e resultado oficial são categorias diferentes. A leitura deve considerar ficha técnica, período e situação de divulgação.', anchor:'politica', sourceLabel:'Pesquisas' },
  { difficulty:'Difícil', prompt:'Se uma fonte municipal ainda não confirma determinada informação, qual conduta é mais adequada?', options:['Sinalizar a lacuna e não apresentar a informação como confirmada','Inferir pelo nome ou por uma notícia isolada','Preencher a lacuna com uma estimativa sem aviso'], answer:'Sinalizar a lacuna e não apresentar a informação como confirmada', explanation:'Transparência sobre limitações evita transformar ausência de evidência em certeza.', anchor:'qualidade', sourceLabel:'Qualidade dos dados' },
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
    if (step === QUESTIONS.length - 1) setFinished(true);
    else {
      setStep(current => current + 1);
      setSelected(null);
    }
  }

  function restart() {
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  async function share() {
    const text = `Completei o Quiz do Observatório: ${score}/${QUESTIONS.length} acertos.`;
    if (navigator.share) await navigator.share({ title:'Quiz do Observatório', text, url:location.href });
    else if (navigator.clipboard) await navigator.clipboard.writeText(text + ' ' + location.href);
  }

  return (
    <section id="quiz" aria-labelledby="quiz-title" className="quiz-premium">
      <div className="quiz-premium-head">
        <div>
          <span className="quiz-eyebrow">Interativo · 12 perguntas</span>
          <h2 id="quiz-title">Quiz do Observatório</h2>
          <p>Teste se você consegue interpretar dados públicos sem cair em conclusões automáticas.</p>
        </div>
        {!finished && <span className="quiz-counter">{step + 1}/{QUESTIONS.length}</span>}
      </div>

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
          <div className="quiz-meta"><span>{question.difficulty}</span><span>{question.sourceLabel}</span></div>
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
