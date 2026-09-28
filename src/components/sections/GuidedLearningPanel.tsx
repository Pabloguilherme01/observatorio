import { ArrowRight, BookOpenCheck, CheckCircle2, GraduationCap, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { STORAGE_NAMESPACE } from '../../config/version';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { navigateToCleanSection } from '../../lib/sectionNavigation';

const STORAGE_KEY = `${STORAGE_NAMESPACE}-guided-learning-visited`;

const steps = [
  {
    id: 'valor',
    target: 'resumo',
    title: '1. Identifique o que o número mede',
    description: 'Comece pelo valor e pela unidade. Evite comparar antes de saber exatamente o que está sendo contado.',
  },
  {
    id: 'referencia',
    target: 'dashboard',
    title: '2. Confira período e natureza',
    description: 'Veja a data de referência e se o indicador é publicado, histórico, planejado, recorte datado ou derivado.',
  },
  {
    id: 'contexto',
    target: 'eleitorado',
    title: '3. Separe universos e recortes',
    description: 'Observe população, eleitorado e outros universos separadamente. Diferenças de base não são erro automático.',
  },
  {
    id: 'utilidade',
    target: 'acao',
    title: '4. Leve a informação ao serviço certo',
    description: 'Use os canais oficiais quando a necessidade for prática: atendimento, documentos, saúde, assistência ou transparência.',
  },
  {
    id: 'fonte',
    target: 'fontes',
    title: '5. Confira a origem',
    description: 'Abra a fonte, confirme instituição e data e leia as limitações antes de usar o número em uma conclusão.',
  },
  {
    id: 'quiz',
    target: 'quiz',
    title: '6. Teste a compreensão',
    description: 'Use o quiz de educação cívica para revisar conceitos. A pontuação é pessoal e não indica preferência política.',
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
  const nextStep = steps.find(step => !visitedSet.has(step.id)) ?? steps[0];
  const progress = Math.round((visitedSet.size / steps.length) * 100);

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
            <h2 id="guided-learning-title">Como ler dados públicos em etapas</h2>
            <p>A trilha organiza a navegação; os valores continuam vindo dos mesmos cards, fontes e métodos dos outros modos.</p>
          </div>
          <div className="guided-learning-progress" aria-label={`${visitedSet.size} de ${steps.length} etapas visitadas`}>
            <strong>{visitedSet.size}/{steps.length}</strong>
            <span>etapas visitadas</span>
            <div aria-hidden="true"><i style={{ width: progress + '%' }} /></div>
          </div>
        </div>

        <div className="guided-learning-grid">
          {steps.map(step => {
            const done = visitedSet.has(step.id);
            return (
              <button
                key={step.id}
                type="button"
                className={`guided-learning-step ${done ? 'is-visited' : ''}`}
                onClick={() => openStep(step)}
                aria-label={`${done ? 'Revisar' : 'Abrir'}: ${step.title}`}
              >
                <span className="guided-learning-check" aria-hidden="true">{done ? <CheckCircle2 /> : <BookOpenCheck />}</span>
                <span className="guided-learning-copy"><strong>{step.title}</strong><small>{step.description}</small></span>
                <ArrowRight aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="guided-learning-footer">
          <p><strong>Neutralidade:</strong> este modo ensina como ler e verificar dados. Ele não recomenda candidaturas, partidos, posições políticas ou escolhas eleitorais.</p>
          <div>
            <button type="button" className="guided-learning-reset" onClick={reset} disabled={visited.length === 0}>
              <RotateCcw aria-hidden="true" /> Reiniciar trilha
            </button>
            <button type="button" className="guided-learning-next" onClick={() => openStep(nextStep)}>
              {visitedSet.size === steps.length ? 'Revisar desde o início' : `Continuar · ${nextStep.title.replace(/^\d+\.\s*/, '')}`}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
