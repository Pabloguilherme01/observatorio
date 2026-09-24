import { CheckCircle2, ExternalLink, RotateCcw, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

type Difficulty = 'Fácil' | 'Médio' | 'Avançado';

type Question = {
  readonly difficulty: Difficulty;
  readonly category: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answer: string;
  readonly explanation: string;
  readonly anchor: string;
  readonly sourceId: string;
  readonly sourceLabel: string;
};

const population2026 = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
const population2022 = d.populationSeries.find(point => point.year === 2022)?.value ?? 0;
const density2026 = Number(d.indicators.find(item => item.id === 'density')?.value ?? 0);
const budgetPerCapita = population2026 > 0 ? d.budget.totalBrl / population2026 : 0;
const currentStatedBeds = d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds;

const sourceUrl = (sourceId: string) => d.sources.find(source => source.id === sourceId)?.url;

const QUESTIONS: readonly Question[] = [
  {
    difficulty: 'Fácil',
    category: 'Cidade',
    prompt: 'Qual é a população estimada de Águas Lindas de Goiás para 2026?',
    options: [formatNumber(population2026), formatNumber(population2022), '245.352'],
    answer: formatNumber(population2026),
    explanation: 'A edição usa a estimativa IBGE 2026, com referência em 1º de julho de 2026.',
    anchor: 'dashboard',
    sourceId: 'ibge-estimativas-2026',
    sourceLabel: 'IBGE · população 2026',
  },
  {
    difficulty: 'Fácil',
    category: 'Eleitorado',
    prompt: 'Quantos eleitores aparecem no snapshot local de 2026?',
    options: [formatNumber(d.electoral.electorate), formatNumber(d.electoral.tseConsolidated), formatNumber(d.electoral.electorate2024 ?? 0)],
    answer: formatNumber(d.electoral.electorate),
    explanation: 'O recorte da 28ª Zona usado nesta edição registra 125.062 eleitores em 15/07/2026.',
    anchor: 'eleitorado',
    sourceId: 'tse-eleitorado-2026',
    sourceLabel: 'TSE · Eleitorado 2026',
  },
  {
    difficulty: 'Fácil',
    category: 'Orçamento',
    prompt: 'Qual é o total informado para a LOA municipal de 2026?',
    options: [formatCurrency(d.budget.totalBrl), formatCurrency(691558004.38), formatCurrency(825112043.1)],
    answer: formatCurrency(d.budget.totalBrl),
    explanation: 'A LOA é planejamento orçamentário. Ela não deve ser confundida com despesa efetivamente executada.',
    anchor: 'orcamento',
    sourceId: 'loa-2026',
    sourceLabel: 'LOA municipal · 2026',
  },
  {
    difficulty: 'Fácil',
    category: 'Transporte',
    prompt: 'Qual tarifa por trecho o Observatório usa para Águas Lindas → Brasília / Plano Piloto?',
    options: [formatCurrency(11.45), formatCurrency(7.65), formatCurrency(5.85)],
    answer: formatCurrency(11.45),
    explanation: 'O simulador usa R$ 11,45 por trecho para Brasília, segundo a tarifa registrada pela UTB.',
    anchor: 'transporte',
    sourceId: 'utb-tarifas',
    sourceLabel: 'UTB · tarifas',
  },
  {
    difficulty: 'Fácil',
    category: 'Saneamento',
    prompt: 'Qual é o acesso à água no recorte SINISA 2024?',
    options: [formatPercent(d.sanitation.waterAccessPct, 1), formatPercent(d.sanitation.publicSewerServicePct, 1), formatPercent(d.sanitation.sewerCollectionPct, 1)],
    answer: formatPercent(d.sanitation.waterAccessPct, 1),
    explanation: 'O recorte SINISA 2024 usado na edição registra 95,8% de acesso à água.',
    anchor: 'saude',
    sourceId: 'sinisa-2024',
    sourceLabel: 'SINISA 2024',
  },
  {
    difficulty: 'Médio',
    category: 'Saneamento',
    prompt: 'Qual é o acesso ao serviço público de esgoto no recorte SINISA 2024?',
    options: [formatPercent(49.69, 2), formatPercent(d.sanitation.publicSewerServicePct, 1), formatPercent(d.sanitation.waterAccessPct, 1)],
    answer: formatPercent(d.sanitation.publicSewerServicePct, 1),
    explanation: 'O indicador de acesso ao serviço público de esgoto é 84,8%. O indicador de esgotamento sanitário adequado do IBGE 2022 é outra definição.',
    anchor: 'saude',
    sourceId: 'sinisa-2024',
    sourceLabel: 'SINISA 2024',
  },
  {
    difficulty: 'Médio',
    category: 'Saneamento',
    prompt: 'Quanto do esgoto gerado aparece como coletado no recorte usado pela edição?',
    options: [formatPercent(d.sanitation.sewerCollectionPct, 1), formatPercent(d.sanitation.collectedSewerTreatedPct, 1), formatPercent(d.sanitation.publicSewerServicePct, 1)],
    answer: formatPercent(d.sanitation.sewerCollectionPct, 1),
    explanation: 'Coleta, tratamento e acesso ao serviço são métricas distintas e não devem ser somadas como se fossem uma única cobertura.',
    anchor: 'saude',
    sourceId: 'sinisa-2024',
    sourceLabel: 'SINISA 2024',
  },
  {
    difficulty: 'Médio',
    category: 'Eleitorado',
    prompt: 'Qual faixa etária concentra mais eleitores no snapshot desta edição?',
    options: ['Até 24 anos', '25–59 anos', '60 anos ou mais'],
    answer: '25–59 anos',
    explanation: 'A faixa de 25–59 anos reúne 86.928 eleitores, ou 69,5% do snapshot.',
    anchor: 'eleitorado',
    sourceId: 'tse-eleitorado-2026',
    sourceLabel: 'TSE · perfil eleitoral',
  },
  {
    difficulty: 'Médio',
    category: 'Cidade',
    prompt: 'Qual é a densidade demográfica derivada para 2026 no Observatório?',
    options: [formatNumber(density2026, 1) + ' hab/km²', '1.176,6 hab/km²', '980,2 hab/km²'],
    answer: formatNumber(density2026, 1) + ' hab/km²',
    explanation: 'O valor é derivado de 249.978 habitantes divididos por 191,817 km². Não é o indicador oficial do Censo 2022.',
    anchor: 'dashboard',
    sourceId: 'ibge-estimativas-2026',
    sourceLabel: 'Cálculo · IBGE 2026',
  },
  {
    difficulty: 'Médio',
    category: 'Orçamento',
    prompt: 'Quanto a LOA 2026 representa por habitante na razão de planejamento usada pelo Observatório?',
    options: [formatCurrency(budgetPerCapita), formatCurrency(d.budget.totalBrl / (d.electoral.electorate || 1)), formatCurrency(124.7)],
    answer: formatCurrency(budgetPerCapita),
    explanation: 'É a LOA 2026 dividida pela população estimada de 2026. Essa razão não mede gasto realizado por pessoa.',
    anchor: 'orcamento',
    sourceId: 'loa-2026',
    sourceLabel: 'Cálculo · LOA ÷ população',
  },
  {
    difficulty: 'Médio',
    category: 'Saúde',
    prompt: 'Quantos leitos são explicitados atualmente no portal do HEAL na modelagem desta edição?',
    options: [String(currentStatedBeds), String(d.health.openingReportedBeds), String(d.health.plannedBeds ?? 0)],
    answer: String(currentStatedBeds),
    explanation: 'A modelagem atual explicita 32 leitos de enfermaria e 53 de UTI, totalizando 85. O 164 e o 298 têm naturezas distintas.',
    anchor: 'saude',
    sourceId: 'healgo',
    sourceLabel: 'SES-GO · HEAL',
  },
  {
    difficulty: 'Avançado',
    category: 'Método',
    prompt: 'Qual afirmação descreve corretamente a série populacional usada na edição?',
    options: ['2022 é Censo; 2025 e 2026 são estimativas.', 'Todos os anos são contagens censitárias.', '2026 é uma projeção do próprio Observatório.'],
    answer: '2022 é Censo; 2025 e 2026 são estimativas.',
    explanation: 'A natureza do ponto acompanha a natureza informada pelo IBGE e fica separada na interface.',
    anchor: 'dashboard',
    sourceId: 'ibge-estimativas-2026',
    sourceLabel: 'IBGE · metodologia',
  },
  {
    difficulty: 'Avançado',
    category: 'Pesquisa',
    prompt: 'Como a pesquisa GO-04133/2026 deve aparecer no Observatório?',
    options: ['Como snapshot histórico com data, amostra e contexto jurídico.', 'Como resultado oficial da eleição.', 'Como previsão automática do resultado.'],
    answer: 'Como snapshot histórico com data, amostra e contexto jurídico.',
    explanation: 'O conjunto tem uma única fotografia de 25/08/2026, 400 entrevistas, e o painel preserva o contexto jurídico da divulgação sem transformá-lo em previsão.',
    anchor: 'politica',
    sourceId: 'tse-pesquisas-2026',
    sourceLabel: 'TSE · Pesquisas 2026',
  },
  {
    difficulty: 'Avançado',
    category: 'Pesquisa',
    prompt: 'O que acontece com os 7,75 pontos percentuais não classificados no snapshot da pesquisa?',
    options: ['Ficam explícitos como “não classificados”.', 'São redistribuídos entre os candidatos.', 'Viraram votos válidos.'],
    answer: 'Ficam explícitos como “não classificados”.',
    explanation: 'A edição evita completar a distribuição por inferência e mantém os 7,75 p.p. visíveis como categoria residual do snapshot.',
    anchor: 'politica',
    sourceId: 'tse-pesquisas-2026',
    sourceLabel: 'Pesquisa · snapshot',
  },
  {
    difficulty: 'Avançado',
    category: 'Candidatos',
    prompt: 'O recorte atual de candidatos representa o universo municipal completo?',
    options: ['Não. É uma watchlist estadual com vínculo local documental.', 'Sim. É o cadastro municipal completo do TSE.', 'Sim. Todos os candidatos de Goiás foram reduzidos por inferência municipal.'],
    answer: 'Não. É uma watchlist estadual com vínculo local documental.',
    explanation: 'O snapshot lido é estadual e o vínculo local é sustentado por evidência documental separada. O painel não deve chamar esse conjunto de universo municipal completo.',
    anchor: 'candidaturas',
    sourceId: 'tse-candidatos-2026',
    sourceLabel: 'TSE · Candidatos 2026',
  },
  {
    difficulty: 'Avançado',
    category: 'Candidatos',
    prompt: 'Quantos nomes aparecem no recorte local acompanhado nesta edição?',
    options: [String(d.candidates.length), '5', '12'],
    answer: String(d.candidates.length),
    explanation: 'O snapshot atual acompanha sete nomes estaduais com evidência documental de vínculo local.',
    anchor: 'candidaturas',
    sourceId: 'tse-candidatos-2026',
    sourceLabel: 'TSE · snapshot de candidaturas',
  },
  {
    difficulty: 'Avançado',
    category: 'Fontes',
    prompt: 'Qual elemento vem antes da interpretação de um indicador?',
    options: ['Fonte, data de referência, natureza do dado e limitação.', 'Somente o valor numérico.', 'Somente o gráfico usado na página.'],
    answer: 'Fonte, data de referência, natureza do dado e limitação.',
    explanation: 'A edição foi desenhada para preservar a proveniência antes de qualquer leitura interpretativa.',
    anchor: 'fontes',
    sourceId: 'tse-candidatos-2026',
    sourceLabel: 'Mapa de evidências',
  },
  {
    difficulty: 'Avançado',
    category: 'Orçamento',
    prompt: 'Uma dotação da LOA deve ser lida automaticamente como gasto realizado?',
    options: ['Não. É planejamento, não execução financeira.', 'Sim. Toda LOA é gasto já pago.', 'Sim. Toda dotação é serviço entregue.'],
    answer: 'Não. É planejamento, não execução financeira.',
    explanation: 'A própria camada de orçamento informa que alocação orçamentária não é execução financeira nem resultado do serviço.',
    anchor: 'orcamento',
    sourceId: 'loa-2026',
    sourceLabel: 'LOA · metodologia',
  },
] as const;

function shuffledOptions(question: Question, index: number): readonly string[] {
  const offset = (index * 3) % question.options.length;
  return question.options.map((_, position) => question.options[(position + offset) % question.options.length]);
}

export function QuickQuiz() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [category, setCategory] = useState('Todas');

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(QUESTIONS.map(question => question.category)))], []);
  const available = useMemo(
    () => category === 'Todas' ? QUESTIONS : QUESTIONS.filter(question => question.category === category),
    [category],
  );
  const question = available[step];
  const options = useMemo(
    () => shuffledOptions(question ?? available[0] ?? QUESTIONS[0], step),
    [available, question, step],
  );
  const progress = finished ? 100 : Math.round(((step + 1) / Math.max(available.length, 1)) * 100);

  const answer = (value: string) => {
    if (selected || !question) return;
    setSelected(value);
    if (value === question.answer) setScore(current => current + 1);
  };

  const next = () => {
    if (!selected || !question) return;
    if (step === available.length - 1) setFinished(true);
    else {
      setStep(current => current + 1);
      setSelected(null);
    }
  };

  const chooseCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const share = async () => {
    const text = \`Completei o Quiz do Observatório: \${score}/\${available.length} acertos.\`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Quiz do Observatório', text, url: window.location.href + '#quiz' });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text + ' ' + window.location.href + '#quiz');
      }
    } catch {}
  };

  const source = question ? d.sources.find(item => item.id === question.sourceId) : undefined;
  const questionSourceUrl = sourceUrl(question?.sourceId ?? '');

  return (
    <section id="quiz" aria-labelledby="quiz-title" className="quiz-premium scroll-mt-24">
      <div className="quiz-premium-head">
        <div>
          <span className="quiz-eyebrow">Interativo · {QUESTIONS.length} perguntas · edição {d.meta.updatedAt.split('-').reverse().join('/')}</span>
          <h2 id="quiz-title">Aprenda a ler os dados</h2>
          <p>Questões baseadas nos números, fontes e regras de leitura desta edição. A resposta mostra a explicação na hora.</p>
        </div>
        {!finished && <span className="quiz-counter">{step + 1}/{available.length}</span>}
      </div>

      <div className="quiz-categories" role="tablist" aria-label="Filtrar perguntas por categoria">
        {categories.map(item => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            className={category === item ? 'is-active' : ''}
            onClick={() => chooseCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="quiz-progress-track" aria-label={\`Progresso: \${progress}%\`}>
        <span style={{ width: \`\${progress}%\` }} />
      </div>

      {finished ? (
        <div className="quiz-result">
          <div className="quiz-result-icon"><CheckCircle2 aria-hidden="true" /></div>
          <span className="quiz-eyebrow">Quiz concluído</span>
          <strong>{score}/{available.length}</strong>
          <p>{score === available.length ? 'Você acertou todas as questões deste recorte.' : 'Revise as explicações e abra as fontes das questões que você errou.'}</p>
          <div className="quiz-actions">
            <button type="button" onClick={restart}><RotateCcw aria-hidden="true" /> Refazer</button>
            <button type="button" onClick={share} className="secondary"><Share2 aria-hidden="true" /> Compartilhar</button>
          </div>
        </div>
      ) : question ? (
        <div className="quiz-question">
          <div className="quiz-meta">
            <span>{question.difficulty}</span>
            <span>{question.category}</span>
            <span>{question.sourceLabel}</span>
          </div>
          <h3>{question.prompt}</h3>

          <div className="quiz-options">
            {options.map(option => {
              const isSelected = selected === option;
              const isCorrect = Boolean(selected) && option === question.answer;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => answer(option)}
                  className={\`quiz-option \${isSelected ? 'is-selected' : ''} \${isCorrect ? 'is-correct' : ''}\`}
                  disabled={Boolean(selected)}
                  aria-pressed={isSelected}
                >
                  <span className="quiz-option-dot" aria-hidden="true" />
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className={\`quiz-feedback \${selected === question.answer ? 'correct' : 'wrong'}\`} role="status">
              <strong>{selected === question.answer ? 'Resposta correta' : 'Revise este ponto'}</strong>
              <p>{question.explanation}</p>
              {questionSourceUrl ? (
                <a href={questionSourceUrl} target="_blank" rel="noopener noreferrer">
                  Conferir fonte · {source?.label ?? question.sourceLabel} <ExternalLink aria-hidden="true" />
                </a>
              ) : (
                <a href={\`#\${question.anchor}\`}>Abrir contexto <ExternalLink aria-hidden="true" /></a>
              )}
            </div>
          )}

          <div className="quiz-footer">
            <span>{selected ? 'Resposta registrada' : 'Escolha uma alternativa'}</span>
            <button type="button" onClick={next} disabled={!selected}>
              {step === available.length - 1 ? 'Ver resultado' : 'Próxima'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
