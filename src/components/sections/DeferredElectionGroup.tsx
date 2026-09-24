import { BudgetSection } from './BudgetSection';
import { BudgetImpact } from './BudgetImpact';
import { Central2026 } from './Central2026';

const electionSections = [
  BudgetSection,
  BudgetImpact,
  Central2026,
];

export default function DeferredElectionGroup() {
  return (
    <>
      {electionSections.map((Section) => (
        <Section key={Section.name} />
      ))}
    </>
  );
}
