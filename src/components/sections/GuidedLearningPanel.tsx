import { ArrowRight, BookOpen, BookOpenCheck, Compass, GraduationCap, Lightbulb, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { STORAGE_NAMESPACE } from '../../config/version';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { navigateToCleanSection } from '../../lib/sectionNavigation';

const STORAGE_KEY = `${STORAGE_NAMESPACE}-guided-learning-visited`;

const dataTerms = [
  { label: 'Atual', description: 'Referência corrente no conjunto; a data ainda precisa ser conferida.' },
  { label: 'Histórico', description: 'Registro de período anterior, preservado para contexto ou comparação.' },
  { label: 'Recorte datado', description: 'Captura válida para uma data específica; não significa atualização em tempo real.' },
  { label: 'Derivado', description: 'Cálculo produzido a partir de valores e premissas identificadas.' },
  { label: 'Planejado', description: 'Meta, previsão ou autorização; não equivale automaticamente a execução.' },
] as const;

const steps = [
  {
    id: 'valor',
    target: 'resumo',
    action: 'Ir ao resumo',
    skill: 'Leitura',
    question: 'O que este número mede — e em qual unidade?',
    title: '1. Identifique o que o número mede',
    description: 'Comece pelo valor e pela unidade. Evite comparar antes de saber exatamente o que está sendo contado.',
    hint: 'Procure o nome completo do indicador, a unidade — como habitantes, eleitores ou reais — e o valor mostrado.',
  },
  {
    id: 'referencia',
    target: 'dashboard',
    action: 'Ir aos indicadores',
    skill: 'Tempo',
    question: 'De quando é o dado e qual é a sua natureza?',
    title: '2. Confira período e natureza',
    description: 'Veja a data de referência e se o indicador é publicado, histórico, planejado, recorte datado ou derivado.',
    hint: 'Localize o mês, ano ou data exata. “Atual” ainda precisa ser lido junto da referência indicada no cartão.',
  },
  {
    id: 'contexto',
    target: 'eleitorado',
    action: 'Ver eleitorado',
    skill: 'Recorte',
    question: 'Estou comparando universos e bases equivalentes?',
    title: '3. Separe universos e recortes',
    description: 'Observe população, eleitorado e outros universos separadamente. Diferenças de base não são erro automático.',
    hint: 'Confira território, período e grupo contado. População e eleitorado são bases diferentes e não medem comparecimento.',
  },
  {
    id: 'utilidade',
    target: 'acao',
    action: 'Abrir serviços',
    skill: 'Utilidade',
    question: 'Qual canal oficial atende a necessidade prática?',
    title: '4. Leve a informação ao serviço certo',
    description: 'Use os canais oficiais quando a necessidade for prática: atendimento, documentos, saúde, assistência ou transparência.',
    hint: 'Leia o que o serviço resolve e confirme se o link leva ao órgão municipal, estadual ou federal responsável.',
  },
  {
    id: 'fonte',
    target: 'fontes',
    action: 'Conferir fontes',
    skill: 'Verificação',
    question: 'Quem publicou, quando e com quais limitações?',
    title: '5. Confira a origem',
    description: 'Abra a fonte, confirme instituição e data e leia as limitações antes de usar o número em uma conclusão.',
    hint: 'Procure instituição, data de publicação, método e limitações. A data da publicação pode ser diferente do período medido.',
  },
  {
    id: 'quiz',
    target: 'quiz',
    action: 'Fazer o quiz',
    skill: 'Revisão',
    question: 'Consigo reconhecer valor, período, natureza e fonte?',
    title: '6. Teste a compreensão',
    description: 'Use o quiz de educação cívica para revisar conceitos. A pontuação é pessoal e não indica preferência política.',
    hint: 'Tente responder com base no cartão e depois leia a explicação. O quiz revisa conceitos; não mede preferência política.',
  },
] as const;

type GuidedStepId = typeof steps[number]['id'];

function readVisited(): GuidedStepId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = new Set<GuidedStepId>(steps.map(step => step.id));
    return parsed.filter((value): value is GuidedStepId => valid.has(value));
  } catch {
    return [];
  }
}

export function GuidedLearningPanel() {
  const { mode } = useLanguageMode();
  const [visited, setVisited] = useState<GuidedStepId[]>(readVisited);

  const visitedSet = useMemo(() => new Set(visited), [visited]);
  const nextUnvisitedStep = steps.find(step => !visitedSet.has(step.id));
  const continueStep = nextUnvisitedStep ?? steps[0];
  const allVisited = visitedSet.size === steps.length;
  const progress = Math.round((visitedSet.size / steps.length) * 100);
  const hasProgress = visitedSet.size > 0;

  if (mode !== 'guided') return null;

  const openStep = (step: typeof steps[number]) => {
    const nextVisited = visitedSet.has(step.id) ? visited : [...visited, step.id];
    setVisited(nextVisited);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVisited)); } catch {}
    navigateToCleanSection(step.target);
  };

  const reset = () => {
    setVisited([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <section id="aprendizado-guiado" className="guided-learning mx-auto max-w-7xl px-4 pb-4 sm:px-6" aria-labelledby="guided-learning-title">
      <div className="guided-learning-shell">
        <div className="guided-learning-head">
          <div>
            <span className="guided-learning-eyebrow"><GraduationCap aria-hidden="true" /> Aprendizado guiado</span>
            <h2 id="guided-learning-title">Expedição pelos dados públicos</h2>
            <p>Cada parada traz uma pergunta, uma pista opcional e um lugar para investigar. Explore no seu ritmo; os dados e as fontes continuam os mesmos.</p>
            {hasProgress && !allVisited ? <small className="guided-learning-resume">Sua rota: {visitedSet.size} de {steps.length} paradas já abertas.</small> : null}
          </div>
          <div
            className="guided-learning-progress"
            role="progressbar"
            aria-label="Progresso da rota de investigação"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={visitedSet.size}
            aria-valuetext={`${visitedSet.size} de ${steps.length} paradas abertas`}
          >
            <strong>{visitedSet.size}/{steps.length}</strong>
            <span>paradas abertas</span>
            <div aria-hidden="true"><i style={{ width: progress + '%' }} /></div>
          </div>
        </div>

        <div className="guided-learning-next-card" aria-live="polite">
          <span><Compass aria-hidden="true" /> {allVisited ? 'Rota percorrida' : hasProgress ? 'Continue sua expedição' : 'Próxima parada'}</span>
          <strong>{allVisited ? 'Você abriu as seis paradas' : continueStep.title}</strong>
          <small>{allVisited ? 'Isso registra as paradas abertas, não uma nota nem uma avaliação de conhecimento. Você pode voltar a qualquer ponto.' : continueStep.question}</small>
        </div>

        <details className="guided-learning-glossary">
            <summary>Kit de pistas: entenda os rótulos</summary>
          <div>
            {dataTerms.map(term => (
              <span key={term.label}>
                <strong>{term.label}</strong>
                <small>{term.description}</small>
              </span>
            ))}
          </div>
        </details>

        <div className="guided-learning-route-heading">
          <div>
            <span><Compass aria-hidden="true" /> Rota de investigação</span>
            <p>Seis paradas curtas para observar, conferir e usar dados com cuidado.</p>
          </div>
          <small>Sem corrida. Avance no seu ritmo.</small>
        </div>

        <ol className="guided-learning-grid" aria-label="Seis paradas da rota de investigação">
          {steps.map((step, index) => {
            const done = visitedSet.has(step.id);
            const isNext = !allVisited && nextUnvisitedStep?.id === step.id;
            return (
              <li key={step.id} className={`guided-learning-stop ${done ? 'is-opened' : ''} ${isNext ? 'is-next' : ''}`}>
                <span className="guided-learning-stop-marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div className="guided-learning-stop-card">
                  <button
                    type="button"
                    className={`guided-learning-step ${done ? 'is-opened' : ''} ${isNext ? 'is-next' : ''}`}
                    onClick={() => openStep(step)}
                    aria-label={`${done ? 'Revisar' : 'Abrir'}: ${step.title}. ${step.action}. Pergunta-guia: ${step.question}`}
                    aria-current={isNext ? 'step' : undefined}
                  >
                    <span className="guided-learning-copy">
                      <em>{isNext ? 'Sua próxima parada' : done ? 'Destino aberto' : step.skill}</em>
                      <strong>{step.title.replace(/^\d+\.\s*/, '')}</strong>
                      <small className="guided-learning-question">{step.question}</small>
                      <small>{step.description}</small>
                      <span className="guided-learning-step-action">{step.action}<ArrowRight aria-hidden="true" /></span>
                    </span>
                    <span className="guided-learning-check" aria-hidden="true">{done ? <BookOpen /> : <BookOpenCheck />}</span>
                  </button>
                  <details className="guided-learning-hint">
                    <summary><Lightbulb aria-hidden="true" /> Abrir uma pista · {step.skill}</summary>
                    <p>{step.hint}</p>
                  </details>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="guided-learning-footer">
          <p><strong>Jogo limpo:</strong> a rota ensina a ler e verificar dados públicos. O progresso registra apenas as paradas abertas; não confirma a leitura nem avalia o que você aprendeu. O modo não recomenda candidaturas, partidos, posições políticas ou escolhas eleitorais.</p>
          <div>
            <button type="button" className="guided-learning-reset" onClick={reset} disabled={visited.length === 0}>
              <RotateCcw aria-hidden="true" /> Reiniciar trilha
            </button>
            <button type="button" className="guided-learning-next" onClick={() => openStep(continueStep)}>
              {allVisited ? 'Revisar rota · parada 1' : hasProgress ? `Retomar · ${continueStep.title.replace(/^\d+\.\s*/, '')}` : `Começar · ${continueStep.title.replace(/^\d+\.\s*/, '')}`}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
