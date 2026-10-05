import { observatorioData as d } from '../../data/observatorioData';
import { formatBudgetCurrency } from '../../utils/formatters';

export interface QuickAnswer {
  readonly title: string;
  readonly value: string;
  readonly id: string;
  readonly sourceId?: string;
  readonly note?: string;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const normalizeSearchQuery = (value: string) => normalize(value).replace(/\s+/g, ' ');
const hasTerm = (query: string, term: string) => query.split(/\s+/).includes(term);

export function resolveQuickAnswer(query: string): QuickAnswer | null {
    const q = normalizeSearchQuery(query);
    if (!q || q.length < 4) return null;
    const sourceCount = d.sources.length;
    const indicatorCount = d.indicators.length;
    const datedSources = d.sources.filter(source => source.referenceDate || source.publishedAt).length;
    if ((hasTerm(q, 'internacao') || hasTerm(q, 'internacoes')) && hasTerm(q, 'agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-related-hospitalizations');
      return indicator ? { title: 'Internações por doenças relacionadas à água', value: Number(indicator.value).toLocaleString('pt-BR') + ' internações', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((hasTerm(q, 'obito') || hasTerm(q, 'obitos') || hasTerm(q, 'morte') || hasTerm(q, 'mortes')) && hasTerm(q, 'agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-related-deaths');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' óbitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('quantos') || q.includes('total')) && q.includes('indicadores')) {
      return { title: 'Indicadores publicados', value: indicatorCount.toLocaleString('pt-BR') + ' indicadores', id: 'dados', note: 'Contagem do conjunto normalizado exibido pelo Observatório; não representa o total de indicadores existentes nas fontes originais.' };
    }
    if ((q.includes('quantas') || q.includes('total')) && q.includes('fontes')) {
      return { title: 'Fontes registradas', value: sourceCount.toLocaleString('pt-BR') + ' fontes', id: 'dados', note: 'Contagem do catálogo de fontes registrado no conjunto publicado.' };
    }
    if (q.includes('cobertura') && q.includes('fontes')) {
      const coverage = sourceCount ? (datedSources / sourceCount) * 100 : 0;
      return { title: 'Cobertura temporal das fontes', value: coverage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dados', note: 'Percentual de fontes registradas com data de referência ou publicação.' };
    }
    const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
    if ((q.includes('crescimento') || q.includes('variacao') || q.includes('aumento')) && q.includes('populacao')) {
      const indicator = d.indicators.find(item => item.id === 'population-growth-2022-2026');
      return indicator ? { title: 'Variação da população 2022–2026', value: '+' + Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('diferenca') || q.includes('variacao')) && q.includes('habitantes')) {
      const indicator = d.indicators.find(item => item.id === 'population-change-2022-2026');
      return indicator ? { title: 'Diferença populacional 2022–2026', value: '+' + Number(indicator.value).toLocaleString('pt-BR') + ' habitantes', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('populacao') || q.includes('habitantes')) return { title: 'População 2026', value: population.toLocaleString('pt-BR') + ' habitantes', id: 'dashboard', sourceId: 'ibge-estimativas-2026' };
    if (q.includes('densidade')) {
      const indicator = d.indicators.find(item => item.id === 'density');
      return indicator ? { title: 'Densidade estimada 2026', value: Math.round(Number(indicator.value)).toLocaleString('pt-BR') + ' hab/km²', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('empresas') || q.includes('empresa')) && (q.includes('novas') || q.includes('novos') || q.includes('abertas'))) {
      const indicator = d.indicators.find(item => item.id === 'companies-new');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' empresas', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('empresas') || q.includes('empresa')) {
      const indicator = d.indicators.find(item => item.id === 'companies');
      return indicator ? { title: 'Empresas ativas', value: indicator.value.toLocaleString('pt-BR') + ' empresas', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('emprego') || q.includes('caged') || q.includes('postos')) {
      const indicator = d.indicators.find(item => item.id === 'cagedBalance');
      return indicator ? { title: 'Saldo celetista até jul/2026', value: Number(indicator.value).toLocaleString('pt-BR') + ' postos', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('diferenca') || q.includes('saldo')) && q.includes('receita') && q.includes('despesa') && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'revenue-expense-difference-per-capita-2025');
      return indicator ? { title: 'Diferença receita–despesa por habitante 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('diferenca') || q.includes('saldo')) && q.includes('receita') && q.includes('despesa')) {
      const indicator = d.indicators.find(item => item.id === 'revenue-expense-difference-2025');
      return indicator ? { title: 'Receitas realizadas − despesas empenhadas 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('receita') || q.includes('receitas')) && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'revenue-per-capita-2025');
      return indicator ? { title: 'Receitas realizadas por habitante 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('despesa') || q.includes('despesas')) && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'expenses-per-capita-2025');
      return indicator ? { title: 'Despesas empenhadas por habitante 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('receita') || q.includes('receitas')) {
      const indicator = d.indicators.find(item => item.id === 'revenue-2025');
      return indicator ? { title: 'Receitas brutas realizadas 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'orcamento', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('despesa') || q.includes('despesas')) {
      const indicator = d.indicators.find(item => item.id === 'expenses-2025');
      return indicator ? { title: 'Despesas brutas empenhadas 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'orcamento', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('pessoal ocupado') || q.includes('trabalhadores formais')) {
      const indicator = d.indicators.find(item => item.id === 'formal-workers');
      return indicator ? { title: 'Pessoal ocupado', value: Number(indicator.value).toLocaleString('pt-BR') + ' pessoas', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('salario formal') || q.includes('salário formal')) {
      const indicator = d.indicators.find(item => item.id === 'formal-salary');
      return indicator ? { title: 'Salário médio mensal formal', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' salários mínimos', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('mortalidade infantil')) {
      const indicator = d.indicators.find(item => item.id === 'infant-mortality');
      return indicator ? { title: 'Mortalidade infantil', value: indicator.value.toLocaleString('pt-BR') + ' óbitos por mil', id: 'saude', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('escolarizacao') || q.includes('escolarização')) {
      const indicator = d.indicators.find(item => item.id === 'schooling-6-14');
      return indicator ? { title: 'Escolarização de 6 a 14 anos', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('arborizacao') || q.includes('arborização')) {
      const indicator = d.indicators.find(item => item.id === 'street-arborization');
      return indicator ? { title: 'Arborização de vias públicas', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('sem') || q.includes('falta')) && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-access-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('sem') || q.includes('fora')) && q.includes('esgoto') && q.includes('servico')) {
      const indicator = d.indicators.find(item => item.id === 'public-sewer-service-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgoto') && q.includes('sem') && q.includes('coleta')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-collection-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgoto') && q.includes('sem') && q.includes('tratamento')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-treatment-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('perda') && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-distribution-loss-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('hidrometr')) {
      const indicator = d.indicators.find(item => item.id === 'hydrometering-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('consumo') && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-consumption-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' L/pessoa/dia', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('tarifa') && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'average-water-tariff-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '/m³', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('lixo') || q.includes('residuo') || q.includes('residuos')) {
      const indicator = d.indicators.find(item => item.id === 'household-waste-collection-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (hasTerm(q, 'agua') || q.includes('abastecimento')) {
      const indicator = d.indicators.find(item => item.id === 'water-access-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('eleitorado') || q.includes('eleitores')) return { title: 'Eleitorado 2026', value: d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores', id: 'eleitoral360', sourceId: 'tse-eleitorado-2026' };
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita')) && q.includes('educacao')) {
      const indicator = d.indicators.find(item => item.id === 'budget-education-per-capita-2026');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita')) && q.includes('saude')) {
      const indicator = d.indicators.find(item => item.id === 'budget-health-per-capita-2026');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita')) && q.includes('saneamento')) {
      const indicator = d.indicators.find(item => item.id === 'budget-sanitation-per-capita-2026');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && q.includes('educacao')) {
      const indicator = d.indicators.find(item => item.id === 'budget-education-share-2026');
      return indicator ? { title: 'Educação na LOA 2026', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && q.includes('saude')) {
      const indicator = d.indicators.find(item => item.id === 'budget-health-share-2026');
      return indicator ? { title: 'Saúde na LOA 2026', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && q.includes('saneamento')) {
      const indicator = d.indicators.find(item => item.id === 'budget-sanitation-share-2026');
      return indicator ? { title: 'Saneamento na LOA 2026', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('matriculas municipais') || (q.includes('matricula') && q.includes('municipal'))) {
      const indicator = d.indicators.find(item => item.id === 'municipal-enrollment-share-2025');
      return indicator ? { title: 'Matrículas municipais na educação básica', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'budget-per-capita-2026');
      return indicator ? { title: 'LOA 2026 por habitante', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('orcamento') || q.includes('loa')) return { title: 'LOA 2026', value: formatBudgetCurrency(d.budget.totalBrl), id: 'orcamento', sourceId: d.budget.sourceId };
    if (q.includes('coleta') && q.includes('esgoto')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-collection-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('tratamento') && q.includes('esgoto')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-treatment-generated-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgoto')) {
      const indicator = d.indicators.find(item => item.id === 'public-sewer-service-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('custo') || q.includes('mensal')) && q.includes('brasilia')) {
      const indicator = d.indicators.find(item => item.id === 'transport-monthly-brasilia-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa/mês', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('custo') || q.includes('mensal')) && q.includes('taguatinga')) {
      const indicator = d.indicators.find(item => item.id === 'transport-monthly-taguatinga-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa/mês', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('custo') || q.includes('mensal')) && q.includes('ceilandia')) {
      const indicator = d.indicators.find(item => item.id === 'transport-monthly-ceilandia-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa/mês', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('transporte') || q.includes('brasilia')) && q.includes('salario')) {
      const indicator = d.indicators.find(item => item.id === 'transport-brasilia-min-wage-share-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('tarifa') || q.includes('passagem') || q.includes('brasilia')) {
      const route = d.transport.routes.find(item => item.id === 'brasilia') ?? d.transport.routes[0];
      return route ? { title: 'Tarifa de referência para Brasília', value: route.fareBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por trecho', id: 'transporte', sourceId: route.sourceId } : null;
    }
    if (q.includes('pib')) {
      const indicator = d.indicators.find(item => item.id === 'gdp-per-capita-2023');
      return indicator ? { title: 'PIB per capita 2023', value: indicator.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('ideb')) {
      const range = d.education?.ideb2025Range;
      return range ? { title: 'Referência Ideb 2025', value: range[0].toLocaleString('pt-BR') + '–' + range[1].toLocaleString('pt-BR'), id: 'dashboard', sourceId: d.education?.sourceId ?? 'qedu-ideb-2025' } : null;
    }
    if ((q.includes('ept') || q.includes('educacao profissional') || q.includes('educacao tecnica') || q.includes('ensino tecnico')) && (q.includes('matricula') || q.includes('tecnica') || q.includes('tecnico') || q === 'ept')) {
      const indicator = d.indicators.find(item => item.id === 'ept-technical-2025');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' matrículas', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('matricula') || q.includes('matriculas') || q.includes('educacao basica')) {
      const indicator = d.indicators.find(item => item.id === 'basic-enrollments-2025');
      return indicator ? { title: 'Matrículas na educação básica 2025', value: Number(indicator.value).toLocaleString('pt-BR') + ' matrículas', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('saneamento') && (q.includes('per capita') || q.includes('por pessoa'))) || (q.includes('investimento') && q.includes('saneamento') && q.includes('habitante'))) {
      const indicator = d.indicators.find(item => item.id === 'sanitation-investment-per-capita');
      return indicator ? { title: 'Investimento em saneamento por pessoa', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgotamento') && q.includes('adequado')) {
      const indicator = d.indicators.find(item => item.id === 'adequate-sewerage');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('investimento') && q.includes('saneamento')) {
      const indicator = d.indicators.find(item => item.id === 'sanitation-investment');
      return indicator ? { title: 'Investimento em saneamento', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'saude', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && (q.includes('planej') || q.includes('298'))) {
      const indicator = d.indicators.find(item => item.id === 'heal-planned-beds');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' leitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && (q.includes('inaugur') || q.includes('164'))) {
      const indicator = d.indicators.find(item => item.id === 'heal-opening-beds');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' leitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && q.includes('investimento')) {
      const indicator = d.indicators.find(item => item.id === 'heal-opening-investment');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && q.includes('atendimento')) {
      const indicator = d.indicators.find(item => item.id === 'heal-first-year-attendances');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + '+ atendimentos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && (q.includes('por leito') || q.includes('leito de referencia'))) {
      const indicator = d.indicators.find(item => item.id === 'heal-attendances-per-opening-bed');
      return indicator ? { title: indicator.label, value: Math.floor(Number(indicator.value)).toLocaleString('pt-BR') + '+ atendimentos/leito', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('heal') || q.includes('hospital')) {
      const indicator = d.indicators.find(item => item.id === 'heal-current-stated-beds');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' leitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    return null;
}
