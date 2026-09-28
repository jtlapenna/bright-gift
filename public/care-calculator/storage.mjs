import { DEFAULT_BED, DEFAULT_LEAD, DEFAULT_WAKE, LEGACY_KEY, STORAGE_KEY, VERSION, validateDay } from './core.mjs';

export function emptyStore(storage) {
  return {
    version: VERSION,
    settings: { wake: DEFAULT_WAKE, bed: DEFAULT_BED, johnLead: DEFAULT_LEAD },
    days: {},
    legacySnapshot: storage.getItem(LEGACY_KEY),
  };
}

export function validateStore(store) {
  if (!store || store.version !== VERSION || !store.settings || !store.days || typeof store.days !== 'object' || Array.isArray(store.days)) return 'This backup uses an unknown format.';
  const { wake, bed, johnLead } = store.settings;
  if (!Number.isInteger(wake) || !Number.isInteger(bed) || wake < 0 || bed > 1439 || wake >= bed) return 'Default wake and bed times are invalid.';
  if (!Number.isInteger(johnLead) || johnLead < 0 || johnLead > 240) return 'John’s target difference is invalid.';
  for (const [date, day] of Object.entries(store.days)) {
    if (day.date !== date) return `Day ${date} has the wrong date.`;
    const problem = validateDay(day);
    if (problem) return `Day ${date}: ${problem}`;
  }
  return null;
}

export function loadStore(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return emptyStore(storage);
  let store;
  try { store = JSON.parse(raw); }
  catch { throw new Error('Saved data is unreadable. Export it before resetting this browser.'); }
  const problem = validateStore(store);
  if (problem) throw new Error(`Saved data needs repair. ${problem}`);
  if (store.legacySnapshot == null) store.legacySnapshot = storage.getItem(LEGACY_KEY);
  return store;
}

export function saveStore(storage, store, expectedRaw) {
  const problem = validateStore(store);
  if (problem) throw new Error(problem);
  if (expectedRaw !== undefined && storage.getItem(STORAGE_KEY) !== expectedRaw) {
    const error = new Error('This plan changed in another tab. Reload before saving.');
    error.code = 'STALE_STORE';
    throw error;
  }
  const raw = JSON.stringify(store);
  storage.setItem(STORAGE_KEY, raw);
  return raw;
}

export function parseBackup(text) {
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('This file is not valid JSON.'); }
  const problem = validateStore(data);
  if (problem) throw new Error(problem);
  return data;
}
