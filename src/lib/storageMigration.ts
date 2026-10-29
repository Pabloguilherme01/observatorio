export const MUNICIPAL_MIGRATION_MARKER = 'observatorio-v46-migrated';

/** Preserve preferences while giving rewritten learning content a clean start. */
export function migrateMunicipalStorage() {
  try {
    if (localStorage.getItem(MUNICIPAL_MIGRATION_MARKER)) return;
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('observatorio-v45-')) continue;
      // Leave the previous learning progress intact for recovery, but do not carry it into v46.
      if (/quiz|guided-learning/.test(key)) continue;
      const next = key.replace('observatorio-v45-', 'observatorio-v46-');
      const value = localStorage.getItem(key);
      if (value !== null && localStorage.getItem(next) === null) localStorage.setItem(next, value);
    }
    localStorage.setItem(MUNICIPAL_MIGRATION_MARKER, 'true');
  } catch { /* Preferences remain usable when browser storage is unavailable. */ }
}

/** Read the old preference only while an incomplete migration can still be retried. */
export function readMunicipalLanguagePreference(): string | null {
  try {
    const current = localStorage.getItem('observatorio-v46-language-mode');
    if (current !== null) return current;
    if (!localStorage.getItem(MUNICIPAL_MIGRATION_MARKER)) {
      return localStorage.getItem('observatorio-v45-language-mode');
    }
  } catch { /* Use the default when browser storage cannot be read. */ }
  return null;
}

/** Do not persist an automatic default before the old preference has been migrated. */
export function canPersistMunicipalLanguagePreference(userSelected: boolean): boolean {
  if (userSelected) return true;
  try { return Boolean(localStorage.getItem(MUNICIPAL_MIGRATION_MARKER)); } catch { return false; }
}
