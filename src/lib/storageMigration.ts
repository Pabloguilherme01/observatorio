/** Preserve preferences while giving rewritten learning content a clean start. */
export function migrateMunicipalStorage() {
  try {
    const marker = 'observatorio-v46-migrated';
    if (localStorage.getItem(marker)) return;
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('observatorio-v45-')) continue;
      // Leave the previous learning progress intact for recovery, but do not carry it into v46.
      if (/quiz|guided-learning/.test(key)) continue;
      const next = key.replace('observatorio-v45-', 'observatorio-v46-');
      const value = localStorage.getItem(key);
      if (value !== null && localStorage.getItem(next) === null) localStorage.setItem(next, value);
    }
    localStorage.setItem(marker, 'true');
  } catch { /* Preferences remain usable when browser storage is unavailable. */ }
}
