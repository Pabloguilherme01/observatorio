import type { TransportCalculationInput, TransportCalculationResult } from '../types/observatorio';

export function calculateTransportCost(input: TransportCalculationInput): TransportCalculationResult {
  const safeFare = Math.max(0, input.fareBrl);
  const safeTrips = Math.max(0, input.tripsPerDay);
  const safeDays = Math.max(0, input.workDaysPerMonth);
  const safePeople = Math.max(0, input.people);
  const safeMonths = Math.max(0, input.monthsPerYear);
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

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}