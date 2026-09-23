import type { ISODate, SourceRef } from './observatorio';

export type DataLifecycle = 'bruto' | 'snapshot' | 'histórico' | 'calculado' | 'projeção';
export type DataReliability = 'oficial' | 'secundária' | 'derivada';

export interface DadoRastreavel<T> {
  readonly valor: T;
  readonly unidade: string;
  readonly dataReferencia: ISODate;
  readonly dataColeta: ISODate;
  readonly fonte: SourceRef;
  readonly metodologia?: string;
  readonly denominador?: string;
  readonly lifecycle: DataLifecycle;
  readonly confiabilidade: DataReliability;
  readonly notaEditorial?: string;
}
