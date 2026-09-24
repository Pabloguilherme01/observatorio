import { BudgetSection } from './BudgetSection';
import { BudgetImpact } from './BudgetImpact';
import { Central2026 } from './Central2026';

export default function DeferredElectionGroup() {
  const sections = [BudgetSection, BudgetImpact, Central2026];

  return (
    <>
      {sections.map((Section) => (
        <Section key={Section.name} />
      ))}
    </>
  );
}
