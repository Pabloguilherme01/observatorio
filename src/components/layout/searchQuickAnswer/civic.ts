import { observatorioData as d } from '../../../data/observatorioData';
import { formatBudgetCurrency } from '../../../utils/formatters';
import type { QuickAnswer } from './types';

export function resolveCivicQuickAnswer(q: string): QuickAnswer | null {
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
    return null;
}
