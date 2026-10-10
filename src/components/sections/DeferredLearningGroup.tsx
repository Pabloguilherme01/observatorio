import { QuickQuiz } from './QuickQuiz';
import { useLanguageMode } from '../../context/LanguageModeContext';

export default function DeferredLearningGroup() {
  const { mode } = useLanguageMode();
  return mode !== 'summary' ? <QuickQuiz /> : null;
}
