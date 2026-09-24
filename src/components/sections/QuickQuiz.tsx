import { CheckCircle2, ExternalLink, RotateCcw, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';

type Difficulty = 'Fácil' | 'Médio' | 'Difícil' | 'Avançado' | 'Expert';

type Seed = {
  readonly category: string;
  readonly label: string;
  readonly value: string;
  readonly numeric?: number;
  readonly unit?: string;
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly anchor: string;
  readonly note: string;
};

type Question = {
  readonly id: string;
  readonly difficulty: Difficulty;
  readonly phase: number;
  readonly category: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answer: string;
  readonly explanation: string;
  readonly anchor: string;
  readonly sourceId: string;
  readonly sourceLabel: string;
};

const fmt = (value: number, digits = 0) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (value: number, digits = 1) => `${fmt(value, digits)}%`;

const indicator = (id: string) => d.indicators.find(item => item.id === id);
const sourceLabel = (id: string) => d.sources.find(source => source.id === id)?.label ?? id;
const sourceUrl = (id: string) => d.sources.find(source => source.id === id)?.url;

const seeds: readonly Seed[] = [
  { category:'Cidade', label:'população estimada de 2026', value:fmt(249978), numeric:249978, unit:'habitantes', sourceId:'ibge-estimativas-2026', sourceLabel:sourceLabel('ibge-estimativas-2026'), anchor:'dashboard', note:'estimativa IBGE com referência em 1º de julho de 2026' },
  { category:'Cidade', label:'população do Censo 2022', value:fmt(225693), numeric:225693, unit:'habitantes', sourceId:'ibge-censo-2022', sourceLabel:sourceLabel('ibge-censo-2022'), anchor:'dashboard', note:'contagem censitária do IBGE em 2022' },
  { category:'Cidade', label:'população do Censo 2010', value:fmt(159378), numeric:159378, unit:'habitantes', sourceId:'ibge-censo-2022', sourceLabel:sourceLabel('ibge-censo-2022'), anchor:'dashboard', note:'contagem censitária do IBGE em 2010' },
  { category:'Cidade', label:'população estimada de 2025', value:fmt(245352), numeric:245352, unit:'habitantes', sourceId:'ibge-estimativas-2026', sourceLabel:sourceLabel('ibge-estimativas-2026'), anchor:'dashboard', note:'estimativa IBGE com referência em 1º de julho de 2025' },
  { category:'Cidade', label:'área territorial', value:'191,817', numeric:191.817, unit:'km²', sourceId:'ibge-cidades-2026', sourceLabel:sourceLabel('ibge-cidades-2026'), anchor:'dashboard', note:'área territorial registrada na base municipal' },
  { category:'Cidade', label:'densidade demográfica oficial do Censo 2022', value:'1.176,61', numeric:1176.61, unit:'hab/km²', sourceId:'ibge-censo-2022', sourceLabel:sourceLabel('ibge-censo-2022'), anchor:'dashboard', note:'indicador oficial do Censo 2022' },
  { category:'Cidade', label:'densidade 2026 derivada', value:fmt(249978/191.817,1), numeric:249978/191.817, unit:'hab/km²', sourceId:'ibge-estimativas-2026', sourceLabel:sourceLabel('ibge-estimativas-2026'), anchor:'dashboard', note:'cálculo da estimativa 2026 dividida pela área; não é o indicador censitário' },
  { category:'Cidade', label:'área urbanizada', value:'43,87', numeric:43.87, unit:'km²', sourceId:'ibge-cidades-2026', sourceLabel:sourceLabel('ibge-cidades-2026'), anchor:'dashboard', note:'recorte histórico registrado na base municipal' },
  { category:'Cidade', label:'arborização de vias públicas', value:'54,66', numeric:54.66, unit:'%', sourceId:'ibge-cidades-2026', sourceLabel:sourceLabel('ibge-cidades-2026'), anchor:'dashboard', note:'indicador histórico com referência no Censo 2022' },
  { category:'Cidade', label:'esgotamento sanitário adequado', value:'49,69', numeric:49.69, unit:'%', sourceId:'ibge-cidades-2026', sourceLabel:sourceLabel('ibge-cidades-2026'), anchor:'dashboard', note:'indicador histórico do Censo 2022' },
  { category:'Eleitorado', label:'eleitorado no snapshot de 2026', value:fmt(125062), numeric:125062, unit:'eleitores', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'snapshot de 15 de julho de 2026 na 28ª Zona Eleitoral' },
  { category:'Eleitorado', label:'eleitorado consolidado do TSE', value:fmt(125501), numeric:125501, unit:'eleitores', sourceId:'reconciliacao-eleitorado-2026', sourceLabel:sourceLabel('reconciliacao-eleitorado-2026'), anchor:'eleitorado', note:'valor consolidado usado na reconciliação' },
  { category:'Eleitorado', label:'eleitorado de 2018', value:fmt(95200), numeric:95200, unit:'eleitores', sourceId:'tse-eleitorado-2018', sourceLabel:sourceLabel('tse-eleitorado-2018'), anchor:'eleitorado', note:'base histórica do TSE' },
  { category:'Eleitorado', label:'eleitorado de 2022', value:fmt(107255), numeric:107255, unit:'eleitores', sourceId:'tse-eleitorado-2022', sourceLabel:sourceLabel('tse-eleitorado-2022'), anchor:'eleitorado', note:'base histórica do TSE' },
  { category:'Eleitorado', label:'eleitorado de 2024', value:fmt(121788), numeric:121788, unit:'eleitores', sourceId:'tse-eleitorado-2024', sourceLabel:sourceLabel('tse-eleitorado-2024'), anchor:'eleitorado', note:'base histórica do TSE' },
  { category:'Eleitorado', label:'eleitores até 24 anos', value:fmt(24265), numeric:24265, unit:'eleitores', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'19,4% do snapshot' },
  { category:'Eleitorado', label:'eleitores de 25 a 59 anos', value:fmt(86928), numeric:86928, unit:'eleitores', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'69,5% do snapshot' },
  { category:'Eleitorado', label:'eleitores de 60 anos ou mais', value:fmt(13869), numeric:13869, unit:'eleitores', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'11,1% do snapshot' },
  { category:'Eleitorado', label:'participação eleitoral de 2024', value:'78,17', numeric:78.17, unit:'%', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'percentual de comparecimento informado para 2024' },
  { category:'Eleitorado', label:'abstenção de 2024', value:'21,83', numeric:21.83, unit:'%', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'percentual separado de votos brancos e nulos' },
  { category:'Eleitorado', label:'votos válidos de 2024', value:fmt(89039), numeric:89039, unit:'votos', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'total registrado no snapshot eleitoral' },
  { category:'Eleitorado', label:'votos brancos de 2024', value:fmt(3230), numeric:3230, unit:'votos', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'categoria separada dos votos válidos' },
  { category:'Eleitorado', label:'votos nulos de 2024', value:fmt(2934), numeric:2934, unit:'votos', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'categoria separada dos votos válidos' },
  { category:'Eleitorado', label:'mulheres no cadastro', value:'52,98', numeric:52.98, unit:'%', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'participação no cadastro eleitoral' },
  { category:'Eleitorado', label:'homens no cadastro', value:'47,02', numeric:47.02, unit:'%', sourceId:'tse-eleitorado-2026', sourceLabel:sourceLabel('tse-eleitorado-2026'), anchor:'eleitorado', note:'participação no cadastro eleitoral' },
  { category:'Transporte', label:'tarifa para Brasília / Plano Piloto', value:money(11.45), numeric:11.45, unit:'R$/trecho', sourceId:'utb-tarifas', sourceLabel:sourceLabel('utb-tarifas'), anchor:'transporte', note:'tarifa usada pelo simulador do Observatório' },
  { category:'Transporte', label:'tarifa para Taguatinga', value:money(7.65), numeric:7.65, unit:'R$/trecho', sourceId:'antt-entorno-2026', sourceLabel:sourceLabel('antt-entorno-2026'), anchor:'transporte', note:'tarifa registrada para o trecho' },
  { category:'Transporte', label:'tarifa para Ceilândia', value:money(5.85), numeric:5.85, unit:'R$/trecho', sourceId:'antt-entorno-2026', sourceLabel:sourceLabel('antt-entorno-2026'), anchor:'transporte', note:'tarifa registrada para o trecho' },
  { category:'Saneamento', label:'acesso à água', value:'95,8', numeric:95.8, unit:'%', sourceId:'sinisa-2024', sourceLabel:sourceLabel('sinisa-2024'), anchor:'saude', note:'SINISA 2024' },
  { category:'Saneamento', label:'acesso ao serviço público de esgoto', value:'84,8', numeric:84.8, unit:'%', sourceId:'sinisa-2024', sourceLabel:sourceLabel('sinisa-2024'), anchor:'saude', note:'SINISA 2024' },
  { category:'Saneamento', label:'esgoto coletado', value:'60,1', numeric:60.1, unit:'%', sourceId:'sinisa-2024', sourceLabel:sourceLabel('sinisa-2024'), anchor:'saude', note:'SINISA 2024' },
  { category:'Saneamento', label:'esgoto coletado que foi tratado', value:'100', numeric:100, unit:'%', sourceId:'sinisa-2024', sourceLabel:sourceLabel('sinisa-2024'), anchor:'saude', note:'não significa 100% do esgoto gerado' },
  { category:'Saneamento', label:'perdas na distribuição de água', value:'40,9', numeric:40.9, unit:'%', sourceId:'sinisa-2024', sourceLabel:sourceLabel('sinisa-2024'), anchor:'saude', note:'SINISA 2024' },
  { category:'Saneamento', label:'hidrometração', value:'99,5', numeric:99.5, unit:'%', sourceId:'sinisa-2024', sourceLabel:sourceLabel('sinisa-2024'), anchor:'saude', note:'SINISA 2024' },
  { category:'Saneamento', label:'consumo de água por pessoa/dia', value:'104,1', numeric:104.1, unit:'litros', sourceId:'sinisa-2024', sourceLabel:sourceLabel('sinisa-2024'), anchor:'saude', note:'média registrada no recorte' },
  { category:'Orçamento', label:'LOA municipal de 2026', value:money(771255334.51), numeric:771255334.51, unit:'R$', sourceId:'loa-2026', sourceLabel:sourceLabel('loa-2026'), anchor:'orcamento', note:'planejamento orçamentário, não execução financeira' },
  { category:'Orçamento', label:'receitas brutas realizadas em 2025', value:money(825112043.10), numeric:825112043.10, unit:'R$', sourceId:'ibge-cidades-2026', sourceLabel:sourceLabel('ibge-cidades-2026'), anchor:'orcamento', note:'dado histórico de 2025' },
  { category:'Orçamento', label:'despesas brutas empenhadas em 2025', value:money(691558004.38), numeric:691558004.38, unit:'R$', sourceId:'ibge-cidades-2026', sourceLabel:sourceLabel('ibge-cidades-2026'), anchor:'orcamento', note:'empenho não equivale a pagamento' },
  { category:'Orçamento', label:'função Educação na LOA 2026', value:money(245469752.28), numeric:245469752.28, unit:'R$', sourceId:'loa-2026', sourceLabel:sourceLabel('loa-2026'), anchor:'orcamento', note:'função orçamentária' },
  { category:'Orçamento', label:'função Saúde na LOA 2026', value:money(138093749.09), numeric:138093749.09, unit:'R$', sourceId:'loa-2026', sourceLabel:sourceLabel('loa-2026'), anchor:'orcamento', note:'função orçamentária' },
  { category:'Educação', label:'matrículas na educação básica em 2025', value:fmt(58138), numeric:58138, unit:'matrículas', sourceId:'pee-go-educacao-2025', sourceLabel:sourceLabel('pee-go-educacao-2025'), anchor:'dashboard', note:'base educacional de 2025' },
  { category:'Educação', label:'matrículas municipais em 2025', value:fmt(23847), numeric:23847, unit:'matrículas', sourceId:'pee-go-educacao-2025', sourceLabel:sourceLabel('pee-go-educacao-2025'), anchor:'dashboard', note:'recorte municipal' },
  { category:'Educação', label:'matrículas EPT técnica articulada ao Ensino Médio', value:fmt(493), numeric:493, unit:'matrículas', sourceId:'pee-go-ept-2025', sourceLabel:sourceLabel('pee-go-ept-2025'), anchor:'dashboard', note:'educação profissional e tecnológica' },
  { category:'Economia', label:'empresas ativas', value:fmt(20096), numeric:20096, unit:'empresas', sourceId:'caged-sebrae-2026', sourceLabel:sourceLabel('caged-sebrae-2026'), anchor:'dashboard', note:'snapshot econômico registrado' },
  { category:'Economia', label:'saldo celetista até julho de 2026', value:fmt(762), numeric:762, unit:'postos', sourceId:'caged-sebrae-2026', sourceLabel:sourceLabel('caged-sebrae-2026'), anchor:'dashboard', note:'saldo no recorte informado' },
  { category:'Saúde', label:'leitos de enfermaria explicitados atualmente', value:fmt(32), numeric:32, unit:'leitos', sourceId:'healgo', sourceLabel:sourceLabel('healgo'), anchor:'saude', note:'modelagem atual do HEAL' },
  { category:'Saúde', label:'leitos de UTI explicitados atualmente', value:fmt(53), numeric:53, unit:'leitos', sourceId:'healgo', sourceLabel:sourceLabel('healgo'), anchor:'saude', note:'modelagem atual do HEAL' },
  { category:'Saúde', label:'atendimentos no primeiro ano, piso informado', value:fmt(200000), numeric:200000, unit:'atendimentos', sourceId:'healgo-200k', sourceLabel:sourceLabel('healgo-200k'), anchor:'saude', note:'piso informado na fonte do hospital' },
  { category:'Saúde', label:'investimento de abertura do HEAL', value:money(157000000), numeric:157000000, unit:'R$', sourceId:'healgo', sourceLabel:sourceLabel('healgo'), anchor:'saude', note:'investimento informado para a abertura' },
] as const;

const easy = seeds.map((s, i): Question => {
  const alternatives = seeds.filter(candidate => candidate.unit === s.unit && candidate.value !== s.value).slice(0, 2).map(candidate => candidate.value);
  const fallback = s.unit === 'R$'
    ? [money((s.numeric ?? 0) / 2), money((s.numeric ?? 0) * 1.5)]
    : [fmt((s.numeric ?? 0) / 2, s.unit === 'km²' || s.unit === 'hab/km²' ? 1 : 0), fmt((s.numeric ?? 0) * 1.5, s.unit === 'km²' || s.unit === 'hab/km²' ? 1 : 0)];
  const options = Array.from(new Set([s.value, ...alternatives, ...fallback])).slice(0, 3);
  return {
    id:`easy-${i+1}`, difficulty:'Fácil', phase:1, category:s.category,
    prompt:`Qual é o valor registrado para ${s.label}?`,
    options, answer:s.value, explanation:s.note + '.', anchor:s.anchor, sourceId:s.sourceId, sourceLabel:s.sourceLabel,
  };
});

const pairs = seeds.map((s, i) => {
  const sameUnit = seeds.find((candidate, j) => j !== i && candidate.unit === s.unit);
  const sameCategory = seeds.find((candidate, j) => j !== i && candidate.category === s.category);
  return { a: s, b: sameUnit ?? sameCategory ?? seeds[(i + 1) % seeds.length] };
});
const medium = pairs.map(({a,b},i): Question => {
  const aNum=a.numeric ?? 0, bNum=b.numeric ?? 0;
  const larger = aNum >= bNum ? a.value : b.value;
  const label = aNum >= bNum ? a.label : b.label;
  return {
    id:`medium-${i+1}`, difficulty:'Médio', phase:2, category:a.category,
    prompt:`Entre "${a.label}" e "${b.label}", qual valor é maior no recorte desta edição?`,
    options:[larger, a.value, b.value],
    answer:larger, explanation:`A comparação usa os valores registrados para os dois indicadores. O maior é ${label}: ${larger}.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

const hard = pairs.map(({a,b},i): Question => {
  const aNum=a.numeric ?? 0, bNum=b.numeric ?? 0;
  const ratio = bNum === 0 ? 0 : aNum / bNum;
  const answer = `${fmt(ratio,2)}×`;
  return {
    id:`hard-${i+1}`, difficulty:'Difícil', phase:3, category:a.category,
    prompt:`Considerando os valores de "${a.label}" e "${b.label}", qual é a razão aproximada do primeiro pelo segundo?`,
    options:[answer,`${fmt(ratio*10,2)}×`,`${fmt(ratio/2,2)}×`],
    answer, explanation:`Razão derivada: ${fmt(aNum,2)} ÷ ${fmt(bNum,2)} = ${answer}. É uma relação matemática entre os dois dados, não um indicador oficial adicional.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

const advanced = pairs.map(({a,b},i): Question => {
  const sameSource = a.sourceId === b.sourceId;
  const answer = sameSource ? 'Podem ser comparados diretamente dentro da mesma fonte, respeitando as definições.' : 'Exigem cuidado porque vêm de fontes ou definições diferentes.';
  return {
    id:`advanced-${i+1}`, difficulty:'Avançado', phase:4, category:a.category,
    prompt:`Ao interpretar "${a.label}" junto com "${b.label}", qual leitura metodológica é mais adequada?`,
    options:[answer,'Os dois números sempre têm o mesmo denominador e período.','Qualquer diferença entre eles prova causalidade.'],
    answer, explanation: sameSource
      ? `Os dois registros apontam para ${a.sourceLabel}. Ainda assim, unidade, período e definição precisam ser lidos antes da comparação.`
      : `Os registros não compartilham necessariamente fonte, período ou denominador. A edição mantém essas camadas separadas para evitar uma comparação indevida.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

const expert = pairs.map(({a,b},i): Question => {
  const answer = a.sourceId === b.sourceId
    ? `Usar a definição da fonte e conferir a data antes de concluir.`
    : `Manter as fontes e os denominadores separados antes de concluir.`;
  return {
    id:`expert-${i+1}`, difficulty:'Expert', phase:5, category:'Método',
    prompt:`Você está auditando "${a.label}" contra "${b.label}". Qual procedimento é defensável antes de publicar uma conclusão?`,
    options:[answer,'Somar os valores e publicar o total como novo indicador oficial.','Escolher o maior número e tratá-lo como referência para ambos.'],
    answer, explanation:`O Observatório diferencia dado oficial, derivação e interpretação. ${a.note}; ${b.note}.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

export const QUIZ_LEVELS = ['Fácil','Médio','Difícil','Avançado','Expert'] as const;
export const QUESTIONS_PER_LEVEL = 40 as const;
export const QUIZ_TOTAL = 200 as const;
export const QUESTION_BANK: readonly Question[] = [...easy, ...medium, ...hard, ...advanced, ...expert];

if (QUESTION_BANK.length !== QUIZ_TOTAL || QUIZ_LEVELS.some(level => QUESTION_BANK.filter(q => q.difficulty === level).length !== QUESTIONS_PER_LEVEL)) {
  throw new Error(`Banco do quiz deve ter ${QUIZ_TOTAL} questões, com ${QUESTIONS_PER_LEVEL} por nível; recebeu ${QUESTION_BANK.length}`);
}

export function QuickQuiz() {
  const [phase, setPhase] = useState<Difficulty>('Fácil');
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [unlockedPhase, setUnlockedPhase] = useState(0);

  const phases = QUIZ_LEVELS;
  const questions = useMemo(() => QUESTION_BANK.filter(q => q.difficulty === phase), [phase]);
  const question = questions[step];
  const progress = finished ? 100 : Math.round(((step + 1) / questions.length) * 100);

  const options = useMemo(() => {
    if (!question) return [];
    const values = [...question.options];
    const shift = step % values.length;
    return values.slice(shift).concat(values.slice(0, shift));
  }, [question, step]);

  const choosePhase = (next: Difficulty) => {
    const nextIndex = phases.indexOf(next);
    if (nextIndex > unlockedPhase) return;
    setPhase(next);
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const answer = (value: string) => {
    if (selected) return;
    setSelected(value);
    if (value === question.answer) setScore(v => v + 1);
  };

  const next = () => {
    if (!selected) return;
    if (step === questions.length - 1) {
      setFinished(true);
      setUnlockedPhase(current => Math.max(current, Math.min(phases.length - 1, phases.indexOf(phase) + 1)));
    } else {
      setStep(v => v + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const share = async () => {
    const text = `Quiz do Observatório · ${phase}: ${score}/${questions.length} acertos.`;
    try {
      if (navigator.share) await navigator.share({ title:'Quiz do Observatório', text, url:window.location.href + '#quiz' });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text + ' ' + window.location.href + '#quiz');
    } catch {}
  };

  const source = question ? d.sources.find(item => item.id === question.sourceId) : undefined;
  const questionSourceUrl = question ? sourceUrl(question.sourceId) : undefined;

  return (
    <section id="quiz" className="quiz-premium scroll-mt-24" aria-labelledby="quiz-title">
      <div className="quiz-premium-head">
        <div>
          <span className="quiz-eyebrow">200 perguntas · 5 fases · 40 por nível · edição {d.meta.updatedAt.split('-').reverse().join('/')}</span>
          <h2 id="quiz-title">Desafio do Observatório</h2>
          <p>Comece no Fácil e avance até Expert. Cada resposta mostra a explicação e a fonte usada no dado.</p>
        </div>
        <span className="quiz-counter">{finished ? 'Fase concluída' : `${step + 1}/${QUESTIONS_PER_LEVEL}`}</span>
      </div>

      <div className="quiz-phase-grid" role="tablist" aria-label="Fases de dificuldade">
        {phases.map((item, index) => {
          const locked = index > unlockedPhase;
          return (
            <button key={item} type="button" role="tab" aria-selected={phase === item} aria-disabled={locked} disabled={locked} className={phase === item ? 'is-active' : ''} onClick={() => choosePhase(item)}>
              <span>Fase {index + 1}</span><strong>{item}</strong><small>{locked ? 'Bloqueada' : `${QUESTIONS_PER_LEVEL} perguntas`}</small>
            </button>
          );
        })}
      </div>

      <div className="quiz-progress-track" aria-label={`Progresso da fase: ${progress}%`}><span style={{width:`${progress}%`}} /></div>

      {finished ? (
        <div className="quiz-result">
          <div className="quiz-result-icon"><CheckCircle2 aria-hidden="true" /></div>
          <span className="quiz-eyebrow">Fase concluída</span>
          <strong>{score}/{QUESTIONS_PER_LEVEL}</strong>
          <p>{score === 40 ? 'Fase concluída com aproveitamento máximo.' : 'Revise as explicações e as fontes das questões erradas antes de avançar.'}</p>
          <div className="quiz-actions">
            <button type="button" onClick={restart}><RotateCcw aria-hidden="true" /> Refazer fase</button>
            <button type="button" onClick={share} className="secondary"><Share2 aria-hidden="true" /> Compartilhar</button>
          </div>
        </div>
      ) : question ? (
        <div className="quiz-question">
          <div className="quiz-meta"><span>{question.difficulty}</span><span>{question.category}</span><span>{question.sourceLabel}</span></div>
          <h3>{question.prompt}</h3>
          <div className="quiz-options">
            {options.map(option => {
              const isSelected = selected === option;
              const isCorrect = Boolean(selected) && option === question.answer;
              return (
                <button key={option} type="button" onClick={() => answer(option)} disabled={Boolean(selected)} aria-pressed={isSelected} className={`quiz-option ${isSelected ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''}`}>
                  <span className="quiz-option-dot" aria-hidden="true" /><span>{option}</span>
                </button>
              );
            })}
          </div>
          {selected && (
            <div className={`quiz-feedback ${selected === question.answer ? 'correct' : 'wrong'}`} role="status">
              <strong>{selected === question.answer ? 'Resposta correta' : 'Resposta registrada'}</strong>
              <p>{question.explanation}</p>
              {questionSourceUrl && <a href={questionSourceUrl} target="_blank" rel="noopener noreferrer">Conferir fonte · {source?.label ?? question.sourceLabel} <ExternalLink aria-hidden="true" /></a>}
            </div>
          )}
          <div className="quiz-footer"><span>{selected ? 'Resposta registrada' : 'Escolha uma alternativa'}</span><button type="button" onClick={next} disabled={!selected}>{step === 39 ? 'Concluir fase' : 'Próxima'} <span aria-hidden="true">→</span></button></div>
        </div>
      ) : null}
    </section>
  );
}

    ? [money((s.numeric ?? 0) / 2), money((s.numeric ?? 0) * 1.5)]
    : [fmt((s.numeric ?? 0) / 2, s.unit === 'km²' || s.unit === 'hab/km²' ? 1 : 0), fmt((s.numeric ?? 0) * 1.5, s.unit === 'km²' || s.unit === 'hab/km²' ? 1 : 0)];
  const options = Array.from(new Set([s.value, ...alternatives, ...fallback])).slice(0, 3);
  return {
    id:`easy-${i+1}`, difficulty:'Fácil', phase:1, category:s.category,
    prompt:`Qual é o valor registrado para ${s.label}?`,
    options, answer:s.value, explanation:s.note + '.', anchor:s.anchor, sourceId:s.sourceId, sourceLabel:s.sourceLabel,
  };
});

const pairs = seeds.map((s, i) => {
  const sameUnit = seeds.find((candidate, j) => j !== i && candidate.unit === s.unit);
  const sameCategory = seeds.find((candidate, j) => j !== i && candidate.category === s.category);
  return { a: s, b: sameUnit ?? sameCategory ?? seeds[(i + 1) % seeds.length] };
});
const medium = pairs.map(({a,b},i): Question => {
  const aNum=a.numeric ?? 0, bNum=b.numeric ?? 0;
  const larger = aNum >= bNum ? a.value : b.value;
  const label = aNum >= bNum ? a.label : b.label;
  return {
    id:`medium-${i+1}`, difficulty:'Médio', phase:2, category:a.category,
    prompt:`Entre "${a.label}" e "${b.label}", qual valor é maior no recorte desta edição?`,
    options:[larger, a.value, b.value],
    answer:larger, explanation:`A comparação usa os valores registrados para os dois indicadores. O maior é ${label}: ${larger}.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

const hard = pairs.map(({a,b},i): Question => {
  const aNum=a.numeric ?? 0, bNum=b.numeric ?? 0;
  const ratio = bNum === 0 ? 0 : aNum / bNum;
  const answer = `${fmt(ratio,2)}×`;
  return {
    id:`hard-${i+1}`, difficulty:'Difícil', phase:3, category:a.category,
    prompt:`Considerando os valores de "${a.label}" e "${b.label}", qual é a razão aproximada do primeiro pelo segundo?`,
    options:[answer,`${fmt(ratio*10,2)}×`,`${fmt(ratio/2,2)}×`],
    answer, explanation:`Razão derivada: ${fmt(aNum,2)} ÷ ${fmt(bNum,2)} = ${answer}. É uma relação matemática entre os dois dados, não um indicador oficial adicional.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

const advanced = pairs.map(({a,b},i): Question => {
  const sameSource = a.sourceId === b.sourceId;
  const answer = sameSource ? 'Podem ser comparados diretamente dentro da mesma fonte, respeitando as definições.' : 'Exigem cuidado porque vêm de fontes ou definições diferentes.';
  return {
    id:`advanced-${i+1}`, difficulty:'Avançado', phase:4, category:a.category,
    prompt:`Ao interpretar "${a.label}" junto com "${b.label}", qual leitura metodológica é mais adequada?`,
    options:[answer,'Os dois números sempre têm o mesmo denominador e período.','Qualquer diferença entre eles prova causalidade.'],
    answer, explanation: sameSource
      ? `Os dois registros apontam para ${a.sourceLabel}. Ainda assim, unidade, período e definição precisam ser lidos antes da comparação.`
      : `Os registros não compartilham necessariamente fonte, período ou denominador. A edição mantém essas camadas separadas para evitar uma comparação indevida.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

const expert = pairs.map(({a,b},i): Question => {
  const answer = a.sourceId === b.sourceId
    ? `Usar a definição da fonte e conferir a data antes de concluir.`
    : `Manter as fontes e os denominadores separados antes de concluir.`;
  return {
    id:`expert-${i+1}`, difficulty:'Expert', phase:5, category:'Método',
    prompt:`Você está auditando "${a.label}" contra "${b.label}". Qual procedimento é defensável antes de publicar uma conclusão?`,
    options:[answer,'Somar os valores e publicar o total como novo indicador oficial.','Escolher o maior número e tratá-lo como referência para ambos.'],
    answer, explanation:`O Observatório diferencia dado oficial, derivação e interpretação. ${a.note}; ${b.note}.`,
    anchor:a.anchor, sourceId:a.sourceId, sourceLabel:a.sourceLabel,
  };
});

export const QUESTION_BANK: readonly Question[] = [...easy, ...medium, ...hard, ...advanced, ...expert];

if (QUESTION_BANK.length !== 200) {
  throw new Error(`Banco do quiz deve ter 200 questões; recebeu ${QUESTION_BANK.length}`);
}

export function QuickQuiz() {
  const [phase, setPhase] = useState<Difficulty>('Fácil');
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const phases = ['Fácil','Médio','Difícil','Avançado','Expert'] as const;
  const questions = useMemo(() => QUESTION_BANK.filter(q => q.difficulty === phase), [phase]);
  const question = questions[step];
  const progress = finished ? 100 : Math.round(((step + 1) / questions.length) * 100);

  const options = useMemo(() => {
    if (!question) return [];
    const values = [...question.options];
    const shift = step % values.length;
    return values.slice(shift).concat(values.slice(0, shift));
  }, [question, step]);

  const choosePhase = (next: Difficulty) => {
    setPhase(next);
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const answer = (value: string) => {
    if (selected) return;
    setSelected(value);
    if (value === question.answer) setScore(v => v + 1);
  };

  const next = () => {
    if (!selected) return;
    if (step === questions.length - 1) setFinished(true);
    else {
      setStep(v => v + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const share = async () => {
    const text = `Quiz do Observatório · ${phase}: ${score}/${questions.length} acertos.`;
    try {
      if (navigator.share) await navigator.share({ title:'Quiz do Observatório', text, url:window.location.href + '#quiz' });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text + ' ' + window.location.href + '#quiz');
    } catch {}
  };

  const source = question ? d.sources.find(item => item.id === question.sourceId) : undefined;
  const questionSourceUrl = question ? sourceUrl(question.sourceId) : undefined;

  return (
    <section id="quiz" className="quiz-premium scroll-mt-24" aria-labelledby="quiz-title">
      <div className="quiz-premium-head">
        <div>
          <span className="quiz-eyebrow">200 perguntas · 5 fases · 40 por nível · edição {d.meta.updatedAt.split('-').reverse().join('/')}</span>
          <h2 id="quiz-title">Desafio do Observatório</h2>
          <p>Comece no Fácil e avance até Expert. Cada resposta mostra a explicação e a fonte usada no dado.</p>
        </div>
        <span className="quiz-counter">{finished ? '100%' : `${step + 1}/40`}</span>
      </div>

      <div className="quiz-phase-grid" role="tablist" aria-label="Fases de dificuldade">
        {phases.map((item, index) => (
          <button key={item} type="button" role="tab" aria-selected={phase === item} className={phase === item ? 'is-active' : ''} onClick={() => choosePhase(item)}>
            <span>Fase {index + 1}</span><strong>{item}</strong><small>40 perguntas</small>
          </button>
        ))}
      </div>

      <div className="quiz-progress-track" aria-label={`Progresso da fase: ${progress}%`}><span style={{width:`${progress}%`}} /></div>

      {finished ? (
        <div className="quiz-result">
          <div className="quiz-result-icon"><CheckCircle2 aria-hidden="true" /></div>
          <span className="quiz-eyebrow">Fase concluída</span>
          <strong>{score}/40</strong>
          <p>{score === 40 ? 'Fase concluída com aproveitamento máximo.' : 'Revise as explicações e as fontes das questões erradas antes de avançar.'}</p>
          <div className="quiz-actions">
            <button type="button" onClick={restart}><RotateCcw aria-hidden="true" /> Refazer fase</button>
            <button type="button" onClick={share} className="secondary"><Share2 aria-hidden="true" /> Compartilhar</button>
          </div>
        </div>
      ) : question ? (
        <div className="quiz-question">
          <div className="quiz-meta"><span>{question.difficulty}</span><span>{question.category}</span><span>{question.sourceLabel}</span></div>
          <h3>{question.prompt}</h3>
          <div className="quiz-options">
            {options.map(option => {
              const isSelected = selected === option;
              const isCorrect = Boolean(selected) && option === question.answer;
              return (
                <button key={option} type="button" onClick={() => answer(option)} disabled={Boolean(selected)} aria-pressed={isSelected} className={`quiz-option ${isSelected ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''}`}>
                  <span className="quiz-option-dot" aria-hidden="true" /><span>{option}</span>
                </button>
              );
            })}
          </div>
          {selected && (
            <div className={`quiz-feedback ${selected === question.answer ? 'correct' : 'wrong'}`} role="status">
              <strong>{selected === question.answer ? 'Resposta correta' : 'Resposta registrada'}</strong>
              <p>{question.explanation}</p>
              {questionSourceUrl && <a href={questionSourceUrl} target="_blank" rel="noopener noreferrer">Conferir fonte · {source?.label ?? question.sourceLabel} <ExternalLink aria-hidden="true" /></a>}
            </div>
          )}
          <div className="quiz-footer"><span>{selected ? 'Resposta registrada' : 'Escolha uma alternativa'}</span><button type="button" onClick={next} disabled={!selected}>{step === 39 ? 'Concluir fase' : 'Próxima'} <span aria-hidden="true">→</span></button></div>
        </div>
      ) : null}
    </section>
  );
}
