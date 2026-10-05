import { observatorioData as d } from '../../../data/observatorioData';
import type { QuickAnswer } from './types';

export function resolveProfileQuickAnswer(q: string): QuickAnswer | null {
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
