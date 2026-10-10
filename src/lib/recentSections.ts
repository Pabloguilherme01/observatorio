import { navigation } from '../config/navigation';
import { STORAGE_NAMESPACE } from '../config/version';

const STORAGE_KEY = `${STORAGE_NAMESPACE}-recent-sections`;
const MAX_RECENT_SECTIONS = 4;

const sectionAliases: Readonly<Record<string, string>> = {
  resumo: 'dashboard',
  contexto: 'dashboard',
  demografia: 'dashboard',
  dados: 'dashboard',
  'orcamento-impacto': 'orcamento',
  qualidade: 'fontes',
  evidencias: 'fontes',
  'mapa-evidencias': 'fontes',
};

const navigationIds = new Set(navigation.map(item => item.id as string));

function canonicalRecentSection(id: string) {
  const normalized = id.trim().replace(/^#/, '');
  const candidate = sectionAliases[normalized] ?? normalized;
  return navigationIds.has(candidate) ? candidate : null;
}

export function getRecentSections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed
      .map(value => typeof value === 'string' ? canonicalRecentSection(value) : null)
      .filter((value): value is string => {
        if (!value || seen.has(value)) return false;
        seen.add(value);
        return true;
      })
      .slice(0, MAX_RECENT_SECTIONS);
  } catch {
    return [];
  }
}

export function recordRecentSection(id: string) {
  const canonical = canonicalRecentSection(id);
  if (!canonical) return getRecentSections();

  const next = [
    canonical,
    ...getRecentSections().filter(item => item !== canonical),
  ].slice(0, MAX_RECENT_SECTIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function clearRecentSections() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
