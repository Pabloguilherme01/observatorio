/** Contratos de domínio do Observatório. Dados e UI permanecem desacoplados. */
export type DataNature = 'official' | 'secondary' | 'derived' | 'legacy';
export type DataStatus = 'current' | 'snapshot' | 'historical' | 'planned' | 'derived';
export type ISODate = `${number}-${number}-${number}`;

export interface SourceRef {
  readonly id: string;
  readonly label: string;
  readonly institution: string;
  readonly url: string;
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

export interface AgeGroup {
  readonly id: 'under24' | '25to59' | '60plus';
  readonly label: string;
  readonly voters: number;
  readonly sharePct: number;
}

export interface ElectoralSnapshot {
  readonly zone: string;
  readonly electorate: number;
  readonly snapshotDate: ISODate;
  readonly tseConsolidated?: number;
  readonly ageGroups: readonly AgeGroup[];
  readonly womenPct?: number;
  readonly menPct?: number;
  readonly socialNameCount?: number;
  readonly indigenousPopulation?: number;
  readonly indigenousElectorate?: number;
  readonly electorate2018?: number;
  readonly electorate2022?: number;
  readonly electorate2024?: number;
  readonly zoneVsTseDifference?: number;
  readonly turnout2024Pct: number;
  readonly abstention2024Pct: number;
  readonly abstention2024Count: number;
  readonly blankVotes2024Count: number;
  readonly nullVotes2024Count: number;
  readonly validVotes2024Count: number;
  readonly sourceId: string;
}

export interface PollResult {
  readonly label: string;
  readonly percentage: number;
}

export interface ElectionPoll {
  readonly registrationNumber: string;
  readonly pollster: string;
  readonly contractor?: string;
  readonly collectionDate: ISODate;
  readonly interviews: number;
  readonly method: 'spontaneous' | 'stimulated' | 'unknown';
  readonly results: readonly PollResult[];
  readonly nonePct?: number;
  readonly notSurePct?: number;
  readonly officialMarginErrorPct?: number;
  readonly theoreticalMarginErrorPct?: number;
  readonly confidenceLevelPct?: number;
  readonly sourceId: string;
  readonly note?: string;
}

export interface CandidateSnapshot {
  readonly name: string;
  readonly party?: string;
  readonly ballotNumber?: number;
  readonly status: string;
  readonly occupation?: string;
  readonly education?: string;
  readonly declaredAssetsBrl?: number;
  readonly sourceId: string;
  readonly snapshotDate: ISODate;
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
  readonly electoral: ElectoralSnapshot;
  readonly polls: readonly ElectionPoll[];
  readonly candidates: readonly CandidateSnapshot[];
  readonly transport: TransportProfile;
  readonly sanitation: SanitationSnapshot;
  readonly health: HealthProfile;
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