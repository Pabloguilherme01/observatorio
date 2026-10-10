import { useLanguageMode } from '../../context/LanguageModeContext';
import { BudgetSection } from './BudgetSection';
import { BudgetImpact } from './BudgetImpact';

export default function DeferredBudgetGroup() {
  const { mode } = useLanguageMode();
  return <>
    <BudgetSection />
    {mode === 'technical' && <BudgetImpact />}
  </>;
}
