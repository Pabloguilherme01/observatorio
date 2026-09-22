import { observatorioData } from '../data/observatorioData';
import type { ObservatoryData } from '../types/observatorio';

/** Contrato de leitura que permite trocar o mock estático por API/DB sem alterar componentes. */
export interface ObservatorioDataSource {
  getSnapshot(): Promise<ObservatoryData>;
}

/** Adaptador local atual. Em produção pode ser substituído por REST, RPC ou Supabase. */
export const localDataSource: ObservatorioDataSource = {
  async getSnapshot() {
    return observatorioData;
  },
};