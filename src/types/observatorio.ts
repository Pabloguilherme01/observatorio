/** Contratos de domínio do Observatório. Dados e UI permanecem desacoplados. */
export type DataNature = 'official' | 'secondary' | 'derived' | 'legacy';
export type DataStatus = 'published' | 'snapshot' | 'historical' | 'planned' | 'derived';
export type ISODate = `${number}-${number}-${number}`;

export interface SourceRef {
  readonly id: string;
  readonly label: string;
  readonly institution: string;
  readonly url: string;
  readonly resourceUrl?: string;
  readonly updateFrequency?: string;
  readonly license?: string;
  readonly lastCheckedAt?: ISODate;
  readonly nature: DataNature;
  readonly referenceDate?: ISODate;
  readonly publishedAt?: ISODate;
  readonly note?: string;
}

export interface PopulationPoint {
  readonly year: number;
  readonly value: number;
  readonly kind: 'census' | 'estimate';
  readonly referenceDate: ISODate;
  readonly sourceId: string;
}

export interface BudgetAllocation {
  readonly id: string;
  readonly level: 'governmentBody' | 'organizationalUnit' | 'function';
  readonly name: string;
  readonly amountBrl: number;
  readonly sourceId: string;
}

export interface BudgetData {
  readonly year: number;
  readonly totalBrl: number;
  readonly organizations: readonly BudgetAllocation[];
  readonly functions: readonly BudgetAllocation[];
  readonly sourceId: string;
}

export interface TransportRoute {
  readonly id: string;
  readonly label: string;
  readonly fareBrl: number;
  readonly regulator: string;
  readonly sourceId: string;
}

export interface TransportProfile {
  readonly routes: readonly TransportRoute[];
  readonly defaultWorkDaysPerMonth: number;
  readonly defaultTripsPerDay: number;
  readonly minimumWageBrl: number;
  readonly minimumWageYear: number;
}

export interface SanitationSnapshot {
  readonly waterAccessPct: number;
  readonly publicSewerServicePct: number;
  readonly sewerCollectionPct: number;
  readonly sewerTreatmentOfGeneratedPct: number;
  readonly collectedSewerTreatedPct: number;
  readonly waterDistributionLossPct: number;
  readonly hydrometeringPct: number;
  readonly waterConsumptionLitersPerPersonDay: number;
  readonly averageWaterTariffBrlPerM3: number;
  readonly householdWasteCollectionPct: number;
  readonly sourceId: string;
  readonly note?: string;
}

export interface HealthProfile {
  readonly hospitalName: string;
  readonly openingReportedBeds: number;
  readonly currentStatedWardBeds: number;
  readonly currentStatedIcuBeds: number;
  readonly firstYearAttendancesAtLeast: number;
  readonly openingInvestmentBrl: number;
  readonly plannedBeds?: number;
  readonly sourceIds: readonly string[];
}

export interface MunicipalIndicator {
  readonly id: string;
  readonly label: string;
  readonly value: number | string;
  readonly unit: string;
  readonly status: DataStatus;
  readonly referenceDate?: ISODate;
  readonly sourceId: string;
  readonly note?: string;
}

export interface ObservatoryData {
  readonly meta: {
    readonly name: string;
    readonly edition: string;
    readonly municipality: string;
    readonly timezone: 'America/Sao_Paulo';
    readonly updatedAt: ISODate;
  };
  readonly sources: readonly SourceRef[];
  readonly populationSeries: readonly PopulationPoint[];
  readonly transport: TransportProfile;
  readonly sanitation: SanitationSnapshot;
  readonly health: HealthProfile;
  readonly education?: {
    readonly ideb2025Range: readonly [number, number];
    readonly basicEducationEnrollments2025: number;
    readonly municipalBasicEducationEnrollments2025: number;
    readonly technicalEptEnrollments2025: number;
    readonly sourceId: string;
    readonly note: string;
  };
  readonly budgetUpdates: readonly {
    readonly date: ISODate;
    readonly law: string;
    readonly title: string;
    readonly amountBrl: number;
    readonly description: string;
    readonly sourceId: string;
  }[];
  readonly budget: BudgetData;
  readonly indicators: readonly MunicipalIndicator[];
}

export interface TransportCalculationInput {
  readonly fareBrl: number;
  readonly tripsPerDay: number;
  readonly workDaysPerMonth: number;
  readonly people: number;
  readonly monthsPerYear: number;
  readonly salaryReferenceBrl: number;
}

export interface TransportCalculationResult {
  readonly monthlyPerPersonBrl: number;
  readonly annualPerPersonBrl: number;
  readonly monthlyTotalBrl: number;
  readonly annualTotalBrl: number;
  readonly monthlyPctOfSalaryPerPerson: number | null;
  readonly annualPctOfSalaryPerPerson: number | null;
}
