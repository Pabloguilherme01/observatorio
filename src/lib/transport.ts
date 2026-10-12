import type { SourceRef, TransportCalculationInput, TransportCalculationResult } from '../types/observatorio';
import { formatDate } from '../utils/formatters';

export function transportFareReference(source?: SourceRef): string {
  return source?.referenceDate
    ? `Referência da tarifa: ${formatDate(source.referenceDate)}. Confira o valor vigente na fonte antes de viajar.`
    : 'Período da tarifa não informado. Confira o valor vigente na fonte antes de viajar.';
}

function finiteNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  const finite = finiteNumber(value, fallback);
  return Math.min(max, Math.max(min, finite));
}

export function calculateTransportCost(input: TransportCalculationInput): TransportCalculationResult {
  const safeFare = clamp(input.fareBrl, 0, 10_000, 0);
  const safeTrips = clamp(input.tripsPerDay, 0, 8, 0);
  const safeDays = clamp(input.workDaysPerMonth, 0, 31, 0);
  const safePeople = clamp(input.people, 0, 20, 0);
  const safeMonths = clamp(input.monthsPerYear, 0, 12, 0);
  const monthlyPerPersonBrl = safeFare * safeTrips * safeDays;
  const annualPerPersonBrl = monthlyPerPersonBrl * safeMonths;
  const monthlyTotalBrl = monthlyPerPersonBrl * safePeople;
  const annualTotalBrl = annualPerPersonBrl * safePeople;
  const monthlyPctOfSalaryPerPerson = input.salaryReferenceBrl > 0 ? (monthlyPerPersonBrl / input.salaryReferenceBrl) * 100 : null;
  const annualPctOfSalaryPerPerson = input.salaryReferenceBrl > 0 ? (annualPerPersonBrl / input.salaryReferenceBrl) * 100 : null;

  return {
    monthlyPerPersonBrl,
    annualPerPersonBrl,
    monthlyTotalBrl,
    annualTotalBrl,
    monthlyPctOfSalaryPerPerson,
    annualPctOfSalaryPerPerson,
  };
}

export function workDaysPerMonthFromWeeks(daysPerWeek: number, weeksPerMonth = 4.4): number {
  return clamp(daysPerWeek, 0, 7, 0) * clamp(weeksPerMonth, 0, 5, 4.4);
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
