import { BarChart3, BookOpen, BusFront, Database, Droplets, FileCheck2, Landmark, ShieldCheck, Users, Vote, WalletCards } from 'lucide-react';
import { observatorioData as d } from '../../../data/observatorioData';
import { navigation } from '../../../config/navigation';

export type ResultKind = 'primary' | 'data' | 'source' | 'candidate' | 'transport' | 'public';

export interface SearchResultItem {
  readonly label: string;
  readonly id: string;
  readonly kind: ResultKind;
  readonly serviceQuery?: string;
  readonly score: number;
}

export const sourceForId = (sourceId?: string) =>
  sourceId ? d.sources.find(source => source.id === sourceId) : undefined;

export const sourceLabel = (sourceId?: string) =>
  sourceId ? (sourceForId(sourceId)?.label ?? sourceId) : 'Conjunto publicado pelo Observatório';

export const destinationLabel = (id: string) =>
  navigation.find(item => item.id === id)?.label
  ?? ({
    resumo: 'Resumo',
    'aprendizado-guiado': 'Aprendizado guiado',
    saude: 'Saúde e serviços',
    candidaturas: 'Candidaturas',
    exportacao: 'Baixar dados',
    acao: 'Serviços públicos',
    contexto: 'Comparação municipal',
    dados: 'Atualizações públicas',
  }[id] ?? 'Seção do observatório');

export const resultIcon = (id: string) => {
  if (id === 'eleitorado') return Users;
  if (id === 'transporte') return BusFront;
  if (id === 'saude') return Droplets;
  if (id === 'politica') return Vote;
  if (id === 'candidaturas') return FileCheck2;
  if (id === 'orcamento') return WalletCards;
  if (id === 'fontes') return Database;
  if (id === 'qualidade') return ShieldCheck;
  if (id === 'exportacao') return BookOpen;
  if (id === 'acao') return Landmark;
  return BarChart3;
};
