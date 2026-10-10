import '../../assets/styles/guided-mode.css';
import { ArrowRight, BookOpen, BookOpenCheck, Compass, GraduationCap, Lightbulb, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { STORAGE_NAMESPACE } from '../../config/version';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { navigateToCleanSection } from '../../lib/sectionNavigation';

const STORAGE_KEY = `${STORAGE_NAMESPACE}-guided-learning-visited`;

const dataTerms = [
  { label: 'Publicado', description: 'Valor incluído no conjunto; confira sua referência, sem presumir atualidade.' },
  { label: 'Histórico', description: 'Registro de período anterior, preservado para contexto ou comparação.' },
  { label: 'Recorte datado', description: 'Captura válida para uma data específica; não significa atualização em tempo real.' },
  { label: 'Derivado', description: 'Cálculo produzido a partir de valores e premissas identificadas.' },
  { label: 'Planejado', description: 'Meta, previsão ou autorização; não equivale automaticamente a execução.' },
] as const;

const steps = [
  {
    "id": "valor",
    "target": "resumo",
    "action": "Ir ao resumo",
    "skill": "Leitura",
    "question": "O que este número mede?",
    "title": "1. Identifique o indicador",
    "description": "Leia nome, valor e unidade antes de tirar conclusões.",
    "hint": "Habitantes, reais, quilômetros quadrados e porcentagens representam medidas diferentes."
  },
  {
    "id": "referencia",
    "target": "dashboard",
    "action": "Ver indicadores",
    "skill": "Tempo",
    "question": "De quando é o dado?",
    "title": "2. Confira o período",
    "description": "Procure data de referência ou ano-base. A publicação pode ocorrer depois do período medido.",
    "hint": "Sem referência informada, não trate o valor como retrato atual."
  },
  {
    "id": "significado",
    "target": "orcamento",
    "action": "Ver orçamento",
    "skill": "Significado",
    "question": "O que o valor permite concluir?",
    "title": "3. Entenda o significado",
    "description": "Separe contagem, estimativa, planejamento e execução. A LOA autoriza recursos; não comprova pagamento.",
    "hint": "Leia as notas do indicador e não transforme previsão em resultado realizado."
  },
  {
    "id": "comparacao",
    "target": "dashboard",
    "action": "Comparar indicadores",
    "skill": "Comparação",
    "question": "As medidas são compatíveis?",
    "title": "4. Compare medidas compatíveis",
    "description": "Confira unidade, território, período, universo e método. Censo e estimativa têm naturezas diferentes.",
    "hint": "Totais, taxas e percentuais respondem a perguntas diferentes; mantenha as bases explícitas."
  },
  {
    "id": "utilidade",
    "target": "acao",
    "action": "Encontrar serviços",
    "skill": "Utilidade",
    "question": "Qual canal atende esta necessidade?",
    "title": "5. Encontre o serviço",
    "description": "Leia a descrição e abra o canal institucional responsável por atendimento e orientações.",
    "hint": "O catálogo encaminha à fonte oficial; não garante disponibilidade ou prazo individual."
  },
  {
    "id": "fonte",
    "target": "fontes",
    "action": "Conferir fontes",
    "skill": "Verificação",
    "question": "Quem publicou e com quais limites?",
    "title": "6. Confira a fonte",
    "description": "Abra a origem, confira instituição, referência e método antes de compartilhar uma conclusão.",
    "hint": "A data de consulta da página não altera o período do indicador."
  },
  {
    "id": "quiz",
    "target": "quiz",
    "action": "Praticar no quiz",
    "skill": "Prática",
    "question": "Consigo explicar valor, período, natureza e fonte?",
    "title": "7. Pratique a leitura",
    "description": "As cinco fases ajudam a começar, entender, comparar, conferir e aplicar a leitura dos dados.",
    "hint": "Depois de responder, leia a explicação e consulte a fonte."
  }
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
          <strong>{allVisited ? 'Você abriu as sete paradas' : continueStep.title}</strong>
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
            <p>Sete paradas curtas para observar, conferir e usar dados com cuidado.</p>
          </div>
          <small>Sem corrida. Avance no seu ritmo.</small>
        </div>

        <ol className="guided-learning-grid" aria-label="Sete paradas da rota de investigação">
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
          <p><strong>Jogo limpo:</strong> a rota ensina a ler e verificar dados públicos. O progresso registra apenas as paradas abertas; não confirma a leitura nem avalia o que você aprendeu.</p>
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
